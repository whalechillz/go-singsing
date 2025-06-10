import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 to-amber-50">
      <div className="text-center px-8 py-12 max-w-3xl mx-auto">
        {/* 꽃잎 장식 배경 */}
        <div className="relative">
          {/* 배경 꽃잎들 */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-rose-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-amber-200 rounded-full opacity-20 blur-3xl"></div>
          
          {/* 메인 컨텐츠 카드 */}
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-rose-100">
            {/* 상단 장식 */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-3">
                <span className="text-5xl">🌸</span>
                <span className="text-6xl">⛳</span>
                <span className="text-5xl">🌸</span>
              </div>
            </div>

            {/* 메인 메시지 */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
              어머, 길을 잃으셨나요?
            </h1>
            
            <div className="space-y-4 mb-10">
              <p className="text-xl text-gray-700">
                페이지를 찾을 수 없어요
              </p>
              <p className="text-lg text-gray-600">
                하지만 걱정하지 마세요!<br />
                저희가 바른 길로 안내해드릴게요
              </p>
            </div>

            {/* 골프 메타포 메시지 */}
            <div className="bg-gradient-to-r from-rose-100 to-amber-100 rounded-2xl p-6 mb-10">
              <p className="text-gray-700 text-lg leading-relaxed">
                <span className="font-semibold text-rose-600">멀리건</span>처럼,<br />
                다시 한 번 기회를 드릴게요! 🏌️‍♀️
              </p>
            </div>

            {/* CTA 버튼들 */}
            <div className="space-y-4">
              <Link 
                href="/" 
                className="block w-full sm:w-auto sm:inline-block bg-gradient-to-r from-rose-500 to-rose-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🏠 홈으로 돌아가기
              </Link>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Link 
                  href="/tour-schedule" 
                  className="text-rose-600 hover:text-rose-700 font-medium text-lg underline decoration-2 underline-offset-4"
                >
                  투어 일정 확인하기
                </Link>
                <span className="hidden sm:inline text-gray-400">|</span>
                <Link 
                  href="/quote" 
                  className="text-rose-600 hover:text-rose-700 font-medium text-lg underline decoration-2 underline-offset-4"
                >
                  견적 문의하기
                </Link>
              </div>
            </div>

            {/* 하단 연락처 */}
            <div className="mt-12 pt-8 border-t border-rose-100">
              <p className="text-gray-600 mb-3">
                직접 도움을 받고 싶으신가요?
              </p>
              <div className="flex items-center justify-center gap-6">
                <a 
                  href="tel:1234-5678" 
                  className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-semibold"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-lg">1234-5678</span>
                </a>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">
                  평일 9시-6시
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 격려 메시지 */}
        <p className="mt-8 text-gray-500 text-base italic">
          "모든 위대한 골퍼도 가끔은 러프에 빠집니다"
        </p>
      </div>
    </div>
  )
}