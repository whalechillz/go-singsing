// 협업 업체 관련 타입 정의
export interface PartnerCompany {
  id: string;
  name: string;
  country?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  kakao_talk_id?: string;
  facebook_url?: string;
  website_url?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}


