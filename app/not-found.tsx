import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="text-center px-6 py-12 max-w-2xl mx-auto">
        {/* 메인 일러스트 영역 */}
        <div className="mb-8">
          {/* 부드러운 원형 배경 */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-2xl opacity-50 scale-110"></div>
            <div className="relative bg-white rounded-full p-12 shadow-lg">
              {/* 꽃과 골프 아이콘 조합 */}
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl">🌸</span>
                <span className="text-6xl">⛳</span>
                <span className="text-5xl">🌸</span>
              </div>
            </div>
          </div>
        </div>

        {/* 메시지 영역 - 더 임팩트 있게 */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          어머, 길을 잃으셨나요?
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          <span className="font-semibold text-purple-600">멀리건</span>처럼,<br />
          다시 한 번 기회를 드릴게요! 🏌️‍♀️
        </p>

        {/* 버튼 영역 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link 
            href="/" 
            className="group bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              홈으로 가기
            </span>
          </Link>
          
          <Link 
            href="/tour-schedule" 
            className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-medium border-2 border-purple-300 hover:bg-purple-50 transition-all shadow-md hover:shadow-lg"
          >
            투어 일정 보기
          </Link>

          <Link 
            href="/quote" 
            className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-medium border-2 border-purple-300 hover:bg-purple-50 transition-all shadow-md hover:shadow-lg"
          >
            단체 견적 문의
          </Link>
        </div>

        {/* 추가 도움말 */}
        <div className="mt-12 text-gray-500">
          <p className="text-base">
            도움이 필요하신가요?
          </p>
          <a 
            href="tel:031-215-3990" 
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mt-2 text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            고객센터 031-215-3990
          </a>
        </div>

        {/* 하단 격려 메시지 */}
        <p className="mt-8 text-gray-500 text-base italic">
          "모든 위대한 골퍼도 가끔은 러프에 빠집니다"
        </p>

        {/* 장식 요소들 */}
        <div className="absolute top-10 left-10 text-6xl opacity-20 text-purple-300 animate-bounce">
          ⛳
        </div>
        <div className="absolute bottom-10 right-10 text-6xl opacity-20 text-pink-300 animate-pulse">
          🏌️‍♀️
        </div>
      </div>
    </div>
  )
}