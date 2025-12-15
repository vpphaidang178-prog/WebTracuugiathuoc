import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
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

    return NextResponse.json(users)
  } catch (error) {
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
    const { username, password, fullName, phone, status, expiryDate, zaloName, notes, isAdmin } = body

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        phone,
        status: status !== undefined ? status : true,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        zaloName,
        notes,
        isAdmin: isAdmin || false,
      }
    })

    return NextResponse.json({ 
      id: user.id, 
      username: user.username,
      fullName: user.fullName,
      phone: user.phone,
      status: user.status,
      createdAt: user.createdAt,
      expiryDate: user.expiryDate,
      zaloName: user.zaloName,
      notes: user.notes,
      isAdmin: user.isAdmin 
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

