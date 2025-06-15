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
          {/* 중앙 로고 - Black Han Sans 스타일 */}
          <div
            style={{
              fontSize: 200,
              fontWeight: '900',
              color: '#003366',
              fontFamily: '"Arial Black", sans-serif',
              letterSpacing: '-8px',
              transform: 'scale(1.1, 1)',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            싱
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