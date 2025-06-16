'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, Users, Clock, Camera, Plane, Hotel, Utensils, Bus, Phone, CreditCard, CheckCircle2, Navigation, Star, Coffee, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface TourSchedulePreviewProps {
  tourId: string;
}

interface TouristAttraction {
  id: string;
  name: string;
  category: string;
  address: string;
  description: string;
  features?: string[];
  image_urls?: string[];
  main_image_url?: string;
  operating_hours?: string;
  contact_info?: string;
  recommended_duration?: number;
  tags?: string[];
  region?: string;
  is_active?: boolean;
  golf_course_info?: any;
  meal_info?: any;
  parking_info?: string;
  entrance_fee?: string;
  booking_required?: boolean;
}

interface TourScheduleSpot {
  tour_id: string;
  day: number;
  sequence: number;
  spot_id: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  category: string;
  tourist_attraction?: TouristAttraction;
}

export default function TourSchedulePreview({ tourId }: TourSchedulePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [tourData, setTourData] = useState<any>(null);
  const [scheduleSpots, setScheduleSpots] = useState<TourScheduleSpot[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    fetchTourData();
  }, [tourId]);

  const fetchTourData = async () => {
    try {
      // 투어 정보 가져오기
      const { data: tour, error: tourError } = await supabase
        .from('singsing_tours')
        .select('*')
        .eq('id', tourId)
        .single();

      if (tourError) throw tourError;
      setTourData(tour);

      // 투어 일정 스팟 정보 가져오기
      const { data: spots, error: spotsError } = await supabase
        .from('tour_schedule_spots')
        .select(`
          *,
          tourist_attraction:tourist_attractions(*)
        `)
        .eq('tour_id', tourId)
        .order('day', { ascending: true })
        .order('sequence', { ascending: true });

      if (spotsError) throw spotsError;
      
      if (spots && spots.length > 0) {
        setScheduleSpots(spots);
        // 총 일수 계산
        const maxDay = Math.max(...spots.map(s => s.day));
        setTotalDays(maxDay);
      } else {
        // 스팟이 없으면 투어 기간으로 일수 계산
        if (tour.start_date && tour.end_date) {
          const start = new Date(tour.start_date);
          const end = new Date(tour.end_date);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          setTotalDays(days);
        }
      }
    } catch (error) {
      console.error('Error fetching tour data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!tourData) {
    return (
      <div className="text-center p-8 text-gray-500">
        투어 정보를 불러올 수 없습니다.
      </div>
    );
  }

  // 카테고리별 아이콘 맵핑
  const categoryIcons: Record<string, any> = {
    '골프장': Camera,
    '골프': Camera,
    '식사': Utensils,
    '조식': Coffee,
    '중식': Utensils,
    '석식': Utensils,
    '숙박': Hotel,
    '호텔': Hotel,
    '관광': MapPin,
    '관광지': MapPin,
    '카트비': Camera,
    '기타': Star
  };

  const getCategoryIcon = (category: string) => {
    for (const key in categoryIcons) {
      if (category?.includes(key)) {
        return categoryIcons[key];
      }
    }
    return Star;
  };

  // 카테고리별 배경색
  const getCategoryBgClass = (category: string) => {
    if (category?.includes('골프')) return 'bg-green-50 text-green-800';
    if (category?.includes('식사') || category?.includes('조식') || category?.includes('중식') || category?.includes('석식')) return 'bg-orange-50 text-orange-800';
    if (category?.includes('숙박') || category?.includes('호텔')) return 'bg-indigo-50 text-indigo-800';
    if (category?.includes('관광')) return 'bg-blue-50 text-blue-800';
    return 'bg-purple-50 text-purple-800';
  };

  // 해당 일자의 스팟 가져오기
  const getDaySpots = (day: number) => {
    return scheduleSpots.filter(spot => spot.day === day);
  };

  // 버스 출발 정보
  const busInfo = {
    departure: [
      { location: '수원역 4번 출구', time: '06:00' },
      { location: '영통 홈플러스', time: '06:20' },
      { location: '동탄 메타폴리스', time: '06:40' }
    ],
    busType: '45인승 리무진 버스',
    driver: '김기사님 (010-1234-5678)'
  };

  // 날짜 계산
  const startDate = new Date(tourData.start_date);
  const endDate = new Date(tourData.end_date);
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const days = nights + 1;

  return (
    <div className="max-w-5xl mx-auto">
      {/* 견적서 스타일 헤더 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-t-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">[{tourData.golf_course}] {tourData.title}</h1>
            <p className="text-xl opacity-90">{nights}박 {days}일의 특별한 여행</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">견적 유효기간</p>
            <p className="text-lg font-semibold">2025년 {new Date(tourData.end_date).getMonth() + 1}월까지</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6 mt-6 bg-white/10 rounded-xl p-4">
          <div className="text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm opacity-80">여행 일정</p>
            <p className="font-semibold">{new Date(tourData.start_date).toLocaleDateString('ko-KR')} ~ {new Date(tourData.end_date).toLocaleDateString('ko-KR')}</p>
          </div>
          <div className="text-center">
            <MapPin className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm opacity-80">여행지</p>
            <p className="font-semibold">{tourData.golf_course}</p>
          </div>
          <div className="text-center">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm opacity-80">인원</p>
            <p className="font-semibold">최대 {tourData.max_participants}명</p>
          </div>
        </div>
      </div>

      {/* 버스 출발 정보 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 -mt-4 rounded-xl mx-4 relative z-10 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Bus className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-bold">리무진 버스 출발 안내</h3>
            <p className="text-sm opacity-90">{busInfo.busType} · {busInfo.driver}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {busInfo.departure.map((stop, idx) => (
            <div key={idx} className="bg-white/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="w-4 h-4" />
                <span className="font-semibold">{stop.time}</span>
              </div>
              <p className="text-sm">{stop.location}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 여행 일정 */}
      <div className="bg-white shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            여행 일정
          </h2>
        </div>

        {/* 일자별 탭 */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-all ${
                  selectedDay === day
                    ? 'bg-purple-600 text-white border-b-2 border-purple-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>
        </div>

        {/* 선택된 일자의 스팟 표시 */}
        <div className="p-6">
          {getDaySpots(selectedDay).length > 0 ? (
            <div className="space-y-4">
              {getDaySpots(selectedDay).map((spot, index) => {
                const attraction = spot.tourist_attraction;
                if (!attraction) return null;
                
                const Icon = getCategoryIcon(spot.category);
                
                return (
                  <div key={spot.spot_id} className={`rounded-xl p-5 ${getCategoryBgClass(spot.category)}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold">{attraction.name}</h4>
                          {spot.start_time && (
                            <span className="text-sm font-medium">{spot.start_time}</span>
                          )}
                        </div>
                        {attraction.description && (
                          <p className="text-sm mb-2">{attraction.description}</p>
                        )}
                        {attraction.address && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{attraction.address}</span>
                          </div>
                        )}
                        {attraction.main_image_url && (
                          <div className="mt-3 relative h-48 rounded-lg overflow-hidden">
                            <Image
                              src={attraction.main_image_url}
                              alt={attraction.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        {attraction.meal_info && (
                          <div className="mt-3 p-3 bg-white/50 rounded-lg">
                            <p className="text-sm">{JSON.stringify(attraction.meal_info)}</p>
                          </div>
                        )}
                        {attraction.features && attraction.features.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {attraction.features.map((feature, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-white/50 rounded-full">
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>선택한 일자에 등록된 일정이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 견적 요약 */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 포함사항 */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                포함사항
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">리무진 버스</p>
                    <p className="text-sm text-gray-600">45인승 최고급 차량</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">그린피 및 카트비</p>
                    <p className="text-sm text-gray-600">18홀 × {days}일</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">호텔 {nights}박</p>
                    <p className="text-sm text-gray-600">2인 1실 기준</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">조식 {nights}회</p>
                    <p className="text-sm text-gray-600">호텔 조식</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">전문 기사가이드</p>
                    <p className="text-sm text-gray-600">경험 많은 전문가</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* 추가 혜택 */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                특별 혜택
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-xs">★</span>
                  </div>
                  <div>
                    <p className="font-medium">지역 맛집 투어</p>
                    <p className="text-sm text-gray-600">엄선된 맛집만</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-xs">★</span>
                  </div>
                  <div>
                    <p className="font-medium">그룹 사진 촬영</p>
                    <p className="text-sm text-gray-600">전문 작가 촬영</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-xs">★</span>
                  </div>
                  <div>
                    <p className="font-medium">물 및 간식 제공</p>
                    <p className="text-sm text-gray-600">버스 내 상시</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* 불포함사항 */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                불포함사항
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-500 text-xs">×</span>
                  </div>
                  <div>
                    <p className="font-medium">캐디피</p>
                    <p className="text-sm text-gray-600">약 15만원</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-500 text-xs">×</span>
                  </div>
                  <div>
                    <p className="font-medium">중식 및 석식</p>
                    <p className="text-sm text-gray-600">개인 부담</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-500 text-xs">×</span>
                  </div>
                  <div>
                    <p className="font-medium">개인 경비</p>
                    <p className="text-sm text-gray-600">기타 개인 비용</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 견적 금액 - 1인 기준 크게, 2인/4인 기준 작게 */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold mb-2">특별 견적</h3>
            <p className="text-lg opacity-90">편안하고 즐거운 여행, 싱싱골프가 함께합니다</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur rounded-2xl p-8">
            {/* 1인 기준 가격 - 크게 표시 */}
            <div className="text-center mb-6">
              <p className="text-lg opacity-90 mb-2">1인 기준</p>
              <p className="text-5xl font-bold mb-2">{tourData.price?.toLocaleString() || '750,000'}원</p>
            </div>
            
            {/* 2인/4인 기준 - 작게 표시 */}
            <div className="grid grid-cols-2 gap-4 text-center pt-4 border-t border-white/30">
              <div>
                <p className="text-sm opacity-80">2인 기준</p>
                <p className="text-xl font-semibold">{((tourData.price || 750000) * 2).toLocaleString()}원</p>
              </div>
              <div>
                <p className="text-sm opacity-80">4인 기준</p>
                <p className="text-xl font-semibold">{((tourData.price || 750000) * 4).toLocaleString()}원</p>
              </div>
            </div>
            
            {/* 예약금 정보 */}
            <div className="mt-6 pt-4 border-t border-white/30 text-center">
              <p className="text-sm opacity-80">예약금</p>
              <p className="text-2xl font-bold">10만원</p>
              <p className="text-xs opacity-70">1인당</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm opacity-90">
              ※ 예약금은 출발 7일 전까지 100% 환불 가능합니다
            </p>
          </div>
        </div>

        {/* 문의하기 */}
        <div className="bg-gradient-to-b from-gray-50 to-white p-8 rounded-b-2xl">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">지금 바로 예약하세요!</h3>
            <p className="text-gray-600">취소율이 낮은 인기 코스입니다. 서두르세요!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <a
              href="tel:031-215-3990"
              className="flex items-center justify-center gap-3 bg-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-purple-300 group"
            >
              <Phone className="w-6 h-6 text-purple-600 group-hover:animate-pulse" />
              <div className="text-left">
                <p className="text-sm text-gray-600">전화 예약</p>
                <p className="text-lg font-bold text-gray-800">031-215-3990</p>
              </div>
            </a>
            
            <a
              href="https://open.kakao.com/o/singsinggolf"
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <CreditCard className="w-6 h-6" />
              <div className="text-left">
                <p className="text-sm opacity-90">온라인 예약</p>
                <p className="text-lg font-bold">카카오톡 상담</p>
              </div>
            </a>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-sm text-yellow-800">
              <span className="font-bold">⏰ 마감 임박!</span> 잔여석이 빠르게 줄어들고 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}