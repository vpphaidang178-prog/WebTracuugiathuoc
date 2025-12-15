import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        status: true,
        createdAt: true,
        expiryDate: true,
        zaloName: true,
        notes: true,
        isAdmin: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
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
    const { username, password, fullName, phone, status, expiryDate, zaloName, notes, isAdmin } = body

    const updateData: any = {
      username,
      fullName,
      phone,
      status,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      zaloName,
      notes,
      isAdmin,
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        status: true,
        createdAt: true,
        expiryDate: true,
        zaloName: true,
        notes: true,
        isAdmin: true,
      }
    })

    return NextResponse.json(user)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
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

    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

