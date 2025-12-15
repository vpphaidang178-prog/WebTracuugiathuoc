"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function QuanLyTuongDuongSinhHocPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [columnConfigs, setColumnConfigs] = useState<{ [key: string]: string }>({});
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [savingConfigs, setSavingConfigs] = useState(false);

  useEffect(() => {
    if (session && !(session.user as any)?.isAdmin) {
      router.push("/dashboard");
    } else if (session) {
      fetchHistory();
      fetchColumnConfigs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/import-history?type=TDSH');
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch history');
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file Excel (.xlsx hoặc .xls)' });
      return;
    }

    // Validate file size (100MB = 100 * 1024 * 1024 bytes)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setMessage({ 
        type: 'error', 
        text: `File quá lớn! Kích thước tối đa là 100MB. File của bạn: ${(file.size / (1024 * 1024)).toFixed(2)}MB` 
      });
      return;
    }

    setUploading(true);
    setMessage(null);
    setStats({ total: 0, success: 0, failed: 0 });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/tuong-duong-sinh-hoc/import', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Lỗi khi import dữ liệu');
      }

      setStats(result.stats);
      setMessage({ 
        type: 'success', 
        text: `Import thành công! ${result.stats.success}/${result.stats.total} dòng được thêm vào database.` 
      });

      // Refresh history
      fetchHistory();

      // Reset input
      e.target.value = '';
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await fetch('/api/tuong-duong-sinh-hoc/template');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Template_Tuong_Duong_Sinh_Hoc.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Lỗi khi tải template');
    }
  };

  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      '⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa TẤT CẢ dữ liệu Tương đương sinh học?\n\n' +
      'Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa vĩnh viễn.\n\n' +
      'Nhập "XÓA TẤT CẢ" để xác nhận:'
    );

    if (!confirmed) return;

    const confirmText = window.prompt('Nhập "XÓA TẤT CẢ" để xác nhận xóa:');
    if (confirmText !== 'XÓA TẤT CẢ') {
      setMessage({ type: 'error', text: 'Xác nhận không đúng. Hành động đã bị hủy.' });
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/tuong-duong-sinh-hoc', {
        method: 'DELETE',
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Lỗi khi xóa dữ liệu');
      }

      setMessage({
        type: 'success',
        text: result.message || `Đã xóa ${result.deletedCount || 0} bản ghi tương đương sinh học`
      });

      // Refresh history
      fetchHistory();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setDeleting(false);
    }
  };

  const fetchColumnConfigs = async () => {
    try {
      setLoadingConfigs(true);
      const res = await fetch('/api/column-config?type=TDSH');
      if (res.ok) {
        const data = await res.json();
        setColumnConfigs(data || {});
      }
    } catch (error) {
      console.error('Failed to fetch column configs');
    } finally {
      setLoadingConfigs(false);
    }
  };

  const handleSaveColumnConfigs = async () => {
    setSavingConfigs(true);
    setMessage(null);

    try {
      const res = await fetch('/api/column-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'TDSH',
          configs: columnConfigs,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Lỗi khi lưu cấu hình');
      }

      setMessage({
        type: 'success',
        text: 'Đã lưu cấu hình tên cột thành công!'
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSavingConfigs(false);
    }
  };

  const defaultColumnNames: { [key: string]: string } = {
    stt: 'STT',
    tenThuoc: 'Tên thuốc',
    hamLuong: 'Hàm lượng',
    dangBaoChe: 'Dạng bào chế',
    quyCachDongGoi: 'Quy cách đóng gói',
    soDangKy: 'Số đăng ký',
    tenCoSoSanXuat: 'Cơ sở sản xuất',
    diaChiCoSoSanXuat: 'Địa chỉ cơ sở sản xuất',
    ghiChu: 'Ghi chú',
    soQuyetDinh: 'Số Quyết định',
  };

  if (!session) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý Danh mục Tương đương sinh học - Import từ Excel
      </h2>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Hướng dẫn Import</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>File Excel phải có đúng 9 cột theo thứ tự bên dưới</li>
          <li>Dòng đầu tiên là tiêu đề (header) - sẽ bị bỏ qua</li>
          <li>Tên thuốc là trường bắt buộc</li>
          <li>Tải template mẫu để tham khảo cấu trúc</li>
        </ol>
      </div>

      {/* Column list */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          9 cột theo thứ tự (Cột A → I):
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
          <div>1. Tên thuốc *</div>
          <div>2. Hàm lượng</div>
          <div>3. Dạng bào chế</div>
          <div>4. Quy cách đóng gói</div>
          <div>5. Số đăng ký</div>
          <div>6. Cơ sở sản xuất</div>
          <div>7. Địa chỉ cơ sở sản xuất</div>
          <div>8. Ghi chú</div>
          <div>9. Số Quyết định</div>
          <div className="col-span-2 text-xs text-gray-500 italic mt-2">
            * Trường bắt buộc
          </div>
        </div>
      </div>

      {/* Template download, Delete all, and Column Config */}
      <div className="mb-6 flex gap-4 items-end flex-wrap">
        <div>
          <button
            onClick={downloadTemplate}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            📥 Tải Template mẫu Excel (.xlsx)
          </button>
          <p className="text-sm text-gray-500 mt-2">
            File Excel có sẵn dòng mẫu để bạn tham khảo
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowColumnConfig(!showColumnConfig)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
          >
            {showColumnConfig ? '✕ Đóng' : '⚙️ Quản lý tên cột'}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Thay đổi tên hiển thị các cột
          </p>
        </div>
        <div>
          <button
            onClick={handleDeleteAll}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition"
          >
            {deleting ? 'Đang xóa...' : '🗑️ Xóa tất cả dữ liệu'}
          </button>
          <p className="text-sm text-red-600 mt-2">
            ⚠️ Xóa vĩnh viễn tất cả dữ liệu
          </p>
        </div>
      </div>

      {/* Column Config Section */}
      {showColumnConfig && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-900 mb-4">
            ⚙️ Quản lý tên cột - Tương đương sinh học
          </h3>
          <p className="text-sm text-purple-700 mb-4">
            Thay đổi tên hiển thị của các cột trong bảng "Tương đương sinh học"
          </p>
          
          {loadingConfigs ? (
            <div className="text-center py-4 text-purple-600">Đang tải...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 max-h-96 overflow-y-auto">
                {Object.entries(defaultColumnNames).map(([key, defaultName]) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-sm font-medium text-purple-800 mb-1">
                      {defaultName}
                    </label>
                    <input
                      type="text"
                      value={columnConfigs[key] || defaultName}
                      onChange={(e) => {
                        const newConfigs = { ...columnConfigs };
                        if (e.target.value === defaultName) {
                          delete newConfigs[key];
                        } else {
                          newConfigs[key] = e.target.value;
                        }
                        setColumnConfigs(newConfigs);
                      }}
                      placeholder={defaultName}
                      className="px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <button
                      onClick={() => {
                        const newConfigs = { ...columnConfigs };
                        delete newConfigs[key];
                        setColumnConfigs(newConfigs);
                      }}
                      className="text-xs text-purple-600 hover:text-purple-800 mt-1 text-left"
                    >
                      ↺ Đặt lại mặc định
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveColumnConfigs}
                  disabled={savingConfigs}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition"
                >
                  {savingConfigs ? 'Đang lưu...' : '💾 Lưu cấu hình'}
                </button>
                <button
                  onClick={() => {
                    setColumnConfigs({});
                    fetchColumnConfigs();
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
                >
                  ↺ Đặt lại tất cả
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Upload section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="mb-4">
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition inline-block"
          >
            {uploading ? 'Đang xử lý...' : 'Chọn file Excel'}
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>
        <p className="text-sm text-gray-500">
          Chấp nhận file .xlsx và .xls (tối đa 100MB)
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats */}
      {stats.total > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Kết quả Import:</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Tổng số dòng</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.success}
              </div>
              <div className="text-sm text-gray-600">Thành công</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {stats.failed}
              </div>
              <div className="text-sm text-gray-600">Thất bại</div>
            </div>
          </div>
        </div>
      )}

      {/* Import History */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Lịch sử Import
        </h3>
        {loadingHistory ? (
          <div className="text-center py-4 text-gray-500">Đang tải...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Chưa có lịch sử import
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên file
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Số thuốc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thành công
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thất bại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Người import
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày cập nhật
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(history) && history.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.fileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.totalRecords}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {item.successCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {item.failedCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.user?.username || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}



