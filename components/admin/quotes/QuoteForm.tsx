"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { 
  Calendar,
  Users,
  DollarSign,
  Phone,
  Mail,
  User,
  FileText,
  Clock,
  Save,
  X
} from 'lucide-react';

interface QuoteFormProps {
  onSuccess: (id: string) => void;
  onCancel: () => void;
  initialData?: any;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [tourProducts, setTourProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    tour_product_id: '',
    start_date: '',
    end_date: '',
    price: 0,
    max_participants: 40,
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    quote_expires_at: '',
    quote_notes: '',
    status: 'quote'
  });

  useEffect(() => {
    fetchTourProducts();
    
    if (initialData) {
      setForm({
        ...form,
        ...initialData
      });
    } else {
      // 기본 유효기간 설정 (30일)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      setForm({
        ...form,
        quote_expires_at: expiryDate.toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  const fetchTourProducts = async () => {
    const { data } = await supabase
      .from("tour_products")
      .select("*")
      .order("name");
    
    if (data) setTourProducts(data);
  };

  const handleProductChange = (productId: string) => {
    const product = tourProducts.find(p => p.id === productId);
    if (product) {
      setForm({
        ...form,
        tour_product_id: productId,
        title: `${product.name} - ${form.start_date || '날짜 미정'}`
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        quoted_at: new Date().toISOString(),
        quoted_by: 'admin' // TODO: 실제 사용자 정보로 변경
      };

      if (initialData?.id) {
        // 수정 모드
        const { error } = await supabase
          .from("singsing_tours")
          .update(payload)
          .eq("id", initialData.id);
        
        if (error) throw error;
        onSuccess(initialData.id);
      } else {
        // 생성 모드
        const { data, error } = await supabase
          .from("singsing_tours")
          .insert(payload)
          .select()
          .single();
        
        if (error) throw error;
        onSuccess(data.id);
      }
    } catch (error: any) {
      alert('저장 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return `${days - 1}박 ${days}일`;
    }
    return '';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* 고객 정보 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          고객 정보
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              고객명 *
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연락처 *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                className="w-full border rounded-lg pl-10 pr-3 py-2"
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                placeholder="010-0000-0000"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                className="w-full border rounded-lg pl-10 pr-3 py-2"
                value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 투어 정보 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          투어 정보
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                투어 상품 *
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={form.tour_product_id}
                onChange={(e) => handleProductChange(e.target.value)}
                required
              >
                <option value="">선택하세요</option>
                {tourProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.golf_course}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                견적 제목 *
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="2박3일 순천버스핑 - 홍길동님"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                출발일 *
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                도착일 *
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                min={form.start_date}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                일정
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                value={calculateDays()}
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                인원 *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  className="w-full border rounded-lg pl-10 pr-3 py-2"
                  value={form.max_participants}
                  onChange={(e) => setForm({ ...form, max_participants: Number(e.target.value) })}
                  min="1"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1인 금액 *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  className="w-full border rounded-lg pl-10 pr-3 py-2"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                총액
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 font-semibold"
                value={`${(form.price * form.max_participants).toLocaleString()}원`}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* 견적 설정 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          견적 설정
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              견적 유효기간 *
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={form.quote_expires_at}
              onChange={(e) => setForm({ ...form, quote_expires_at: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>
      </div>

      {/* 추가 메모 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          추가 정보
        </h3>
        <textarea
          className="w-full border rounded-lg px-3 py-2"
          rows={4}
          value={form.quote_notes}
          onChange={(e) => setForm({ ...form, quote_notes: e.target.value })}
          placeholder="고객 요청사항이나 특이사항을 입력하세요..."
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 bg-white text-gray-700 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          onClick={onCancel}
          disabled={loading}
        >
          <X className="w-4 h-4" />
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          disabled={loading}
        >
          <Save className="w-4 h-4" />
          {loading ? '저장 중...' : '견적 저장'}
        </button>
      </div>
    </form>
  );
};

export default QuoteForm;