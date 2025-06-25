// lib/services/smsService.ts
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

// SMS 발송 타입 정의
export interface SMSMessage {
  to: string;
  from: string;
  text: string;
  type?: 'SMS' | 'LMS' | 'ATA';
  subject?: string; // LMS 제목
  kakaoOptions?: {
    pfId: string;
    templateId: string;
    disableSms?: boolean;
    buttons?: Array<{
      buttonType: string;
      buttonName: string;
      linkMo: string;
      linkPc?: string;
    }>;
  };
}

export interface SendSMSOptions {
  messages: SMSMessage[];
  groupId?: string;
}

// 환경 변수 타입
interface SMSConfig {
  apiKey: string;
  apiSecret: string;
  pfId: string;
  sender: string;
}

// SMS 서비스 클래스
export class SMSService {
  private config: SMSConfig;

  constructor() {
    this.config = {
      apiKey: process.env.SOLAPI_API_KEY || '',
      apiSecret: process.env.SOLAPI_API_SECRET || '',
      pfId: process.env.SOLAPI_PFID || '',
      sender: process.env.SOLAPI_SENDER || ''
    };
  }

  // 환경 변수 검증
  public validateConfig(): { isValid: boolean; missingVars: string[] } {
    const missingVars = [];
    if (!this.config.apiKey) missingVars.push('SOLAPI_API_KEY');
    if (!this.config.apiSecret) missingVars.push('SOLAPI_API_SECRET');
    if (!this.config.sender) missingVars.push('SOLAPI_SENDER');
    
    return {
      isValid: missingVars.length === 0,
      missingVars
    };
  }

