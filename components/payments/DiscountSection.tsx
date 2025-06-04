import React from 'react';
import { Tag } from 'lucide-react';

interface DiscountSectionProps {
  form: {
    amount: number;
    discount_amount: number;
    discount_type: string;
    discount_name: string;
  };
  setForm: (form: any) => void;
}

const DiscountSection: React.FC<DiscountSectionProps> = ({ form, setForm }) => {
  return (
    <div className="border-t pt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">할인 정보 (선택사항)</h4>
      
      {/* 할인 유형 선택 */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          할인 유형
        </label>
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={form.discount_type}
          onChange={(e) => {
            const type = e.target.value;
            setForm({ ...form, discount_type: type });
            
            // 할인 유형별 기본 할인명 설정
            if (type === 'coupon') {
              setForm((prev: any) => ({ ...prev, discount_name: '신규가입 쿠폰' }));
            } else if (type === 'event') {
              setForm((prev: any) => ({ ...prev, discount_name: '이벤트 할인' }));
            } else if (type === 'vip') {
              setForm((prev: any) => ({ ...prev, discount_name: 'VIP 할인' }));
            } else if (type === 'special') {
              setForm((prev: any) => ({ ...prev, discount_name: '특별 할인' }));
            }
          }}
        >
          <option value="">할인 없음</option>
          <option value="coupon">쿠폰</option>
          <option value="event">이벤트</option>
          <option value="vip">VIP</option>
          <option value="special">특별할인</option>
          <option value="other">기타</option>
        </select>
      </div>
      
      {/* 할인명 */}
      {form.discount_type && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            할인명
          </label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2"
            value={form.discount_name}
            onChange={(e) => setForm({ ...form, discount_name: e.target.value })}
            placeholder="예: 신규가입 쿠폰, VIP 할인 등"
          />
        </div>
      )}
      
      {/* 할인 금액 */}
      {form.discount_type && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            할인 금액
          </label>
          
          {/* 빠른 할인 버튼 */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            <button
              type="button"
              className="px-3 py-2 rounded-lg border text-sm font-medium transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              onClick={() => setForm({ ...form, discount_amount: 10000 })}
            >
              1만원
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-lg border text-sm font-medium transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              onClick={() => setForm({ ...form, discount_amount: 30000 })}
            >
              3만원
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-lg border text-sm font-medium transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              onClick={() => setForm({ ...form, discount_amount: 50000 })}
            >
              5만원
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-lg border text-sm font-medium transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              onClick={() => setForm({ ...form, discount_amount: 100000 })}
            >
              10만원
            </button>
          </div>
          
          {/* 할인 금액 입력 */}
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            value={form.discount_amount || ''}
            onChange={(e) => {
              const value = Number(e.target.value);
              setForm({ ...form, discount_amount: value });
            }}
            placeholder="할인 금액을 입력하세요"
            min="0"
          />
        </div>
      )}
      
      {/* 최종 금액 표시 */}
      {(form.amount > 0 || form.discount_amount > 0) && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">상품 금액</span>
              <span className="font-medium">{form.amount.toLocaleString()}원</span>
            </div>
            {form.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-red-600">할인 금액</span>
                <span className="font-medium text-red-600">-{form.discount_amount.toLocaleString()}원</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t pt-2">
              <span>최종 결제 금액</span>
              <span className="text-blue-600">
                {Math.max(0, form.amount - (form.discount_amount || 0)).toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountSection;