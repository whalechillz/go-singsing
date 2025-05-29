// 슬랙 웹훅 설정
export const SLACK_CONFIG = {
  // 슬랙 Incoming Webhook URL
  WEBHOOK_URL: process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL || '',
  
  // 알림 채널 설정
  CHANNELS: {
    refund: '#환불-알림',
    approval: '#승인-요청',
    general: '#일반'
  }
};

// 슬랙 메시지 전송 함수
export async function sendSlackNotification(
  type: 'refund' | 'approval' | 'general',
  message: string,
  details?: any
) {
  if (!SLACK_CONFIG.WEBHOOK_URL) {
    console.warn('슬랙 웹훅 URL이 설정되지 않았습니다.');
    return;
  }

  try {
    const payload = {
      channel: SLACK_CONFIG.CHANNELS[type],
      username: '싱싱골프 봇',
      icon_emoji: ':golf:',
      text: message,
      attachments: details ? [
        {
          color: type === 'refund' ? '#ff0000' : '#36a64f',
          fields: Object.entries(details).map(([key, value]) => ({
            title: key,
            value: String(value),
            short: true
          }))
        }
      ] : undefined
    };

    const response = await fetch(SLACK_CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('슬랙 알림 전송 실패:', response.status);
    }
  } catch (error) {
    console.error('슬랙 알림 오류:', error);
  }
}

// 환불 알림 템플릿
export function createRefundNotification(
  participant: string,
  amount: number,
  reason: string,
  approvalNeeded: boolean = false
) {
  const message = approvalNeeded
    ? `🚨 환불 승인 요청`
    : `💰 환불 처리 완료`;

  const details = {
    '참가자': participant,
    '환불 금액': `${amount.toLocaleString()}원`,
    '환불 사유': reason,
    '처리 시간': new Date().toLocaleString('ko-KR'),
    '상태': approvalNeeded ? '승인 대기중' : '처리 완료'
  };

  return { message, details };
}

// 환불 금액별 승인 필요 여부
export function needsApproval(amount: number): boolean {
  // 100만원 이상은 승인 필요
  return amount >= 1000000;
}
