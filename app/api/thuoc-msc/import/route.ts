import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

// Cấu hình để hỗ trợ upload file lớn và xử lý nhiều dòng
export const maxDuration = 600; // 10 phút timeout cho file lớn
export const runtime = 'nodejs';

// Số lượng records xử lý trong mỗi batch
const BATCH_SIZE = 1000;

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

    console.log(`Processing file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`)

    // Read file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Parse Excel with optimizations for large files
    const workbook = XLSX.read(buffer, { 
      type: 'buffer',
      cellDates: true, // Parse dates automatically
      cellText: false, // Don't create text representations
      cellFormula: false, // Don't parse formulas
      sheetRows: 0, // Read all rows (0 = no limit)
    })
    
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON (raw values only)
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      raw: false, // Get formatted values
      defval: null, // Default value for empty cells
    }) as any[][]
    
    console.log(`Excel parsed: ${data.length} rows (including header)`)
    
    if (data.length <= 1) {
      return NextResponse.json({ error: "File không có dữ liệu" }, { status: 400 })
    }

    // Skip header row
    const rows = data.slice(1)
    
    let success = 0
    let failed = 0
    const errors: string[] = []
    const validRecords: any[] = []

    // Phase 1: Parse and validate all rows (fast)
    console.log('Phase 1: Parsing and validating data...')
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      // Skip empty rows
      if (!row || row.length === 0 || !row[0]) {
        continue
      }

      try {
        // Map columns (A-V = 0-21 in array)
        const thuocData = {
          tenThuoc: row[0]?.toString().trim() || '',
          hoatChat: row[1]?.toString().trim() || null,
          hamLuong: row[2]?.toString().trim() || null,
          gdklh: row[3]?.toString().trim() || null,
          duongDung: row[4]?.toString().trim() || null,
          dangBaoChe: row[5]?.toString().trim() || null,
          hanDung: row[6]?.toString().trim() || null,
          tenCoSoSanXuat: row[7]?.toString().trim() || null,
          nuocSanXuat: row[8]?.toString().trim() || null,
          quyCachDongGoi: row[9]?.toString().trim() || null,
          donViTinh: row[10]?.toString().trim() || null,
          soLuong: row[11]?.toString().trim() || null,
          donGia: row[12]?.toString().trim() || null,
          nhomThuoc: row[13]?.toString().trim() || null,
          maTBMT: row[14]?.toString().trim() || null,
          tenChuDauTu: row[15]?.toString().trim() || null,
          hinhThucLCNT: row[16]?.toString().trim() || null,
          ngayDangTai: row[17] ? parseDate(row[17]) : null,
          soQuyetDinh: row[18]?.toString().trim() || null,
          ngayBanHanhQuyetDinh: row[19] ? parseDate(row[19]) : null,
          soNhaThauThamDu: row[20]?.toString().trim() || null,
          diaDiem: row[21]?.toString().trim() || null,
        }

        // Validate required fields
        if (!thuocData.tenThuoc) {
          throw new Error('Tên thuốc không được để trống')
        }

        // Validate string lengths (Prisma will fail if too long)
        if (thuocData.tenThuoc.length > 500) {
          throw new Error('Tên thuốc quá dài (tối đa 500 ký tự)')
        }

        validRecords.push(thuocData)
      } catch (error: any) {
        failed++
        if (errors.length < 100) { // Store up to 100 errors
          errors.push(`Dòng ${i + 2}: ${error.message}`)
        }
      }
    }

    console.log(`Parsed: ${validRecords.length} valid, ${failed} invalid`)

    // Phase 2: Batch insert to database (fast)
    console.log('Phase 2: Inserting to database in batches...')
    const totalBatches = Math.ceil(validRecords.length / BATCH_SIZE)
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE
      const end = Math.min(start + BATCH_SIZE, validRecords.length)
      const batch = validRecords.slice(start, end)

      try {
        // Use createMany for batch insert (much faster)
        const result = await prisma.thuocMSC.createMany({
          data: batch,
          skipDuplicates: false, // Fail on duplicates to maintain data integrity
        })
        
        success += result.count
        console.log(`Batch ${batchIndex + 1}/${totalBatches}: Inserted ${result.count} records`)
      } catch (error: any) {
        console.error(`Batch ${batchIndex + 1} failed:`, error.message)
        
        // If batch fails, try inserting one by one to identify bad records
        for (let i = 0; i < batch.length; i++) {
          try {
            await prisma.thuocMSC.create({ data: batch[i] })
            success++
          } catch (individualError: any) {
            failed++
            const originalRowIndex = start + i + 2 // +2 for header and 0-index
            if (errors.length < 100) {
              errors.push(`Dòng ${originalRowIndex}: ${individualError.message}`)
            }
          }
        }
      }
    }

    const totalRecords = validRecords.length + failed

    // Save import history
    try {
      await prisma.importHistory.create({
        data: {
          type: 'MSC',
          fileName: file.name,
          totalRecords,
          successCount: success,
          failedCount: failed,
          importedBy: (session.user as any).id,
        }
      })
    } catch (historyError) {
      console.error('Failed to save import history:', historyError)
    }

    console.log(`Import completed: ${success} success, ${failed} failed`)

    return NextResponse.json({
      success: true,
      stats: {
        total: totalRecords,
        success,
        failed
      },
      errors: errors.length > 0 ? errors.slice(0, 100) : [], // Return first 100 errors
      hasMoreErrors: errors.length > 100
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

