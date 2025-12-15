import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Tên đăng nhập", type: "text" },
        password: { label: "Mật khẩu", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username
          }
        })

        if (!user) {
          return null
        }

        // Kiểm tra trạng thái tài khoản
        if (!user.status) {
          throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          name: user.username,
          email: user.username,
          username: user.username,
          isAdmin: user.isAdmin,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Khi user mới đăng nhập
      if (user) {
        return {
          ...token,
          id: user.id,
          username: (user as any).username || user.name,
          isAdmin: (user as any).isAdmin,
        } as any
      }
      
      // Refresh token từ database để đảm bảo isAdmin luôn đúng
      // Đặc biệt quan trọng khi deploy production với NEXTAUTH_SECRET khác
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isAdmin: true, status: true }
          })
          
          if (dbUser) {
            // Cập nhật isAdmin từ database
            token.isAdmin = dbUser.isAdmin
            
            // Kiểm tra trạng thái tài khoản
            if (!dbUser.status) {
              // Invalidate token nếu tài khoản bị khóa
              return null as any
            }
          }
        } catch (error) {
          console.error('Error refreshing token from database:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          username: token.username,
          isAdmin: token.isAdmin,
        }
      }
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

