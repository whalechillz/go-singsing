// 투어 편집 페이지 개선안
// 여행상품에서 정보 가져오기

useEffect(() => {
  const fetchData = async () => {
    // 1. 투어 정보 가져오기
    const { data: tourData } = await supabase
      .from("singsing_tours")
      .select(`
        *,
        tour_products (
          golf_course,
          hotel,
          golf_phone,  // tour_products에 추가 필요
          hotel_phone  // tour_products에 추가 필요
        )
      `)
      .eq("id", tourId)
      .single();
    
    // 2. 회사 기본 설정 가져오기
    const { data: settings } = await supabase
      .from("company_settings")  // 또는 설정 테이블
      .select("company_phone, company_mobile, default_footer_message")
      .single();
    
    // 3. 데이터 병합
    setForm({
      ...tourData,
      // 우선순위: 투어 > 상품 > 설정
      company_phone: tourData.company_phone || settings?.company_phone || "031-215-3990",
      company_mobile: tourData.company_mobile || settings?.company_mobile || "010-3332-9020",
      golf_reservation_phone: tourData.golf_reservation_phone || tourData.tour_products?.golf_phone || "",
      footer_message: tourData.footer_message || settings?.default_footer_message || "♡ 즐거운 하루 되시길 바랍니다. ♡"
    });
  };
}, []);