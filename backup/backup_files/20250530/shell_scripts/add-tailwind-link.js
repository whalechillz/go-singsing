const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, 'components');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Tailwind CSS 빌드 파일 찾기 (src_app_globals_*.css)
const CHUNKS_DIR = path.join(__dirname, '.next', 'static', 'chunks');
const cssFile = fs.readdirSync(CHUNKS_DIR).find(f => /^src_app_globals_.*\.css$/.test(f));
if (!cssFile) {
  console.error('Tailwind CSS 빌드 파일을 찾을 수 없습니다. 먼저 next build 또는 dev를 실행하세요.');
  process.exit(1);
}
const TAILWIND_CSS_SRC = path.join(CHUNKS_DIR, cssFile);
const TAILWIND_CSS_DEST = path.join(PUBLIC_DIR, 'tailwind.css');

// 1. Tailwind CSS 파일 복사
fs.copyFileSync(TAILWIND_CSS_SRC, TAILWIND_CSS_DEST);
console.log('tailwind.css 복사 완료:', cssFile);

// 2. components 폴더의 모든 .html 파일 처리
fs.readdirSync(COMPONENTS_DIR)
  .filter(file => file.endsWith('.html'))
  .forEach(file => {
    const srcPath = path.join(COMPONENTS_DIR, file);
    const destPath = path.join(PUBLIC_DIR, file);
    let html = fs.readFileSync(srcPath, 'utf8');
    if (!html.includes('tailwind.css')) {
      html = html.replace(
        /<head>/i,
        `<head>\n  <link href=\"/tailwind.css\" rel=\"stylesheet\">`
      );
      console.log(`${file}에 tailwind.css 링크 추가`);
    }
    fs.writeFileSync(destPath, html, 'utf8');
  });

console.log('모든 HTML 파일이 public 폴더로 복사 및 스타일 적용 완료!'); 