"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    // Nếu đã đăng nhập, redirect đến dashboard
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // Hiển thị loading khi đang kiểm tra session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  // Nếu đã đăng nhập, không hiển thị gì (sẽ redirect)
  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tra cứu giá trúng thầu
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                Hướng dẫn đăng ký sử dụng
              </button>
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Hệ thống tra cứu giá trúng thầu
            <span className="block text-blue-600 mt-2">Chuyên nghiệp & Hiện đại</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Tra cứu nhanh chóng, chính xác giá trúng thầu thuốc theo VSS và MSC.
            Hệ thống được thiết kế để phục vụ nhu cầu tra cứu thông tin một cách hiệu quả nhất.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg transition duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Bắt đầu tra cứu
            </Link>
            <Link
              href="#features"
              className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg transition duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Tính năng nổi bật
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hệ thống cung cấp đầy đủ các công cụ cần thiết cho việc tra cứu và quản lý dữ liệu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-200">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              Tra cứu thông minh
            </h4>
            <p className="text-gray-600">
              Tìm kiếm nhanh chóng theo tên thuốc, hoạt chất, cơ sở sản xuất với bộ lọc nâng cao và tìm kiếm đa tiêu chí.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-200">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              Dữ liệu đầy đủ
            </h4>
            <p className="text-gray-600">
              Hệ thống cung cấp đầy đủ thông tin về giá trúng thầu theo VSS và MSC với hơn 20 trường dữ liệu chi tiết.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-200">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              Thống kê chi tiết
            </h4>
            <p className="text-gray-600">
              Xem thống kê giá trung bình, giá phổ biến, giá min/max và các chỉ số quan trọng khác.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-200">
            <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              Cập nhật nhanh chóng
            </h4>
            <p className="text-gray-600">
              Dữ liệu được cập nhật thường xuyên, đảm bảo thông tin luôn mới nhất và chính xác.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              Bảo mật cao
            </h4>
            <p className="text-gray-600">
              Hệ thống được bảo vệ bằng xác thực người dùng, đảm bảo dữ liệu được truy cập an toàn.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-200">
            <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              Giao diện hiện đại
            </h4>
            <p className="text-gray-600">
              Thiết kế giao diện thân thiện, dễ sử dụng, hỗ trợ responsive trên mọi thiết bị.
            </p>
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Nguồn dữ liệu
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hệ thống cung cấp dữ liệu từ hai nguồn chính
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">VSS</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900">
                  Giá trúng thầu theo VSS
                </h4>
              </div>
              <p className="text-gray-700 mb-4">
                Dữ liệu giá trúng thầu thuốc theo hệ thống VSS với đầy đủ thông tin về:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Thông tin thuốc và hoạt chất</li>
                <li>Thông tin đơn vị trúng thầu</li>
                <li>Thông tin nhà thầu</li>
                <li>Ngày công bố và quyết định</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">MSC</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900">
                  Giá trúng thầu theo MSC
                </h4>
              </div>
              <p className="text-gray-700 mb-4">
                Dữ liệu giá trúng thầu thuốc theo hệ thống MSC với đầy đủ thông tin về:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Thông tin thuốc và hạn dùng</li>
                <li>Thông tin chủ đầu tư</li>
                <li>Hình thức LCNT</li>
                <li>Ngày đăng tải và ban hành</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Sẵn sàng bắt đầu tra cứu?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Đăng nhập ngay để truy cập vào hệ thống tra cứu giá trúng thầu chuyên nghiệp
          </p>
          <Link
            href="/login"
            className="inline-block bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg transition duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold mb-4">Tra cứu giá trúng thầu</h4>
            <p className="text-gray-400 mb-6">
              Hệ thống tra cứu giá trúng thầu thuốc chuyên nghiệp
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 Tra cứu giá trúng thầu. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal Hướng dẫn đăng ký */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Hướng dẫn đăng ký sử dụng
              </h3>
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Thông tin gói đăng ký */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  Gói đăng ký sử dụng
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-600">
                    200.000đ
                  </span>
                  <span className="text-gray-600 text-lg">/user/tháng</span>
                </div>
                <p className="text-gray-700 mt-2">
                  Đăng ký ngay để được sử dụng đầy đủ các tính năng của hệ thống tra cứu giá trúng thầu.
                </p>
              </div>

              {/* Thông tin liên hệ */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  Liên hệ đăng ký
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium">
                      Số điện thoại:{" "}
                      <a
                        href="tel:0907851113"
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        0907851113
                      </a>
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Zalo */}
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Quét mã QR để liên hệ qua Zalo
                </h4>
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <Image
                      src="/zalome.jpg"
                      alt="QR Code Zalo"
                      width={250}
                      height={250}
                      className="rounded-lg"
                    />
                  </div>
                </div>
                <p className="text-center text-gray-600 mt-4">
                  Quét mã QR bằng ứng dụng Zalo để được tư vấn và hỗ trợ đăng ký
                </p>
              </div>

              {/* Hướng dẫn */}
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  Các bước đăng ký:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Quét mã QR Zalo hoặc gọi số điện thoại 0907851113</li>
                  <li>Liên hệ với chúng tôi để được tư vấn về gói dịch vụ</li>
                  <li>Thanh toán phí đăng ký 200.000đ/user/tháng</li>
                  <li>Nhận thông tin tài khoản đăng nhập</li>
                  <li>Bắt đầu sử dụng hệ thống tra cứu</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200 font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
