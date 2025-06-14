import { readFileSync } from 'fs';
import { join } from 'path';

export interface EmailTemplateVariables {
  [key: string]: string;
}

export class EmailTemplateManager {
  private templatesDir: string;

  constructor() {
    // Next.js 환경에서는 process.cwd()를 사용
    this.templatesDir = join(process.cwd(), 'templates', 'emails');
  }

  /**
   * 템플릿 파일을 읽고 변수를 치환합니다.
   * @param templateName 템플릿 파일명 (확장자 제외)
   * @param variables 치환할 변수들
   * @returns 변수가 치환된 HTML 문자열
   */
  public renderTemplate(templateName: string, variables: EmailTemplateVariables): string {
    try {
      const templatePath = join(this.templatesDir, `${templateName}.html`);
      let template = readFileSync(templatePath, 'utf-8');

      // {{VARIABLE_NAME}} 형식의 변수를 치환
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value);
      });

      return template;
    } catch (error) {
      console.error(`템플릿 로드 실패: ${templateName}`, error);
      throw new Error(`템플릿을 찾을 수 없습니다: ${templateName}`);
    }
  }

  /**
   * 비밀번호 재설정 이메일 렌더링
   */
  public renderPasswordResetEmail(params: {
    userName: string;
    userEmail: string;
    resetLink: string;
  }): string {
    return this.renderTemplate('password-reset', {
      USER_NAME: params.userName || '고객',
      USER_EMAIL: params.userEmail,
      RESET_LINK: params.resetLink,
    });
  }

  /**
   * 회원가입 환영 이메일 렌더링
   */
  public renderWelcomeEmail(params: {
    userName: string;
    userEmail: string;
    loginLink: string;
  }): string {
    return this.renderTemplate('welcome', {
      USER_NAME: params.userName,
      USER_EMAIL: params.userEmail,
      LOGIN_LINK: params.loginLink,
    });
  }

  /**
   * 이메일 인증 메일 렌더링
   */
  public renderVerificationEmail(params: {
    userName: string;
    userEmail: string;
    verificationLink: string;
  }): string {
    return this.renderTemplate('email-verification', {
      USER_NAME: params.userName,
      USER_EMAIL: params.userEmail,
      VERIFICATION_LINK: params.verificationLink,
    });
  }
}

// 싱글톤 인스턴스
export const emailTemplateManager = new EmailTemplateManager();

// 사용 예시:
/*
import { emailTemplateManager } from '@/lib/email-template-manager';

// 비밀번호 재설정 이메일
const resetEmailHtml = emailTemplateManager.renderPasswordResetEmail({
  userName: '홍길동',
  userEmail: 'user@singsinggolf.kr',
  resetLink: 'https://singsinggolf.kr/auth/reset-password?token=abc123'
});

// Supabase Email Hook이나 SendGrid 등으로 발송
await sendEmail({
  to: 'user@singsinggolf.kr',
  subject: '싱싱골프 - 비밀번호 재설정',
  html: resetEmailHtml
});
*/
