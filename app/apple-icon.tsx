import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#003366',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
        }}
      >
        {/* 골프공 */}
        <div
          style={{
            width: 120,
            height: 120,
            backgroundColor: 'white',
            borderRadius: '50%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 딥플 패턴 */}
          <div
            style={{
              position: 'absolute',
              width: 20,
              height: 20,
              backgroundColor: '#e0e0e0',
              borderRadius: '50%',
              top: 20,
              left: 50,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 20,
              height: 20,
              backgroundColor: '#e0e0e0',
              borderRadius: '50%',
              top: 50,
              left: 20,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 20,
              height: 20,
              backgroundColor: '#e0e0e0',
              borderRadius: '50%',
              top: 50,
              right: 20,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 20,
              height: 20,
              backgroundColor: '#e0e0e0',
              borderRadius: '50%',
              bottom: 20,
              left: 50,
            }}
          />
          {/* 중앙 로고 - 나눔고딕 스타일 */}
          <div
            style={{
              fontSize: 44,
              fontWeight: '800',
              color: '#003366',
              fontFamily: '"Nanum Gothic", sans-serif',
              letterSpacing: '-4px',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            싱싱
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}