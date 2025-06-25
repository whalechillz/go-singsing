// 버튼 URL 치환 수정 부분
// 기존 코드:
// linkMo: btn.linkMo?.replace(/#{url}/g, actualUrl),

// 수정된 코드:
// 솔라피 템플릿이 /portal/#{url} 형식을 기대하는 경우
const processedButtons = templateData.buttons.map((btn: any) => {
  if (typeof btn === 'string') {
    try {
      btn = JSON.parse(btn);
    } catch (e) {
      console.error('버튼 파싱 오류:', e);
    }
  }
  
  // URL 변수 치환
  let processedButton = { ...btn };
  
  // documentUrl이 전체 URL인 경우 short_code만 추출
  let urlParam = documentUrl;
  if (documentUrl.includes('/s/')) {
    // https://go.singsinggolf.kr/s/bo6d6cre -> bo6d6cre
    urlParam = documentUrl.split('/s/')[1];
  } else if (documentUrl.includes('/portal/')) {
    // https://go.singsinggolf.kr/portal/bo6d6cre -> bo6d6cre
    urlParam = documentUrl.split('/portal/')[1];
  }
  
  // #{url}만 치환 (전체 경로가 아닌 파라미터만)
  processedButton.linkMo = btn.linkMo?.replace(/#{url}/g, urlParam);
  processedButton.linkPc = btn.linkPc?.replace(/#{url}/g, urlParam);
  
  console.log('버튼 URL 치환:', {
    원본: btn.linkMo,
    치환후: processedButton.linkMo,
    urlParam
  });
  
  return processedButton;
});