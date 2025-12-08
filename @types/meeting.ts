// 회의록 관련 타입 정의
import type { PartnerCompany } from "./partner";

export interface Attendee {
  name: string;
  role?: string;
  company?: string;
  type: 'internal' | 'external';
}

export interface ActionItem {
  task: string;
  assignee: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface MeetingMinute {
  id: string;
  title: string;
  meeting_date: string;
  meeting_time?: string;
  meeting_type: 'phone' | 'in_person' | 'online';
  meeting_location?: string;
  partner_company_id?: string;
  attendees: Attendee[];
  agenda?: string;
  discussion?: string;
  decisions?: string;
  action_items?: ActionItem[];
  comparison_data?: Record<string, any>;
  details?: Record<string, any>;
  created_by?: string;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  created_at: string;
  updated_at: string;
  // 관계 데이터
  partner_company?: PartnerCompany;
  attachments?: MeetingAttachment[];
}

export interface MeetingAttachment {
  id: string;
  meeting_minute_id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  file_category?: 'image' | 'document' | 'quotation' | 'other';
  display_order: number;
  uploaded_by?: string;
  created_at: string;
}


