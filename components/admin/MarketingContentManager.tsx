import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface MarketingItem {
  id?: string;
  category: 'included' | 'benefits' | 'excluded';
  icon?: string;
  title: string;
  description?: string;
  display_order: number;
  is_highlight?: boolean;
  // 특별혜택 전용 필드
  benefit_type?: string;
  value?: string;
  badge_text?: string;
  badge_color?: string;
}

interface MarketingContentManagerProps {
  tourProductId?: string;
  tourId?: string;
  contentType: 'tour_product' | 'tour_specific';
}

const CATEGORY_LABELS = {
  included: '포함사항',
  benefits: '특별혜택',
  excluded: '불포함사항'
};

const ICON_OPTIONS = [
  { value: 'accommodation', label: '🏨 숙박' },
  { value: 'meal', label: '🍽️ 식사' },
  { value: 'transport', label: '🚌 교통' },
  { value: 'golf_cart', label: '🏌️ 카트' },
  { value: 'caddie', label: '👤 캐디' },
  { value: 'locker', label: '🔒 락커' },
  { value: 'green_fee', label: '⛳ 그린피' },
  { value: 'insurance', label: '📋 보험' },
  { value: 'gift', label: '🎁 선물' },
  { value: 'discount', label: '💰 할인' }
];

const BENEFIT_TYPES = [
  { value: 'discount', label: '할인' },
  { value: 'gift', label: '사은품' },
  { value: 'upgrade', label: '업그레이드' },
  { value: 'exclusive', label: '독점혜택' }
];

const BADGE_COLORS = [
  { value: 'red', label: '빨강', className: 'bg-red-500' },
  { value: 'blue', label: '파랑', className: 'bg-blue-500' },
  { value: 'purple', label: '보라', className: 'bg-purple-500' },
  { value: 'green', label: '초록', className: 'bg-green-500' },
  { value: 'orange', label: '주황', className: 'bg-orange-500' }
];

