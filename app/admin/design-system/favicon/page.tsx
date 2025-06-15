'use client'

export default function FaviconShowcase() {
  const fontStyles = [
    { name: 'Black Han Sans', family: '"Black Han Sans", "Arial Black", sans-serif', weight: '900', spacing: '-3px' },
    { name: 'Gothic A1', family: '"Gothic A1", sans-serif', weight: '900', spacing: '-2px' },
    { name: 'Do Hyeon', family: '"Do Hyeon", sans-serif', weight: '400', spacing: '-1px' },
    { name: 'Jua', family: '"Jua", sans-serif', weight: '400', spacing: '0px' },
    { name: 'Nanum Gothic', family: '"Nanum Gothic", sans-serif', weight: '800', spacing: '-1px' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">싱싱골프투어 파비콘 디자인</h1>
        
        <div className="space-y-8">
          {/* 512x512 큰 버전 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">메인 아이콘 (512x512)</h2>
            <div className="flex items-center justify-center bg-gray-50 p-8 rounded">
              <img 
                src="/favicon/preview" 
                alt="싱싱골프투어 파비콘 큰 버전"
                width={512}
                height={512}
                className="border-2 border-gray-300 rounded-lg"
              />
            </div>
            <p className="mt-4 text-gray-600">
              골프공 디자인에 '싱싱' 글자가 들어간 메인 아이콘입니다.
              나눔고딕 800 (특굵) 폰트를 사용하여 깨끗하고 공식적인 느낌을 줍니다.
            </p>
          </div>

          {/* 한글 폰트 스타일 비교 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">한글 폰트 스타일 비교</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {fontStyles.map((font) => (
                <div key={font.name} className="text-center">
                  <div className="bg-gray-50 p-4 rounded mb-2">
                    <div className="w-24 h-24 mx-auto bg-[#003366] rounded-2xl flex items-center justify-center">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                        <span
                          style={{
                            fontFamily: font.family,
                            fontSize: '2.5rem',
                            fontWeight: font.weight,
                            letterSpacing: font.spacing,
                            color: '#003366',
                          }}
                        >
                          싱싱
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{font.name}</p>
                  <p className="text-xs text-gray-500">Weight: {font.weight}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>적용됨:</strong> Nanum Gothic - 깨끗하고 가독성이 좋아 공식적인 느낌을 주며 브랜드 아이덴티티에 적합합니다.
              </p>
            </div>
          </div>

          {/* 180x180 Apple Touch Icon */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Apple Touch Icon (180x180)</h2>
            <div className="flex items-center justify-center bg-gray-50 p-8 rounded">
              <img 
                src="/apple-icon" 
                alt="Apple Touch Icon"
                width={180}
                height={180}
                className="border-2 border-gray-300 rounded-lg"
              />
            </div>
            <p className="mt-4 text-gray-600">
              iOS 홈 화면에 추가할 때 사용되는 아이콘입니다.
            </p>
          </div>

          {/* 32x32 파비콘 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">브라우저 파비콘 (32x32)</h2>
            <div className="flex items-center gap-8">
              <div className="bg-gray-50 p-4 rounded">
                <img 
                  src="/icon" 
                  alt="브라우저 파비콘"
                  width={32}
                  height={32}
                  className="pixelated"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <img 
                  src="/icon" 
                  alt="브라우저 파비콘 확대"
                  width={128}
                  height={128}
                  className="pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">실제 크기 → 4배 확대</p>
              </div>
            </div>
            <p className="mt-4 text-gray-600">
              브라우저 탭에 표시되는 작은 아이콘입니다. 심플한 골프공 디자인입니다.
            </p>
          </div>

          {/* 정적 파일 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">PNG/SVG 파일</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded text-center">
                <img 
                  src="/singsing_sg_icon_192x192.png" 
                  alt="SG Icon 192x192"
                  width={96}
                  height={96}
                  className="mx-auto mb-2"
                />
                <p className="text-xs text-gray-600">SG Icon 192x192</p>
              </div>
              <div className="bg-gray-50 p-4 rounded text-center">
                <img 
                  src="/singsing_sg_logo_180x180.png" 
                  alt="SG Logo 180x180"
                  width={96}
                  height={96}
                  className="mx-auto mb-2"
                />
                <p className="text-xs text-gray-600">SG Logo 180x180</p>
              </div>
              <div className="bg-gray-50 p-4 rounded text-center">
                <img 
                  src="/singsing_logo.svg" 
                  alt="Main Logo SVG"
                  width={96}
                  height={96}
                  className="mx-auto mb-2 bg-blue-800 p-2 rounded"
                />
                <p className="text-xs text-gray-600">Main Logo SVG</p>
              </div>
              <div className="bg-gray-50 p-4 rounded text-center">
                <img 
                  src="/favicon/singsing_logo_192x192.png" 
                  alt="192x192 PNG"
                  width={96}
                  height={96}
                  className="mx-auto mb-2"
                />
                <p className="text-xs text-gray-600">192x192 PNG</p>
              </div>
              <div className="bg-gray-50 p-4 rounded text-center">
                <img 
                  src="/favicon/singsing_logo_180x180.png" 
                  alt="180x180 PNG"
                  width={96}
                  height={96}
                  className="mx-auto mb-2"
                />
                <p className="text-xs text-gray-600">180x180 PNG</p>
              </div>
              <div className="bg-gray-50 p-4 rounded text-center">
                <img 
                  src="/favicon.ico" 
                  alt="Favicon ICO"
                  width={96}
                  height={96}
                  className="mx-auto mb-2"
                />
                <p className="text-xs text-gray-600">Favicon ICO</p>
              </div>
            </div>
          </div>

          {/* CDN 폰트 사용법 */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">💡 CDN 한글 폰트 사용법</h3>
            <p className="text-sm text-gray-700 mb-3">
              Google Fonts에서 제공하는 한글 폰트를 사용하려면:
            </p>
            <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
{`<!-- HTML head에 추가 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap" rel="stylesheet">

/* CSS에서 사용 */
font-family: 'Black Han Sans', sans-serif;`}
            </pre>
          </div>

          {/* 디자인 설명 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">디자인 컨셉</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>배경색</strong>: #003366 (싱싱골프투어 브랜드 컬러)</li>
              <li>• <strong>메인 요소</strong>: 흰색 골프공</li>
              <li>• <strong>딤플 패턴</strong>: 회색(#e0e0e0)으로 골프공의 입체감 표현</li>
              <li>• <strong>텍스트</strong>: '싱싱' 한글 (큰 버전에만 포함)</li>
              <li>• <strong>폰트</strong>: Nanum Gothic 800 (나눔고딕 특굵)</li>
              <li>• <strong>형태</strong>: 둥근 모서리의 정사각형</li>
            </ul>
          </div>

          {/* 개발자 노트 */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">👨‍💻 개발자 노트</h3>
            <p className="text-sm text-gray-700 mb-3">
              이 페이지는 <code className="bg-gray-200 px-2 py-1 rounded">/app/admin/design-system/favicon</code>에 위치합니다.
              관리자 사이드바에서 '디자인 시스템 {'>'} 파비콘 디자인' 메뉴를 통해 접근할 수 있습니다.
            </p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• 파비콘 수정: <code className="bg-gray-200 px-1">/app/icon.tsx</code></li>
              <li>• Apple 아이콘 수정: <code className="bg-gray-200 px-1">/app/apple-icon.tsx</code></li>
              <li>• 정적 파일: <code className="bg-gray-200 px-1">/public/favicon/</code></li>
              <li>• 파비콘 미리보기: <code className="bg-gray-200 px-1">/app/favicon/preview/route.tsx</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}