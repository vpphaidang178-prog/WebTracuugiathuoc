"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  fullName?: string;
  phone?: string;
  status: boolean;
  createdAt: string;
  expiryDate?: string;
  zaloName?: string;
  notes?: string;
  isAdmin: boolean;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    phone: "",
    status: true,
    expiryDate: "",
    zaloName: "",
    notes: "",
    isAdmin: false,
  });

  useEffect(() => {
    if (session && !(session.user as any)?.isAdmin) {
      router.push("/dashboard");
    } else if (session) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      
      // Check if response is JSON
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error('Lỗi khi tải danh sách người dùng');
      }
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          alert('Bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
          return;
        }
        throw new Error(data.error || 'Lỗi khi tải danh sách người dùng');
      }
      
      setUsers(data);
    } catch (error: any) {
      alert(error.message || "Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Check if response is JSON
      let result;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      } else {
        const text = await res.text();
        result = { error: text || 'Lỗi không xác định' };
      }

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại.');
        }
        throw new Error(result.error || 'Lỗi khi lưu người dùng');
      }

      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      alert(error.message || "Lỗi khi lưu người dùng");
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      fullName: "",
      phone: "",
      status: true,
      expiryDate: "",
      zaloName: "",
      notes: "",
      isAdmin: false,
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "",
      fullName: user.fullName || "",
      phone: user.phone || "",
      status: user.status,
      expiryDate: user.expiryDate ? new Date(user.expiryDate).toISOString().split('T')[0] : "",
      zaloName: user.zaloName || "",
      notes: user.notes || "",
      isAdmin: user.isAdmin,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      // Check if response is JSON
      let result;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      } else if (!res.ok) {
        const text = await res.text();
        result = { error: text || 'Lỗi không xác định' };
      }

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại.');
        }
        throw new Error(result?.error || "Lỗi khi xóa người dùng");
      }

      fetchUsers();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
        <button
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Thêm người dùng
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên đăng nhập
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Họ và tên
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số điện thoại
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo tài khoản
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày hết hạn
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên Zalo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ghi chú
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.fullName || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  {user.status ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Khóa
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateOnly(user.expiryDate || "")}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.zaloName || "-"}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate" title={user.notes || ""}>
                  {user.notes || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingUser ? "Sửa người dùng" : "Thêm người dùng"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu {editingUser && "(Để trống nếu không đổi)"}
                    {!editingUser && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required={!editingUser}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value === "true" })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="true">Hoạt động</option>
                    <option value="false">Khóa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày hết hạn
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Zalo
                </label>
                <input
                  type="text"
                  value={formData.zaloName}
                  onChange={(e) =>
                    setFormData({ ...formData, zaloName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onChange={(e) =>
                    setFormData({ ...formData, isAdmin: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isAdmin"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Quyền Admin
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  {editingUser ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