export default function MarketingContentManager({ 
  tourProductId, 
  tourId, 
  contentType 
}: MarketingContentManagerProps) {
  const [items, setItems] = useState<MarketingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'included' | 'benefits' | 'excluded'>('included');

  // 데이터 로드
  useEffect(() => {
    loadMarketingContent();
  }, [tourProductId, tourId]);

  const loadMarketingContent = async () => {
    try {
      setLoading(true);
      // API 호출로 데이터 로드
      const response = await fetch(`/api/marketing/content?${contentType === 'tour_product' ? `tourProductId=${tourProductId}` : `tourId=${tourId}`}`);
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('마케팅 콘텐츠 로드 실패:', error);
      toast({
        title: "오류",
        description: "마케팅 콘텐츠를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 새 항목 추가
  const addItem = () => {
    const newItem: MarketingItem = {
      category: activeCategory,
      title: '',
      description: '',
      display_order: items.filter(item => item.category === activeCategory).length,
      is_highlight: false
    };
    
    if (activeCategory === 'benefits') {
      newItem.benefit_type = 'discount';
      newItem.badge_text = '한정특가';
      newItem.badge_color = 'red';
    }
    
    setItems([...items, newItem]);
  };

  // 항목 업데이트
  const updateItem = (index: number, field: keyof MarketingItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  // 항목 삭제
  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // 순서 변경
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const categoryItems = items.filter(item => item.category === activeCategory);
    const itemIndex = categoryItems.findIndex(item => items.indexOf(item) === index);
    
    if (
      (direction === 'up' && itemIndex === 0) ||
      (direction === 'down' && itemIndex === categoryItems.length - 1)
    ) {
      return;
    }

    const newItems = [...items];
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    const currentItem = categoryItems[itemIndex];
    const targetItem = categoryItems[targetIndex];
    
    // display_order 교환
    const tempOrder = currentItem.display_order;
    currentItem.display_order = targetItem.display_order;
    targetItem.display_order = tempOrder;

    setItems(newItems);
  };

  // 저장
  const saveContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketing/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourProductId,
          tourId,
          contentType,
          items
        })
      });

      if (response.ok) {
        toast({
          title: "저장 완료",
          description: "마케팅 콘텐츠가 저장되었습니다."
        });
      } else {
        throw new Error('저장 실패');
      }
    } catch (error) {
      console.error('마케팅 콘텐츠 저장 실패:', error);
      toast({
        title: "오류",
        description: "마케팅 콘텐츠 저장에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 카테고리별 항목 필터링
  const categoryItems = items.filter(item => item.category === activeCategory);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>마케팅 콘텐츠 관리</CardTitle>
          <CardDescription>
            {contentType === 'tour_product' ? '투어 상품' : '개별 투어'}의 마케팅용 콘텐츠를 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 카테고리 탭 */}
          <div className="flex gap-2 mb-6">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Button
                key={key}
                variant={activeCategory === key ? "default" : "outline"}
                onClick={() => setActiveCategory(key as any)}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* 항목 리스트 */}
          <div className="space-y-4">
            {categoryItems.sort((a, b) => a.display_order - b.display_order).map((item, index) => {
              const globalIndex = items.indexOf(item);
              return (
                <Card key={globalIndex} className="p-4">
                  <div className="flex items-start gap-4">
                    {/* 순서 변경 버튼 */}
                    <div className="flex flex-col gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => moveItem(globalIndex, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => moveItem(globalIndex, 'down')}
                        disabled={index === categoryItems.length - 1}
                      >
                        ↓
                      </Button>
                    </div>

                    {/* 콘텐츠 */}
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-12 gap-3">
                        {/* 아이콘 선택 */}
                        <Select
                          className="col-span-2"
                          value={item.icon || ''}
                          onChange={(e) => updateItem(globalIndex, 'icon', e.target.value)}
                        >
                          <option value="">아이콘</option>
                          {ICON_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>

                        {/* 제목 */}
                        <Input
                          className="col-span-10"
                          placeholder="제목을 입력하세요"
                          value={item.title}
                          onChange={(e) => updateItem(globalIndex, 'title', e.target.value)}
                        />
                      </div>

                      {/* 설명 */}
                      <Textarea
                        placeholder="설명을 입력하세요 (선택사항)"
                        value={item.description || ''}
                        onChange={(e) => updateItem(globalIndex, 'description', e.target.value)}
                        rows={2}
                      />

                      {/* 특별혜택 추가 필드 */}
                      {activeCategory === 'benefits' && (
                        <div className="grid grid-cols-12 gap-3">
                          <Select
                            className="col-span-3"
                            value={item.benefit_type || 'discount'}
                            onChange={(e) => updateItem(globalIndex, 'benefit_type', e.target.value)}
                          >
                            {BENEFIT_TYPES.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </Select>

                          <Input
                            className="col-span-3"
                            placeholder="값 (예: 10%, 5만원)"
                            value={item.value || ''}
                            onChange={(e) => updateItem(globalIndex, 'value', e.target.value)}
                          />

                          <Input
                            className="col-span-3"
                            placeholder="배지 텍스트"
                            value={item.badge_text || ''}
                            onChange={(e) => updateItem(globalIndex, 'badge_text', e.target.value)}
                          />

                          <Select
                            className="col-span-3"
                            value={item.badge_color || 'red'}
                            onChange={(e) => updateItem(globalIndex, 'badge_color', e.target.value)}
                          >
                            {BADGE_COLORS.map(color => (
                              <option key={color.value} value={color.value}>
                                {color.label}
                              </option>
                            ))}
                          </Select>
                        </div>
                      )}

                      {/* 미리보기 */}
                      {item.badge_text && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">미리보기:</span>
                          <Badge className={`bg-${item.badge_color || 'red'}-500`}>
                            {item.badge_text}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* 삭제 버튼 */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteItem(globalIndex)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}

            {/* 추가 버튼 */}
            <Button
              onClick={addItem}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {CATEGORY_LABELS[activeCategory]} 추가
            </Button>
          </div>

          {/* 저장 버튼 */}
          <div className="mt-6 flex justify-end">
            <Button onClick={saveContent} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
