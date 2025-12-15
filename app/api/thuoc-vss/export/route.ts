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
    const thuocList = await prisma.thuocVSS.findMany({
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

    // Chuyển đổi dữ liệu thành mảng 2D
    const wsData = [headers]
    
    thuocList.forEach((item: typeof thuocList[0], index: number) => {
      const row = [
        index + 1, // STT
        item.tenThuoc || '',
        item.hoatChat || '',
        item.hamLuong || '',
        item.gdklh || '',
        item.duongDung || '',
        item.dangBaoChe || '',
        item.tenCoSoSanXuat || '',
        item.nuocSanXuat || '',
        item.quyCachDongGoi || '',
        item.donViTinh || '',
        item.soLuong || '',
        item.donGia || '',
        item.nhomThuoc || '',
        item.tenDonViTrungThau || '',
        item.tinh || '',
        item.tenNhaThau || '',
        item.soQuyetDinh || '',
        item.ngayCongBo ? new Date(item.ngayCongBo).toLocaleDateString("vi-VN") : '',
        item.loaiThuoc || '',
        item.maTT || '',
        item.maDuongDung || ''
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
      { wch: 20 },  // Hoạt chất
      { wch: 12 },  // Hàm lượng
      { wch: 15 },  // GĐKLH
      { wch: 15 },  // Đường dùng
      { wch: 18 },  // Dạng bào chế
      { wch: 25 },  // Tên cơ sở sản xuất
      { wch: 15 },  // Nước sản xuất
      { wch: 20 },  // Quy cách đóng gói
      { wch: 12 },  // Đơn vị tính
      { wch: 12 },  // Số lượng
      { wch: 12 },  // Đơn giá
      { wch: 20 },  // Nhóm thuốc
      { wch: 25 },  // Tên đơn vị trúng thầu
      { wch: 12 },  // Tỉnh
      { wch: 25 },  // Tên nhà thầu
      { wch: 18 },  // Số quyết định
      { wch: 15 },  // Ngày công bố
      { wch: 15 },  // Loại thuốc
      { wch: 10 },  // Mã TT
      { wch: 15 }   // Mã Đường dùng
    ]
    ws['!cols'] = colWidths

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Thuốc VSS')

    // Tạo buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Tạo tên file với timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `Thuoc_VSS_${timestamp}.xlsx`

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

