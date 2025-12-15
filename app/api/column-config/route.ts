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
    const type = searchParams.get('type') // "VSS", "MSC", "TDSH", or "BDG"

    if (!type || (type !== 'VSS' && type !== 'MSC' && type !== 'TDSH' && type !== 'BDG')) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    const configs = await prisma.columnConfig.findMany({
      where: { type },
      select: {
        columnKey: true,
        displayName: true,
      }
    })

    // Convert to object format: { columnKey: displayName }
    const configMap: { [key: string]: string } = {}
    configs.forEach((config: { columnKey: string; displayName: string }) => {
      configMap[config.columnKey] = config.displayName
    })

    return NextResponse.json(configMap)
  } catch (error) {
    console.error("Error in GET /api/column-config:", error);
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
    const { type, configs } = body // type: "VSS", "MSC", "TDSH", or "BDG", configs: { columnKey: displayName }

    if (!type || (type !== 'VSS' && type !== 'MSC' && type !== 'TDSH' && type !== 'BDG')) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    if (!configs || typeof configs !== 'object') {
      return NextResponse.json({ error: "Invalid configs" }, { status: 400 })
    }

    // Upsert all configs
    const operations = Object.entries(configs).map(([columnKey, displayName]) =>
      prisma.columnConfig.upsert({
        where: {
          type_columnKey: {
            type,
            columnKey: columnKey as string,
          }
        },
        update: {
          displayName: displayName as string,
        },
        create: {
          type,
          columnKey: columnKey as string,
          displayName: displayName as string,
        }
      })
    )

    await Promise.all(operations)

    return NextResponse.json({ success: true, message: "Đã cập nhật tên cột thành công" })
  } catch (error) {
    console.error("Error in POST /api/column-config:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

