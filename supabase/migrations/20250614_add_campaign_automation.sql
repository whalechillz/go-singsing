-- 캠페인에 자동화 관련 필드 추가
ALTER TABLE marketing_campaigns 
ADD COLUMN IF NOT EXISTS is_automated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS automation_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS automation_config JSONB,
ADD COLUMN IF NOT EXISTS next_run_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_run_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS run_count INTEGER DEFAULT 0;

-- 자동화 타입 체크 제약조건
ALTER TABLE marketing_campaigns 
ADD CONSTRAINT check_automation_type 
CHECK (automation_type IN ('birthday', 'anniversary', 'after_tour', 'inactive_reminder', 'custom'));

-- 자동화 캠페인 실행 로그 테이블
CREATE TABLE IF NOT EXISTS campaign_automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recipients_count INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'running',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_campaigns_automated ON marketing_campaigns(is_automated, next_run_at) WHERE is_automated = true;
CREATE INDEX IF NOT EXISTS idx_automation_logs_campaign ON campaign_automation_logs(campaign_id, run_at DESC);

-- RLS 정책
ALTER TABLE campaign_automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaign_automation_logs_policy" ON campaign_automation_logs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- A/B 테스트를 위한 캠페인 변형 테이블
CREATE TABLE IF NOT EXISTS campaign_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    variant_name VARCHAR(100) NOT NULL,
    message_template_id UUID REFERENCES message_templates(id),
    send_time TIME,
    percentage INTEGER NOT NULL DEFAULT 50,
    metrics JSONB DEFAULT '{"sent": 0, "delivered": 0, "clicked": 0, "converted": 0}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT check_percentage CHECK (percentage >= 0 AND percentage <= 100)
);

-- 캠페인별 변형 비율 합계가 100%인지 확인하는 트리거
CREATE OR REPLACE FUNCTION check_variant_percentage()
RETURNS TRIGGER AS $$
DECLARE
    total_percentage INTEGER;
BEGIN
    SELECT SUM(percentage) INTO total_percentage
    FROM campaign_variants
    WHERE campaign_id = NEW.campaign_id
    AND id != COALESCE(NEW.id, gen_random_uuid());
    
    IF (total_percentage + NEW.percentage) > 100 THEN
        RAISE EXCEPTION '캠페인 변형의 총 비율이 100%를 초과할 수 없습니다.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_variant_percentage_trigger
    BEFORE INSERT OR UPDATE ON campaign_variants
    FOR EACH ROW
    EXECUTE FUNCTION check_variant_percentage();

-- 자동화 캠페인 예시 데이터 (생일 축하)
INSERT INTO message_templates (name, type, content, is_active) VALUES
('생일 축하 템플릿', 'lms', '#{이름}님, 생일을 진심으로 축하드립니다! 🎉

특별한 날을 맞아 싱싱골프투어에서 준비한 생일 쿠폰을 드립니다.
다음 투어 예약 시 5% 할인 혜택을 받으실 수 있습니다.

쿠폰 코드: HAPPY#{생일월}
유효기간: 생일 후 30일

행복한 하루 보내세요! 🎂', true)
ON CONFLICT DO NOTHING;

-- 투어 후 감사 템플릿
INSERT INTO message_templates (name, type, content, is_active) VALUES
('투어 후 감사 템플릿', 'lms', '#{이름}님, #{투어명} 여행은 즐거우셨나요?

싱싱골프투어와 함께해 주셔서 감사합니다.

다음 투어를 위한 특별 혜택:
- 조기 예약 시 3% 추가 할인
- 동반자 할인 혜택

고객님의 소중한 후기를 기다립니다.
후기 작성 시 5만원 할인 쿠폰을 드립니다!

감사합니다. 🙏', true)
ON CONFLICT DO NOTHING;
