// 견적서 메시지 발송 테스트 스크립트

const testQuoteSend = async () => {
  const testData = {
    quoteId: "cfdc12b6-8bc3-41d5-a668-5704f91ba8ca", // 실제 견적서 ID로 변경
    customerPhone: "010-1234-5678", // 테스트할 전화번호
    customerName: "테스트",
    templateId: "test-template-id", // 실제 템플릿 ID로 변경
    templateData: {
      content: "#{이름}님, 테스트 견적서입니다.\n\n#{견적서명}\n\n▶ #{url}\n\n유효기간: #{만료일}\n문의: 031-215-3990",
      type: "sms"
    },
    sendMethod: "sms"
  };

  try {
    const response = await fetch('http://localhost:3000/api/messages/send-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('응답:', result);
    
    if (!response.ok) {
      console.error('에러 상태:', response.status);
      console.error('에러 상세:', result);
    }
  } catch (error) {
    console.error('네트워크 에러:', error);
  }
};

// 브라우저 콘솔에서 실행
// testQuoteSend();

console.log('테스트 실행: testQuoteSend() 를 콘솔에서 실행하세요.');
