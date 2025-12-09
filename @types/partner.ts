// 협업 업체 관련 타입 정의
export interface PartnerCompany {
  id: string;
  name: string;
  country?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  kakao_talk_id?: string;
  nateon_id?: string;
  facebook_url?: string;
  website_url?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive';
  category?: '해외업체' | '해외랜드' | '국내부킹' | '국내 버스패키지' | '버스기사' | '프로' | '기타';
  is_favorite?: boolean;
  created_at: string;
  updated_at: string;
}


