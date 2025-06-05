import type { Meta, StoryObj } from '@storybook/react';
import { 
  ContractHeader, 
  OperationalHeader, 
  ColorPalette 
} from '../examples/header-samples';

// 색상 팔레트 스토리
const meta: Meta<typeof ColorPalette> = {
  title: 'Design System/Colors',
  component: ColorPalette,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BrandColors: Story = {
  render: () => <ColorPalette />,
};

// 헤더 컴포넌트 스토리
export const Headers: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '20px' }}>
      <div>
        <h3 style={{ marginBottom: '20px' }}>A그룹: 계약 문서 헤더</h3>
        <ContractHeader 
          title="2박3일 순천버스핑" 
          date="2025. 6. 16. ~ 2025. 6. 18."
        />
      </div>
      
      <div>
        <h3 style={{ marginBottom: '20px' }}>B그룹: 실행 문서 헤더</h3>
        <div style={{ background: '#f5f7fa', padding: '20px', borderRadius: '12px' }}>
          <OperationalHeader 
            documentType="탑승 안내"
            tourName="2박3일 순천버스핑"
          />
        </div>
      </div>
    </div>
  ),
};

// 색상 비교 스토리
export const ColorComparison: Story = {
  render: () => (
    <div style={{ padding: '40px' }}>
      <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>
        싱싱골프투어 색상 체계 비교
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div>
          <h3 style={{ marginBottom: '20px' }}>계약 단계 (진한 색상)</h3>
          <div style={{
            backgroundColor: '#2c5282',
            color: 'white',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>#2c5282</div>
            <div style={{ marginTop: '10px' }}>권위감 • 신뢰감</div>
          </div>
        </div>
        
        <div>
          <h3 style={{ marginBottom: '20px' }}>실행 단계 (연한 색상)</h3>
          <div style={{
            backgroundColor: '#4a6fa5',
            color: 'white',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>#4a6fa5</div>
            <div style={{ marginTop: '10px' }}>친근감 • 편안함</div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4>사용 가이드</h4>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>고객용 일정표: 계약서 역할 → 진한 색상 (#2c5282)</li>
          <li>탑승안내서, 객실배정표 등: 실행 문서 → 연한 색상 (#4a6fa5)</li>
          <li>60대 고객을 위해 충분한 대비와 큰 글씨 사용</li>
        </ul>
      </div>
    </div>
  ),
};
