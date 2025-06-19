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
  
  // UUID 패턴 확인 (ID인지 slug인지 구분)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  // 임시 해결책: UUID인 경우 tour 정보만으로 메타데이터 생성
  if (isUUID) {
    const { data: tour } = await supabase
      .from('singsing_tours')
      .select('*')
      .eq('id', slug)
      .single();

    if (!tour) {
      return {
        title: '투어를 찾을 수 없습니다',
      };
    }

    return {
      title: `${tour.title} - 싱싱골프투어`,
      description: `싱싱골프투어와 함께하는 ${tour.title}`,
    };
  }
  
  // 기존 로직 (slug로 조회)
  let query = supabase
    .from('tour_promotion_pages')
    .select(`
      *,
      tour:singsing_tours(*)
    `);
  
  query = query.eq('slug', slug);
  
  const { data: promo } = await query.single();

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
  
  // UUID 패턴 확인 (ID인지 slug인지 구분)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  // 임시 해결책: UUID인 경우 직접 tour 정보 조회
  if (isUUID) {
    // tour 정보 직접 조회
    const { data: tour, error: tourError } = await supabase
      .from('singsing_tours')
      .select(`
        *,
        tour_product_id,
        schedules:singsing_schedules(
          *,
          schedule_items:singsing_schedule_items(*)
        )
      `)
      .eq('id', slug)
      .single();

    if (tourError || !tour) {
      notFound();
    }

    // 임시 promo 객체 생성
    const promo = {
      id: slug,
      tour_id: slug,
      slug: slug,
      is_public: true,
      valid_until: null,
      main_image_url: null,
      tour: tour
    };

    // 관광지 옵션 가져오기
    const { data: attractionOptions } = await supabase
      .from('tour_attraction_options')
      .select(`
        *,
        attraction:tourist_attractions(*),
        schedule:singsing_schedules(*)
      `)
      .eq('tour_id', slug)
      .order('schedule_id, order_no');

    // 활성화된 문서 링크 가져오기
    const { data: documentLinks } = await supabase
      .from('public_document_links')
      .select('*')
      .eq('tour_id', slug)
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    return (
      <TourPromotionClient 
        promo={promo}
        attractionOptions={attractionOptions || []}
        documentLinks={documentLinks || []}
      />
    );
  }
  
  // 기존 로직 (slug로 조회)
  let query = supabase
    .from('tour_promotion_pages')
    .select(`
      *,
      tour:singsing_tours(
        *,
        tour_product_id,
        schedules:singsing_schedules(
          *,
          schedule_items:singsing_schedule_items(*)
        )
      )
    `)
    .eq('is_public', true)
    .eq('slug', slug);
  
  const { data: promo, error } = await query.single();

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

  // 활성화된 문서 링크 가져오기
  const { data: documentLinks } = await supabase
    .from('public_document_links')
    .select('*')
    .eq('tour_id', promo.tour_id)
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

  return (
    <TourPromotionClient 
      promo={promo}
      attractionOptions={attractionOptions || []}
      documentLinks={documentLinks || []}
    />
  );
}