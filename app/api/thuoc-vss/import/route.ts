import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

// Cấu hình để hỗ trợ upload file lớn (100MB, 100.000+ dòng)
export const maxDuration = 300; // 5 phút timeout (Vercel hobby plan limit)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file size (100MB = 100 * 1024 * 1024 bytes)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File quá lớn! Kích thước tối đa là 100MB. File của bạn: ${(file.size / (1024 * 1024)).toFixed(2)}MB` 
      }, { status: 400 })
    }

    // Read file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Parse Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON (skip header row)
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    
    if (data.length <= 1) {
      return NextResponse.json({ error: "File không có dữ liệu" }, { status: 400 })
    }

    // Skip header row
    const rows = data.slice(1)
    
    let success = 0
    let failed = 0
    const errors: string[] = []
    const batchSize = 1000 // Insert 1000 records mỗi lần để tối ưu hiệu suất
    const validRecords: Array<{ data: any; rowIndex: number }> = []

    // Parse và validate tất cả rows trước
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      // Skip empty rows
      if (!row || row.length === 0 || !row[0]) {
        continue
      }

      try {
        // Helper function to clean null bytes and invalid UTF-8 characters
        const cleanString = (value: any): string | null => {
          if (!value) return null
          const str = value.toString().trim()
          if (!str) return null
          // Remove null bytes (0x00) and other invalid UTF-8 characters
          return str.replace(/\0/g, '').replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') || null
        }

        // Map columns (A-W = 0-22 in array)
        const thuocData = {
          tenThuoc: cleanString(row[0]) || '',
          hoatChat: cleanString(row[1]),
          hamLuong: cleanString(row[2]),
          gdklh: cleanString(row[3]),
          duongDung: cleanString(row[4]),
          dangBaoChe: cleanString(row[5]),
          tenCoSoSanXuat: cleanString(row[6]),
          nuocSanXuat: cleanString(row[7]),
          quyCachDongGoi: cleanString(row[8]),
          donViTinh: cleanString(row[9]),
          soLuong: cleanString(row[10]),
          donGia: cleanString(row[11]),
          nhomThuoc: cleanString(row[12]),
          tenDonViTrungThau: cleanString(row[13]),
          tinh: cleanString(row[14]),
          tenNhaThau: cleanString(row[15]),
          soQuyetDinh: cleanString(row[16]),
          ngayCongBo: row[17] ? parseDate(row[17]) : null,
          loaiThuoc: cleanString(row[18]),
          maTT: cleanString(row[19]),
          maDuongDung: cleanString(row[20]),
        }

        // Validate required fields
        if (!thuocData.tenThuoc) {
          throw new Error('Tên thuốc không được để trống')
        }

        validRecords.push({ data: thuocData, rowIndex: i + 2 }) // +2 vì có header và index bắt đầu từ 0
      } catch (error: any) {
        failed++
        if (errors.length < 50) { // Giới hạn số lỗi để tránh response quá lớn
          errors.push(`Dòng ${i + 2}: ${error.message}`)
        }
      }
    }

    // Batch insert để tối ưu hiệu suất
    console.log(`Bắt đầu import ${validRecords.length} records trong ${Math.ceil(validRecords.length / batchSize)} batches...`)
    
    for (let i = 0; i < validRecords.length; i += batchSize) {
      const batch = validRecords.slice(i, i + batchSize)
      const batchData = batch.map(r => r.data)
      
      try {
        // Sử dụng createMany để insert nhiều records cùng lúc (nhanh hơn rất nhiều)
        await prisma.thuocVSS.createMany({
          data: batchData,
          skipDuplicates: true // Bỏ qua duplicate nếu có
        })
        
        success += batch.length
        console.log(`Đã import batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validRecords.length / batchSize)}: ${batch.length} records`)
      } catch (error: any) {
        // Nếu batch insert thất bại, thử insert từng record trong batch
        console.error(`Batch insert failed, trying individual inserts for batch ${Math.floor(i / batchSize) + 1}:`, error.message)
        
        for (const { data: record, rowIndex } of batch) {
          try {
            await prisma.thuocVSS.create({
              data: record
            })
            success++
          } catch (individualError: any) {
            failed++
            if (errors.length < 50) {
              errors.push(`Dòng ${rowIndex}: ${individualError.message}`)
            }
          }
        }
      }
    }

    const totalRecords = rows.filter(r => r && r.length > 0 && r[0]).length

    // Save import history with errors
    let importHistoryId = null
    const userId = (session.user as any).id
    
    console.log('Preparing to save import history:', {
      type: 'VSS',
      fileName: file.name,
      totalRecords,
      successCount: success,
      failedCount: failed,
      errorsCount: errors.length,
      userId: userId
    })

    if (!userId) {
      console.error('User ID is missing! Session:', session.user)
    }

    try {
      // Thử lưu với errors trước
      const errorsJson = errors.length > 0 ? JSON.stringify(errors) : null
      const history = await prisma.importHistory.create({
        data: {
          type: 'VSS',
          fileName: file.name,
          totalRecords,
          successCount: success,
          failedCount: failed,
          errors: errorsJson,
          importedBy: userId,
        }
      })
      importHistoryId = history.id
      console.log('✅ Import history saved successfully:', history.id)
    } catch (historyError: any) {
      console.error('❌ Failed to save import history with errors, trying without errors...')
      console.error('History error details:', {
        message: historyError.message,
        code: historyError.code,
        meta: historyError.meta
      })
      
      // Thử lưu lại không có errors (có thể errors quá lớn)
      try {
        const history = await prisma.importHistory.create({
          data: {
            type: 'VSS',
            fileName: file.name,
            totalRecords,
            successCount: success,
            failedCount: failed,
            errors: null, // Không lưu errors nếu quá lớn
            importedBy: userId,
          }
        })
        importHistoryId = history.id
        console.log('✅ Import history saved without errors:', history.id)
      } catch (retryError: any) {
        console.error('❌ Failed to save import history even without errors:', retryError)
        console.error('Retry error details:', {
          message: retryError.message,
          code: retryError.code,
          meta: retryError.meta
        })
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        total: totalRecords,
        success,
        failed
      },
      importHistoryId,
      errors: errors.length > 0 ? errors.slice(0, 10) : [], // Return first 10 errors for immediate display
      totalErrors: errors.length // Tổng số lỗi
    })

  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ 
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}

// Helper function to parse date
function parseDate(value: any): Date | null {
  if (!value) return null
  
  // If it's already a date
  if (value instanceof Date) return value
  
  // If it's a string
  if (typeof value === 'string') {
    const date = new Date(value)
    if (!isNaN(date.getTime())) return date
  }
  
  // If it's Excel serial number
  if (typeof value === 'number') {
    // Excel dates are stored as days since 1900-01-01
    const excelEpoch = new Date(1900, 0, 1)
    const days = value - 2 // Excel has a bug with leap year
    const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000)
    return date
  }
  
  return null
}

