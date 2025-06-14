-- 이메일 템플릿 관리 테이블
CREATE TABLE email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- 템플릿 식별자 (예: password-reset, welcome)
    subject VARCHAR(255) NOT NULL, -- 이메일 제목
    description TEXT, -- 템플릿 설명
    html_content TEXT NOT NULL, -- HTML 템플릿 내용
    text_content TEXT, -- 텍스트 버전 (선택사항)
    variables JSONB DEFAULT '[]'::jsonb, -- 사용 가능한 변수 목록
    category VARCHAR(50), -- 카테고리 (auth, marketing, transactional 등)
    is_active BOOLEAN DEFAULT true, -- 활성화 상태
    version INTEGER DEFAULT 1, -- 버전 관리
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 이메일 템플릿 버전 히스토리
CREATE TABLE email_template_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]'::jsonb,
    change_note TEXT, -- 변경 사항 메모
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(template_id, version)
);

-- 이메일 발송 로그
CREATE TABLE email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES email_templates(id),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    variables JSONB, -- 실제 사용된 변수 값들
    status VARCHAR(50) NOT NULL, -- sent, failed, bounced, opened, clicked
    error_message TEXT, -- 에러 발생 시 메시지
    provider VARCHAR(50), -- sendgrid, ses, smtp 등
    provider_message_id VARCHAR(255), -- 외부 서비스의 메시지 ID
    opened_at TIMESTAMPTZ, -- 이메일 열람 시간
    clicked_at TIMESTAMPTZ, -- 링크 클릭 시간
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 이메일 링크 추적
CREATE TABLE email_link_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_log_id UUID REFERENCES email_logs(id) ON DELETE CASCADE,
    link_url TEXT NOT NULL,
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- 인덱스 생성
CREATE INDEX idx_email_templates_name ON email_templates(name);
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_template ON email_logs(template_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);

-- RLS 정책
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_link_clicks ENABLE ROW LEVEL SECURITY;

-- 관리자만 템플릿 관리 가능
CREATE POLICY "Admins can manage email templates" ON email_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.active_users
            WHERE id = auth.uid()::text
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    );

-- 이메일 로그는 관리자만 조회 가능
CREATE POLICY "Admins can view email logs" ON email_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.active_users
            WHERE id = auth.uid()::text
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    );

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON email_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 트리거: 템플릿 버전 자동 저장
CREATE OR REPLACE FUNCTION save_email_template_version()
RETURNS TRIGGER AS $$
BEGIN
    -- 내용이 변경된 경우에만 버전 저장
    IF OLD.html_content != NEW.html_content OR OLD.subject != NEW.subject THEN
        INSERT INTO email_template_versions (
            template_id,
            version,
            subject,
            html_content,
            text_content,
            variables,
            created_by
        )
        VALUES (
            NEW.id,
            NEW.version,
            OLD.subject,
            OLD.html_content,
            OLD.text_content,
            OLD.variables,
            NEW.updated_by
        );
        
        -- 버전 번호 증가
        NEW.version = NEW.version + 1;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER save_template_version_on_update
    BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION save_email_template_version();

-- 초기 템플릿 데이터 삽입
INSERT INTO email_templates (name, subject, description, html_content, category, variables) VALUES
(
    'password-reset',
    '싱싱골프 - 비밀번호 재설정',
    '사용자가 비밀번호 재설정을 요청했을 때 발송되는 이메일',
    '<!-- 여기에 HTML 템플릿 내용 -->',
    'auth',
    '[
        {"name": "USER_NAME", "description": "사용자 이름", "required": false, "default": "고객"},
        {"name": "USER_EMAIL", "description": "사용자 이메일", "required": true},
        {"name": "RESET_LINK", "description": "비밀번호 재설정 링크", "required": true}
    ]'::jsonb
),
(
    'welcome',
    '싱싱골프에 오신 것을 환영합니다!',
    '신규 회원가입 시 발송되는 환영 이메일',
    '<!-- 환영 이메일 HTML -->',
    'marketing',
    '[
        {"name": "USER_NAME", "description": "사용자 이름", "required": true},
        {"name": "USER_EMAIL", "description": "사용자 이메일", "required": true},
        {"name": "LOGIN_LINK", "description": "로그인 페이지 링크", "required": true}
    ]'::jsonb
),
(
    'email-verification',
    '이메일 주소를 인증해주세요',
    '이메일 주소 인증을 위한 이메일',
    '<!-- 인증 이메일 HTML -->',
    'auth',
    '[
        {"name": "USER_NAME", "description": "사용자 이름", "required": true},
        {"name": "USER_EMAIL", "description": "사용자 이메일", "required": true},
        {"name": "VERIFICATION_LINK", "description": "인증 링크", "required": true}
    ]'::jsonb
);

-- 이메일 발송 함수
CREATE OR REPLACE FUNCTION send_email(
    p_template_name VARCHAR,
    p_recipient_email VARCHAR,
    p_recipient_name VARCHAR,
    p_variables JSONB
)
RETURNS UUID AS $$
DECLARE
    v_template email_templates;
    v_email_log_id UUID;
    v_html_content TEXT;
    v_subject VARCHAR;
BEGIN
    -- 템플릿 조회
    SELECT * INTO v_template
    FROM email_templates
    WHERE name = p_template_name
    AND is_active = true
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Email template not found: %', p_template_name;
    END IF;
    
    -- 변수 치환 (간단한 예시)
    v_html_content := v_template.html_content;
    v_subject := v_template.subject;
    
    -- 로그 생성
    INSERT INTO email_logs (
        template_id,
        recipient_email,
        recipient_name,
        subject,
        variables,
        status
    )
    VALUES (
        v_template.id,
        p_recipient_email,
        p_recipient_name,
        v_subject,
        p_variables,
        'pending'
    )
    RETURNING id INTO v_email_log_id;
    
    -- 실제 이메일 발송은 Edge Function이나 백엔드에서 처리
    -- 여기서는 로그 ID만 반환
    RETURN v_email_log_id;
END;
$$ LANGUAGE plpgsql;

-- 사용 예시
-- SELECT send_email(
--     'password-reset',
--     'user@example.com',
--     '홍길동',
--     '{"USER_NAME": "홍길동", "RESET_LINK": "https://..."}'::jsonb
-- );
