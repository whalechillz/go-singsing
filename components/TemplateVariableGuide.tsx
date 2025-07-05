// components/TemplateVariableGuide.tsx
import React from 'react';
import { Info } from 'lucide-react';

interface TemplateVariable {
  name: string;
  description: string;
  example: string;
}

interface TemplateVariableGuideProps {
  templateType: 'quote' | 'document' | 'payment' | 'customer' | 'portal';
}

const TEMPLATE_VARIABLES: Record<string, TemplateVariable[]> = {
  common: [
    { name: '#{이름}', description: '수신자 이름', example: '홍길동' },
  ],
  quote: [
    { name: '#{견적서명}', description: '견적서 제목', example: '파인비치/솔라시도 패키지 견적서' },
    { name: '#{url}', description: '짧은 URL 코드', example: 'iaa7cfd6' },
    { name: '#{전체url}', description: '전체 URL 주소', example: 'https://go.singsinggolf.kr/s/iaa7cfd6' },
    { name: '#{만료일}', description: '견적서 유효기간', example: '2025. 7. 2.' },
  ],
  document: [
    { name: '#{문서명}', description: '문서 제목', example: '투어 일정표' },
    { name: '#{url}', description: '짧은 URL 코드', example: 'abc123' },
    { name: '#{전체url}', description: '전체 URL 주소', example: 'https://go.singsinggolf.kr/s/abc123' },
  ],
  portal: [
    { name: '#{투어명}', description: '투어 이름', example: '2025년 3월 제주도 골프투어' },
    { name: '#{url}', description: '짧은 URL 코드', example: 'xyz789' },
    { name: '#{전체url}', description: '전체 URL 주소', example: 'https://go.singsinggolf.kr/portal/xyz789' },
  ],
  payment: [
    { name: '#{투어명}', description: '투어 이름', example: '2025년 3월 제주도 골프투어' },
    { name: '#{출발일}', description: '투어 출발일', example: '2025. 3. 15.' },
    { name: '#{계약금}', description: '계약금 금액', example: '100,000' },
    { name: '#{잔금}', description: '잔금 금액', example: '2,400,000' },
    { name: '#{총금액}', description: '총 결제 금액', example: '2,500,000' },
    { name: '#{납부기한}', description: '납부 마감일', example: '2025. 3. 8.' },
    { name: '#{은행명}', description: '입금 은행', example: '국민은행' },
    { name: '#{계좌번호}', description: '입금 계좌번호', example: '294537-04-018035' },
  ],
  customer: [
    { name: '#{안내사항}', description: '안내 메시지', example: '다음 주 투어 일정을 확인해 주세요' },
    { name: '#{생일혜택}', description: '생일 축하 혜택', example: '10% 할인쿠폰' },
    { name: '#{프로모션}', description: '프로모션 내용', example: '신규 투어 상품 출시' },
  ],
};

export default function TemplateVariableGuide({ templateType }: TemplateVariableGuideProps) {
  const variables = [
    ...(TEMPLATE_VARIABLES.common || []),
    ...(TEMPLATE_VARIABLES[templateType] || [])
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-2 mb-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-900">사용 가능한 변수</h4>
          <p className="text-sm text-blue-700 mt-1">
            템플릿에서 아래 변수를 사용하면 자동으로 실제 값으로 치환됩니다.
          </p>
        </div>
      </div>
      
      <div className="space-y-2 mt-4">
        {variables.map((variable, index) => (
          <div key={index} className="bg-white rounded p-3 text-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <code className="font-mono font-bold text-blue-600">{variable.name}</code>
                <span className="text-gray-600 ml-2">{variable.description}</span>
              </div>
              <div className="text-gray-500 text-xs">
                예: {variable.example}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>💡 팁:</strong> URL 관련 변수
        </p>
        <ul className="text-sm text-yellow-700 mt-2 space-y-1">
          <li>• <code className="font-mono">{'#{url}'}</code> - 짧은 코드만 (URL에 이미 도메인이 있을 때)</li>
          <li>• <code className="font-mono">{'#{전체url}'}</code> - 전체 URL (도메인 포함)</li>
        </ul>
      </div>
    </div>
  );
}