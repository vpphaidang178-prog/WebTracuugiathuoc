"use client";

import { useState, useEffect } from "react";

interface BietDuocGoc {
  id: string;
  tenThuoc: string;
  hamLuong?: string;
  dangBaoCheQuyCach?: string;
  soDangKy?: string;
  tenCoSoSanXuat?: string;
  diaChiCoSoSanXuat?: string;
  ghiChu?: string;
  soQuyetDinh?: string;
}

export default function BietDuocGocPage() {
  const [data, setData] = useState<BietDuocGoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [columnNames, setColumnNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchData();
    fetchColumnNames();
  }, [searchQuery, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      const res = await fetch(`/api/biet-duoc-goc?${params}`);
      if (res.ok) {
        const result = await res.json();
        setData(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchColumnNames = async () => {
    try {
      const res = await fetch('/api/column-config?type=BDG');
      if (res.ok) {
        const data = await res.json();
        setColumnNames(data || {});
      }
    } catch (error) {
      console.error('Failed to fetch column names');
    }
  };

  const getColumnName = (key: string, defaultName: string): string => {
    return columnNames[key] || defaultName;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
    setPage(1);
  };

  const handleCheckbox = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.map((item) => item.id)));
    }
  };

  const handleExportExcel = async () => {
    if (selectedItems.size === 0) {
      alert("Vui lòng chọn ít nhất một thuốc để xuất Excel");
      return;
    }

    try {
      setExporting(true);
      const response = await fetch('/api/biet-duoc-goc/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: Array.from(selectedItems) }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Lỗi khi xuất file Excel');
      }

      // Lấy blob từ response
      const blob = await response.blob();
      
      // Tạo URL tạm thời và tải file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Lấy tên file từ header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'Biet_Duoc_Goc.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export error:', error);
      alert(error.message || 'Lỗi khi xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Biệt dược gốc
      </h2>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên thuốc, số đăng ký, cơ sở sản xuất..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Tìm kiếm
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Không có dữ liệu
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleExportExcel}
              disabled={exporting || selectedItems.size === 0}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-md"
            >
              {exporting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xuất...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Xuất Excel ({selectedItems.size})
                </>
              )}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-600 uppercase w-12">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-600 uppercase w-16">
                    {getColumnName('stt', 'STT')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-600 uppercase min-w-[200px]">
                    {getColumnName('tenThuoc', 'Tên thuốc')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-600 uppercase min-w-[120px]">
                    {getColumnName('hamLuong', 'Hàm lượng')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-600 uppercase min-w-[180px]">
                    {getColumnName('dangBaoCheQuyCach', 'Dạng bào chế/Quy cách')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-600 uppercase min-w-[150px]">
                    {getColumnName('soDangKy', 'Số đăng ký')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-600 uppercase min-w-[200px]">
                    {getColumnName('tenCoSoSanXuat', 'Cơ sở sản xuất')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-600 uppercase min-w-[250px]">
                    {getColumnName('diaChiCoSoSanXuat', 'Địa chỉ cơ sở sản xuất')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-600 uppercase min-w-[200px]">
                    {getColumnName('ghiChu', 'Ghi chú')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-600 uppercase min-w-[150px]">
                    {getColumnName('soQuyetDinh', 'Số quyết định')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleCheckbox(item.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {(page - 1) * 50 + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.tenThuoc || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.hamLuong || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.dangBaoCheQuyCach || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.soDangKy || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.tenCoSoSanXuat || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.diaChiCoSoSanXuat || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.ghiChu || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.soQuyetDinh || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="px-4 py-2">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>

          {selectedItems.size > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Đã chọn: {selectedItems.size} mục
            </div>
          )}
        </>
      )}
    </div>
  );
}



