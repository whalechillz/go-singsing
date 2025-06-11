  useEffect(() => {
    fetchTourProducts();
    fetchQuoteData();
    fetchAttractions();
    fetchTouristAttractions();
  }, [quoteId]);

  const fetchTourProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("tour_products")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setTourProducts(data || []);
    } catch (error) {
      console.error("Error fetching tour products:", error);
    }
  };

  const fetchAttractions = async () => {
    try {
      const { data, error } = await supabase
        .from("attractions")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setAttractions(data || []);
    } catch (error) {
      console.error("Error fetching attractions:", error);
    }
  };

  const fetchTouristAttractions = async () => {
    try {
      const { data, error } = await supabase
        .from("tourist_attractions")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      setTouristAttractions(data || []);
    } catch (error) {
      console.error("Error fetching tourist attractions:", error);
    }
  };

  const fetchQuoteData = async () => {
    try {
      const { data, error } = await supabase
        .from("singsing_tours")
        .select("*")
        .eq("id", quoteId)
        .single();
      
      if (error) throw error;
      
      // 공개 링크 정보 가져오기
      const { data: linkData } = await supabase
        .from("public_document_links")
        .select("*")
        .eq("tour_id", quoteId)
        .eq("document_type", "quote")
        .single();
      
      if (linkData) {
        setDocumentLink(linkData);
      }
      
      if (data) {
        const quoteData = typeof data.quote_data === 'string' 
          ? JSON.parse(data.quote_data) 
          : data.quote_data;
          
        setFormData({
          title: data.title,
          tour_product_id: data.tour_product_id || "",
          start_date: data.start_date,
          end_date: data.end_date,
          price: data.price,
          max_participants: data.max_participants,
          customer_name: data.customer_name || "",
          customer_phone: data.customer_phone || "",
          customer_email: "",
          quote_expires_at: data.quote_expires_at || "",
          quote_notes: data.quote_notes || "",
          quote_data: quoteData || {
            participants: {
              estimated_count: data.max_participants,
              group_name: "",
              leader_name: "",
              leader_phone: ""
            },
            includeExclude: {
              includes: ["왕복 전용버스", "그린피 및 카트비", "숙박", "조식"],
              excludes: ["개인 경비", "캐디피", "중식 및 석식", "여행자 보험"]
            },
            schedules: [],
            additional_options: [],
            special_requests: ""
          }
        });
        
        // 일정이 있으면 자동으로 일정 탭 확장
        if (quoteData?.schedules?.length > 0) {
          setExpandedDays(quoteData.schedules.map((_: any, index: number) => index));
        }
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
      alert("견적서를 불러오는 중 오류가 발생했습니다.");
      router.push("/admin/quotes");
    } finally {
      setLoading(false);
    }
  };