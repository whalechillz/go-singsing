-- 공지사항 템플릿 테이블 생성
CREATE TABLE IF NOT EXISTS public.notice_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- weather, payment, schedule, emergency, etc
    content TEXT NOT NULL,
    short_content TEXT, -- 메시지 발송용 짧은 버전
    variables JSONB DEFAULT '[]'::jsonb, -- 치환 가능한 변수들 (예: {{tour_name}}, {{date}})
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id)
);

-- 카테고리별 인덱스
CREATE INDEX idx_notice_templates_category ON notice_templates(category);
CREATE INDEX idx_notice_templates_active ON notice_templates(is_active);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_notice_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notice_templates_updated_at
    BEFORE UPDATE ON notice_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_notice_templates_updated_at();

-- 샘플 템플릿 데이터 삽입
INSERT INTO notice_templates (title, category, content, short_content, variables) VALUES
(
    '우천시 환불 안내',
    'weather',
    '☔ 우천시 환불 규정 안내

【출발 전 취소】
• 출발 당일 우천 예보 시: 전액 환불
• 취소 결정: 출발 2시간 전 최종 확정

【라운딩 중 우천】
• 9홀 미만 플레이: 그린피 70% 환불
• 9홀 이상 플레이: 홀아웃 정산표 기준 적용
• 카트피, 캐디피는 환불 불가

【환불 절차】
• 총무님께서 키 수령 시 정산표 전달
• 환불금은 3~5일 내 입금 처리

문의: 담당 매니저 {{manager_phone}}',
    '[우천환불] 출발전 취소시 전액환불, 라운딩중 우천시 홀아웃정산. 자세한 내용은 링크 확인 {{portal_link}}',
    '["manager_phone", "portal_link"]'::jsonb
),
(
    '식음료 결제 안내',
    'payment',
    '💳 골프장 내 식음료 결제 안내

【결제 원칙】
• 골프장 식당 이용 금액: 당일 결제 필수
• 룸/바 이용 금액: 당일 또는 익일 오전까지 결제
• 미결제 시 출발이 지연될 수 있습니다

【결제 방법】
• 식사 후 즉시 프론트에서 결제
• 룸차지는 체크아웃 전 정산
• 신용카드/현금 모두 가능

【주의사항】
• 체크아웃 전 프론트에서 미결제 금액 확인 필수
• 단체 정산 시 대표자 확인 필요
• 영수증은 꼭 보관해 주세요

문의: {{hotel_front}} 또는 담당 매니저',
    '[결제안내] 골프장 식음료는 당일결제 원칙. 미결제시 출발지연 가능. {{portal_link}}',
    '["hotel_front", "portal_link"]'::jsonb
),
(
    '조식 시간 변경 안내',
    'schedule',
    '🍳 조식 운영시간 변경 안내

【변경된 시간】
• 기존: {{old_time}}
• 변경: {{new_time}}

【이용 안내】
• 1차 라운딩 조: {{first_round_time}} 이용 권장
• 2차 라운딩 조: {{second_round_time}} 이용 권장
• 혼잡 시간대: {{busy_time}}

【주의사항】
• 라운딩 시간 30분 전까지 식사 완료
• 테이크아웃 가능 (프론트 문의)

변경된 시간 꼭 확인 부탁드립니다.',
    '[조식변경] {{new_time}}로 변경. 라운딩 30분전 식사완료 필수.',
    '["old_time", "new_time", "first_round_time", "second_round_time", "busy_time"]'::jsonb
),
(
    '긴급 연락처 안내',
    'emergency',
    '🚨 긴급 상황 시 연락처

【투어 관련】
• 담당 매니저: {{manager_phone}}
• 기사님: {{driver_phone}}
• 싱싱골프 본사: 031-215-3990

【의료 기관】
• 응급실: 119
• 가장 가까운 병원: {{hospital_info}}
• 24시간 약국: {{pharmacy_info}}

【현지 시설】
• 호텔 프론트: {{hotel_front}}
• 골프장 프론트: {{golf_front}}

안전한 투어 되시기 바랍니다.',
    '[긴급연락처] 매니저 {{manager_phone}}, 기사 {{driver_phone}}, 응급 119',
    '["manager_phone", "driver_phone", "hospital_info", "pharmacy_info", "hotel_front", "golf_front"]'::jsonb
);

-- Row Level Security 설정
ALTER TABLE notice_templates ENABLE ROW LEVEL SECURITY;

-- 읽기는 모두 가능
CREATE POLICY "Anyone can view active templates" ON notice_templates
    FOR SELECT
    USING (is_active = true);

-- 생성/수정/삭제는 인증된 사용자만
CREATE POLICY "Authenticated users can manage templates" ON notice_templates
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
