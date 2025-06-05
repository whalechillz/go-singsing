import React from 'react';
import { colors } from '../../styles/colors';

/**
 * 싱싱골프투어 헤더 컴포넌트 예시
 * 문서 타입에 따라 다른 스타일 적용
 */

// A그룹: 계약 문서용 헤더
export const ContractHeader = ({ title, date }: { title: string; date?: string }) => {
  return (
    <div style={{
      backgroundColor: colors.contractDark,
      color: 'white',
      padding: '20px 15px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
        싱싱골프투어
      </div>
      <div style={{ fontSize: '20px', marginBottom: '8px' }}>
        {title}
      </div>
      {date && (
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          {date}
        </div>
      )}
      <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '10px' }}>
        수원시 영통구 법조로149번길 200<br />
        고객센터 TEL 031-215-3990
      </div>
    </div>
  );
};

// B그룹: 실행 문서용 헤더 (둥근 모서리)
export const OperationalHeader = ({ 
  documentType, 
  tourName 
}: { 
  documentType: string; 
  tourName: string;
}) => {
  return (
    <div style={{
      backgroundColor: colors.operationalMain,
      color: 'white',
      padding: '20px',
      textAlign: 'center',
      borderRadius: '10px 10px 0 0'
    }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
        싱싱골프투어
      </div>
      <div style={{ fontSize: '20px', marginBottom: '5px' }}>
        {documentType}
      </div>
      <div style={{ fontSize: '16px', opacity: 0.9 }}>
        {tourName}
      </div>
    </div>
  );
};

// Tailwind CSS 버전
export const ContractHeaderTailwind = ({ title }: { title: string }) => {
  return (
    <div className="bg-singsing-dark text-white p-5 text-center">
      <div className="text-2xl font-bold mb-2.5">싱싱골프투어</div>
      <div className="text-xl mb-2">{title}</div>
      <div className="text-sm opacity-90 mt-2.5">
        수원시 영통구 법조로149번길 200<br />
        고객센터 TEL 031-215-3990
      </div>
    </div>
  );
};

export const OperationalHeaderTailwind = ({ 
  documentType, 
  tourName 
}: { 
  documentType: string; 
  tourName: string;
}) => {
  return (
    <div className="bg-singsing-main text-white p-5 text-center rounded-t-lg">
      <div className="text-2xl font-bold mb-2.5">싱싱골프투어</div>
      <div className="text-xl mb-1.5">{documentType}</div>
      <div className="text-base opacity-90">{tourName}</div>
    </div>
  );
};

// 색상 팔레트 표시 컴포넌트
export const ColorPalette = () => {
  const brandColors = [
    { name: 'Contract Dark', value: colors.contractDark, usage: '계약 문서' },
    { name: 'Operational Main', value: colors.operationalMain, usage: '실행 문서' },
    { name: 'Accent Light', value: colors.accentLight, usage: '강조 요소' },
    { name: 'Background Light', value: colors.backgroundLight, usage: '배경색' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: colors.textPrimary }}>
        싱싱골프투어 브랜드 색상
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {brandColors.map((color) => (
          <div key={color.name} style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              backgroundColor: color.value, 
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color.value === colors.backgroundLight ? colors.textPrimary : 'white',
              fontWeight: 'bold'
            }}>
              {color.value}
            </div>
            <div style={{ padding: '15px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {color.name}
              </div>
              <div style={{ color: colors.textSecondary, fontSize: '14px' }}>
                {color.usage}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
