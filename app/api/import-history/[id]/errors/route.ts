import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Handle both Promise and direct params
    const resolvedParams = params instanceof Promise ? await params : params

    const importHistory = await prisma.importHistory.findUnique({
      where: {
        id: resolvedParams.id
      },
      select: {
        id: true,
        errors: true,
        failedCount: true,
        fileName: true,
        createdAt: true
      }
    })

    if (!importHistory) {
      return NextResponse.json({ error: "Import history not found" }, { status: 404 })
    }

    // Parse errors từ JSON string
    let errors: string[] = []
    if (importHistory.errors) {
      try {
        errors = JSON.parse(importHistory.errors)
      } catch (e) {
        console.error('Failed to parse errors:', e)
      }
    }

    return NextResponse.json({
      id: importHistory.id,
      fileName: importHistory.fileName,
      failedCount: importHistory.failedCount,
      createdAt: importHistory.createdAt,
      errors
    })
  } catch (error) {
    console.error('Failed to fetch import errors:', error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

