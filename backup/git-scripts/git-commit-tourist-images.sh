#!/bin/bash

# Git에 변경사항 추가
git add scripts/fix_tourist_attractions_and_options.sql
git add scripts/update_tourist_attractions_images.sql
git add scripts/create_storage_bucket.sql
git add docs/fix-boseong-green-tea-image.md

# 커밋
git commit -m "fix: 보성 녹차밭 및 관광지 이미지 추가

- 보성 녹차밭, 송광사, 순천만 습지 이미지 URL 추가
- tour_attraction_options 테이블 생성 SQL 추가
- 투어에 관광지 옵션 연결하는 SQL 추가
- Storage 버킷 생성 스크립트 추가
- 이미지 추가 가이드 문서 작성"

echo "✅ 변경사항이 커밋되었습니다."
echo ""
echo "📝 다음 단계:"
echo "1. Supabase SQL Editor에서 다음 스크립트 실행:"
echo "   - scripts/fix_tourist_attractions_and_options.sql"
echo "   - scripts/create_storage_bucket.sql (필요한 경우)"
echo ""
echo "2. 관리자 페이지에서 확인:"
echo "   - /admin/attractions 에서 이미지 확인"
echo ""
echo "3. Git push:"
echo "   git push origin main"
