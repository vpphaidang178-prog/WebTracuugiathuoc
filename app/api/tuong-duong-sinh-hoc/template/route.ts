import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function GET() {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new()

    // Define headers for Tương đương sinh học (9 columns)
    const headers = [
      'Tên thuốc',
      'Hàm lượng',
      'Dạng bào chế',
      'Quy cách đóng gói',
      'Số đăng ký',
      'Cơ sở sản xuất',
      'Địa chỉ cơ sở sản xuất',
      'Ghi chú',
      'Số Quyết định'
    ]

    // Sample data
    const sampleData = [
      'Paracetamol 500mg',
      '500mg',
      'Viên nén',
      'Hộp 10 vỉ x 10 viên',
      'VD-12345-20',
      'Công ty Dược phẩm ABC',
      '123 Đường ABC, Quận XYZ, TP. Hà Nội',
      'Thuốc tương đương sinh học',
      '123/QĐ-BYT'
    ]

    // Create worksheet data
    const wsData = [headers, sampleData]

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Set column widths
    const colWidths = [
      { wch: 25 },  // Tên thuốc
      { wch: 15 },  // Hàm lượng
      { wch: 18 },  // Dạng bào chế
      { wch: 20 },  // Quy cách đóng gói
      { wch: 18 },  // Số đăng ký
      { wch: 25 },  // Cơ sở sản xuất
      { wch: 35 },  // Địa chỉ cơ sở sản xuất
      { wch: 30 },  // Ghi chú
      { wch: 18 }   // Số Quyết định
    ]
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Tương đương sinh học')

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Return file
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Template_Tuong_Duong_Sinh_Hoc.xlsx"'
      }
    })
  } catch (error: any) {
    console.error('Template generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



