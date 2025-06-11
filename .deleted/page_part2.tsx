export default function EditQuotePage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tourProducts, setTourProducts] = useState<TourProduct[]>([]);
  const [documentLink, setDocumentLink] = useState<any>(null);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [touristAttractions, setTouristAttractions] = useState<TouristAttraction[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<{dayIndex: number, itemIndex: number, item: ScheduleItem} | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule'>('basic');
  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    // 기본 정보
    title: "",
    tour_product_id: "",
    start_date: "",
    end_date: "",
    price: 0,
    max_participants: 20,
    
    // 고객 정보
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    
    // 견적 정보
    quote_expires_at: "",
    quote_notes: "",
    
    // 견적 상세 데이터
    quote_data: {
      participants: {
        estimated_count: 20,
        group_name: "",
        leader_name: "",
        leader_phone: ""
      },
      includeExclude: {
        includes: [
          "왕복 전용버스",
          "그린피 및 카트비",
          "숙박",
          "조식"
        ],
        excludes: [
          "개인 경비",
          "캐디피",
          "중식 및 석식",
          "여행자 보험"
        ]
      },
      schedules: [] as DaySchedule[],
      additional_options: [] as string[],
      special_requests: ""
    }
  });