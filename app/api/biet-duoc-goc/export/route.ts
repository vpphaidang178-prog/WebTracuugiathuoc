import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Danh sách ID không hợp lệ" }, { status: 400 })
    }

    // Lấy dữ liệu các thuốc đã chọn
    const thuocList = await prisma.bietDuocGoc.findMany({
      where: {
        id: {
          in: ids
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (thuocList.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy dữ liệu" }, { status: 404 })
    }

    // Định nghĩa headers
    const headers = [
      'STT',
      'Tên thuốc',
      'Hàm lượng',
      'Dạng bào chế/Quy cách',
      'Số đăng ký',
      'Cơ sở sản xuất',
      'Địa chỉ cơ sở sản xuất',
      'Ghi chú',
      'Số quyết định'
    ]

    // Chuyển đổi dữ liệu thành mảng 2D
    const wsData = [headers]
    
    thuocList.forEach((item: typeof thuocList[0], index: number) => {
      const row = [
        index + 1, // STT
        item.tenThuoc || '',
        item.hamLuong || '',
        item.dangBaoCheQuyCach || '',
        item.soDangKy || '',
        item.tenCoSoSanXuat || '',
        item.diaChiCoSoSanXuat || '',
        item.ghiChu || '',
        item.soQuyetDinh || ''
      ]
      wsData.push(row)
    })

    // Tạo workbook và worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Đặt độ rộng cột
    const colWidths = [
      { wch: 6 },   // STT
      { wch: 25 },  // Tên thuốc
      { wch: 15 },  // Hàm lượng
      { wch: 25 },  // Dạng bào chế/Quy cách
      { wch: 18 },  // Số đăng ký
      { wch: 25 },  // Cơ sở sản xuất
      { wch: 35 },  // Địa chỉ cơ sở sản xuất
      { wch: 30 },  // Ghi chú
      { wch: 18 }   // Số quyết định
    ]
    ws['!cols'] = colWidths

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Biệt dược gốc')

    // Tạo buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Tạo tên file với timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `Biet_Duoc_Goc_${timestamp}.xlsx`

    // Trả về file
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json({ error: error.message || "Lỗi khi xuất file Excel" }, { status: 500 })
  }
}



