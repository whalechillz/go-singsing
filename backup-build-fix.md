# backup 폴더 때문에 빌드 오류 발생 시 해결 방법

## 임시 해결책
```bash
# 1. backup 폴더 이름 변경
mv backup .backup

# 또는

# 2. backup 폴더를 프로젝트 외부로 이동
mv backup ../backup_singsinggolf_20250108
```

## 영구 해결책 (이미 적용됨)
- tsconfig.json의 exclude에 "backup", "backup_*" 추가
- .gitignore에 backup 폴더 추가
- next.config.ts에 webpack 설정으로 backup 폴더 제외

## 빌드 후 복원
```bash
# backup 폴더 복원 (필요시)
mv .backup backup
```
