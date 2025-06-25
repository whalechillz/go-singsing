// lib/services/messageTemplates.ts

export const MESSAGE_TEMPLATES = {
  // 고객 포털 (통합 표지)
  PORTAL: {
    SMS: '[싱싱골프] #{이름}님, 투어 통합 포털을 확인해주세요: https://go.singsinggolf.kr/portal/#{url}',
    KAKAO: {
      content: '#{이름}님, 싱싱골프 투어 포털이 준비되었습니다.\n\n모든 투어 문서를 한 곳에서 확인하실 수 있습니다.',
      buttons: [{
        buttonType: 'WL',
        buttonName: '투어 포털 보기',
        linkMo: 'https://go.singsinggolf.kr/portal/#{url}',
        linkPc: 'https://go.singsinggolf.kr/portal/#{url}'
      }]
    }
  },
  
  // 개별 문서
  DOCUMENT: {
    SMS: '[싱싱골프] #{이름}님, 투어 문서를 확인해주세요: https://go.singsinggolf.kr/s/#{url}',
    KAKAO: {
      content: '#{이름}님, 싱싱골프 투어 문서가 도착했습니다.',
      buttons: [{
        buttonType: 'WL',
        buttonName: '문서 확인하기',
        linkMo: 'https://go.singsinggolf.kr/s/#{url}',
        linkPc: 'https://go.singsinggolf.kr/s/#{url}'
      }]
    }
  },
  
  // 견적서
  QUOTE: {
    SMS: '[싱싱골프] #{이름}님, 견적서를 확인해주세요 (유효기간: #{만료일}): https://go.singsinggolf.kr/s/#{url}',
    KAKAO: {
      content: '#{이름}님, 요청하신 싱싱골프 견적서입니다.\n\n견적서명: #{견적서명}\n유효기간: #{만료일}',
      buttons: [{
        buttonType: 'WL',
        buttonName: '견적서 보기',
        linkMo: 'https://go.singsinggolf.kr/s/#{url}',
        linkPc: 'https://go.singsinggolf.kr/s/#{url}'
      }]
    }
  },
  
  // 결제 요청
  PAYMENT: {
    DEPOSIT_REQUEST: {
      SMS: '[싱싱골프] #{이름}님, #{투어명} 계약금 #{계약금}원을 납부해주세요.\n#{은행명} #{계좌번호}',
      KAKAO: {
        content: '#{이름}님, 싱싱골프 투어 계약금 안내입니다.\n\n투어명: #{투어명}\n출발일: #{출발일}\n계약금: #{계약금}원\n\n입금계좌: #{은행명} #{계좌번호}',
      }
    },
    BALANCE_REQUEST: {
      SMS: '[싱싱골프] #{이름}님, #{투어명} 잔금 #{잔금}원을 #{납부기한}까지 납부해주세요.\n#{은행명} #{계좌번호}',
      KAKAO: {
        content: '#{이름}님, 싱싱골프 투어 잔금 안내입니다.\n\n투어명: #{투어명}\n출발일: #{출발일}\n잔금: #{잔금}원\n납부기한: #{납부기한}\n\n입금계좌: #{은행명} #{계좌번호}',
      }
    },
    DEPOSIT_CONFIRMATION: {
      SMS: '[싱싱골프] #{이름}님, #{투어명} 계약금 #{계약금}원이 확인되었습니다. 감사합니다.',
      KAKAO: {
        content: '#{이름}님, 계약금이 확인되었습니다.\n\n투어명: #{투어명}\n입금액: #{계약금}원\n\n감사합니다.',
      }
    },
    PAYMENT_COMPLETE: {
      SMS: '[싱싱골프] #{이름}님, #{투어명} 전액 납부가 완료되었습니다. 투어 정보: https://go.singsinggolf.kr/portal/#{url}',
      KAKAO: {
        content: '#{이름}님, 투어 비용 전액이 납부되었습니다.\n\n투어명: #{투어명}\n총금액: #{총금액}원\n\n아래 링크에서 투어 정보를 확인하세요.',
        buttons: [{
          buttonType: 'WL',
          buttonName: '투어 정보 확인',
          linkMo: 'https://go.singsinggolf.kr/portal/#{url}',
          linkPc: 'https://go.singsinggolf.kr/portal/#{url}'
        }]
      }
    }
  },
  
  // 고객 관리
  CUSTOMER: {
    BIRTHDAY: {
      SMS: '[싱싱골프] #{이름}님, 생일 축하드립니다! 특별 혜택: #{생일혜택}',
      KAKAO: {
        content: '#{이름}님, 생일을 진심으로 축하드립니다! 🎉\n\n싱싱골프가 준비한 특별한 혜택을 확인하세요.\n혜택: #{생일혜택}',
      }
    },
    PROMOTION: {
      SMS: '[싱싱골프] #{이름}님, #{프로모션} 안내드립니다. 자세한 내용은 문의 주세요.',
      KAKAO: {
        content: '#{이름}님, 싱싱골프 특별 프로모션!\n\n#{프로모션}\n\n자세한 내용은 문의해 주세요.\n☎ 031-215-3990',
      }
    },
    REMINDER: {
      SMS: '[싱싱골프] #{이름}님, #{안내사항}',
      KAKAO: {
        content: '#{이름}님, 싱싱골프에서 안내드립니다.\n\n#{안내사항}',
      }
    }
  }
};

// 문서 타입 판별 함수
export function getDocumentType(documentUrl: string): keyof typeof MESSAGE_TEMPLATES {
  if (documentUrl.includes('/portal/')) {
    return 'PORTAL';
  } else if (documentUrl.includes('/q/')) {
    return 'QUOTE';
  } else {
    return 'DOCUMENT';
  }
}

// 템플릿 선택 함수
export function selectTemplate(
  documentType: keyof typeof MESSAGE_TEMPLATES,
  sendMethod: 'sms' | 'kakao',
  subType?: string
): any {
  const templates = MESSAGE_TEMPLATES[documentType];
  
  // 결제나 고객 관리처럼 하위 타입이 있는 경우
  if (subType && typeof templates === 'object' && subType in templates) {
    const subTemplates = (templates as any)[subType];
    return sendMethod === 'kakao' && subTemplates.KAKAO ? subTemplates.KAKAO : subTemplates.SMS || subTemplates;
  }
  
  // 일반적인 경우
  return sendMethod === 'kakao' && (templates as any).KAKAO ? (templates as any).KAKAO : (templates as any).SMS || templates;
}