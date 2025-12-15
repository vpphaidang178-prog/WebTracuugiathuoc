import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function GET() {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new()

    // Define headers for VSS (21 columns)
    const headers = [
      'Tên thuốc',
      'Hoạt chất',
      'Hàm lượng',
      'GĐKLH',
      'Đường dùng',
      'Dạng bào chế',
      'Tên cơ sở sản xuất',
      'Nước sản xuất',
      'Quy cách đóng gói',
      'Đơn vị tính',
      'Số lượng',
      'Đơn giá',
      'Nhóm thuốc',
      'Tên đơn vị trúng thầu',
      'Tỉnh',
      'Tên nhà thầu',
      'Số quyết định',
      'Ngày công bố',
      'Loại thuốc',
      'Mã TT',
      'Mã Đường dùng'
    ]

    // Sample data
    const sampleData = [
      'Paracetamol 500mg',
      'Paracetamol',
      '500mg',
      'VD-12345-20',
      'Uống',
      'Viên nén',
      'Công ty Dược phẩm ABC',
      'Việt Nam',
      'Hộp 10 vỉ x 10 viên',
      'Hộp',
      '1000',
      '15000',
      'Thuốc giảm đau, hạ sốt',
      'Bệnh viện Đa khoa Tỉnh',
      'Hà Nội',
      'Công ty TNHH Dược phẩm XYZ',
      '123/QĐ-BYT',
      '2024-01-15',
      'Thuốc kê đơn',
      'TT001',
      'DD01'
    ]

    // Create worksheet data
    const wsData = [headers, sampleData]

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Set column widths
    const colWidths = headers.map(() => ({ wch: 20 }))
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Thuốc VSS')

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Return file
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Template_Thuoc_VSS.xlsx"'
      }
    })
  } catch (error: any) {
    console.error('Template generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}





