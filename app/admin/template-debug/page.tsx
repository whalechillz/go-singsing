"use client";
import React from "react";

// TemplateDebugger 컴포넌트가 없으므로 임시 컴포넌트 생성
const TemplateDebugger = () => {
  return (
    <div className="p-4 bg-gray-100 rounded">
      <p className="text-gray-600">템플릿 디버거 컴포넌트가 준비 중입니다.</p>
    </div>
  );
};

export default function TemplateDebugPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">템플릿 시스템 디버깅</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
        <p className="text-sm">
          이 페이지는 템플릿 시스템의 문제를 진단하기 위한 디버깅 페이지입니다.
          브라우저 콘솔을 열어서 로그를 확인하세요.
        </p>
      </div>

      <TemplateDebugger />
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold mb-2">문제 해결 체크리스트:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Supabase RLS 정책이 올바르게 설정되어 있는가?</li>
          <li>템플릿 데이터가 실제로 데이터베이스에 존재하는가?</li>
          <li>카테고리 값이 정확히 일치하는가? (예: 'urgent' vs 'urgnet' 오타)</li>
          <li>사용자 권한이 충분한가?</li>
          <li>네트워크 요청이 성공적으로 완료되는가?</li>
        </ul>
      </div>
    </div>
  );
}
