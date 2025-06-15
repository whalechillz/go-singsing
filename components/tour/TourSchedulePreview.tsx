'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, Users, Clock, Camera, Plane, Hotel, Utensils, Bus, Phone, CreditCard, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface TourSchedulePreviewProps {
  tourId: string;
}

interface Journey {
  day: number;
  date: string;
  morning_schedule: string;
  afternoon_schedule: string;
  evening_schedule: string;
  golf_course_morning?: string;
  golf_course_afternoon?: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  accommodation?: string;
}

export default function TourSchedulePreview({ tourId }: TourSchedulePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [tourData, setTourData] = useState<any>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);

  useEffect(() => {
    fetchTourData();
  }, [tourId]);

  const fetchTourData = async () => {
    try {
      // 투어 정보 가져오기
      const { data: tour, error: tourError } = await supabase
        .from('tours')
        .select('*')
        .eq('id', tourId)
        .single();

      if (tourError) throw tourError;
      setTourData(tour);

      // 여정 정보 가져오기
      const { data: journeyData, error: journeyError } = await supabase
        .from('journey_management')
        .select('*')
        .eq('tour_id', tourId)
        .order('day', { ascending: true });

      if (journeyError) throw journeyError;
      setJourneys(journeyData || []);
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

  // 더미 이미지 데이터 (실제로는 데이터베이스에서 가져와야 함)
  const golfImages = [
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1611374243147-44a702c2d44c?w=800&h=600&fit=crop'
  ];

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
            <h1 className="text-3xl font-bold mb-2">[{tourData.location}] {tourData.name}</h1>
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
            <p className="font-semibold">{tourData.location}</p>
          </div>
          <div className="text-center">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm opacity-80">인원</p>
            <p className="font-semibold">최대 {tourData.max_participants}명</p>
          </div>
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

        {journeys.map((journey, index) => {
          const golfCourse = journey.golf_course_morning || journey.golf_course_afternoon || '파인비치 파인/비치/오시아노 코스';
          const hasGolf = journey.morning_schedule?.includes('골프') || journey.afternoon_schedule?.includes('골프');
          
          return (
            <div key={journey.day} className="border-b border-gray-200 last:border-b-0">
              {/* 날짜 헤더 */}
              <div className="bg-gray-50 px-6 py-4 flex items-center gap-4">
                <div className="bg-purple-600 text-white rounded-lg px-4 py-2 font-bold">
                  D{journey.day}
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {new Date(journey.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
                  </p>
                </div>
              </div>

              {/* 일정 내용 - 견적서 스타일 */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 왼쪽: 일정 정보 */}
                  <div className="space-y-4">
                    {/* 골프 일정 */}
                    {hasGolf && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">🏌️ 골프</h4>
                        <p className="text-gray-700">{golfCourse}</p>
                        <p className="text-sm text-gray-600 mt-1">18홀 라운딩</p>
                      </div>
                    )}

                    {/* 관광 일정 */}
                    {(journey.afternoon_schedule && !journey.afternoon_schedule.includes('골프')) && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">🎯 관광</h4>
                        <p className="text-gray-700">{journey.afternoon_schedule}</p>
                      </div>
                    )}

                    {/* 식사 정보 */}
                    <div className="space-y-2">
                      {journey.breakfast && (
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 rounded-full p-2">
                            <Utensils className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">조식:</span>
                            <span className="ml-2 font-medium">{journey.breakfast}</span>
                          </div>
                        </div>
                      )}
                      {journey.lunch && (
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 rounded-full p-2">
                            <Utensils className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">중식:</span>
                            <span className="ml-2 font-medium">{journey.lunch}</span>
                          </div>
                        </div>
                      )}
                      {journey.dinner && (
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 rounded-full p-2">
                            <Utensils className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">석식:</span>
                            <span className="ml-2 font-medium">{journey.dinner}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 숙박 정보 */}
                    {journey.accommodation && (
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 rounded-full p-2">
                          <Hotel className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">숙박:</span>
                          <span className="ml-2 font-medium">{journey.accommodation}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 오른쪽: 이미지 */}
                  <div className="relative h-64 md:h-auto rounded-xl overflow-hidden">
                    <Image
                      src={golfImages[index % golfImages.length]}
                      alt={`${journey.day}일차 골프장`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* 견적 요약 */}
        <div className="bg-purple-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 포함사항 */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                포함사항
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>그린피(18홀×{days}일)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>카트비</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>조식 {nights}회</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>골프텔 {nights}박</span>
                </li>
              </ul>
            </div>

            {/* 불포함사항 */}
            <div>
              <h3 className="font-bold text-lg mb-4">불포함사항</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">×</span>
                  <span>캐디피</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">×</span>
                  <span>중식 및 석식</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">×</span>
                  <span>개인 경비</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 견적 금액 */}
        <div className="bg-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">견적 요약</h3>
              <p className="opacity-90">1인 요금: {tourData.price_per_person?.toLocaleString() || '750,000'}원</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80 mb-1">총 예상 금액 (4명 기준)</p>
              <p className="text-3xl font-bold">{((tourData.price_per_person || 750000) * 4).toLocaleString()}원</p>
            </div>
          </div>
        </div>

        {/* 문의하기 */}
        <div className="bg-gray-100 p-6 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">문의하기</h3>
              <p className="text-gray-600">견적에 대해 궁금하신 점이 있으시면 언제든 연락주세요.</p>
            </div>
            <div className="flex gap-4">
              <a
                href="tel:031-215-3990"
                className="flex items-center gap-2 bg-white px-6 py-3 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <Phone className="w-5 h-5 text-purple-600" />
                <span className="font-medium">031-215-3990</span>
              </a>
              <a
                href={`/quote/de21ec85-05ad-476d-9bfd-3a2c82d32df0`}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">예약 진행하기</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}