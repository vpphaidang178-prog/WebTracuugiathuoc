"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function QuanLyVSSPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, importHistoryId: null as string | null });
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [columnConfigs, setColumnConfigs] = useState<{ [key: string]: string }>({});
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [savingConfigs, setSavingConfigs] = useState(false);
  const [showErrorsModal, setShowErrorsModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loadingErrors, setLoadingErrors] = useState(false);
  const [errorFileName, setErrorFileName] = useState('');

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
      const res = await fetch('/api/import-history?type=VSS');
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

  const handleViewErrors = async (importId: string, fileName: string) => {
    setLoadingErrors(true);
    setErrorFileName(fileName);
    try {
      const res = await fetch(`/api/import-history/${importId}/errors`);
      if (res.ok) {
        const data = await res.json();
        setErrors(data.errors || []);
        setShowErrorsModal(true);
      } else {
        setMessage({ type: 'error', text: 'Không thể tải chi tiết lỗi' });
      }
    } catch (error) {
      console.error('Failed to fetch errors:', error);
      setMessage({ type: 'error', text: 'Không thể tải chi tiết lỗi' });
    } finally {
      setLoadingErrors(false);
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
    setStats({ total: 0, success: 0, failed: 0, importHistoryId: null });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/thuoc-vss/import', {
        method: 'POST',
        body: formData,
      });

      // Check if response is JSON
      let result;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      } else {
        // If not JSON, try to get text
        const text = await res.text();
        result = { error: text || 'Lỗi không xác định' };
      }

      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 401 || res.status === 403) {
          throw new Error('Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại.');
        }
        throw new Error(result.error || 'Lỗi khi import dữ liệu');
      }

      setStats({
        ...result.stats,
        importHistoryId: result.importHistoryId || null
      });
      
      let messageText = '';
      if (result.stats.failed > 0) {
        messageText = `Import thành công! ${result.stats.success}/${result.stats.total} dòng được thêm vào database. Có ${result.stats.failed} dòng thất bại. Click vào số thất bại để xem chi tiết.`;
      } else {
        messageText = `Import thành công! ${result.stats.success}/${result.stats.total} dòng được thêm vào database.`;
      }
      
      // Cảnh báo nếu không lưu được lịch sử
      if (!result.importHistoryId) {
        messageText += ' (Lưu ý: Không thể lưu lịch sử import)';
      }
      
      setMessage({ 
        type: result.stats.failed > 0 ? 'error' : 'success', 
        text: messageText
      });

      // Refresh history sau một chút để đảm bảo database đã commit
      setTimeout(() => {
        fetchHistory();
      }, 500);

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
      const res = await fetch('/api/thuoc-vss/template');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Template_Thuoc_VSS.xlsx';
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
      '⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa TẤT CẢ dữ liệu thuốc VSS?\n\n' +
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
      const res = await fetch('/api/thuoc-vss', {
        method: 'DELETE',
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
        throw new Error(result.error || 'Lỗi khi xóa dữ liệu');
      }

      setMessage({
        type: 'success',
        text: result.message || `Đã xóa ${result.deletedCount || 0} bản ghi thuốc VSS`
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
      const res = await fetch('/api/column-config?type=VSS');
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
          type: 'VSS',
          configs: columnConfigs,
        }),
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
    hoatChat: 'Hoạt chất',
    hamLuong: 'Hàm lượng',
    gdklh: 'GĐKLH',
    duongDung: 'Đường dùng',
    dangBaoChe: 'Dạng bào chế',
    tenCoSoSanXuat: 'Tên cơ sở SX',
    nuocSanXuat: 'Nước SX',
    quyCachDongGoi: 'Quy cách đóng gói',
    donViTinh: 'Đơn vị tính',
    soLuong: 'Số lượng',
    donGia: 'Đơn giá',
    nhomThuoc: 'Nhóm thuốc',
    tenDonViTrungThau: 'Tên ĐV trúng thầu',
    tinh: 'Tỉnh',
    tenNhaThau: 'Tên nhà thầu',
    soQuyetDinh: 'Số quyết định',
    ngayCongBo: 'Ngày công bố',
    loaiThuoc: 'Loại thuốc',
    maTT: 'Mã TT',
    maDuongDung: 'Mã đường dùng',
  };

  if (!session) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Quản lý thuốc VSS - Import từ Excel
      </h2>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Hướng dẫn Import</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>File Excel phải có đúng 23 cột theo thứ tự bên dưới</li>
          <li>Dòng đầu tiên là tiêu đề (header) - sẽ bị bỏ qua</li>
          <li>Tên thuốc là trường bắt buộc</li>
          <li>Ngày tháng theo định dạng: YYYY-MM-DD (ví dụ: 2024-01-15)</li>
          <li>Tải template mẫu để tham khảo cấu trúc</li>
        </ol>
      </div>

      {/* Column list */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          23 cột theo thứ tự (Cột A → W):
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
          <div>1. Tên thuốc *</div>
          <div>2. Hoạt chất</div>
          <div>3. Hàm lượng</div>
          <div>4. GĐKLH</div>
          <div>5. Đường dùng</div>
          <div>6. Dạng bào chế</div>
          <div>7. Tên cơ sở sản xuất</div>
          <div>8. Nước sản xuất</div>
          <div>9. Quy cách đóng gói</div>
          <div>10. Đơn vị tính</div>
          <div>11. Số lượng</div>
          <div>12. Đơn giá</div>
          <div>13. Nhóm thuốc</div>
          <div>14. Tên đơn vị trúng thầu</div>
          <div>15. Tỉnh</div>
          <div>16. Tên nhà thầu</div>
          <div>17. Số quyết định</div>
          <div>18. Ngày công bố (YYYY-MM-DD)</div>
          <div>19. Loại thuốc</div>
          <div>20. Mã TT</div>
          <div>21. Mã Đường dùng</div>
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
            {deleting ? 'Đang xóa...' : '🗑️ Xóa tất cả dữ liệu VSS'}
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
            ⚙️ Quản lý tên cột - VSS
          </h3>
          <p className="text-sm text-purple-700 mb-4">
            Thay đổi tên hiển thị của các cột trong bảng "Giá trúng thầu theo VSS"
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
              {stats.failed > 0 ? (
                <button
                  onClick={() => {
                    // Tìm importHistoryId từ stats hoặc từ history mới nhất
                    const importId = stats.importHistoryId || history[0]?.id;
                    const fileName = history[0]?.fileName || 'File vừa import';
                    if (importId) {
                      handleViewErrors(importId, fileName);
                    } else {
                      setMessage({ type: 'error', text: 'Không tìm thấy thông tin import' });
                    }
                  }}
                  className="text-2xl font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                >
                  {stats.failed}
                </button>
              ) : (
                <div className="text-2xl font-bold text-red-600">
                  {stats.failed}
                </div>
              )}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.failedCount > 0 ? (
                        <button
                          onClick={() => handleViewErrors(item.id, item.fileName)}
                          className="text-red-600 hover:text-red-800 hover:underline font-medium cursor-pointer"
                        >
                          {item.failedCount}
                        </button>
                      ) : (
                        <span className="text-gray-400">{item.failedCount}</span>
                      )}
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

      {/* Errors Modal */}
      {showErrorsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                Chi tiết lỗi import - {errorFileName}
              </h3>
              <button
                onClick={() => {
                  setShowErrorsModal(false);
                  setErrors([]);
                  setErrorFileName('');
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1">
              {loadingErrors ? (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ) : errors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Không có lỗi nào</div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-4">
                    Tổng số lỗi: <span className="font-semibold text-red-600">{errors.length}</span>
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <ul className="space-y-2">
                      {errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-800 border-b border-red-100 pb-2 last:border-0">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowErrorsModal(false);
                  setErrors([]);
                  setErrorFileName('');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
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
