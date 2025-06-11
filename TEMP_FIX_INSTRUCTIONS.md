// 임시 해결책: company_mobile 관련 코드 주석 처리
// 
// 다음 라인들을 찾아서 주석 처리하세요:
// 
// 1. TourForm 타입에서:
// // company_mobile: string;
// 
// 2. form 초기값에서:
// // company_mobile: "010-3332-9020",
// 
// 3. tourData 로드 부분에서:
// // company_mobile: tourData.company_mobile || "010-3332-9020",
// 
// 4. 업데이트 데이터에서:
// // company_mobile: form.company_mobile,
// 
// 5. input 필드:
// /*
// <label className="flex flex-col gap-1">
//   <span className="text-sm text-gray-600">회사 업무핸드폰</span>
//   <input
//     name="company_mobile"
//     type="text"
//     value={form.company_mobile}
//     onChange={handleChange}
//     className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800"
//   />
// </label>
// */