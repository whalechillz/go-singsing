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
          background: '#2c5282',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
        }}
      >
        {/* 흰색 원 배경 */}
        <div
          style={{
            width: 26,
            height: 26,
            backgroundColor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 4개의 작은 회색 점 */}
          <div
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              backgroundColor: '#d0d0d0',
              borderRadius: '50%',
              top: 8,
              left: 14,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              backgroundColor: '#d0d0d0',
              borderRadius: '50%',
              top: 14,
              left: 8,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              backgroundColor: '#d0d0d0',
              borderRadius: '50%',
              top: 14,
              right: 8,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              backgroundColor: '#d0d0d0',
              borderRadius: '50%',
              bottom: 8,
              left: 14,
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