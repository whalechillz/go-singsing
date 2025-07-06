// 네이버 API 테스트
async function testNaverAPI() {
  const response = await fetch('http://localhost:3000/api/attractions/search-naver', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '마스골프' })
  });
  
  const result = await response.json();
  
  console.log('=== 네이버 API 응답 ===');
  console.log('성공 여부:', result.success);
  console.log('데이터 키:', Object.keys(result.data || {}));
  console.log('local 결과:', result.data?.local?.length, '개');
  console.log('첫 번째 결과:', result.data?.local?.[0]);
  console.log('extractedInfo:', result.data?.extractedInfo);
}

testNaverAPI();