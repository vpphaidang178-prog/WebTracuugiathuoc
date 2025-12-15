export default function DashboardPage() {
  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Chào mừng đến với Hệ thống tra cứu giá trúng thầu
      </h2>
      <p className="text-gray-600 mb-4">
        Sử dụng menu phía trên để tra cứu thông tin thuốc trúng thầu theo VSS hoặc MSC.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">
            Giá trúng thầu theo VSS
          </h3>
          <p className="text-blue-700">
            Tra cứu thông tin thuốc trúng thầu theo Bảo hiểm Y tế VSS
          </p>
        </div>
        <div className="border border-green-200 rounded-lg p-6 bg-green-50">
          <h3 className="text-xl font-semibold text-green-900 mb-2">
            Giá trúng thầu theo MSC
          </h3>
          <p className="text-green-700">
            Tra cứu thông tin thuốc trúng thầu theo Mạng lưới Mua sắm Công
          </p>
        </div>
      </div>
    </div>
  );
}





