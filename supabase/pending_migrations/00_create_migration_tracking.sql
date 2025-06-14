-- 마이그레이션 추적 테이블 (이미 없다면 생성)
CREATE TABLE IF NOT EXISTS migration_history (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    executed_by VARCHAR(255),
    notes TEXT
);

-- 이미 실행한 마이그레이션들을 기록
INSERT INTO migration_history (filename, notes) VALUES
('001_auth_setup.sql', '수동 실행됨'),
('001_create_profiles.sql', '수동 실행됨'),
-- ... 여기에 이미 실행한 파일들 추가
ON CONFLICT (filename) DO NOTHING;

-- 이메일 템플릿 마이그레이션이 이미 실행되었는지 확인
SELECT EXISTS (
    SELECT 1 FROM migration_history 
    WHERE filename = '20250114_email_templates.sql'
);
