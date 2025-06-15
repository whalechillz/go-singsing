import { supabase } from '@/lib/supabaseClient';

// 다음 투어 목록 가져오기
export async function getUpcomingTours(currentTourId?: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const query = supabase
    .from('singsing_tours')
    .select(`
      id,
      title,
      start_date,
      end_date,
      price,
      max_participants,
      current_participants,
      is_closed,
      closed_reason
    `)
    .gte('start_date', today)
    .order('start_date', { ascending: true })
    .limit(5);

  // 현재 투어는 제외
  if (currentTourId) {
    query.neq('id', currentTourId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching upcoming tours:', error);
    return [];
  }

  // 투어 상태 계산
  return data?.map(tour => {
    let status = '예약가능';
    let statusType = 'available';
    
    if (tour.is_closed) {
      status = tour.closed_reason || '마감';
      statusType = 'closed';
    } else if (tour.current_participants >= tour.max_participants) {
      status = '마감';
      statusType = 'closed';
    } else if (tour.current_participants > 0) {
      const remaining = tour.max_participants - tour.current_participants;
      status = `잔여 ${remaining}석`;
      statusType = 'limited';
    }
    
    // 날짜가 오늘이면
    const startDate = new Date(tour.start_date);
    const todayDate = new Date();
    if (startDate.toDateString() === todayDate.toDateString()) {
      status = '진행중';
      statusType = 'active';
    }
    
    return {
      id: tour.id,
      title: tour.title,
      startDate: tour.start_date,
      endDate: tour.end_date,
      price: tour.price,
      status,
      statusType,
      link: `/portal/${tour.id}`
    };
  }) || [];
}

// 투어 문서 링크 가져오기
export async function getTourDocumentLinks(tourId: string) {
  const { data, error } = await supabase
    .from('public_document_links')
    .select('*')
    .eq('tour_id', tourId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching document links:', error);
    return [];
  }

  return data || [];
}
