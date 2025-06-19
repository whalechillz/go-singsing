"use client";

import React from 'react';
import { Check, Star, X } from 'lucide-react';

interface MarketingItem {
  id: string;
  marketing_content_id: string;
  category: string;
  icon: string;
  title: string;
  description?: string | null;
  display_order: number;
  is_highlight?: boolean;
}

interface SpecialBenefit {
  id: string;
  marketing_content_id: string;
  benefit_type: string;
  title: string;
  description?: string | null;
  value?: string | null;
  badge_text?: string | null;
  badge_color?: string | null;
  display_order: number;
}

interface SimpleMarketingContentProps {
  includedItems?: MarketingItem[];
  excludedItems?: MarketingItem[];
  specialBenefits?: SpecialBenefit[];
  className?: string;
}

// 아이콘 맵핑 (간단한 이모지)
const ICON_MAP: Record<string, string> = {
  transport: '🚌',
  accommodation: '🏨',
  meal: '🍴',
  green_fee: '⛳',
  caddie: '👥',
  gift: '🎁',
  exclusive: '⭐',
  wine: '🍷',
  water: '💧',
  photo: '📷',
  restaurant: '📍',
  money: '💵',
  warning: '⚠️',
};

export default function SimpleMarketingContent({ 
  includedItems = [], 
  excludedItems = [], 
  specialBenefits = [],
  className = '' 
}: SimpleMarketingContentProps) {
  
  // 데이터가 없으면 표시하지 않음
  if (includedItems.length === 0 && excludedItems.length === 0 && specialBenefits.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gray-50/50 rounded-2xl p-8 ${className}`}>
      <div className="grid md:grid-cols-3 gap-8">
        {/* 포함사항 */}
        {includedItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">포함사항</h4>
            </div>
            <ul className="space-y-2">
              {includedItems
                .sort((a, b) => a.display_order - b.display_order)
                .map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-base">{ICON_MAP[item.icon] || '✓'}</span>
                    <span className={item.is_highlight ? 'font-medium text-gray-900' : ''}>
                      {item.title}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* 특별 혜택 */}
        {specialBenefits.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-gray-900">특별 혜택</h4>
            </div>
            <ul className="space-y-2">
              {specialBenefits
                .sort((a, b) => a.display_order - b.display_order)
                .map((benefit) => (
                  <li key={benefit.id} className="flex items-center gap-2 text-sm">
                    <span className="text-base">⭐</span>
                    <span className="text-gray-700">
                      {benefit.title}
                      {benefit.value && (
                        <span className="text-purple-700 font-medium ml-1">
                          ({benefit.value})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* 불포함사항 */}
        {excludedItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <X className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-gray-900">불포함사항</h4>
            </div>
            <ul className="space-y-2">
              {excludedItems
                .sort((a, b) => a.display_order - b.display_order)
                .map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-base">{ICON_MAP[item.icon] || '✗'}</span>
                    <span>{item.title}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
