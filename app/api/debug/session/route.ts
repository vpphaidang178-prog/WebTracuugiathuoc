import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      hasSession: !!session,
      session: session,
      user: session?.user,
      isAdmin: (session?.user as any)?.isAdmin,
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      hasSession: false 
    }, { status: 500 })
  }
}

