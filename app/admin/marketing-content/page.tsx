"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Plus, 
  Trash2, 
  Save, 
  GripVertical,
  Edit2,
  X,
  Check,
  Star,
  DollarSign,
  AlertCircle,
  Gift,
  Sparkles
} from 'lucide-react';

interface MarketingContent {
  id: string;
  tour_product_id: string | null;
  tour_id: string | null;
  content_type: string;
  is_active: boolean;
}

interface MarketingItem {
  id: string;
  marketing_content_id: string;
  category: string;
  icon: string;
  title: string;
  description: string | null;
  display_order: number;
  is_highlight: boolean;
}

interface SpecialBenefit {
  id: string;
  marketing_content_id: string;
  benefit_type: string;
  title: string;
  description: string | null;
  value: string | null;
  badge_text: string | null;
  badge_color: string | null;
  display_order: number;
}

interface Tour {
  id: string;
  title: string;
  tour_product_id: string | null;
}

interface TourProduct {
  id: string;
  name: string;
}

// 아이콘 맵
const ICON_OPTIONS = [
  { key: 'transport', label: '교통', icon: '🚌' },
  { key: 'accommodation', label: '숙박', icon: '🏨' },
  { key: 'meal', label: '식사', icon: '🍴' },
  { key: 'green_fee', label: '그린피', icon: '⛳' },
  { key: 'caddie', label: '캐디', icon: '👥' },
  { key: 'gift', label: '선물', icon: '🎁' },
  { key: 'exclusive', label: '특별', icon: '⭐' },
  { key: 'wine', label: '와인', icon: '🍷' },
  { key: 'water', label: '음료', icon: '💧' },
  { key: 'photo', label: '사진', icon: '📷' },
  { key: 'restaurant', label: '맛집', icon: '📍' },
  { key: 'money', label: '비용', icon: '💵' },
  { key: 'warning', label: '주의', icon: '⚠️' },
];

const BADGE_COLORS = [
  { key: 'red', label: '빨강', className: 'bg-red-500 text-white' },
  { key: 'blue', label: '파랑', className: 'bg-blue-500 text-white' },
  { key: 'green', label: '초록', className: 'bg-green-500 text-white' },
  { key: 'purple', label: '보라', className: 'bg-purple-500 text-white' },
  { key: 'orange', label: '주황', className: 'bg-orange-500 text-white' },
];

