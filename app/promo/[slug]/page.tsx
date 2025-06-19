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
  
  // UUID 패턴 확인
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  try {
    let tour;
    
    if (isUUID) {
      // UUID로 직접 투어 조회
      const { data } = await supabase
        .from('singsing_tours')
        .select('*')
        .eq('id', slug)
        .single();
      tour = data;
    } else {
      // slug로 홍보 페이지 조회
      const { data: promo } = await supabase
        .from('tour_promotion_pages')
        .select(`
          *,
          tour:singsing_tours(*)
        `)
        .eq('slug', slug)
        .single();
      
      tour = promo?.tour;
    }

    if (!tour) {
      return {
        title: '투어를 찾을 수 없습니다',
      };
    }

    return {
      title: `${tour.title} - 싱싱골프투어`,
      description: `싱싱골프투어와 함께하는 ${tour.title}`,
    };
  } catch (error) {
    return {
      title: '투어를 찾을 수 없습니다',
    };
  }
}

export default async function TourPromotionPage({ params }: Props) {
  const { slug } = await params;
  
  // UUID 패턴 확인
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  try {
    let promo;
    let tour;
    
    if (isUUID) {
      // UUID로 직접 투어 조회
      const { data: tourData, error: tourError } = await supabase
        .from('singsing_tours')
        .select(`
          *,
          tour_product_id
        `)
        .eq('id', slug)
        .single();

      if (tourError || !tourData) {
        console.error('Tour not found:', tourError);
        notFound();
      }

      tour = tourData;
      
      // 홍보 페이지가 있는지 확인
      const { data: promoData } = await supabase
        .from('tour_promotion_pages')
        .select('*')
        .eq('tour_id', slug)
        .single();
      
      // promo 객체 생성
      promo = promoData || {
        id: slug,
        tour_id: slug,
        slug: slug,
        is_public: true,
        valid_until: null,
        main_image_url: null,
        tour: tour
      };
    } else {
      // slug로 홍보 페이지 조회
      const { data: promoData, error } = await supabase
        .from('tour_promotion_pages')
        .select(`
          *,
          tour:singsing_tours(
            *,
            tour_product_id
          )
        `)
        .eq('slug', slug)
        .eq('is_public', true)
        .single();

      if (error || !promoData) {
        console.error('Promo page not found:', error);
        notFound();
      }

      promo = promoData;
      tour = promoData.tour;
    }

    // 유효기간 체크
    if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
      notFound();
    }

    // 관광지 옵션 가져오기 (실제 테이블 구조에 맞게)
    let attractionOptions = [];
    try {
      const { data } = await supabase
        .from('tour_attraction_options')
        .select(`
          *,
          attraction:tourist_attractions(*)
        `)
        .eq('tour_id', tour.id)
        .order('order_no');
      
      attractionOptions = data || [];
    } catch (error) {
      console.warn('tour_attraction_options 조회 실패:', error);
    }

    // 문서 링크 가져오기
    let documentLinks = [];
    try {
      const { data } = await supabase
        .from('public_document_links')
        .select('*')
        .eq('tour_id', tour.id)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());
      
      documentLinks = data || [];
    } catch (error) {
      console.warn('public_document_links 조회 실패:', error);
    }

    return (
      <TourPromotionClient 
        promo={{...promo, tour}}
        attractionOptions={attractionOptions}
        documentLinks={documentLinks}
      />
    );
  } catch (error) {
    console.error('페이지 로드 중 오류:', error);
    notFound();
  }
}