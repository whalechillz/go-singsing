// 투어 수정 페이지 간소화 - 실제 적용 코드
// 숙소, 포함/불포함사항을 숨기고 여행상품에서 자동으로 가져오도록 수정

// 1. form state 간소화
const [form, setForm] = useState<TourForm>({
  title: "",
  start_date: "",
  end_date: "",
  tour_product_id: "",
  price: "",
  max_participants: "",
  // accommodation: "", // 제거
  // includes: "", // 제거
  // excludes: "", // 제거
  // reservation_notices: [], // 제거
  other_notices: "", // 유지
  
  // 문서 설정은 유지
  show_staff_info: true,
  show_footer_message: true,
  show_company_phones: true,
  show_golf_phones: true,
  footer_message: "♡ 즐거운 하루 되시길 바랍니다. ♡",
  company_phone: "031-215-3990",
  company_mobile: "010-3332-9020",
  golf_reservation_phone: "",
  golf_reservation_mobile: "",
  document_settings: {
    customer_schedule: true,
    customer_boarding: true,
    staff_boarding: true,
    room_assignment: true,
    tee_time: true,
    simplified: true
  }
});

// 2. 여행상품 선택시 미리보기만 표시
const [selectedProduct, setSelectedProduct] = useState<any>(null);

const handleProductChange = (e: ChangeEvent<HTMLSelectElement>) => {
  const selectedId = e.target.value;
  const product = products.find((p) => p.id === selectedId);
  
  setForm({
    ...form,
    tour_product_id: selectedId
  });
  
  setSelectedProduct(product); // 미리보기용
};

// 3. 저장시 tour_product_id만 저장
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  if (!form.tour_product_id) {
    alert("여행상품을 선택해주세요.");
    return;
  }
  
  const updateData = {
    title: form.title,
    tour_product_id: form.tour_product_id,
    start_date: form.start_date,
    end_date: form.end_date,
    price: Number(form.price),
    max_participants: Number(form.max_participants),
    other_notices: form.other_notices,
    // 문서 설정 관련
    show_staff_info: form.show_staff_info,
    show_footer_message: form.show_footer_message,
    show_company_phones: form.show_company_phones,
    show_golf_phones: form.show_golf_phones,
    footer_message: form.footer_message,
    company_phone: form.company_phone,
    company_mobile: form.company_mobile,
    golf_reservation_phone: form.golf_reservation_phone,
    golf_reservation_mobile: form.golf_reservation_mobile,
    document_settings: form.document_settings,
  };
  
  await supabase
    .from("singsing_tours")
    .update(updateData)
    .eq("id", tourId);
};