// 이메일 템플릿 관련 타입 정의

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string | null;
  html_content: string;
  text_content: string | null;
  variables: EmailTemplateVariable[];
  category: string | null;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface EmailTemplateVariable {
  name: string;
  description: string;
  required: boolean;
  default?: string;
}

export interface EmailTemplateVersion {
  id: string;
  template_id: string;
  version: number;
  subject: string;
  html_content: string;
  text_content: string | null;
  variables: EmailTemplateVariable[];
  change_note: string | null;
  created_at: string;
  created_by: string | null;
}

export interface EmailLog {
  id: string;
  template_id: string | null;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  variables: Record<string, any> | null;
  status: EmailStatus;
  error_message: string | null;
  provider: string | null;
  provider_message_id: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  sent_at: string;
  created_at: string;
  template?: EmailTemplate; // 조인 데이터
}

export type EmailStatus = 
  | 'pending'
  | 'sent' 
  | 'failed' 
  | 'bounced' 
  | 'opened' 
  | 'clicked';

export interface EmailLinkClick {
  id: string;
  email_log_id: string;
  link_url: string;
  clicked_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

// 이메일 발송 요청 타입
export interface SendEmailRequest {
  template_name: string;
  recipient_email: string;
  recipient_name?: string;
  variables: Record<string, any>;
}

// 이메일 템플릿 생성/수정 요청
export interface CreateEmailTemplateRequest {
  name: string;
  subject: string;
  description?: string;
  html_content: string;
  text_content?: string;
  variables?: EmailTemplateVariable[];
  category?: string;
  is_active?: boolean;
}

export interface UpdateEmailTemplateRequest extends Partial<CreateEmailTemplateRequest> {
  change_note?: string;
}

// 이메일 로그 필터
export interface EmailLogFilter {
  template_id?: string;
  recipient_email?: string;
  status?: EmailStatus;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

// 통계 타입
export interface EmailStatistics {
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_failed: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  by_template: {
    template_id: string;
    template_name: string;
    sent: number;
    opened: number;
    clicked: number;
  }[];
  by_date: {
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }[];
}
