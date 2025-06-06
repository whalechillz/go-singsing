"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Globe, 
  Calendar, 
  Link2, 
  Eye, 
  Share2, 
  MessageCircle,
  Save,
  Trash2,
  Plus,
  X,
  MapPin,
  DollarSign
} from 'lucide-react';

interface TourPromotionManagerProps {
  tourId: string;
}

interface TourPromotion {
  id?: string;
  tour_id: string;
  slug: string;
  is_public: boolean;
  valid_until: string | null;
  main_image_url: string | null;
}

interface AttractionOption {
  id?: string;
  tour_id: string;
  schedule_id: string;
  attraction_id: string;
  additional_price: number;
  is_default: boolean;
  order_no: number;
  attraction?: {
    id: string;
    name: string;
    description: string;
    main_image_url: string | null;
    category: string;
  };
}

interface Schedule {
  id: string;
  tour_id: string;
  day_number: number;
  date: string;
}

interface TouristAttraction {
  id: string;
  name: string;
  category: string;
  description: string;
  main_image_url: string | null;
  region: string;
}

const TourPromotionManager: React.FC<TourPromotionManagerProps> = ({ tourId }) => {
  const [tourPromotion, setTourPromotion] = useState<TourPromotion | null>(null);
  const [attractionOptions, setAttractionOptions] = useState<AttractionOption[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showAttractionModal, setShowAttractionModal] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, [tourId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. 홍보 페이지 정보 로드
      const { data: promoData } = await supabase
        .from('tour_promotion_pages')
        .select('*')
        .eq('tour_id', tourId)
        .single();

      if (promoData) {
        setTourPromotion(promoData);
      } else {
        // 기본값 설정
        setTourPromotion({
          tour_id: tourId,
          slug: '',
          is_public: false,
          valid_until: null,
          main_image_url: null
        });
      }

      // 2. 일정 정보 로드
      const { data: scheduleData } = await supabase
        .from('singsing_schedules')
        .select('*')
        .eq('tour_id', tourId)
        .order('day_number');

      setSchedules(scheduleData || []);

      // 3. 관광지 옵션 로드
      const { data: optionsData } = await supabase
        .from('tour_attraction_options')
        .select(`
          *,
          attraction:tourist_attractions(*)
        `)
        .eq('tour_id', tourId)
        .order('schedule_id, order_no');

      setAttractionOptions(optionsData || []);

      // 4. 전체 관광지 목록 로드
      const { data: attractionsData } = await supabase
        .from('tourist_attractions')
        .select('*')
        .eq('is_active', true)
        .order('name');

      setAttractions(attractionsData || []);

    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 홍보 페이지 저장
  const savePromotion = async () => {
    try {
      if (!tourPromotion) return;

      const promotionData = {
        tour_id: tourId,
        slug: tourPromotion.slug,
        is_public: tourPromotion.is_public,
        valid_until: tourPromotion.valid_until,
        main_image_url: tourPromotion.main_image_url,
        updated_at: new Date().toISOString()
      };

      if (tourPromotion.id) {
        // 업데이트
        const { error } = await supabase
          .from('tour_promotion_pages')
          .update(promotionData)
          .eq('id', tourPromotion.id);

        if (error) throw error;
      } else {
        // 신규 생성
        const { data, error } = await supabase
          .from('tour_promotion_pages')
          .insert(promotionData)
          .select()
          .single();

        if (error) throw error;
        setTourPromotion(data);
      }

      alert('홍보 페이지 설정이 저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  // 관광지 옵션 추가
  const addAttractionOption = async (scheduleId: string, attractionId: string) => {
    try {
      const newOption = {
        tour_id: tourId,
        schedule_id: scheduleId,
        attraction_id: attractionId,
        additional_price: 0,
        is_default: false,
        order_no: attractionOptions.filter(opt => opt.schedule_id === scheduleId).length + 1
      };

      const { data, error } = await supabase
        .from('tour_attraction_options')
        .insert(newOption)
        .select(`
          *,
          attraction:tourist_attractions(*)
        `)
        .single();

      if (error) throw error;
      
      setAttractionOptions([...attractionOptions, data]);
      setShowAttractionModal(false);
    } catch (error) {
      console.error('관광지 추가 실패:', error);
      alert('관광지 추가에 실패했습니다.');
    }
  };

  // 관광지 옵션 삭제
  const deleteAttractionOption = async (optionId: string) => {
    try {
      const { error } = await supabase
        .from('tour_attraction_options')
        .delete()
        .eq('id', optionId);

      if (error) throw error;
      
      setAttractionOptions(attractionOptions.filter(opt => opt.id !== optionId));
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  // 관광지 옵션 업데이트
  const updateAttractionOption = async (optionId: string, updates: Partial<AttractionOption>) => {
    try {
      const { error } = await supabase
        .from('tour_attraction_options')
        .update(updates)
        .eq('id', optionId);

      if (error) throw error;
      
      setAttractionOptions(attractionOptions.map(opt => 
        opt.id === optionId ? { ...opt, ...updates } : opt
      ));
    } catch (error) {
      console.error('업데이트 실패:', error);
      alert('업데이트에 실패했습니다.');
    }
  };

  // 홍보 페이지 URL 복사
  const copyPromotionUrl = () => {
    if (!tourPromotion?.slug) {
      alert('먼저 URL 슬러그를 설정해주세요.');
      return;
    }
    const url = `${window.location.origin}/promo/${tourPromotion.slug}`;
    navigator.clipboard.writeText(url);
    alert('홍보 페이지 URL이 복사되었습니다.');
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-8">
      {/* 홍보 페이지 설정 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          홍보 페이지 설정
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL 슬러그
            </label>
            <div className="flex gap-2">
              <span className="text-gray-500 py-2">/promo/</span>
              <input
                type="text"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="jeju-spring-2025"
                value={tourPromotion?.slug || ''}
                onChange={(e) => setTourPromotion({
                  ...tourPromotion!,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              유효기간
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={tourPromotion?.valid_until || ''}
              onChange={(e) => setTourPromotion({
                ...tourPromotion!,
                valid_until: e.target.value
              })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              대표 이미지 URL
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
              value={tourPromotion?.main_image_url || ''}
              onChange={(e) => setTourPromotion({
                ...tourPromotion!,
                main_image_url: e.target.value
              })}
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                checked={tourPromotion?.is_public || false}
                onChange={(e) => setTourPromotion({
                  ...tourPromotion!,
                  is_public: e.target.checked
                })}
              />
              <span className="text-sm font-medium text-gray-700">공개 상태</span>
            </label>

            <button
              onClick={savePromotion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              설정 저장
            </button>
          </div>
        </div>
      </div>

      {/* 일정별 관광지 옵션 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          일정별 관광지 옵션
        </h3>

        <div className="space-y-4">
          {schedules.map((schedule) => {
            const dayOptions = attractionOptions.filter(opt => opt.schedule_id === schedule.id);
            
            return (
              <div key={schedule.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">
                    Day {schedule.day_number} - {new Date(schedule.date).toLocaleDateString('ko-KR')}
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedDay(schedule.id);
                      setShowAttractionModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  >
                    <Plus className="w-4 h-4" />
                    관광지 추가
                  </button>
                </div>

                <div className="space-y-2">
                  {dayOptions.map((option) => (
                    <div key={option.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium">{option.attraction?.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({option.attraction?.category})
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={option.is_default}
                            onChange={(e) => updateAttractionOption(option.id!, {
                              is_default: e.target.checked
                            })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">기본</span>
                        </label>
                        
                        <div className="flex items-center gap-1">
                          <span className="text-sm">추가요금:</span>
                          <input
                            type="number"
                            value={option.additional_price}
                            onChange={(e) => updateAttractionOption(option.id!, {
                              additional_price: parseInt(e.target.value) || 0
                            })}
                            className="w-20 px-2 py-1 border rounded text-sm"
                          />
                          <span className="text-sm">원</span>
                        </div>
                        
                        <button
                          onClick={() => deleteAttractionOption(option.id!)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {dayOptions.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      관광지 옵션이 없습니다.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 미리보기 및 공유 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          미리보기 및 공유
        </h3>

        <div className="flex gap-4">
          <button
            onClick={() => {
              if (!tourPromotion?.slug) {
                alert('먼저 URL 슬러그를 설정해주세요.');
                return;
              }
              window.open(`/promo/${tourPromotion.slug}`, '_blank');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Eye className="w-4 h-4" />
            미리보기
          </button>

          <button
            onClick={copyPromotionUrl}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
          >
            <Link2 className="w-4 h-4" />
            링크 복사
          </button>

          <button
            onClick={() => {
              if (!tourPromotion?.slug) {
                alert('먼저 URL 슬러그를 설정해주세요.');
                return;
              }
              const url = `${window.location.origin}/promo/${tourPromotion.slug}`;
              const text = `싱싱골프투어 상세 안내\n👉 ${url}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100"
          >
            <MessageCircle className="w-4 h-4" />
            카톡 전송
          </button>
        </div>
      </div>

      {/* 관광지 선택 모달 */}
      {showAttractionModal && selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">관광지 선택</h3>
              <button
                onClick={() => setShowAttractionModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {attractions.map((attraction) => (
                <button
                  key={attraction.id}
                  onClick={() => addAttractionOption(selectedDay, attraction.id)}
                  className="w-full text-left p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">{attraction.name}</div>
                  <div className="text-sm text-gray-500">
                    {attraction.category} - {attraction.region}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {attraction.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourPromotionManager;