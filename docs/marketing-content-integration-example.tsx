// 투어 수정 페이지에 추가할 마케팅 콘텐츠 관리 탭 예시

import MarketingContentManager from '@/components/admin/MarketingContentManager';

// 기존 탭에 추가
const tourEditTabs = [
  { id: 'basic', label: '기본 정보' },
  { id: 'staff', label: '스텝진 관리' },
  { id: 'document', label: '문서 설정' },
  { id: 'marketing', label: '마케팅 콘텐츠' }, // 새로 추가
];

// 탭 내용 렌더링 부분에 추가
function renderTabContent(activeTab: string, tourId: string, tourProductId: string) {
  switch (activeTab) {
    // ... 기존 케이스들
    
    case 'marketing':
      return (
        <MarketingContentManager
          tourId={tourId}
          tourProductId={tourProductId}
          contentType="tour_specific"
        />
      );
    
    default:
      return null;
  }
}

// 마케팅 페이지에서 사용 예시
import MarketingContentDisplay from '@/components/MarketingContentDisplay';

function TourMarketingPage({ tourId }: { tourId: string }) {
  const [marketingItems, setMarketingItems] = useState([]);
  
  useEffect(() => {
    // API에서 마케팅 콘텐츠 가져오기
    fetch(`/api/marketing/content?tourId=${tourId}`)
      .then(res => res.json())
      .then(data => setMarketingItems(data.items));
  }, [tourId]);
  
  return (
    <div className="tour-details">
      {/* 기본 투어 정보 */}
      <div className="tour-info">
        {/* ... */}
      </div>
      
      {/* 마케팅 콘텐츠 표시 */}
      <MarketingContentDisplay items={marketingItems} />
    </div>
  );
}
