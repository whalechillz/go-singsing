#!/bin/bash
git add components/TourSchedulePreview/documents/SimplifiedSchedule.tsx
git add components/TourSchedulePreview/index.tsx
git add components/PublicDocumentView.tsx
git add app/public-document/[tourId]/page.tsx
git commit -m "fix: UI 개선 - 간편일정 시간 초 제거, 버튼 크기 통일화"
git push origin main
