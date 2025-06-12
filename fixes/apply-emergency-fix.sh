#!/bin/bash
# 싱싱골프투어 긴급 패치 스크립트
# 실행: bash apply-emergency-fix.sh

echo "🚨 싱싱골프투어 긴급 패치 적용 시작..."

# 1. 백업 디렉토리 생성
BACKUP_DIR="./backup/emergency-fix-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

# 2. 기존 파일 백업
echo "📦 기존 파일 백업 중..."
cp app/admin/tours/\[tourId\]/edit/page.tsx $BACKUP_DIR/
cp app/admin/tours/\[tourId\]/document-links/page.tsx $BACKUP_DIR/

# 3. 수정사항 적용
echo "🔧 수정사항 적용 중..."

# 스탭 에러 수정 패치
cat << 'EOF' > patch-staff-error.js
// 이 스크립트를 실행하여 handleSubmit 함수의 에러 처리를 개선합니다
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/admin/tours/[tourId]/edit/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// catch 블록 찾아서 교체
const oldCatch = 'setError(error.message);';
const newCatch = `console.error('Tour staff save error:', error);
      setError(\`스탭 저장 중 오류: \${error.message || '알 수 없는 오류'}\`);
      window.scrollTo({ top: 0, behavior: 'smooth' });`;

content = content.replace(oldCatch, newCatch);

// staffData에 order 필드 추가
const oldStaffData = 'display_order: i + 1';
const newStaffData = 'display_order: i + 1,\n        order: i + 1 // legacy support';

content = content.replace(oldStaffData, newStaffData);

fs.writeFileSync(filePath, content);
console.log('✅ 스탭 에러 처리 개선 완료');
EOF

# 체크박스 동기화 수정 패치
cat << 'EOF' > patch-checkbox-sync.js
// 이 스크립트를 실행하여 체크박스 동기화 문제를 해결합니다
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/admin/tours/[tourId]/document-links/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// portalSettings에 showOnlyDriver 추가
const oldPortalSettings = 'const portalSettings = {';
const newPortalSettings = 'const portalSettings = {\n      showOnlyDriver: showOnlyDriver, // 명시적으로 저장';

content = content.replace(oldPortalSettings, newPortalSettings);

// handleUpdatePortal에도 동일하게 적용
const updatePortalSettings = 'const portalSettings = {';
const newUpdatePortalSettings = 'const portalSettings = {\n      showOnlyDriver: editShowOnlyDriver, // 명시적으로 저장';

content = content.replace(new RegExp(updatePortalSettings, 'g'), newUpdatePortalSettings);

// showOnlyDriver 불러오기 로직 개선
const oldLoadLogic = 'setEditShowOnlyDriver(!settings.contactNumbers.manager && !!settings.contactNumbers.driver);';
const newLoadLogic = 'setEditShowOnlyDriver(settings.showOnlyDriver === true);';

content = content.replace(oldLoadLogic, newLoadLogic);

fs.writeFileSync(filePath, content);
console.log('✅ 체크박스 동기화 문제 해결 완료');
EOF

# 4. Node.js로 패치 실행
echo "📝 패치 적용 중..."
node patch-staff-error.js
node patch-checkbox-sync.js

# 5. 임시 파일 정리
rm patch-staff-error.js
rm patch-checkbox-sync.js

echo "✅ 긴급 패치 적용 완료!"
echo "📌 백업 파일 위치: $BACKUP_DIR"
echo ""
echo "⚠️  주의사항:"
echo "1. 패치 적용 후 반드시 테스트를 진행하세요"
echo "2. 문제 발생 시 백업 파일로 복원하세요"
echo "3. Supabase 데이터베이스 스키마도 확인하세요"
echo ""
echo "🔍 테스트 항목:"
echo "- 투어 운영진 추가/수정/삭제"
echo "- 통합 표지 생성 시 체크박스 동작"
echo "- 에러 메시지 표시 확인"
