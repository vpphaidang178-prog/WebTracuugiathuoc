import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buildWhereClause, SearchFilter } from "@/lib/filter-utils"

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
    
    let filter: SearchFilter | null = null;
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      try {
        filter = JSON.parse(filterParam);
      } catch (e) {
        // Invalid filter, ignore
      }
    }

    const skip = (page - 1) * limit

    const where = buildWhereClause(filter, search)

    const [data, total] = await Promise.all([
      prisma.thuocVSS.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.thuocVSS.count({ where })
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
    console.error("Error in GET /api/thuoc-vss:", error);
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
    
    const thuoc = await prisma.thuocVSS.create({
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

    const result = await prisma.thuocVSS.deleteMany({})

    return NextResponse.json({ 
      success: true, 
      message: `Đã xóa ${result.count} bản ghi thuốc VSS`,
      deletedCount: result.count
    })
  } catch (error) {
    console.error("Error in DELETE /api/thuoc-vss:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

