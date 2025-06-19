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
  
  // slug로 홍보 페이지 조회
  const { data: promo } = await supabase
    .from('tour_promotion_pages')
    .select(`
      *,
      tour:singsing_tours(*)
    `)
    .eq('slug', slug)
    .single();
  
  // 홍보 페이지가 없으면 tour_id로 직접 조회
  let tour = promo?.tour;
  if (!tour && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
    const { data } = await supabase
      .from('singsing_tours')
      .select('*')
      .eq('id', slug)
      .single();
    tour = data;
  }

  if (!tour) {
    return {
      title: '투어를 찾을 수 없습니다',
    };
  }

  return {
    title: `${tour.title} - 싱싱골프투어`,
    description: `싱싱골프투어와 함께하는 ${tour.title}`,
    openGraph: {
      title: `${tour.title} - 싱싱골프투어`,
      description: `싱싱골프투어와 함께하는 ${tour.title}`,
      images: promo?.main_image_url ? [promo.main_image_url] : [],
    },
  };
}

export default async function TourPromotionPage({ params }: Props) {
  const { slug } = await params;
  
  // slug로 홍보 페이지 조회
  const { data: promo } = await supabase
    .from('tour_promotion_pages')
    .select(`
      *,
      tour:singsing_tours(*)
    `)
    .eq('slug', slug)
    .eq('is_public', true)
    .single();
  
  // 홍보 페이지가 없고 UUID 형식이면 tour_id로 직접 조회
  let tourData = promo;
  if (!promo && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
    const { data: tour } = await supabase
      .from('singsing_tours')
      .select('*')
      .eq('id', slug)
      .single();
    
    if (tour) {
      // 가상의 promo 객체 생성
      tourData = {
        id: slug,
        tour_id: slug,
        slug: slug,
        is_public: true,
        valid_until: null,
        main_image_url: null,
        tour: tour
      };
    }
  }

  if (!tourData || !tourData.tour) {
    notFound();
  }

  // 유효기간 체크
  if (tourData.valid_until && new Date(tourData.valid_until) < new Date()) {
    notFound();
  }

  // 관광지 옵션 가져오기 (에러 무시)
  const { data: attractionOptions } = await supabase
    .from('tour_attraction_options')
    .select(`
      *,
      attraction:tourist_attractions(*)
    `)
    .eq('tour_id', tourData.tour.id)
    .order('order_no');

  // 문서 링크 가져오기 (에러 무시)
  const { data: documentLinks } = await supabase
    .from('public_document_links')
    .select('*')
    .eq('tour_id', tourData.tour.id)
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

  return (
    <TourPromotionClient 
      promo={tourData}
      attractionOptions={attractionOptions || []}
      documentLinks={documentLinks || []}
    />
  );
}