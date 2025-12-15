"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [thuocMenuOpen, setThuocMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isAdmin = (session.user as any)?.isAdmin;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Tra cứu giá trúng thầu
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                Xin chào, <strong>{(session.user as any)?.username}</strong>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-3">
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  className="hover:bg-blue-700 px-3 py-2 rounded-md transition"
                >
                  Quản trị
                </button>
                {adminMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white text-gray-900 rounded-md shadow-lg py-1 w-48">
                    <Link
                      href="/dashboard/admin/users"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      Quản lý người dùng
                    </Link>
                    <Link
                      href="/dashboard/admin/thuoc-vss"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      Quản lý VSS
                    </Link>
                    <Link
                      href="/dashboard/admin/thuoc-msc"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      Quản lý MSC
                    </Link>
                    <Link
                      href="/dashboard/admin/tuong-duong-sinh-hoc"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      Quản lý Danh mục Tương đương sinh học
                    </Link>
                    <Link
                      href="/dashboard/admin/biet-duoc-goc"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      Quản lý Danh mục Biệt dược gốc
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setThuocMenuOpen(!thuocMenuOpen)}
                className="hover:bg-blue-700 px-3 py-2 rounded-md transition"
              >
                Thuốc
              </button>
              {thuocMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white text-gray-900 rounded-md shadow-lg py-1 w-64">
                  <Link
                    href="/dashboard/thuoc-vss"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setThuocMenuOpen(false)}
                  >
                    Giá trúng thầu theo VSS
                  </Link>
                  <Link
                    href="/dashboard/thuoc-msc"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setThuocMenuOpen(false)}
                  >
                    Giá trúng thầu theo MSC
                  </Link>
                  <Link
                    href="/dashboard/tuong-duong-sinh-hoc"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setThuocMenuOpen(false)}
                  >
                    Tương đương sinh học
                  </Link>
                  <Link
                    href="/dashboard/biet-duoc-goc"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setThuocMenuOpen(false)}
                  >
                    Biệt dược gốc
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