  // HMAC 서명 생성
  private getSignature() {
    const date = new Date().toISOString();
    const salt = Math.random().toString(36).substring(2, 15);
    const data = date + salt;
    const signature = crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(data)
      .digest('hex');
    
    return {
      Authorization: `HMAC-SHA256 apiKey=${this.config.apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
    };
  }

  // SMS용 바이트 계산 (한글 2바이트)
  public getByteLength(str: string): number {
    let byteLength = 0;
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      if (charCode <= 0x7F) {
        byteLength += 1;
      } else {
        byteLength += 2;
      }
    }
    return byteLength;
  }

  // 전화번호 정규화
  public normalizePhoneNumber(phone: string): string {
    return phone
      .replace(/-/g, '')
      .replace(/\s/g, '')
      .replace(/\+82/g, '0');
  }

  // 메시지 타입 자동 결정
  private determineMessageType(text: string, useKakao: boolean = false): 'SMS' | 'LMS' | 'ATA' {
    if (useKakao) {
      return 'ATA';
    }
    return this.getByteLength(text) > 90 ? 'LMS' : 'SMS';
  }

  // 템플릿 변수 치환
  public replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      // #{변수명} 형태 지원
      result = result.replace(new RegExp(`#\\{${key}\\}`, 'g'), value);
    });
    return result;
  }

  // URL에서 파라미터 추출
  public extractUrlParam(url: string): string {
    if (!url) return '';
    
    if (url.includes('/s/')) {
      return url.split('/s/')[1];
    } else if (url.includes('/portal/')) {
      return url.split('/portal/')[1];
    } else if (url.includes('/q/')) {
      return url.split('/q/')[1];
    }
    return url;
  }

  // 메시지 준비
  public prepareMessage(params: {
    to: string;
    text: string;
    templateData?: any;
    documentUrl?: string;
    sendMethod?: 'sms' | 'kakao';
  }): SMSMessage {
    const normalizedPhone = this.normalizePhoneNumber(params.to);
    const normalizedSender = this.normalizePhoneNumber(this.config.sender);
    
    // 카카오 알림톡 사용 여부
    const useKakao = params.sendMethod === 'kakao' && 
                     this.config.pfId && 
                     params.templateData?.kakao_template_code;
    
    // 메시지 타입 결정
    const messageType = this.determineMessageType(params.text, useKakao);
    
    const message: SMSMessage = {
      to: normalizedPhone,
      from: normalizedSender,
      text: params.text,
      type: messageType,
    };

    // LMS인 경우 제목 추가
    if (messageType === 'LMS') {
      message.subject = params.templateData?.title || '[싱싱골프] 안내';
    }

    // 카카오 알림톡인 경우
    if (useKakao && params.templateData?.kakao_template_code) {
      message.kakaoOptions = {
        pfId: this.config.pfId,
        templateId: params.templateData.kakao_template_code,
        disableSms: false, // 실패 시 SMS로 대체 발송
      };

      // 버튼 처리
      if (params.templateData.buttons && params.documentUrl) {
        const urlParam = this.extractUrlParam(params.documentUrl);
        
        message.kakaoOptions.buttons = params.templateData.buttons.map((btn: any) => {
          // 버튼이 문자열인 경우 파싱
          if (typeof btn === 'string') {
            try {
              btn = JSON.parse(btn);
            } catch (e) {
              console.error('버튼 파싱 오류:', e);
              return null;
            }
          }

          return {
            buttonType: 'WL',
            buttonName: btn.name || btn.buttonName || '자세히 보기',
            linkMo: (btn.linkMo || params.documentUrl).replace(/#{url}/g, urlParam),
            linkPc: (btn.linkPc || btn.linkMo || params.documentUrl).replace(/#{url}/g, urlParam),
          };
        }).filter(Boolean); // null 제거
      }
    }

    return message;
  }

  // Solapi API 호출 (send-many/detail 방식)
  public async send(messages: SMSMessage[]): Promise<any> {
    try {
      console.log("솔라피 API 호출 준비:", {
        messageCount: messages.length,
        messageType: messages[0]?.type,
        firstPhone: messages[0]?.to,
        hasKakaoOption: !!messages[0]?.kakaoOptions
      });

      const response = await fetch('https://api.solapi.com/messages/v4/send-many/detail', {
        method: 'POST',
        headers: {
          ...this.getSignature(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      const result = await response.json();
      
      console.log("솔라피 응답:", { 
        status: response.status, 
        result,
        groupId: result.groupId,
        countInfo: result.countInfo
      });

      if (!response.ok) {
        throw new Error(result.message || result.error || `솔라피 API 오류: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('SMS 발송 오류:', error);
      throw error;
    }
  }

  // 메시지 로그 저장
  public async saveMessageLog(params: {
    participants: Array<{id: string, name: string, phone: string}>;
    messageType: string;
    templateId?: string;
    title: string;
    content: string;
    status: 'sent' | 'failed';
    tourId?: string;
    error?: string;
    groupId?: string;
  }): Promise<void> {
    try {
      const logs = params.participants.map(participant => ({
        customer_id: participant.id,
        message_type: params.messageType.toLowerCase(),
        template_id: params.templateId,
        phone_number: participant.phone,
        title: params.title,
        content: params.content.replace(/#\{이름\}/g, participant.name || '고객'),
        status: params.status,
        tour_id: params.tourId,
        recipient_name: participant.name,
        error_message: params.error,
        solapi_group_id: params.groupId,
        sent_at: new Date().toISOString()
      }));
      
      await supabase.from('message_logs').insert(logs);
    } catch (error) {
      console.log('메시지 로그 저장 실패 (무시):', error);
    }
  }

  // 비용 계산
  public calculateCost(messages: SMSMessage[]): number {
    let totalCost = 0;
    messages.forEach(message => {
      switch(message.type) {
        case 'SMS':
          totalCost += 20;
          break;
        case 'LMS':
          totalCost += 30;
          break;
        case 'ATA': // 카카오 알림톡
          totalCost += 15;
          break;
        default:
          totalCost += 20;
      }
    });
    return totalCost;
  }
}

// 싱글톤 인스턴스
export const smsService = new SMSService();