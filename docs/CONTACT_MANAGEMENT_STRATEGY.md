// 투어 편집 페이지 수정 제안
// company_mobile을 tours 테이블이 아닌 설정에서 가져오기

// 1. 설정 데이터 가져오기
const { data: settings } = await supabase
  .from('system_settings') // 실제 설정 테이블명으로 변경
  .select('company_phone, company_mobile, default_footer_message')
  .single();

// 2. 투어 스텝진에서 담당자 찾기
const manager = staff.find(s => s.role === '매니저' || s.role === '인솔자');

// 3. 우선순위로 표시
// 1순위: 투어별 담당자 (스텝진)
// 2순위: 회사 기본 설정
const displayPhone = manager?.phone || settings?.company_mobile || '010-3332-9020';

// 4. 문서에 표시할 때
<div className="contact-info">
  <p>문의: {displayPhone} ({manager?.name || '담당자'})</p>
</div>