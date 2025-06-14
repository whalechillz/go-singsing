import { supabase } from './supabaseClient';
import type { 
  EmailTemplate, 
  EmailLog, 
  SendEmailRequest,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  EmailLogFilter,
  EmailStatistics
} from '@/@types/email-templates';

export class EmailService {
  /**
   * 이메일 템플릿 목록 조회
   */
  async getTemplates(category?: string) {
    let query = supabase
      .from('email_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as EmailTemplate[];
  }

  /**
   * 템플릿 ID로 조회
   */
  async getTemplateById(id: string) {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as EmailTemplate;
  }

  /**
   * 템플릿 이름으로 조회
   */
  async getTemplateByName(name: string) {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', name)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data as EmailTemplate;
  }

  /**
   * 새 템플릿 생성
   */
  async createTemplate(template: CreateEmailTemplateRequest) {
    const { data, error } = await supabase
      .from('email_templates')
      .insert(template)
      .select()
      .single();
    
    if (error) throw error;
    return data as EmailTemplate;
  }

  /**
   * 템플릿 업데이트
   */
  async updateTemplate(id: string, updates: UpdateEmailTemplateRequest) {
    const { data, error } = await supabase
      .from('email_templates')
      .update({
        ...updates,
        updated_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as EmailTemplate;
  }

  /**
   * 템플릿 비활성화
   */
  async deactivateTemplate(id: string) {
    return this.updateTemplate(id, { is_active: false });
  }

  /**
   * 템플릿 버전 히스토리 조회
   */
  async getTemplateVersions(templateId: string) {
    const { data, error } = await supabase
      .from('email_template_versions')
      .select('*')
      .eq('template_id', templateId)
      .order('version', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  /**
   * 이메일 발송 (로그만 생성, 실제 발송은 Edge Function에서)
   */
  async sendEmail(request: SendEmailRequest) {
    const { data, error } = await supabase
      .rpc('send_email', {
        p_template_name: request.template_name,
        p_recipient_email: request.recipient_email,
        p_recipient_name: request.recipient_name || null,
        p_variables: request.variables
      });
    
    if (error) throw error;
    return data as string; // email_log_id
  }

  /**
   * 이메일 로그 조회
   */
  async getEmailLogs(filter: EmailLogFilter = {}) {
    let query = supabase
      .from('email_logs')
      .select(`
        *,
        template:email_templates(name, subject, category)
      `)
      .order('sent_at', { ascending: false });

    if (filter.template_id) {
      query = query.eq('template_id', filter.template_id);
    }
    if (filter.recipient_email) {
      query = query.ilike('recipient_email', `%${filter.recipient_email}%`);
    }
    if (filter.status) {
      query = query.eq('status', filter.status);
    }
    if (filter.from_date) {
      query = query.gte('sent_at', filter.from_date);
    }
    if (filter.to_date) {
      query = query.lte('sent_at', filter.to_date);
    }
    if (filter.limit) {
      query = query.limit(filter.limit);
    }
    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as EmailLog[];
  }

  /**
   * 이메일 상태 업데이트
   */
  async updateEmailStatus(
    emailLogId: string, 
    status: EmailLog['status'],
    errorMessage?: string
  ) {
    const updates: any = { status };
    
    if (status === 'opened') {
      updates.opened_at = new Date().toISOString();
    } else if (status === 'clicked') {
      updates.clicked_at = new Date().toISOString();
    }
    
    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    const { data, error } = await supabase
      .from('email_logs')
      .update(updates)
      .eq('id', emailLogId)
      .select()
      .single();
    
    if (error) throw error;
    return data as EmailLog;
  }

  /**
   * 링크 클릭 추적
   */
  async trackLinkClick(
    emailLogId: string,
    linkUrl: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const { error } = await supabase
      .from('email_link_clicks')
      .insert({
        email_log_id: emailLogId,
        link_url: linkUrl,
        ip_address: ipAddress,
        user_agent: userAgent
      });
    
    if (error) throw error;
    
    // 이메일 상태도 업데이트
    await this.updateEmailStatus(emailLogId, 'clicked');
  }

  /**
   * 이메일 통계 조회
   */
  async getStatistics(fromDate?: string, toDate?: string): Promise<EmailStatistics> {
    // 기본적인 통계 쿼리 (실제로는 더 복잡한 집계가 필요)
    const { data: logs, error } = await supabase
      .from('email_logs')
      .select('*')
      .gte('sent_at', fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('sent_at', toDate || new Date().toISOString());

    if (error) throw error;

    const total_sent = logs.filter(l => l.status !== 'pending').length;
    const total_opened = logs.filter(l => l.opened_at).length;
    const total_clicked = logs.filter(l => l.clicked_at).length;
    const total_bounced = logs.filter(l => l.status === 'bounced').length;
    const total_failed = logs.filter(l => l.status === 'failed').length;

    return {
      total_sent,
      total_opened,
      total_clicked,
      total_bounced,
      total_failed,
      open_rate: total_sent > 0 ? (total_opened / total_sent) * 100 : 0,
      click_rate: total_opened > 0 ? (total_clicked / total_opened) * 100 : 0,
      bounce_rate: total_sent > 0 ? (total_bounced / total_sent) * 100 : 0,
      by_template: [], // TODO: 구현
      by_date: [] // TODO: 구현
    };
  }

  /**
   * 템플릿 변수 치환
   */
  renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value?.toString() || '');
    });
    
    return rendered;
  }

  /**
   * 비밀번호 재설정 이메일 발송
   */
  async sendPasswordResetEmail(email: string, resetLink: string, userName?: string) {
    return this.sendEmail({
      template_name: 'password-reset',
      recipient_email: email,
      recipient_name: userName,
      variables: {
        USER_NAME: userName || '고객',
        USER_EMAIL: email,
        RESET_LINK: resetLink
      }
    });
  }

  /**
   * 환영 이메일 발송
   */
  async sendWelcomeEmail(email: string, userName: string) {
    return this.sendEmail({
      template_name: 'welcome',
      recipient_email: email,
      recipient_name: userName,
      variables: {
        USER_NAME: userName,
        USER_EMAIL: email,
        LOGIN_LINK: `${process.env.NEXT_PUBLIC_SITE_URL}/login`
      }
    });
  }

  /**
   * 이메일 인증 메일 발송
   */
  async sendVerificationEmail(email: string, verificationLink: string, userName: string) {
    return this.sendEmail({
      template_name: 'email-verification',
      recipient_email: email,
      recipient_name: userName,
      variables: {
        USER_NAME: userName,
        USER_EMAIL: email,
        VERIFICATION_LINK: verificationLink
      }
    });
  }
}

// 싱글톤 인스턴스
export const emailService = new EmailService();
