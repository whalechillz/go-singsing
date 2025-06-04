// scripts/create-migration-template.ts
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// 샘플 데이터
const sampleData = [
  {
    인원: 1,
    이름: '홍길동',
    연락처: '010-1234-5678',
    상품가: 800000,
    계약금: 400000,
    계약일: '2025.1.24',
    잔금: 400000,
    잔금일: '2025.3.12',
    '탑승지/탑승시간': '수원월드컵 07:00',
    객실: '4인실',
    비고: '예시 데이터'
  },
  {
    인원: 2,
    이름: '김영희',
    연락처: '010-9876-5432',
    상품가: 800000,
    계약금: 200000,
    계약일: '2025.2.4',
    잔금: 600000,
    잔금일: '2025.3.10',
    '탑승지/탑승시간': '평택 동성골프연습장 08:00',
    객실: '2인실',
    비고: '조인팀'
  }
];

// 엑셀 파일 생성
function createTemplate() {
  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '참가자목록');
  
  // 컬럼 너비 설정
  const colWidths = [
    { wch: 5 },   // 인원
    { wch: 10 },  // 이름
    { wch: 15 },  // 연락처
    { wch: 10 },  // 상품가
    { wch: 10 },  // 계약금
    { wch: 12 },  // 계약일
    { wch: 10 },  // 잔금
    { wch: 12 },  // 잔금일
    { wch: 20 },  // 탑승지/탑승시간
    { wch: 8 },   // 객실
    { wch: 30 }   // 비고
  ];
  ws['!cols'] = colWidths;
  
  const outputPath = path.join(__dirname, '../data/migration-template.xlsx');
  XLSX.writeFile(wb, outputPath);
  
  console.log(`템플릿 파일이 생성되었습니다: ${outputPath}`);
}

createTemplate();