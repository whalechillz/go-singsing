#!/bin/bash

# 백업 폴더 생성
BACKUP_DIR="backup_files/components_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "🧹 사용하지 않는 파일 백업 시작..."

# 확실히 사용하지 않는 파일들
UNUSED_FILES=(
  # 문서 관련 (이미 제거됨)
  "components/DocumentFooterManager.tsx"
  "components/DocumentNoticeManager.tsx"
  
  # 테스트 파일들
  "components/ColorPaletteTest.tsx"
  "components/SimpleColorTest.tsx"
  "components/TestMemoDb.tsx"
  
  # 구버전 컴포넌트들 (V2가 있는 경우)
  "components/payments/PaymentManager.tsx"  # V3 사용 중
  "components/payments/PaymentManagerV2.tsx"  # V3 사용 중
  
  # 구버전 대시보드
  "components/admin/DashboardContent.tsx.backup"  # 이미 백업
  "components/admin/AdminHeader.tsx.backup"  # 이미 백업
  "components/admin/AdminLayout.tsx.backup"  # 이미 백업
  "components/admin/AdminSidebar.tsx.backup"  # 이미 백업
  
  # 미사용 보딩 관련
  "components/BoardingGuideForm.tsx"
  "components/BoardingGuidePreview.tsx"
  "components/BoardingPlaceManager.tsx"
  "components/BoardingScheduleManager.tsx"
  "components/TourBoardingTimeManager.tsx"
  
  # 기타 미사용 추정
  "components/TeeTimeManager.tsx"  # V2 사용 중
  "components/ScheduleManager.tsx"  # IntegratedScheduleManager 사용 중
)

# 파일 백업
for file in "${UNUSED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📦 백업 중: $file"
    # 디렉토리 구조 유지하며 복사
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    mv "$file" "$BACKUP_DIR/$file"
  else
    echo "⏭️  이미 없음: $file"
  fi
done

echo "✅ 백업 완료! 위치: $BACKUP_DIR"
echo ""
echo "⚠️  주의사항:"
echo "1. 백업된 파일들은 $BACKUP_DIR 에 있습니다"
echo "2. 문제가 생기면 복원할 수 있습니다"
echo "3. 확실히 필요없다고 판단되면 나중에 삭제하세요"
