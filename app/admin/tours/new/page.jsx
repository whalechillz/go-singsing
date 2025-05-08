const TourNewPage = () => (
  <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-8">
    <h2 className="text-xl font-bold mb-6">투어 생성</h2>
    <form className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-medium">제목</span>
        <input type="text" className="border rounded px-3 py-2" placeholder="예: 순천 2박3일" required />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-medium">날짜</span>
        <input type="text" className="border rounded px-3 py-2" placeholder="예: 05/19(월)~21(수)" required />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-medium">담당 기사님 연락처</span>
        <input type="text" className="border rounded px-3 py-2" placeholder="예: 010-5254-9876" required />
      </label>
      <button type="submit" className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 focus:bg-blue-700 mt-4">저장</button>
    </form>
  </div>
);

export default TourNewPage; 