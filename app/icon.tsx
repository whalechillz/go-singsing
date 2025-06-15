import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = {
  width: 32,
  height: 32,
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
          borderRadius: '8px',
        }}
      >
        {/* 골프공 */}
        <div
          style={{
            width: 24,
            height: 24,
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
              width: 4,
              height: 4,
              backgroundColor: '#e0e0e0',
              borderRadius: '50%',
              top: 4,
              left: 10,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              backgroundColor: '#e0e0e0',
              borderRadius: '50%',
              top: 10,
              left: 4,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              backgroundColor: '#e0e0e0',
              borderRadius: '50%',
              top: 10,
              right: 4,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              backgroundColor: '#e0e0e0',
              borderRadius: '50%',
              bottom: 4,
              left: 10,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}