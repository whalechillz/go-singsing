// 임시 디버깅 코드
// app/admin/tours/[tourId]/edit/page.tsx 상단에 추가

useEffect(() => {
  const checkTable = async () => {
    const { data, error } = await supabase
      .from("singsing_tours")
      .select("company_phone, company_mobile")
      .limit(1);
    
    console.log("Table check:", data, error);
  };
  
  checkTable();
}, []);