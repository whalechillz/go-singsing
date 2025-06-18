// 마케팅 페이지에서 사용하는 컴포넌트 예시
// components/TourMarketingSection.tsx

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface MarketingContent {
  icon: string;
  title: string;
  description: string;
  sub_items?: string[];
  highlight?: boolean;
}

interface TourMarketingSectionProps {
  tourId: string;
  tourProductId?: string;
}

const TourMarketingSection: React.FC<TourMarketingSectionProps> = ({ tourId, tourProductId }) => {
  const [includedItems, setIncludedItems] = useState<MarketingContent[]>([]);
  const [excludedItems, setExcludedItems] = useState<MarketingContent[]>([]);
  const [specialBenefits, setSpecialBenefits] = useState<MarketingContent[]>([]);
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => {
    loadMarketingContents();
  }, [tourId, tourProductId]);

  const loadMarketingContents = async () => {
    // 투어별 콘텐츠 우선, 없으면 상품 기본값 사용
    const { data, error } = await supabase
      .from('marketing_contents')
      .select('*')
      .or(`tour_id.eq.${tourId},tour_product_id.eq.${tourProductId}`)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (data) {
      // 투어별 콘텐츠가 있으면 우선 사용
      const tourContents = data.filter(item => item.tour_id === tourId);
      const productContents = data.filter(item => item.tour_product_id === tourProductId);
      
      const finalContents = tourContents.length > 0 ? tourContents : productContents;
      
      setIncludedItems(finalContents.filter(item => item.content_type === 'included'));
      setExcludedItems(finalContents.filter(item => item.content_type === 'excluded'));
      setSpecialBenefits(finalContents.filter(item => item.content_type === 'special_benefit'));
    }
  };

  const ContentCard = ({ items, title, bgColor, iconColor }: any) => (
    <div className={`${bgColor} rounded-xl p-6 h-full`}>
      <h3 className={`text-xl font-bold mb-4 ${iconColor}`}>{title}</h3>
      <div className="space-y-4">
        {items.map((item: MarketingContent, index: number) => (
          <div key={index} className="relative">
            {item.highlight && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full animate-pulse">
                HOT
              </span>
            )}
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                {item.sub_items && item.sub_items.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {item.sub_items.map((subItem, idx) => (
                      <li key={idx} className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="text-purple-400">•</span> {subItem}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          투어 상세 안내
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 포함사항 */}
          <ContentCard
            items={includedItems}
            title="✅ 포함사항"
            bgColor="bg-green-50"
            iconColor="text-green-700"
          />
          
          {/* 특별혜택 */}
          {specialBenefits.length > 0 && (
            <ContentCard
              items={specialBenefits}
              title="🎁 특별혜택"
              bgColor="bg-gradient-to-br from-purple-50 to-pink-50"
              iconColor="text-purple-700"
            />
          )}
          
          {/* 불포함사항 */}
          <ContentCard
            items={excludedItems}
            title="❌ 불포함사항"
            bgColor="bg-red-50"
            iconColor="text-red-700"
          />
        </div>
        
        {/* 추가 안내사항 */}
        <div className="mt-12 p-6 bg-blue-50 rounded-xl">
          <p className="text-center text-sm text-blue-700">
            <span className="font-semibold">💡 안내:</span> 상기 일정은 현지 사정 및 기상 변화에 의해 변경될 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TourMarketingSection;

// 사용 예시
// app/(customer)/tour/[id]/page.tsx
/*
export default function TourDetailPage({ params }) {
  const tour = await getTour(params.id);
  
  return (
    <div>
      <TourHeroSection tour={tour} />
      
      // 마케팅 콘텐츠 섹션
      <TourMarketingSection 
        tourId={tour.id}
        tourProductId={tour.tour_product_id}
      />
      
      <TourScheduleSection tour={tour} />
      <TourBookingSection tour={tour} />
    </div>
  );
}
*/
