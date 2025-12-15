import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function GET() {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new()

    // Define headers for MSC (22 columns)
    const headers = [
      'Tên thuốc',
      'Hoạt chất',
      'Hàm lượng',
      'GĐKLH',
      'Đường dùng',
      'Dạng bào chế',
      'Hạn dùng',
      'Tên cơ sở sản xuất',
      'Nước sản xuất',
      'Quy cách đóng gói',
      'Đơn vị tính',
      'Số lượng',
      'Đơn giá',
      'Nhóm thuốc',
      'Mã TBMT',
      'Tên Chủ đầu tư',
      'Hình thức LCNT',
      'Ngày đăng tải',
      'Số quyết định',
      'Ngày ban hành quyết định',
      'Số nhà thầu tham dự',
      'Địa điểm'
    ]

    // Sample data
    const sampleData = [
      'Metformin 500mg',
      'Metformin HCl',
      '500mg',
      'VD-22345-20',
      'Uống',
      'Viên nén bao phim',
      '36 tháng',
      'Công ty Dược phẩm PQR',
      'Việt Nam',
      'Hộp 10 vỉ x 10 viên',
      'Hộp',
      '1500',
      '25000',
      'Thuốc điều trị đái tháo đường',
      'TBMT-2024-001',
      'Sở Y tế Hà Nội',
      'Đấu thầu rộng rãi',
      '2024-01-10',
      '201/QĐ-SYT',
      '2024-01-25',
      '5',
      'Hà Nội'
    ]

    // Create worksheet data
    const wsData = [headers, sampleData]

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Set column widths
    const colWidths = headers.map(() => ({ wch: 22 }))
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Thuốc MSC')

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Return file
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Template_Thuoc_MSC.xlsx"'
      }
    })
  } catch (error: any) {
    console.error('Template generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}





