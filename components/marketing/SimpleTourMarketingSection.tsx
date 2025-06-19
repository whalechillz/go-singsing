"use client";

import React, { useState, useEffect } from 'react';
import SimpleMarketingContent from '@/components/SimpleMarketingContent';
import { supabase } from '@/lib/supabaseClient';

interface SimpleTourMarketingSectionProps {
  tourId: string;
  tourProductId?: string;
  className?: string;
}

export default function SimpleTourMarketingSection({ 
  tourId, 
  tourProductId,
  className = ''
}: SimpleTourMarketingSectionProps) {
  const [loading, setLoading] = useState(true);
  const [includedItems, setIncludedItems] = useState<any[]>([]);
  const [excludedItems, setExcludedItems] = useState<any[]>([]);
  const [specialBenefits, setSpecialBenefits] = useState<any[]>([]);

  useEffect(() => {
    loadMarketingContent();
  }, [tourId, tourProductId]);

  const loadMarketingContent = async () => {
    try {
      setLoading(true);
      
      // 1. 투어별 마케팅 콘텐츠 확인
      let marketingContentId = null;
      
      const { data: tourContent } = await supabase
        .from('marketing_contents')
        .select('id')
        .eq('tour_id', tourId)
        .eq('content_type', 'tour_specific')
        .eq('is_active', true)
        .single();

      if (tourContent) {
        marketingContentId = tourContent.id;
      } else if (tourProductId) {
        // 2. 투어별 콘텐츠가 없으면 투어 상품 기본값 사용
        const { data: productContent } = await supabase
          .from('marketing_contents')
          .select('id')
          .eq('tour_product_id', tourProductId)
          .eq('content_type', 'tour_product')
          .eq('is_active', true)
          .single();

        if (productContent) {
          marketingContentId = productContent.id;
        }
      }

      if (!marketingContentId) {
        setLoading(false);
        return;
      }

      // 3. 포함/불포함 항목 가져오기
      const { data: items } = await supabase
        .from('marketing_included_items')
        .select('*')
        .eq('marketing_content_id', marketingContentId)
        .order('display_order');

      if (items) {
        setIncludedItems(items.filter(item => item.category === '포함사항'));
        setExcludedItems(items.filter(item => item.category === '불포함사항'));
      }

      // 4. 특별혜택 가져오기
      const { data: benefits } = await supabase
        .from('marketing_special_benefits')
        .select('*')
        .eq('marketing_content_id', marketingContentId)
        .order('display_order');

      if (benefits) {
        setSpecialBenefits(benefits);
      }

    } catch (error) {
      console.error('마케팅 콘텐츠 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 animate-pulse">
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // 데이터가 없으면 표시하지 않음
  if (includedItems.length === 0 && excludedItems.length === 0 && specialBenefits.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">투어 안내사항</h3>
          <p className="text-gray-600 mt-2">싱싱골프투어가 준비한 특별한 혜택을 확인하세요</p>
        </div>
        <SimpleMarketingContent
          includedItems={includedItems}
          excludedItems={excludedItems}
          specialBenefits={specialBenefits}
        />
      </div>
    </div>
  );
}
