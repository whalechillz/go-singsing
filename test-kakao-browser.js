// 브라우저 콘솔에서 실행할 테스트 코드
// 개발자 도구(F12) > Console 탭에서 실행

async function testKakaoTemplate() {
  const response = await fetch('/api/messages/test-kakao-debug');
  const data = await response.json();
  console.log('환경변수 상태:', data.envStatus);
  console.log('템플릿 상태:', data.template);
  return data;
}

// 실행
testKakaoTemplate();