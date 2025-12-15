import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const thuoc = await prisma.thuocMSC.findUnique({
      where: { id: params.id }
    })

    if (!thuoc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(thuoc)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    const thuoc = await prisma.thuocMSC.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json(thuoc)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.thuocMSC.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Deleted successfully" })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

