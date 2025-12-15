import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause for BietDuocGoc
    let where: any = {};
    
    if (search) {
      where = {
        OR: [
          { tenThuoc: { contains: search, mode: 'insensitive' as any } },
          { soDangKy: { contains: search, mode: 'insensitive' as any } },
          { tenCoSoSanXuat: { contains: search, mode: 'insensitive' as any } },
          { diaChiCoSoSanXuat: { contains: search, mode: 'insensitive' as any } },
        ]
      };
    }

    const [data, total] = await Promise.all([
      prisma.bietDuocGoc.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.bietDuocGoc.count({ where })
    ])

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error in GET /api/biet-duoc-goc:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    const thuoc = await prisma.bietDuocGoc.create({
      data: body
    })

    return NextResponse.json(thuoc)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await prisma.bietDuocGoc.deleteMany({})

    return NextResponse.json({ 
      success: true, 
      message: `Đã xóa ${result.count} bản ghi biệt dược gốc`,
      deletedCount: result.count
    })
  } catch (error) {
    console.error("Error in DELETE /api/biet-duoc-goc:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}



