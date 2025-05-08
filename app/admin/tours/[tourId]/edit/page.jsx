const TourEditPage = () => (
  <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-lg shadow p-8">
    <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">투어 수정</h2>
    <form className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
        <span className="font-medium">제목</span>
        <input type="text" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" defaultValue="순천 2박3일" required />
      </label>
      <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
        <span className="font-medium">날짜</span>
        <input type="text" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" defaultValue="05/19(월)~21(수)" required />
      </label>
      <label className="flex flex-col gap-1 text-gray-700 dark:text-gray-300">
        <span className="font-medium">담당 기사님 연락처</span>
        <input type="text" className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" defaultValue="010-5254-9876" required />
      </label>
      <button type="submit" className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 focus:bg-blue-700 mt-4">저장</button>
    </form>
  </div>
);

export default TourEditPage; 