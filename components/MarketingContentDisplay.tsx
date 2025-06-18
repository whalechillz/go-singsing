import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Hotel, 
  UtensilsCrossed, 
  Bus, 
  Users, 
  Shield, 
  Gift,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface MarketingItem {
  id: string;
  category: 'included' | 'benefits' | 'excluded';
  icon?: string;
  title: string;
  description?: string;
  display_order: number;
  is_highlight?: boolean;
  benefit_type?: string;
  value?: string;
  badge_text?: string;
  badge_color?: string;
}

interface MarketingContentDisplayProps {
  items: MarketingItem[];
  className?: string;
}

// 아이콘 매핑
const ICON_MAP: Record<string, React.ReactNode> = {
  accommodation: <Hotel className="w-5 h-5" />,
  meal: <UtensilsCrossed className="w-5 h-5" />,
  transport: <Bus className="w-5 h-5" />,
  caddie: <Users className="w-5 h-5" />,
  insurance: <Shield className="w-5 h-5" />,
  gift: <Gift className="w-5 h-5" />,
  default: <ChevronRight className="w-5 h-5" />
};

// 배지 색상 매핑
const BADGE_COLOR_MAP: Record<string, string> = {
  red: 'bg-red-500 text-white',
  blue: 'bg-blue-500 text-white',
  purple: 'bg-purple-500 text-white',
  green: 'bg-green-500 text-white',
  orange: 'bg-orange-500 text-white'
};

export default function MarketingContentDisplay({ items, className = '' }: MarketingContentDisplayProps) {
  const includedItems = items.filter(item => item.category === 'included').sort((a, b) => a.display_order - b.display_order);
  const benefitItems = items.filter(item => item.category === 'benefits').sort((a, b) => a.display_order - b.display_order);
  const excludedItems = items.filter(item => item.category === 'excluded').sort((a, b) => a.display_order - b.display_order);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* 포함사항 */}
      {includedItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600">⭕</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">포함사항</h3>
          </div>
          <div className="grid gap-3">
            {includedItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="mt-0.5 text-green-600">
                  {ICON_MAP[item.icon || 'default']}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.title}</div>
                  {item.description && (
                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 특별 혜택 */}
      {benefitItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">특별 혜택</h3>
          </div>
          <div className="grid gap-3">
            {benefitItems.map((item) => (
              <Card key={item.id} className="p-4 border-purple-200 bg-purple-50/50">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-purple-600">
                    {ICON_MAP[item.icon || 'gift']}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.badge_text && (
                        <Badge className={BADGE_COLOR_MAP[item.badge_color || 'red']}>
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
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 불포함사항 */}
      {excludedItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">불포함사항</h3>
          </div>
          <div className="grid gap-3">
            {excludedItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="mt-0.5 text-yellow-600">
                  <ChevronRight className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.title}</div>
                  {item.description && (
                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
