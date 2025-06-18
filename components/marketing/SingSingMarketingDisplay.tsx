import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bus, 
  Hotel, 
  UtensilsCrossed, 
  Users,
  MapPin,
  Camera,
  Droplets,
  Wine,
  DollarSign,
  AlertCircle
} from 'lucide-react';

// 싱싱골프 전용 아이콘 매핑
export const SINGSING_ICON_MAP: Record<string, React.ReactNode> = {
  // 포함사항 아이콘
  'transport': <Bus className="w-5 h-5" />,
  'accommodation': <Hotel className="w-5 h-5" />,
  'meal': <UtensilsCrossed className="w-5 h-5" />,
  'green_fee': <span className="text-lg">⛳</span>,
  'caddie': <Users className="w-5 h-5" />,
  
  // 특별혜택 아이콘
  'gift': <span className="text-lg">🎁</span>,
  'exclusive': <span className="text-lg">⭐</span>,
  'wine': <Wine className="w-5 h-5" />,
  'water': <Droplets className="w-5 h-5" />,
  'photo': <Camera className="w-5 h-5" />,
  'restaurant': <MapPin className="w-5 h-5" />,
  
  // 불포함사항 아이콘
  'money': <DollarSign className="w-5 h-5" />,
  'warning': <AlertCircle className="w-5 h-5" />,
};

// 배지 스타일 정의
export const BADGE_STYLES = {
  'red': {
    className: 'bg-red-500 text-white border-0',
    label: '특별제공'
  },
  'blue': {
    className: 'bg-blue-500 text-white border-0',
    label: '옵션'
  },
  'green': {
    className: 'bg-green-500 text-white border-0',
    label: '무료'
  },
  'purple': {
    className: 'bg-purple-500 text-white border-0',
    label: '기본제공'
  },
  'orange': {
    className: 'bg-orange-500 text-white border-0',
    label: '한정특가'
  }
};

// 카테고리별 스타일 정의
interface CategoryStyle {
  icon: string;
  title: string;
  iconBg: string;
  iconColor: string;
  itemIcon: string;
  cardClass?: string;
}

export const CATEGORY_STYLES: Record<'included' | 'benefits' | 'excluded', CategoryStyle> = {
  'included': {
    icon: '✅',
    title: '포함사항',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    itemIcon: 'text-green-600'
  },
  'benefits': {
    icon: '⭐',
    title: '특별 혜택',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    itemIcon: 'text-purple-600',
    cardClass: 'border-purple-200 bg-purple-50/50'
  },
  'excluded': {
    icon: '⚠️',
    title: '불포함사항',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    itemIcon: 'text-yellow-600'
  }
};

// 마케팅 콘텐츠 표시 컴포넌트 (싱싱골프 스타일)
interface MarketingContentItem {
  id: string;
  category: 'included' | 'benefits' | 'excluded';
  icon?: string;
  title: string;
  description?: string;
  display_order: number;
  // 특별혜택 전용
  benefit_type?: string;
  value?: string;
  badge_text?: string;
  badge_color?: string;
}

interface SingSingMarketingDisplayProps {
  items: MarketingContentItem[];
  className?: string;
}

export function SingSingMarketingDisplay({ items, className = '' }: SingSingMarketingDisplayProps) {
  const renderCategory = (
    categoryKey: 'included' | 'benefits' | 'excluded',
    categoryItems: MarketingContentItem[]
  ) => {
    if (categoryItems.length === 0) return null;

    const style = CATEGORY_STYLES[categoryKey];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${style.iconBg} rounded-full flex items-center justify-center`}>
            <span className={style.iconColor}>{style.icon}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{style.title}</h3>
        </div>

        <div className="space-y-3">
          {categoryItems.map((item) => {
            const isSpecialBenefit = categoryKey === 'benefits';
            const ItemWrapper = isSpecialBenefit ? Card : 'div';
            const wrapperProps = isSpecialBenefit ? { className: `p-4 ${style.cardClass || ''}` } : {};

            return (
              <ItemWrapper key={item.id} {...wrapperProps}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${style.itemIcon}`}>
                    {SINGSING_ICON_MAP[item.icon || 'warning'] || <span>•</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.badge_text && (
                        <Badge className={BADGE_STYLES[item.badge_color || 'blue'].className}>
                          {item.badge_text}
                        </Badge>
                      )}
                      <span className="font-medium text-gray-900">{item.title}</span>
                      {item.value && (
                        <span className="text-purple-700 font-semibold">{item.value}</span>
                      )}
                    </div>
                    {item.description && (
                      <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                    )}
                  </div>
                </div>
              </ItemWrapper>
            );
          })}
        </div>
      </div>
    );
  };

  const includedItems = items.filter(item => item.category === 'included').sort((a, b) => a.display_order - b.display_order);
  const benefitItems = items.filter(item => item.category === 'benefits').sort((a, b) => a.display_order - b.display_order);
  const excludedItems = items.filter(item => item.category === 'excluded').sort((a, b) => a.display_order - b.display_order);

  return (
    <div className={`space-y-8 ${className}`}>
      {renderCategory('included', includedItems)}
      {renderCategory('benefits', benefitItems)}
      {renderCategory('excluded', excludedItems)}
    </div>
  );
}

// 마케팅 페이지에서 사용 예시
export function TourMarketingSection({ tourId, tourProductId }: { tourId?: string; tourProductId?: string }) {
  const [items, setItems] = React.useState<MarketingContentItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadMarketingContent() {
      try {
        // 개별 투어 콘텐츠 먼저 확인
        if (tourId) {
          const response = await fetch(`/api/marketing/content?tourId=${tourId}`);
          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            setItems(data.items);
            return;
          }
        }

        // 투어 상품 기본 콘텐츠 사용
        if (tourProductId) {
          const response = await fetch(`/api/marketing/content?tourProductId=${tourProductId}`);
          const data = await response.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error('마케팅 콘텐츠 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMarketingContent();
  }, [tourId, tourProductId]);

  if (loading) {
    return <div className="animate-pulse">로딩 중...</div>;
  }

  return <SingSingMarketingDisplay items={items} />;
}
