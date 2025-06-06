import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import TourPromotionClient from './TourPromotionClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// 메타데이터 생성
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: promo } = await supabase
    .from('tour_promotion_pages')
    .select(`
      *,
      tour:singsing_tours(*)
    `)
    .eq('slug', slug)
    .single();

  if (!promo) {
    return {
      title: '투어를 찾을 수 없습니다',
    };
  }

  return {
    title: `${promo.tour.title} - 싱싱골프투어`,
    description: `싱싱골프투어와 함께하는 ${promo.tour.title}`,
    openGraph: {
      title: `${promo.tour.title} - 싱싱골프투어`,
      description: `싱싱골프투어와 함께하는 ${promo.tour.title}`,
      images: promo.main_image_url ? [promo.main_image_url] : [],
    },
  };
}

export default async function TourPromotionPage({ params }: Props) {
  const { slug } = await params;
  // 홍보 페이지 정보 가져오기
  const { data: promo, error } = await supabase
    .from('tour_promotion_pages')
    .select(`
      *,
      tour:singsing_tours(
        *,
        schedules:singsing_schedules(
          *,
          schedule_items:singsing_schedule_items(*)
        )
      )
    `)
    .eq('slug', slug)
    .eq('is_public', true)
    .single();

  if (error || !promo) {
    notFound();
  }

  // 유효기간 체크
  if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
    notFound();
  }

  // 관광지 옵션 가져오기
  const { data: attractionOptions } = await supabase
    .from('tour_attraction_options')
    .select(`
      *,
      attraction:tourist_attractions(*),
      schedule:singsing_schedules(*)
    `)
    .eq('tour_id', promo.tour_id)
    .order('schedule_id, order_no');

  return (
    <TourPromotionClient 
      promo={promo}
      attractionOptions={attractionOptions || []}
    />
  );
}