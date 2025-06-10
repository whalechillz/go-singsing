import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* 골프장 패턴 배경 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" 
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              #10b981,
              #10b981 2px,
              transparent 2px,
              transparent 40px
            ),
            repeating-linear-gradient(
              90deg,
              #10b981,
              #10b981 2px,
              transparent 2px,
              transparent 40px
            )`
          }}
        />
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* 골프 그린 일러스트 */}
          <div className="flex justify-center mb-10">
            <div className="relative">
              {/* 그린 */}
              <div className="w-48 h-48 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-xl relative">
                {/* 홀 */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                  {/* 깃발 */}
                  <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
                    <div className="w-0.5 h-20 bg-gray-700"></div>
                    <div className="absolute top-0 left-0 w-8 h-6 bg-red-500 rounded-sm"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%)' }}
                    ></div>
                  </div>
                </div>
                {/* 골프공 */}
                <div className="absolute top-3/4 left-1/4 w-6 h-6 bg-white rounded-full shadow-md"></div>
              </div>
            </div>
          </div>

          {/* 메인 카드 */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 border-2 border-green-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
              아이고, 벙커에 빠지셨네요!
            </h1>
            
            <p className="text-xl text-gray-600 text-center mb-8">
              찾으시는 페이지가 코스를 벗어났어요 😅
            </p>

            {/* 친근한 안내 메시지 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-green-200">
              <p className="text-gray-700 text-lg text-center leading-relaxed">
                괜찮아요! 모두가 가끔은 실수를 하죠.<br />
                <span className="font-semibold text-green-700">캐디</span>가 되어 올바른 길로 안내해드릴게요 🏌️‍♀️
              </p>
            </div>

            {/* 네비게이션 버튼 */}
            <div className="space-y-4">
              <Link 
                href="/" 
                className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                클럽하우스로 돌아가기
              </Link>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link 
                  href="/tour-schedule" 
                  className="flex items-center justify-center gap-2 bg-white text-green-700 px-6 py-3 rounded-xl border-2 border-green-300 hover:bg-green-50 transition-all font-medium"
                >
                  <span className="text-2xl">📅</span>
                  투어 일정
                </Link>
                
                <Link 
                  href="/quote" 
                  className="flex items-center justify-center gap-2 bg-white text-green-700 px-6 py-3 rounded-xl border-2 border-green-300 hover:bg-green-50 transition-all font-medium"
                >
                  <span className="text-2xl">💬</span>
                  견적 문의
                </Link>
              </div>
            </div>

            {/* 팁 섹션 */}
            <div className="mt-10 pt-8 border-t border-green-100">
              <h3 className="text-center text-gray-700 font-semibold mb-4">
                💡 이런 페이지를 찾고 계신가요?
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/tour-schedule" className="text-green-600 hover:text-green-700 underline">
                  투어 일정
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="/quote" className="text-green-600 hover:text-green-700 underline">
                  견적 문의
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="/promo" className="text-green-600 hover:text-green-700 underline">
                  특가 상품
                </Link>
              </div>
            </div>
          </div>

          {/* 하단 연락처 카드 */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
            <p className="text-gray-600 mb-2">도움이 필요하신가요?</p>
            <a 
              href="tel:1234-5678" 
              className="inline-flex items-center gap-3 text-green-700 hover:text-green-800 font-bold text-xl"
            >
              <span className="text-3xl">☎️</span>
              1234-5678
            </a>
            <p className="text-sm text-gray-500 mt-1">평일 9:00 - 18:00</p>
          </div>
        </div>
      </div>

      {/* 장식 요소 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-100 to-transparent opacity-50"></div>
    </div>
  )
}