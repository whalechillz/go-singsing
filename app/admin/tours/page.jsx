import Link from "next/link";

const dummyTours = [
  { id: "tour1", title: "순천 2박3일", dateRange: "05/19(월)~21(수)", driverPhone: "010-5254-9876" },
  { id: "tour2", title: "제주 3박4일", dateRange: "06/10(월)~13(목)", driverPhone: "010-1234-5678" },
];

const TourListPage = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold dark:text-white">투어 관리</h1>
      <Link href="/admin/tours/new" className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 focus:bg-blue-700" aria-label="투어 생성">+ 투어 생성</Link>
    </div>
    <table className="w-full bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          <th className="py-2 px-4 text-left">제목</th>
          <th className="py-2 px-4 text-left">날짜</th>
          <th className="py-2 px-4 text-left">기사님</th>
          <th className="py-2 px-4">관리</th>
        </tr>
      </thead>
      <tbody>
        {dummyTours.map((tour) => (
          <tr key={tour.id} className="border-t border-gray-200 dark:border-gray-700">
            <td className="py-2 px-4 dark:text-gray-100">{tour.title}</td>
            <td className="py-2 px-4 dark:text-gray-100">{tour.dateRange}</td>
            <td className="py-2 px-4 dark:text-gray-100">{tour.driverPhone}</td>
            <td className="py-2 px-4 flex gap-2">
              <Link href={`/admin/tours/${tour.id}/edit`} className="text-blue-800 dark:text-blue-400 underline hover:text-blue-600 focus:text-blue-600 dark:hover:text-blue-300 dark:focus:text-blue-300" aria-label="수정">수정</Link>
              <button className="text-red-600 dark:text-red-400 underline hover:text-red-400 focus:text-red-400" aria-label="삭제" disabled>삭제</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TourListPage; 