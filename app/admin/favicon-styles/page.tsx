'use client'

import { useState } from 'react'
import { Palette } from 'lucide-react'

export default function FaviconStylesPage() {
  const [selectedFont, setSelectedFont] = useState('nanum-gothic')
  
  const fontStyles = [
    { 
      id: 'black-han-sans',
      name: 'Black Han Sans', 
      family: '"Black Han Sans", "Nanum Gothic", sans-serif', 
      weight: '900', 
      spacing: '-6px',
      preview: '/favicon-blackhan'
    },
    { 
      id: 'gothic-a1',
      name: 'Gothic A1', 
      family: '"Gothic A1", "Nanum Gothic", sans-serif', 
      weight: '900', 
      spacing: '-4px',
      preview: '/favicon-gothic'
    },
    { 
      id: 'do-hyeon',
      name: 'Do Hyeon', 
      family: '"Do Hyeon", "Nanum Gothic", sans-serif', 
      weight: '400', 
      spacing: '-2px',
      preview: '/favicon-dohyeon'
    },
    { 
      id: 'jua',
      name: 'Jua', 
      family: '"Jua", "Nanum Gothic", sans-serif', 
      weight: '400', 
      spacing: '0px',
      preview: '/favicon-jua'
    },
    { 
      id: 'nanum-gothic',
      name: 'Nanum Gothic', 
      family: '"Nanum Gothic", sans-serif', 
      weight: '800', 
      spacing: '-2px',
      preview: '/favicon-nanum'
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="w-6 h-6" />
          파비콘 스타일 관리
        </h1>
        <p className="text-gray-600 mt-2">
          싱싱골프투어 파비콘의 폰트 스타일을 선택하고 미리보기할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 왼쪽: 폰트 목록 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">폰트 스타일 선택</h2>
          <div className="space-y-4">
            {fontStyles.map((font) => (
              <div
                key={font.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedFont === font.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedFont(font.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{font.name}</h3>
                    <p className="text-sm text-gray-600">
                      Weight: {font.weight} | Spacing: {font.spacing}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-[#003366] rounded-lg flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <span
                        style={{
                          fontFamily: font.family,
                          fontSize: '1.5rem',
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
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 미리보기 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">미리보기</h2>
          {selectedFont && (
            <div className="space-y-6">
              {/* 큰 미리보기 */}
              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-md font-medium mb-4 text-center">180x180 (Apple Touch Icon)</h3>
                <div className="flex justify-center">
                  <div className="w-[180px] h-[180px] bg-[#003366] rounded-[40px] flex items-center justify-center shadow-lg">
                    <div className="w-[120px] h-[120px] bg-white rounded-full flex items-center justify-center">
                      <span
                        style={{
                          fontFamily: fontStyles.find(f => f.id === selectedFont)?.family,
                          fontSize: '3rem',
                          fontWeight: fontStyles.find(f => f.id === selectedFont)?.weight,
                          letterSpacing: fontStyles.find(f => f.id === selectedFont)?.spacing,
                          color: '#003366',
                        }}
                      >
                        싱싱
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 작은 미리보기 */}
              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-md font-medium mb-4 text-center">32x32 (브라우저 탭)</h3>
                <div className="flex justify-center items-center gap-8">
                  <div className="text-center">
                    <div className="w-[32px] h-[32px] bg-[#003366] rounded flex items-center justify-center mb-2">
                      <div className="w-[24px] h-[24px] bg-white rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-500">실제 크기</p>
                  </div>
                  <div className="text-center">
                    <div className="w-[128px] h-[128px] bg-[#003366] rounded-lg flex items-center justify-center mb-2">
                      <div className="w-[96px] h-[96px] bg-white rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-500">4배 확대</p>
                  </div>
                </div>
              </div>

              {/* 실제 파일 미리보기 */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-md font-medium mb-4">실제 생성된 파비콘</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <img 
                      src={fontStyles.find(f => f.id === selectedFont)?.preview || '/apple-icon'}
                      alt="파비콘 미리보기"
                      className="w-16 h-16 mx-auto mb-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500">64x64</p>
                  </div>
                  <div className="text-center">
                    <img 
                      src={fontStyles.find(f => f.id === selectedFont)?.preview || '/apple-icon'}
                      alt="파비콘 미리보기"
                      className="w-24 h-24 mx-auto mb-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500">96x96</p>
                  </div>
                  <div className="text-center">
                    <img 
                      src={fontStyles.find(f => f.id === selectedFont)?.preview || '/apple-icon'}
                      alt="파비콘 미리보기"
                      className="w-32 h-32 mx-auto mb-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500">128x128</p>
                  </div>
                </div>
              </div>

              {/* 적용 버튼 */}
              <div className="flex justify-end gap-4">
                <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  취소
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  이 스타일로 적용
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 쇼케이스 링크 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 모든 파비콘 디자인을 한눈에 보려면{' '}
          <a href="/favicon-showcase" target="_blank" className="font-medium underline">
            파비콘 쇼케이스 페이지
          </a>
          를 방문하세요.
        </p>
      </div>
    </div>
  )
}