export default function MarketingContentPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [tourProducts, setTourProducts] = useState<TourProduct[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>('');
  const [marketingContent, setMarketingContent] = useState<MarketingContent | null>(null);
  const [includedItems, setIncludedItems] = useState<MarketingItem[]>([]);
  const [excludedItems, setExcludedItems] = useState<MarketingItem[]>([]);
  const [specialBenefits, setSpecialBenefits] = useState<SpecialBenefit[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'included' | 'benefits' | 'excluded'>('included');

  // 초기 데이터 로드
  useEffect(() => {
    loadTours();
    loadTourProducts();
  }, []);

  // 투어 선택 시 마케팅 콘텐츠 로드
  useEffect(() => {
    if (selectedTourId) {
      loadMarketingContent();
    }
  }, [selectedTourId]);

  const loadTours = async () => {
    const { data, error } = await supabase
      .from('singsing_tours')
      .select('id, title, tour_product_id')
      .order('start_date', { ascending: false });

    if (!error && data) {
      setTours(data);
    }
  };

  const loadTourProducts = async () => {
    const { data, error } = await supabase
      .from('tour_products')
      .select('id, name')
      .order('name');

    if (!error && data) {
      setTourProducts(data);
    }
  };

  const loadMarketingContent = async () => {
    setLoading(true);
    try {
      // 마케팅 콘텐츠 조회
      const { data: contentData, error: contentError } = await supabase
        .from('marketing_contents')
        .select('*')
        .eq('tour_id', selectedTourId)
        .single();

      if (contentData) {
        setMarketingContent(contentData);
        
        // 포함/불포함 항목 조회
        const { data: itemsData } = await supabase
          .from('marketing_included_items')
          .select('*')
          .eq('marketing_content_id', contentData.id)
          .order('display_order');

        if (itemsData) {
          setIncludedItems(itemsData.filter(item => item.category === '포함사항'));
          setExcludedItems(itemsData.filter(item => item.category === '불포함사항'));
        }

        // 특별혜택 조회
        const { data: benefitsData } = await supabase
          .from('marketing_special_benefits')
          .select('*')
          .eq('marketing_content_id', contentData.id)
          .order('display_order');

        if (benefitsData) {
          setSpecialBenefits(benefitsData);
        }
      } else {
        // 마케팅 콘텐츠가 없으면 투어 상품의 기본값 가져오기
        const tour = tours.find(t => t.id === selectedTourId);
        if (tour?.tour_product_id) {
          const { data: productContentData } = await supabase
            .from('marketing_contents')
            .select('*')
            .eq('tour_product_id', tour.tour_product_id)
            .eq('content_type', 'tour_product')
            .single();

          if (productContentData) {
            // 투어 상품의 마케팅 콘텐츠 복사
            await copyFromTourProduct(productContentData.id);
          }
        }
        
        // 빈 상태로 초기화
        setMarketingContent(null);
        setIncludedItems([]);
        setExcludedItems([]);
        setSpecialBenefits([]);
      }
    } catch (error) {
      console.error('마케팅 콘텐츠 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyFromTourProduct = async (productContentId: string) => {
    // 투어 상품의 항목들을 복사
    const { data: productItems } = await supabase
      .from('marketing_included_items')
      .select('*')
      .eq('marketing_content_id', productContentId)
      .order('display_order');

    if (productItems) {
      setIncludedItems(productItems.filter(item => item.category === '포함사항').map(item => ({
        ...item,
        id: crypto.randomUUID()
      })));
      setExcludedItems(productItems.filter(item => item.category === '불포함사항').map(item => ({
        ...item,
        id: crypto.randomUUID()
      })));
    }

    const { data: productBenefits } = await supabase
      .from('marketing_special_benefits')
      .select('*')
      .eq('marketing_content_id', productContentId)
      .order('display_order');

    if (productBenefits) {
      setSpecialBenefits(productBenefits.map(benefit => ({
        ...benefit,
        id: crypto.randomUUID()
      })));
    }
  };

  const saveMarketingContent = async () => {
    if (!selectedTourId) return;

    setSaving(true);
    try {
      let contentId = marketingContent?.id;

      // 마케팅 콘텐츠가 없으면 생성
      if (!contentId) {
        const { data: newContent, error } = await supabase
          .from('marketing_contents')
          .insert({
            tour_id: selectedTourId,
            content_type: 'tour_specific',
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        contentId = newContent.id;
        setMarketingContent(newContent);
      }

      // 기존 데이터 삭제
      await supabase
        .from('marketing_included_items')
        .delete()
        .eq('marketing_content_id', contentId);

      await supabase
        .from('marketing_special_benefits')
        .delete()
        .eq('marketing_content_id', contentId);

      // 새 데이터 삽입
      const allItems = [
        ...includedItems.map((item, idx) => ({
          marketing_content_id: contentId,
          category: '포함사항',
          icon: item.icon,
          title: item.title,
          description: item.description,
          display_order: idx + 1,
          is_highlight: item.is_highlight
        })),
        ...excludedItems.map((item, idx) => ({
          marketing_content_id: contentId,
          category: '불포함사항',
          icon: item.icon,
          title: item.title,
          description: item.description,
          display_order: idx + 1,
          is_highlight: item.is_highlight
        }))
      ];

      if (allItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('marketing_included_items')
          .insert(allItems);

        if (itemsError) throw itemsError;
      }

      if (specialBenefits.length > 0) {
        const benefitsToInsert = specialBenefits.map((benefit, idx) => ({
          marketing_content_id: contentId,
          benefit_type: benefit.benefit_type,
          title: benefit.title,
          description: benefit.description,
          value: benefit.value,
          badge_text: benefit.badge_text,
          badge_color: benefit.badge_color,
          display_order: idx + 1
        }));

        const { error: benefitsError } = await supabase
          .from('marketing_special_benefits')
          .insert(benefitsToInsert);

        if (benefitsError) throw benefitsError;
      }

      alert('저장되었습니다!');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (category: 'included' | 'excluded') => {
    const newItem: MarketingItem = {
      id: crypto.randomUUID(),
      marketing_content_id: marketingContent?.id || '',
      category: category === 'included' ? '포함사항' : '불포함사항',
      icon: 'gift',
      title: '',
      description: null,
      display_order: 0,
      is_highlight: false
    };

    if (category === 'included') {
      setIncludedItems([...includedItems, newItem]);
    } else {
      setExcludedItems([...excludedItems, newItem]);
    }
  };

  const addBenefit = () => {
    const newBenefit: SpecialBenefit = {
      id: crypto.randomUUID(),
      marketing_content_id: marketingContent?.id || '',
      benefit_type: 'special',
      title: '',
      description: null,
      value: null,
      badge_text: null,
      badge_color: 'blue',
      display_order: 0
    };

    setSpecialBenefits([...specialBenefits, newBenefit]);
  };

  const updateItem = (id: string, updates: Partial<MarketingItem>, category: 'included' | 'excluded') => {
    if (category === 'included') {
      setIncludedItems(includedItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } else {
      setExcludedItems(excludedItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    }
  };

  const updateBenefit = (id: string, updates: Partial<SpecialBenefit>) => {
    setSpecialBenefits(specialBenefits.map(benefit => 
      benefit.id === id ? { ...benefit, ...updates } : benefit
    ));
  };

  const deleteItem = (id: string, category: 'included' | 'excluded') => {
    if (category === 'included') {
      setIncludedItems(includedItems.filter(item => item.id !== id));
    } else {
      setExcludedItems(excludedItems.filter(item => item.id !== id));
    }
  };

  const deleteBenefit = (id: string) => {
    setSpecialBenefits(specialBenefits.filter(benefit => benefit.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down', category: 'included' | 'excluded') => {
    const items = category === 'included' ? [...includedItems] : [...excludedItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= items.length) return;
    
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    
    if (category === 'included') {
      setIncludedItems(items);
    } else {
      setExcludedItems(items);
    }
  };

  const moveBenefit = (index: number, direction: 'up' | 'down') => {
    const items = [...specialBenefits];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= items.length) return;
    
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    setSpecialBenefits(items);
  };

  const renderItemEditor = (item: MarketingItem, category: 'included' | 'excluded', index: number) => {
    const items = category === 'included' ? includedItems : excludedItems;
    
    return (
      <div key={item.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => moveItem(index, 'up', category)}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            ▲
          </button>
          <GripVertical className="w-5 h-5 text-gray-400" />
          <button
            onClick={() => moveItem(index, 'down', category)}
            disabled={index === items.length - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            ▼
          </button>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex gap-3">
            <select
              value={item.icon}
              onChange={(e) => updateItem(item.id, { icon: e.target.value }, category)}
              className="px-3 py-2 border rounded-lg"
            >
              {ICON_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(item.id, { title: e.target.value }, category)}
              placeholder="제목"
              className="flex-1 px-3 py-2 border rounded-lg"
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.is_highlight}
                onChange={(e) => updateItem(item.id, { is_highlight: e.target.checked }, category)}
              />
              <span className="text-sm">강조</span>
            </label>
          </div>

          <textarea
            value={item.description || ''}
            onChange={(e) => updateItem(item.id, { description: e.target.value }, category)}
            placeholder="설명 (선택사항)"
            rows={2}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <button
          onClick={() => deleteItem(item.id, category)}
          className="p-2 text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const renderBenefitEditor = (benefit: SpecialBenefit, index: number) => {
    return (
      <div key={benefit.id} className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => moveBenefit(index, 'up')}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            ▲
          </button>
          <Sparkles className="w-5 h-5 text-purple-600" />
          <button
            onClick={() => moveBenefit(index, 'down')}
            disabled={index === specialBenefits.length - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            ▼
          </button>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={benefit.title}
              onChange={(e) => updateBenefit(benefit.id, { title: e.target.value })}
              placeholder="혜택 제목"
              className="flex-1 px-3 py-2 border rounded-lg"
            />

            <input
              type="text"
              value={benefit.value || ''}
              onChange={(e) => updateBenefit(benefit.id, { value: e.target.value })}
              placeholder="값 (예: 10만원)"
              className="w-32 px-3 py-2 border rounded-lg"
            />
          </div>

          <textarea
            value={benefit.description || ''}
            onChange={(e) => updateBenefit(benefit.id, { description: e.target.value })}
            placeholder="설명 (선택사항)"
            rows={2}
            className="w-full px-3 py-2 border rounded-lg"
          />

          <div className="flex gap-3">
            <input
              type="text"
              value={benefit.badge_text || ''}
              onChange={(e) => updateBenefit(benefit.id, { badge_text: e.target.value })}
              placeholder="배지 텍스트"
              className="w-32 px-3 py-2 border rounded-lg"
            />

            <select
              value={benefit.badge_color || 'blue'}
              onChange={(e) => updateBenefit(benefit.id, { badge_color: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              {BADGE_COLORS.map(color => (
                <option key={color.key} value={color.key}>
                  {color.label}
                </option>
              ))}
            </select>

            {benefit.badge_text && (
              <span className={`px-3 py-1 rounded text-white text-sm ${
                BADGE_COLORS.find(c => c.key === benefit.badge_color)?.className || 'bg-blue-500'
              }`}>
                {benefit.badge_text}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => deleteBenefit(benefit.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">마케팅 콘텐츠 관리</h1>
        <p className="text-gray-600 mt-1">
          투어별 포함사항, 특별혜택, 불포함사항을 관리합니다
        </p>
        
        {/* 탭 네비게이션 */}
        <div className="mt-4 flex gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            투어별 설정
          </button>
          <a
            href="/admin/marketing-content/tour-products"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            투어 상품 기본 설정
          </a>
        </div>
      </div>

      {/* 투어 선택 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          투어 선택
        </label>
        <select
          value={selectedTourId}
          onChange={(e) => setSelectedTourId(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="">투어를 선택하세요</option>
          {tours.map(tour => (
            <option key={tour.id} value={tour.id}>
              {tour.title}
            </option>
          ))}
        </select>
      </div>

      {/* 콘텐츠 편집기 */}
      {selectedTourId && (
        <div className="bg-white rounded-lg shadow-sm">
          {/* 탭 */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('included')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'included'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Check className="w-5 h-5 inline mr-2" />
                포함사항
              </button>
              <button
                onClick={() => setActiveTab('benefits')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'benefits'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Star className="w-5 h-5 inline mr-2" />
                특별혜택
              </button>
              <button
                onClick={() => setActiveTab('excluded')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'excluded'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5 inline mr-2" />
                불포함사항
              </button>
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <>
                {/* 포함사항 */}
                {activeTab === 'included' && (
                  <div className="space-y-4">
                    {includedItems.map((item, index) => renderItemEditor(item, 'included', index))}
                    
                    <button
                      onClick={() => addItem('included')}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-900"
                    >
                      <Plus className="w-5 h-5 inline mr-2" />
                      포함사항 추가
                    </button>
                  </div>
                )}

                {/* 특별혜택 */}
                {activeTab === 'benefits' && (
                  <div className="space-y-4">
                    {specialBenefits.map((benefit, index) => renderBenefitEditor(benefit, index))}
                    
                    <button
                      onClick={addBenefit}
                      className="w-full py-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-400 hover:text-purple-700"
                    >
                      <Plus className="w-5 h-5 inline mr-2" />
                      특별혜택 추가
                    </button>
                  </div>
                )}

                {/* 불포함사항 */}
                {activeTab === 'excluded' && (
                  <div className="space-y-4">
                    {excludedItems.map((item, index) => renderItemEditor(item, 'excluded', index))}
                    
                    <button
                      onClick={() => addItem('excluded')}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-900"
                    >
                      <Plus className="w-5 h-5 inline mr-2" />
                      불포함사항 추가
                    </button>
                  </div>
                )}

                {/* 저장 버튼 */}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={saveMarketingContent}
                    disabled={saving || !selectedTourId}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        저장
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 도움말 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">사용 방법</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>투어를 선택하면 해당 투어의 마케팅 콘텐츠를 편집할 수 있습니다</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>각 항목의 순서는 위/아래 화살표로 변경할 수 있습니다</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>특별혜택에는 배지를 추가하여 강조할 수 있습니다</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>저장 후 홍보 페이지에서 즉시 확인할 수 있습니다</span>
          </li>
        </ul>
      </div>
    </div>
  );
}