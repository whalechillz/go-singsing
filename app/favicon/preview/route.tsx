import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
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
          borderRadius: '64px',
        }}
      >
        {/* 골프공 */}
        <div
          style={{
            width: 384,
            height: 384,
            backgroundColor: 'white',
            borderRadius: '50%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 딤플 패턴 */}
          <div
            style={{
              position: 'absolute',
              width: 64,
              height: 64,
              backgroundColor: '#e0e0e0',
              borderRadius: '50%',
              top: 64,
              left: 160,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 64,
              height: 64,
              backgroundColor: '#e0e0e0',
              borderRadius: '50%',
              top: 160,
              left: 64,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 64,
              height: 64,
              backgroundColor: '#e0e0e0',
              borderRadius: '50%',
              top: 160,
              right: 64,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 64,
              height: 64,
              backgroundColor: '#e0e0e0',
              borderRadius: '50%',
              bottom: 64,
              left: 160,
            }}
          />
          {/* 중앙 로고 - 나눔고딕 스타일 */}
          <div
            style={{
              fontSize: 150,
              fontWeight: '800',
              color: '#003366',
              fontFamily: '"Nanum Gothic", sans-serif',
              letterSpacing: '-12px',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            싱싱
          </div>
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  )
}