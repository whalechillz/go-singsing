"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TourScheduleInfo from "./TourScheduleInfo";
import NoticeBox from "./TourSchedulePreview_NoticeBox";
import UsageSection from "./TourSchedulePreview_UsageSection";
import ProductInfoBox from "./TourSchedulePreview_ProductInfoBox";

// 상품 타입(예시)
type Product = {
  id: string;
  name: string;
  description?: string;
  // 기타 필요한 필드
};

type Tour = {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
  driver_name?: string;
  tour_product_id?: string;
  golf_course?: string;
  accommodation?: string;
  // 기타 필요한 필드
};

type Schedule = {
  id: string;
  date: string;
  title: string;
  description?: string;
  meal_breakfast?: boolean;
  meal_lunch?: boolean;
  meal_dinner?: boolean;
};

type Props = { tourId: string };

const dummyNotices = [
  "티오프 시간: 사전 예약 순서에 따라 배정되며, 현장에서 변경이 제한됩니다.",
  "객실 배정: 예약 접수 순서대로 진행되오니 참고 부탁드립니다.",
  "식사 서비스: 불참 시에도 별도 환불이 불가하오니 양해 바랍니다.",
  "리무진 좌석: 가는 날 좌석은 오는 날에도 동일하게 이용해 주세요. 멀미 증상이 있으신 분은 사전 요청 시 앞좌석 배정 가능."
];

const dummyUsage = [
  { title: "라운드 규정", items: ["티오프 15분 전까지 카트 대기선 도착 필수", "3인 플레이 시 4인 요금 적용", "추가 라운드는 프론트 데스크에 문의", "티오프 시간은 선착순 배정, 현장 변경 불가", "기상 악화 시 골프장 취소 규정 적용", "개인 사유로 라운드 취소 시 환불 불가", "그늘집 이용은 별도 결제 후 진행"] },
  { title: "숙소 이용", items: ["객실 선착순 배정", "기본 제공: 샴푸, 린스, 비누, 바디워시, 로션, 스킨, 드라이기, 커피포트", "준비 필요: 칫솔, 치약, 면도기, 휴대폰 충전기", "매일 1인당 생수 500ml 2병 제공 (추가 요청 시 비용 발생)", "귀중품은 프론트 보관 권장 (분실 시 책임 불가)"] },
  { title: "식사 안내", items: ["클럽하우스 운영 시간 내 이용", "외부 음식 및 주류 반입 금지", "미이용 시 환불 불가", "패키지 외 추가 식사는 당일 결제 필수", "현지 사정에 따라 메뉴가 일부 변경될 수 있습니다"] },
  { title: "락카 이용", items: ["2일 차부터 제공, 프론트 데스크에서 개별 배정", "매일 새로운 번호로 배정, 사용 시마다 수령 필요", "장시간(2박 3일) 보관 불가, 분실 시 책임지지 않음"] },
  { title: "버스 이용", items: ["기재된 시간은 버스 출발 시간이며, 정시 출발 원칙 (20분 전 도착)", "일정에 따라 탑승 시간이 변동될 수 있음", "28인승 리무진 버스 운영, 가는 날 배정된 좌석은 오는 날에도 동일하게 이용해 주세요", "멀미가 심하신 고객님은 출발 전 기사님께 말씀해 주시면 앞좌석으로 안내해 드립니다", "평균 연령대 60대 이상 고객님을 고려하여 약 2시간 간격으로 화장실 정차 서비스 제공"] },
  { title: "관광지 투어", items: ["2일 차 관광 불참 시 환불 없음", "현장 상황에 따라 일정 및 방문지 변동 가능"] }
];

const TourSchedulePreview: React.FC<Props> = ({ tourId }) => {
  const [tour, setTour] = useState<Tour | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      // 투어 정보
      const { data: tourData, error: tourErr } = await supabase.from("singsing_tours").select("*", { count: "exact" }).eq("id", tourId).single();
      if (tourErr || !tourData) {
        setError("투어 정보를 불러올 수 없습니다.");
        setLoading(false);
        return;
      }
      setTour(tourData);
      // 상품 정보
      if (tourData.tour_product_id) {
        const { data: productData, error: productErr } = await supabase.from("tour_products").select("*").eq("id", tourData.tour_product_id).single();
        if (productErr) setError("상품 정보를 불러올 수 없습니다.");
        setProduct(productData || null);
      }
      // 일정 정보
      const { data: scheduleData, error: scheduleErr } = await supabase.from("singsing_schedules").select("*").eq("tour_id", tourId).order("date", { ascending: true });
      if (scheduleErr) setError("일정 정보를 불러올 수 없습니다.");
      setSchedules(scheduleData || []);
      setLoading(false);
    };
    if (tourId) fetchAll();
  }, [tourId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="text-center py-8 text-gray-500">불러오는 중...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!tour) return <div className="text-center py-8 text-red-500">투어 정보 없음</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow print:bg-white print:shadow-none">
      <h2 className="text-2xl font-bold mb-2">투어 일정표</h2>
      {/* 1. 상품 정보 */}
      <ProductInfoBox tour={tour} />
      {/* 2. 예약 안내 */}
      <NoticeBox notices={dummyNotices} />
      {/* 3. 일정 안내 */}
      <TourScheduleInfo tour={tour} schedules={schedules} />
      {/* 4. 이용 안내 */}
      <UsageSection usage={dummyUsage} />
      <div className="mt-6 flex justify-end print:hidden">
        <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800" onClick={handlePrint} aria-label="프린트">프린트</button>
      </div>
    </div>
  );
};

export default TourSchedulePreview; 