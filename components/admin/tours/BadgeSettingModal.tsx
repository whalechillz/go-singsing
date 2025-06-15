// components/admin/tours/BadgeSettingModal.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { X, Tag, Star, Sunrise, Diamond, PartyPopper, Users, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface BadgeSettingModalProps {
  tour: {
    id: string;
    title: string;
    is_special_price?: boolean;
    special_badge_text?: string;
    badge_priority?: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: any) => void;
}

const BadgeSettingModal: React.FC<BadgeSettingModalProps> = ({ tour, isOpen, onClose, onSave }) => {
  const [isSpecialPrice, setIsSpecialPrice] = useState(tour.is_special_price || false);
  const [badgeText, setBadgeText] = useState(tour.special_badge_text || '');
  const [priority, setPriority] = useState(tour.badge_priority || 0);
  const [saving, setSaving] = useState(false);

  const predefinedBadges = [
    { text: '특가', icon: Star, color: 'purple' },
    { text: '얼리버드', icon: Sunrise, color: 'blue' },
    { text: '신규오픈', icon: PartyPopper, color: 'green' },
    { text: '프리미엄', icon: Diamond, color: 'indigo' },
    { text: '한정특가', icon: Clock, color: 'red' },
    { text: '단체할인', icon: Users, color: 'teal' }
  ];

  useEffect(() => {
    setIsSpecialPrice(tour.is_special_price || false);
    setBadgeText(tour.special_badge_text || '');
    setPriority(tour.badge_priority || 0);
  }, [tour]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        is_special_price: isSpecialPrice,
        special_badge_text: isSpecialPrice ? badgeText : null,
        badge_priority: isSpecialPrice ? priority : 0
      };

      const { error } = await supabase
        .from('singsing_tours')
        .update(updates)
        .eq('id', tour.id);

      if (error) throw error;

      onSave(updates);
      onClose();
    } catch (error: any) {
      alert('뱃지 설정 저장 실패: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            뱃지 설정
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 투어 정보 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">투어명</p>
          <p className="font-semibold">{tour.title}</p>
        </div>

        {/* 뱃지 설정 */}
        <div className="space-y-4">
          {/* 활성화 체크박스 */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isSpecialPrice}
              onChange={(e) => setIsSpecialPrice(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="font-medium">특별 뱃지 사용</span>
          </label>

          {isSpecialPrice && (
            <>
              {/* 빠른 선택 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">빠른 선택</p>
                <div className="grid grid-cols-3 gap-2">
                  {predefinedBadges.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <button
                        key={badge.text}
                        onClick={() => setBadgeText(badge.text)}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          badgeText === badge.text
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {badge.text}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 커스텀 텍스트 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  커스텀 뱃지 텍스트
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="예: 한정특가"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">최대 10자</p>
              </div>

              {/* 우선순위 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  표시 우선순위
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>보통</option>
                  <option value={1}>높음</option>
                  <option value={2}>매우 높음</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">높은 우선순위 뱃지가 먼저 표시됩니다</p>
              </div>

              {/* 미리보기 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">미리보기</p>
                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-sm font-bold rounded-full border-2 border-purple-600">
                    ⭐ {badgeText || '특가'}
                  </span>
                  <span className="text-sm text-gray-600">
                    이렇게 표시됩니다
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 자동 뱃지 안내 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">자동 뱃지 안내</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>마감임박</strong>: 잔여 3석 이하</li>
            <li>• <strong>최저가</strong>: 같은 골프장 30일 이내 최저가</li>
            <li>• <strong>인기</strong>: 참가율 70% 이상</li>
          </ul>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgeSettingModal;