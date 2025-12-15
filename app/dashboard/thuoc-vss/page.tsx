"use client";

import { useState, useEffect, useRef } from "react";
import AdvancedSearch, { SearchFilter } from "@/components/AdvancedSearch";

interface ThuocVSS {
  id: string;
  tenThuoc: string;
  hoatChat?: string;
  hamLuong?: string;
  gdklh?: string;
  duongDung?: string;
  dangBaoChe?: string;
  tenCoSoSanXuat?: string;
  nuocSanXuat?: string;
  quyCachDongGoi?: string;
  donViTinh?: string;
  soLuong?: string;
  donGia?: string;
  nhomThuoc?: string;
  tenDonViTrungThau?: string;
  tinh?: string;
  tenNhaThau?: string;
  soQuyetDinh?: string;
  ngayCongBo?: string;
  loaiThuoc?: string;
  maTT?: string;
  maDuongDung?: string;
}

export default function ThuocVSSPage() {
  const [data, setData] = useState<ThuocVSS[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilter, setAdvancedFilter] = useState<SearchFilter | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
    stt: 60,
    tenThuoc: 200,
    hoatChat: 150,
    hamLuong: 100,
    gdklh: 120,
    duongDung: 100,
    dangBaoChe: 120,
    tenCoSoSanXuat: 180,
    nuocSanXuat: 100,
    quyCachDongGoi: 150,
    donViTinh: 100,
    soLuong: 100,
    donGia: 100,
    nhomThuoc: 150,
    tenDonViTrungThau: 180,
    tinh: 100,
    tenNhaThau: 180,
    soQuyetDinh: 150,
    ngayCongBo: 120,
    loaiThuoc: 120,
    maTT: 100,
    maDuongDung: 120,
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [stats, setStats] = useState({
    total: 0,
    avgPrice: 0,
    modePrice: 0,
    medianPrice: 0,
    minPrice: 0,
    maxPrice: 0,
  });
  const [columnNames, setColumnNames] = useState<{ [key: string]: string }>({});
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    'stt', 'tenThuoc', 'hoatChat', 'hamLuong', 'gdklh', 'duongDung', 
    'dangBaoChe', 'tenCoSoSanXuat', 'nuocSanXuat', 'quyCachDongGoi', 
    'donViTinh', 'soLuong', 'donGia', 'nhomThuoc', 'tenDonViTrungThau', 
    'tinh', 'tenNhaThau', 'soQuyetDinh', 'ngayCongBo', 'loaiThuoc', 
    'maTT', 'maDuongDung'
  ]));
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const columnToggleRef = useRef<HTMLDivElement>(null);
  const [freezeColumnCount, setFreezeColumnCount] = useState(0); // Số cột freeze từ trái (0 = không freeze)
  const [freezeRowCount, setFreezeRowCount] = useState(1); // Số dòng freeze từ trên (1 = freeze header)
  const [showFreezePanel, setShowFreezePanel] = useState(false);
  const freezePanelRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [wrapText, setWrapText] = useState(false);

  useEffect(() => {
    fetchData();
    fetchStats();
    fetchColumnNames();
  }, [searchQuery, advancedFilter, page]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnToggleRef.current && !columnToggleRef.current.contains(event.target as Node)) {
        setShowColumnToggle(false);
      }
      if (freezePanelRef.current && !freezePanelRef.current.contains(event.target as Node)) {
        setShowFreezePanel(false);
      }
    };

    if (showColumnToggle || showFreezePanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnToggle, showFreezePanel]);

  const fetchColumnNames = async () => {
    try {
      const res = await fetch('/api/column-config?type=VSS');
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

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (advancedFilter) {
        params.append("filter", JSON.stringify(advancedFilter));
      }
      
      const res = await fetch(`/api/thuoc-vss/stats?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setStats(result);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "50");
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (advancedFilter) {
        params.append("filter", JSON.stringify(advancedFilter));
      }
      
      const res = await fetch(`/api/thuoc-vss?${params.toString()}`);
      const result = await res.json();
      setData(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      alert("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
    setAdvancedFilter(null);
    setPage(1);
  };

  const handleAdvancedFilterApply = (filter: SearchFilter) => {
    setAdvancedFilter(filter);
    setSearchQuery("");
    setPage(1);
  };

  const handleAdvancedFilterClear = () => {
    setAdvancedFilter(null);
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
      const response = await fetch('/api/thuoc-vss/export', {
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
      let filename = 'Thuoc_VSS.xlsx';
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

  const handleMouseDown = (columnKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingColumn(columnKey);
    const startX = e.clientX;
    const startWidth = columnWidths[columnKey] || 150;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      setColumnWidths((prev) => ({
        ...prev,
        [columnKey]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  // Tính toán left position cho freeze columns
  const getColumnLeftPosition = (columnIndex: number): number => {
    if (freezeColumnCount === 0 || columnIndex >= freezeColumnCount) {
      return 0;
    }
    let left = 50; // Checkbox column width
    const visibleCols = columnDefinitions.filter(col => visibleColumns.has(col.key));
    for (let i = 0; i < columnIndex && i < visibleCols.length; i++) {
      const colKey = visibleCols[i].key;
      left += columnWidths[colKey] || 150;
    }
    return left;
  };

  // Lấy danh sách các cột visible theo thứ tự
  const getVisibleColumnsOrdered = () => {
    return columnDefinitions.filter(col => visibleColumns.has(col.key));
  };

  const ResizableHeader = ({
    columnKey,
    children,
    columnIndex,
  }: {
    columnKey: string;
    children: React.ReactNode;
    columnIndex: number;
  }) => {
    if (!visibleColumns.has(columnKey)) {
      return null;
    }
    const width = columnWidths[columnKey] || 150;
    const isFrozen = freezeColumnCount > 0 && columnIndex < freezeColumnCount;
    const left = isFrozen ? getColumnLeftPosition(columnIndex) : 0;
    
    return (
      <th
        style={{ 
          width: `${width}px`, 
          position: isFrozen ? "sticky" : "relative",
          left: isFrozen ? `${left}px` : "auto",
          zIndex: isFrozen ? 20 : 1,
          backgroundColor: isFrozen ? "#f9fafb" : "transparent",
        }}
        className="px-3 py-3 text-left text-xs font-bold text-red-600 uppercase"
      >
        {children}
        <div
          onMouseDown={(e) => handleMouseDown(columnKey, e)}
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize z-10 ${
            resizingColumn === columnKey
              ? "bg-blue-500"
              : "bg-transparent hover:bg-blue-300"
          }`}
          style={{ marginRight: "-2px" }}
        />
      </th>
    );
  };

  const columnDefinitions = [
    { key: 'stt', label: 'STT' },
    { key: 'tenThuoc', label: 'Tên thuốc' },
    { key: 'hoatChat', label: 'Hoạt chất' },
    { key: 'hamLuong', label: 'Hàm lượng' },
    { key: 'gdklh', label: 'GĐKLH' },
    { key: 'duongDung', label: 'Đường dùng' },
    { key: 'dangBaoChe', label: 'Dạng bào chế' },
    { key: 'tenCoSoSanXuat', label: 'Tên cơ sở SX' },
    { key: 'nuocSanXuat', label: 'Nước SX' },
    { key: 'quyCachDongGoi', label: 'Quy cách đóng gói' },
    { key: 'donViTinh', label: 'Đơn vị tính' },
    { key: 'soLuong', label: 'Số lượng' },
    { key: 'donGia', label: 'Đơn giá' },
    { key: 'nhomThuoc', label: 'Nhóm thuốc' },
    { key: 'tenDonViTrungThau', label: 'Tên ĐV trúng thầu' },
    { key: 'tinh', label: 'Tỉnh' },
    { key: 'tenNhaThau', label: 'Tên nhà thầu' },
    { key: 'soQuyetDinh', label: 'Số quyết định' },
    { key: 'ngayCongBo', label: 'Ngày công bố' },
    { key: 'loaiThuoc', label: 'Loại thuốc' },
    { key: 'maTT', label: 'Mã TT' },
    { key: 'maDuongDung', label: 'Mã đường dùng' },
  ];

  const handleToggleColumn = (columnKey: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnKey)) {
      newVisible.delete(columnKey);
    } else {
      newVisible.add(columnKey);
    }
    setVisibleColumns(newVisible);
  };

  const handleShowAllColumns = () => {
    setVisibleColumns(new Set(columnDefinitions.map(col => col.key)));
  };

  const handleHideAllColumns = () => {
    setVisibleColumns(new Set(['stt'])); // Giữ lại STT
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Giá trúng thầu theo VSS
      </h2>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên thuốc, hoạt chất, cơ sở sản xuất..."
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

      {/* Advanced Search */}
      <AdvancedSearch
        fields={[
          { value: "tenThuoc", label: "Tên thuốc", type: "string" },
          { value: "hoatChat", label: "Tên hoạt chất", type: "string" },
          { value: "hamLuong", label: "Hàm lượng", type: "string" },
          { value: "gdklh", label: "GĐKLH", type: "string" },
          { value: "duongDung", label: "Đường dùng", type: "string" },
          { value: "dangBaoChe", label: "Dạng bào chế", type: "string" },
          { value: "tenCoSoSanXuat", label: "Tên cơ sở sản xuất", type: "string" },
          { value: "nuocSanXuat", label: "Nước sản xuất", type: "string" },
          { value: "quyCachDongGoi", label: "Quy cách đóng gói", type: "string" },
          { value: "donViTinh", label: "Đơn vị tính", type: "string" },
          { value: "soLuong", label: "Số lượng", type: "number" },
          { value: "donGia", label: "Đơn giá", type: "number" },
          { value: "nhomThuoc", label: "Nhóm thuốc", type: "string" },
          { value: "tenDonViTrungThau", label: "Tên đơn vị trúng thầu", type: "string" },
          { value: "tinh", label: "Tỉnh", type: "string" },
          { value: "tenNhaThau", label: "Tên nhà thầu", type: "string" },
          { value: "soQuyetDinh", label: "Số quyết định", type: "string" },
          { value: "ngayCongBo", label: "Ngày công bố", type: "date" },
          { value: "loaiThuoc", label: "Loại thuốc", type: "string" },
          { value: "maTT", label: "Mã TT", type: "string" },
          { value: "maDuongDung", label: "Mã đường dùng", type: "string" },
        ]}
        onApply={handleAdvancedFilterApply}
        onClear={handleAdvancedFilterClear}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium mb-1">
            Tổng số thuốc
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {stats.total.toLocaleString("vi-VN")}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium mb-1">
            Giá trung bình
          </div>
          <div className="text-2xl font-bold text-green-900">
            {stats.avgPrice > 0
              ? stats.avgPrice.toLocaleString("vi-VN")
              : "-"}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium mb-1">
            Giá phổ biến
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {stats.modePrice > 0
              ? stats.modePrice.toLocaleString("vi-VN")
              : "-"}
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-600 font-medium mb-1">
            Giá trung vị
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {stats.medianPrice > 0
              ? stats.medianPrice.toLocaleString("vi-VN")
              : "-"}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600 font-medium mb-1">Giá min</div>
          <div className="text-2xl font-bold text-red-900">
            {stats.minPrice > 0 ? stats.minPrice.toLocaleString("vi-VN") : "-"}
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="text-sm text-indigo-600 font-medium mb-1">Giá max</div>
          <div className="text-2xl font-bold text-indigo-900">
            {stats.maxPrice > 0 ? stats.maxPrice.toLocaleString("vi-VN") : "-"}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Không có dữ liệu
        </div>
      ) : (
        <>
          <div className="relative mb-4">
            {/* Nút Ẩn/Hiện cột, Freeze Panes, Wrap Text và Xuất Excel */}
            <div className="flex justify-end gap-2 mb-2">
              {/* Nút Wrap Text */}
              <button
                onClick={() => setWrapText(!wrapText)}
                className={`${
                  wrapText 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                } text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-md`}
                title={wrapText ? "Tắt xuống dòng tự động" : "Bật xuống dòng tự động"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {wrapText ? "Tắt Wrap Text" : "Bật Wrap Text"}
              </button>
              
              {/* Nút Xuất Excel */}
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
              
              {/* Nút Freeze Panes */}
              <div className="relative" ref={freezePanelRef}>
                <button
                  onClick={() => setShowFreezePanel(!showFreezePanel)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  Freeze Panes
                </button>
                
                {/* Freeze Panes Panel */}
                {showFreezePanel && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-4">Cài đặt Freeze Panes</h3>
                      
                      {/* Freeze Columns */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số cột đóng băng (từ trái):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={columnDefinitions.filter(col => visibleColumns.has(col.key)).length}
                            value={freezeColumnCount}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const maxCols = columnDefinitions.filter(col => visibleColumns.has(col.key)).length;
                              setFreezeColumnCount(Math.max(0, Math.min(val, maxCols)));
                            }}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                          />
                          <span className="text-sm text-gray-500">
                            / {columnDefinitions.filter(col => visibleColumns.has(col.key)).length} cột
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Chọn số cột muốn đóng băng khi cuộn ngang
                        </p>
                      </div>

                      {/* Freeze Rows */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số dòng đóng băng (từ trên):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={data.length + 1}
                            value={freezeRowCount}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setFreezeRowCount(Math.max(0, Math.min(val, data.length + 1)));
                            }}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                          />
                          <span className="text-sm text-gray-500">
                            (0 = không freeze, 1 = freeze header)
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Chọn số dòng muốn đóng băng khi cuộn dọc
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setFreezeColumnCount(0);
                            setFreezeRowCount(1);
                          }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition text-sm"
                        >
                          Đặt lại
                        </button>
                        <button
                          onClick={() => setShowFreezePanel(false)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm"
                        >
                          Áp dụng
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Nút Ẩn/Hiện cột */}
              <div className="relative" ref={columnToggleRef}>
                <button
                  onClick={() => setShowColumnToggle(!showColumnToggle)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Ẩn/Hiện cột
                </button>
                
                {/* Dropdown menu */}
                {showColumnToggle && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-800">Chọn cột hiển thị</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleShowAllColumns}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                        >
                          Hiện tất cả
                        </button>
                        <button
                          onClick={handleHideAllColumns}
                          className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                        >
                          Ẩn tất cả
                        </button>
                      </div>
                    </div>
                    <div className="p-2">
                      {columnDefinitions.map((col) => (
                        <label
                          key={col.key}
                          className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer rounded"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns.has(col.key)}
                            onChange={() => handleToggleColumn(col.key)}
                            className="rounded mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            {getColumnName(col.key, col.label)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table
              ref={tableRef}
              className="divide-y divide-gray-200 text-sm"
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-3 py-3 text-left bg-gray-50 font-bold text-red-600"
                    style={{ 
                      width: "50px",
                      position: freezeColumnCount > 0 ? "sticky" : "relative",
                      left: freezeColumnCount > 0 ? "0px" : "auto",
                      zIndex: freezeColumnCount > 0 ? 30 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.size === data.length}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  {getVisibleColumnsOrdered().map((col, index) => (
                    <ResizableHeader 
                      key={col.key} 
                      columnKey={col.key}
                      columnIndex={index}
                    >
                      {getColumnName(col.key, col.label)}
                    </ResizableHeader>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, rowIndex) => {
                  const isFrozenRow = freezeRowCount > 1 && rowIndex < freezeRowCount - 1;
                  const visibleCols = getVisibleColumnsOrdered();
                  
                  // Tính top position cho frozen rows
                  let topPosition = 0;
                  if (freezeRowCount > 1) {
                    // Header row height ~40px, mỗi data row ~40px
                    topPosition = 40; // Header
                    for (let i = 0; i < rowIndex && i < freezeRowCount - 1; i++) {
                      topPosition += 40;
                    }
                  }
                  
                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50"
                      style={{
                        position: isFrozenRow ? "sticky" : "relative",
                        top: isFrozenRow ? `${topPosition}px` : "auto",
                        zIndex: isFrozenRow ? 15 : 1,
                        backgroundColor: isFrozenRow ? "#ffffff" : "transparent",
                      }}
                    >
                      <td 
                        className="px-3 py-2 bg-white"
                        style={{ 
                          position: freezeColumnCount > 0 ? "sticky" : "relative",
                          left: freezeColumnCount > 0 ? "0px" : "auto",
                          zIndex: freezeColumnCount > 0 ? (isFrozenRow ? 35 : 25) : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleCheckbox(item.id)}
                          className="rounded"
                        />
                      </td>
                      {visibleCols.map((col, colIndex) => {
                        const isFrozenCol = freezeColumnCount > 0 && colIndex < freezeColumnCount;
                        const left = isFrozenCol ? getColumnLeftPosition(colIndex) : 0;
                        const colKey = col.key;
                        const width = columnWidths[colKey] || 150;
                        
                        let cellContent: string | number = "-";
                        if (colKey === 'stt') {
                          cellContent = (page - 1) * 50 + rowIndex + 1;
                        } else if (colKey === 'tenThuoc') {
                          cellContent = item.tenThuoc || "-";
                        } else if (colKey === 'ngayCongBo') {
                          cellContent = item.ngayCongBo
                            ? new Date(item.ngayCongBo).toLocaleDateString("vi-VN")
                            : "-";
                        } else {
                          const value = (item as any)[colKey];
                          cellContent = value !== undefined && value !== null ? String(value) : "-";
                        }
                        
                        return (
                          <td
                            key={colKey}
                            className={`px-3 py-2 ${
                              wrapText 
                                ? (colKey === 'stt' ? 'whitespace-nowrap' : 'whitespace-normal break-words')
                                : 'overflow-hidden text-ellipsis ' + (colKey === 'stt' ? 'whitespace-nowrap' : '')
                            }`}
                            style={{ 
                              width: `${width}px`,
                              position: isFrozenCol ? "sticky" : "relative",
                              left: isFrozenCol ? `${left}px` : "auto",
                              zIndex: isFrozenCol ? (isFrozenRow ? 25 : 20) : 1,
                              backgroundColor: isFrozenCol ? (isFrozenRow ? "#f9fafb" : "#ffffff") : "transparent",
                              ...(wrapText && colKey !== 'stt' ? { 
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                                overflow: 'visible'
                              } : {})
                            }}
                          >
                            <div 
                              className={wrapText && colKey !== 'stt' ? '' : 'truncate'} 
                              title={!wrapText ? String(cellContent) : undefined}
                            >
                              {cellContent}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
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
        </>
      )}
    </div>
  );
}

