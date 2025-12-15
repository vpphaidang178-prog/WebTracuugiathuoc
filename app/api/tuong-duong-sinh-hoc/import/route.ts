import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

// Cấu hình để hỗ trợ upload file lớn (100MB)
export const maxDuration = 300; // 5 phút timeout
export const runtime = 'nodejs';

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

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      // Skip empty rows
      if (!row || row.length === 0 || !row[0]) {
        continue
      }

      try {
        // Map columns (A-I = 0-8 in array)
        // 1. Tên thuốc, 2. Hàm lượng, 3. Dạng bào chế, 4. Quy cách đóng gói
        // 5. Số đăng ký, 6. Cơ sở sản xuất, 7. Địa chỉ cơ sở sản xuất
        // 8. Ghi chú, 9. Số Quyết định
        const thuocData = {
          tenThuoc: row[0]?.toString() || '',
          hamLuong: row[1]?.toString() || null,
          dangBaoChe: row[2]?.toString() || null,
          quyCachDongGoi: row[3]?.toString() || null,
          soDangKy: row[4]?.toString() || null,
          tenCoSoSanXuat: row[5]?.toString() || null,
          diaChiCoSoSanXuat: row[6]?.toString() || null,
          ghiChu: row[7]?.toString() || null,
          soQuyetDinh: row[8]?.toString() || null,
        }

        // Validate required fields
        if (!thuocData.tenThuoc) {
          throw new Error('Tên thuốc không được để trống')
        }

        // Insert to database
        await prisma.tuongDuongSinhHoc.create({
          data: thuocData
        })

        success++
      } catch (error: any) {
        failed++
        errors.push(`Dòng ${i + 2}: ${error.message}`)
      }
    }

    const totalRecords = rows.filter(r => r && r.length > 0 && r[0]).length

    // Save import history
    try {
      await prisma.importHistory.create({
        data: {
          type: 'TDSH',
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

    return NextResponse.json({
      success: true,
      stats: {
        total: totalRecords,
        success,
        failed
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : [] // Return first 10 errors
    })

  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ 
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}



