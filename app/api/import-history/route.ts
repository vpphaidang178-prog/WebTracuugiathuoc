import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'VSS', 'MSC', 'BDG', 'TDSH', etc.

    const where = type ? { type } : {}

    console.log('Fetching import history with filter:', { type, where })

    const history = await prisma.importHistory.findMany({
      where,
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Last 50 imports
    })

    console.log(`Found ${history.length} import history records`)

    return NextResponse.json(history)
  } catch (error) {
    console.error('Failed to fetch import history:', error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

