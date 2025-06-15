import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = '싱싱골프투어 - Premium Golf Tour'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to right, #003366, #004080)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
          }}
        >
          싱싱골프투어
        </div>
        <div
          style={{
            fontSize: 36,
            color: '#87CEEB',
            letterSpacing: 2,
          }}
        >
          Premium Golf Tour
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}