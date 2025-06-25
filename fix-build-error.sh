#!/bin/bash

# 문제가 되는 파일 삭제
rm -f app/api/messages/send-document/route_button_fix.ts

# 상태 확인
echo "삭제 완료. 남은 파일:"
ls app/api/messages/send-document/

# git 상태 확인
git status --porcelain app/api/messages/send-document/