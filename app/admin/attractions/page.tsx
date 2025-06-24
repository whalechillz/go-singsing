"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { uploadTouristAttractionImage, deleteTouristAttractionImage } from '@/utils/imageUpload';
import ImageUploadDropzone from '@/components/admin/ImageUploadDropzone';
import { 
  Plus, Edit, Trash2, MapPin, Clock, Star, Tag, Image as ImageIcon, 
  Phone, Upload, X as XIcon, Search, Coffee, ShoppingBag, Activity,
  Camera, Utensils, ShoppingCart, Home, Award, MoreHorizontal,
  ChevronLeft, ChevronRight, Grid3X3, List, Filter, ChevronDown,
  Copy, Eye, EyeOff, Bookmark, Download, SortAsc, SortDesc
} from 'lucide-react';

// 확장된 카테고리 타입
type Category = 'boarding' | 'tourist_spot' | 'rest_area' | 'restaurant' | 'shopping' | 'activity' | 'mart' | 'golf_round' | 'club_meal' | 'others';
type ViewMode = 'grid' | 'list';
type SortOption = 'created_desc' | 'created_asc' | 'name_asc' | 'name_desc' | 'duration_asc' | 'duration_desc';

interface TouristAttraction {
  id: string;
  name: string;
  category: Category;
  sub_category?: string;
  description?: string;
  address?: string;
  contact_info?: string;
  operating_hours?: string;
  main_image_url?: string;
  image_urls?: string[];
  recommended_duration?: number;
  features?: string[];
  tags?: string[];
  region?: string;
  is_active: boolean;
  parking_info?: string;
  entrance_fee?: string;
  booking_required?: boolean;
  golf_course_info?: any;
  meal_info?: any;
  created_at: string;
  updated_at: string;
}

// 확장된 카테고리 설정
const categoryConfig: Record<Category, { 
  label: string; 
  icon: any; 
  color: string;
  bgColor: string;
  borderColor: string;
  subCategories?: string[];
}> = {
  'boarding': { 
    label: '탑승지', 
    icon: MapPin, 
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    subCategories: ['버스탑승지', '픽업장소']
  },
  'tourist_spot': { 
    label: '관광명소', 
    icon: Camera, 
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    subCategories: ['사찰', '자연경관', '박물관', '전시관', '체험관', '테마파크']
  },
  'rest_area': { 
    label: '휴게소', 
    icon: Coffee, 
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  'restaurant': { 
    label: '맛집', 
    icon: Utensils, 
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    subCategories: ['한식', '중식', '일식', '양식', '뷔페', '특별식']
  },
  'shopping': { 
    label: '쇼핑', 
    icon: ShoppingBag, 
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    subCategories: ['면세점', '아울렛', '전통시장', '특산품점']
  },
  'activity': { 
    label: '액티비티', 
    icon: Activity, 
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    subCategories: ['레저', '스포츠', '문화체험', '공연관람']
  },
  'mart': { 
    label: '마트', 
    icon: ShoppingCart, 
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    subCategories: ['대형마트', '편의점', '로컬마트']
  },
  'golf_round': { 
    label: '골프 라운드', 
    icon: Award, 
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    subCategories: ['18홀', '9홀', '퍼블릭', '프라이빗']
  },
  'club_meal': { 
    label: '클럽식', 
    icon: Utensils, 
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    subCategories: ['조식', '중식', '석식', '간식']
  },
  'others': { 
    label: '기타', 
    icon: MoreHorizontal, 
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    subCategories: ['개별휴식', '자유시간', '호텔휴식', '이동시간']
  }
};

// 정렬 옵션 설정
const sortOptions: { value: SortOption; label: string; icon: any }[] = [
  { value: 'created_desc', label: '최신순', icon: SortDesc },
  { value: 'created_asc', label: '오래된순', icon: SortAsc },
  { value: 'name_asc', label: '이름순 (가-하)', icon: SortAsc },
  { value: 'name_desc', label: '이름순 (하-가)', icon: SortDesc },
  { value: 'duration_asc', label: '체류시간 짧은순', icon: SortAsc },
  { value: 'duration_desc', label: '체류시간 긴순', icon: SortDesc }
];

export default function SpotManagementPage() {
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<TouristAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<TouristAttraction | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('created_desc');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [galleryModal, setGalleryModal] = useState<{ isOpen: boolean; images: string[]; currentIndex: number }>({
    isOpen: false,
    images: [],
    currentIndex: 0
  });
  
  // Form states
  const [allImages, setAllImages] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'boarding' as Category,
    sub_category: '',
    description: '',
    address: '',
    contact_info: '',
    operating_hours: '',
    main_image_url: '',
    recommended_duration: 60,
    image_urls: [''],
    features: [''],
    tags: [''],
    region: '',
    is_active: true,
    parking_info: '',
    entrance_fee: '',
    booking_required: false,
    golf_course_info: {
      holes: '',
      green_fee: '',
      cart_fee: '',
      caddie_fee: ''
    },
    meal_info: {
      meal_type: '',
      menu: '',
      price: ''
    }
  });

  useEffect(() => {
    fetchAttractions();
  }, []);

  // 필터링 및 정렬
  useEffect(() => {
    let filtered = [...attractions];

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(attraction => 
        attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attraction.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attraction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attraction.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 카테고리 필터
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(attraction => 
        selectedCategories.includes(attraction.category)
      );
    }

    // 지역 필터
    if (selectedRegions.length > 0) {
      filtered = filtered.filter(attraction => 
        attraction.region && selectedRegions.includes(attraction.region)
      );
    }

    // 태그 필터
    if (selectedTags.length > 0) {
      filtered = filtered.filter(attraction => 
        attraction.tags?.some(tag => selectedTags.includes(tag))
      );
    }

    // 활성 상태 필터
    if (showActiveOnly) {
      filtered = filtered.filter(attraction => attraction.is_active);
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'duration_asc':
          return (a.recommended_duration || 0) - (b.recommended_duration || 0);
        case 'duration_desc':
          return (b.recommended_duration || 0) - (a.recommended_duration || 0);
        default:
          return 0;
      }
    });

    setFilteredAttractions(filtered);
  }, [attractions, searchTerm, selectedCategories, selectedRegions, selectedTags, showActiveOnly, sortOption]);

  // 사용 가능한 지역 및 태그 추출
  useEffect(() => {
    const regions = new Set<string>();
    const tags = new Set<string>();

    attractions.forEach(attraction => {
      if (attraction.region) regions.add(attraction.region);
      attraction.tags?.forEach(tag => tags.add(tag));
    });

    setAvailableRegions(Array.from(regions).sort());
    setAvailableTags(Array.from(tags).sort());
  }, [attractions]);

  // 갤러리 모달 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (galleryModal.isOpen) {
        if (e.key === 'ArrowLeft' && galleryModal.currentIndex > 0) {
          setGalleryModal(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
        } else if (e.key === 'ArrowRight' && galleryModal.currentIndex < galleryModal.images.length - 1) {
          setGalleryModal(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
        } else if (e.key === 'Escape') {
          setGalleryModal({ isOpen: false, images: [], currentIndex: 0 });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryModal]);

  const fetchAttractions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tourist_attractions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAttractions(data || []);
    } catch (error) {
      console.error('Error fetching attractions:', error);
      alert('스팟 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category: Category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedRegions([]);
    setSelectedTags([]);
    setSearchTerm('');
    setShowActiveOnly(false);
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (files: File[]) => {
    try {
      const uploadPromises = files.map(file => uploadTouristAttractionImage(file));
      const results = await Promise.all(uploadPromises);
      
      const newImageUrls = results.filter(url => url !== null) as string[];
      setAllImages(prev => [...prev, ...newImageUrls]);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw error;
    }
  };

  // 이미지 삭제 핸들러
  const handleImageDelete = async (imageUrl: string, index: number) => {
    try {
      // Storage에서 이미지 삭제
      await deleteTouristAttractionImage(imageUrl);
      
      // 상태에서 이미지 제거
      const newImages = [...allImages];
      newImages.splice(index, 1);
      setAllImages(newImages);
      
      // 대표 이미지 인덱스 조정
      if (mainImageIndex === index) {
        setMainImageIndex(0);
      } else if (mainImageIndex > index) {
        setMainImageIndex(mainImageIndex - 1);
      }
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      alert('이미지 삭제에 실패했습니다.');
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (allImages.length > 0 && (mainImageIndex < 0 || mainImageIndex >= allImages.length)) {
      alert('대표 이미지를 선택해주세요.');
      return;
    }
    
    try {
      const mainImage = allImages[mainImageIndex] || null;
      const additionalImages = allImages.filter((_, index) => index !== mainImageIndex);
      
      const dataToSubmit = {
        name: formData.name,
        category: formData.category,
        sub_category: formData.sub_category || null,
        description: formData.description || null,
        address: formData.address || null,
        contact_info: formData.contact_info || null,
        operating_hours: formData.operating_hours || null,
        main_image_url: mainImage,
        image_urls: additionalImages,
        features: formData.features.filter(feat => feat.trim()),
        tags: formData.tags.filter(tag => tag.trim()),
        region: formData.region || null,
        is_active: formData.is_active,
        recommended_duration: formData.recommended_duration,
        parking_info: formData.parking_info || null,
        entrance_fee: formData.entrance_fee || null,
        booking_required: formData.booking_required,
        golf_course_info: formData.category === 'golf_round' ? formData.golf_course_info : null,
        meal_info: (formData.category === 'club_meal' || formData.category === 'restaurant') ? formData.meal_info : null
      };
      
      if (editingAttraction) {
        const { error } = await supabase
          .from('tourist_attractions')
          .update({
            ...dataToSubmit,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAttraction.id);
        
        if (error) throw error;
        alert('스팟 정보가 수정되었습니다');
      } else {
        const { error } = await supabase
          .from('tourist_attractions')
          .insert([dataToSubmit]);
        
        if (error) throw error;
        alert('새 스팟이 추가되었습니다');
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchAttractions();
    } catch (error) {
      console.error('Error saving attraction:', error);
      alert('저장에 실패했습니다: ' + (error as any).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('tourist_attractions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      alert('스팟이 삭제되었습니다');
      fetchAttractions();
    } catch (error) {
      console.error('Error deleting attraction:', error);
      alert('삭제에 실패했습니다');
    }
  };

  const handleToggleActive = async (attraction: TouristAttraction) => {
    try {
      const { error } = await supabase
        .from('tourist_attractions')
        .update({ 
          is_active: !attraction.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', attraction.id);
      
      if (error) throw error;
      fetchAttractions();
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('상태 변경에 실패했습니다');
    }
  };

  const handleDuplicate = async (attraction: TouristAttraction) => {
    try {
      const { id, created_at, updated_at, ...dataToClone } = attraction;
      const { error } = await supabase
        .from('tourist_attractions')
        .insert([{
          ...dataToClone,
          name: `${dataToClone.name} (복사본)`,
          is_active: false
        }]);
      
      if (error) throw error;
      alert('스팟이 복제되었습니다');
      fetchAttractions();
    } catch (error) {
      console.error('Error duplicating attraction:', error);
      alert('복제에 실패했습니다');
    }
  };

  const handleEdit = (attraction: TouristAttraction) => {
    setEditingAttraction(attraction);
    
    const images: string[] = [];
    let mainIdx = 0;
    
    if (attraction.main_image_url) {
      images.push(attraction.main_image_url);
      mainIdx = 0;
    }
    
    if (attraction.image_urls && attraction.image_urls.length > 0) {
      const additionalImages = attraction.image_urls.filter(url => url && url.trim());
      images.push(...additionalImages);
    }
    
    setAllImages(images);
    setMainImageIndex(mainIdx);
    
    setFormData({
      name: attraction.name,
      category: attraction.category,
      sub_category: attraction.sub_category || '',
      description: attraction.description || '',
      address: attraction.address || '',
      contact_info: attraction.contact_info || '',
      operating_hours: attraction.operating_hours || '',
      main_image_url: attraction.main_image_url || '',
      recommended_duration: attraction.recommended_duration || 60,
      image_urls: attraction.image_urls?.length ? attraction.image_urls : [''],
      features: attraction.features?.length ? attraction.features : [''],
      tags: attraction.tags?.length ? attraction.tags : [''],
      region: attraction.region || '',
      is_active: attraction.is_active,
      parking_info: attraction.parking_info || '',
      entrance_fee: attraction.entrance_fee || '',
      booking_required: attraction.booking_required || false,
      golf_course_info: attraction.golf_course_info || {
        holes: '',
        green_fee: '',
        cart_fee: '',
        caddie_fee: ''
      },
      meal_info: attraction.meal_info || {
        meal_type: '',
        menu: '',
        price: ''
      }
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingAttraction(null);
    setAllImages([]);
    setMainImageIndex(0);
    setFormData({
      name: '',
      category: 'boarding',
      sub_category: '',
      description: '',
      address: '',
      contact_info: '',
      operating_hours: '',
      main_image_url: '',
      recommended_duration: 60,
      image_urls: [''],
      features: [''],
      tags: [''],
      region: '',
      is_active: true,
      parking_info: '',
      entrance_fee: '',
      booking_required: false,
      golf_course_info: {
        holes: '',
        green_fee: '',
        cart_fee: '',
        caddie_fee: ''
      },
      meal_info: {
        meal_type: '',
        menu: '',
        price: ''
      }
    });
  };

  const addArrayField = (field: 'image_urls' | 'features' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'image_urls' | 'features' | 'tags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'image_urls' | 'features' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };



  const getCategoryIcon = (category: Category, className: string = "w-4 h-4") => {
    const Icon = categoryConfig[category]?.icon || MoreHorizontal;
    return <Icon className={className} />;
  };

  const openGallery = (attraction: TouristAttraction) => {
    const allImages: string[] = [];
    if (attraction.main_image_url) {
      allImages.push(attraction.main_image_url);
    }
    if (attraction.image_urls) {
      allImages.push(...attraction.image_urls.filter(url => url && url.trim()));
    }
    
    if (allImages.length > 0) {
      setGalleryModal({
        isOpen: true,
        images: allImages,
        currentIndex: 0
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">스팟 관리</h1>
              <p className="text-sm text-gray-500 mt-1">투어 중 방문할 모든 장소를 통합 관리합니다</p>
            </div>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              새 스팟 추가
            </button>
          </div>
        </div>

        {/* 검색 및 뷰 모드 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 검색창 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="스팟명, 주소, 설명, 태그로 검색..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* 액션 버튼들 */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`px-4 py-3 rounded-lg transition-all flex items-center gap-2 ${
                  showFilterPanel 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                필터
                {(selectedCategories.length + selectedRegions.length + selectedTags.length) > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {selectedCategories.length + selectedRegions.length + selectedTags.length}
                  </span>
                )}
              </button>
              
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 패널 */}
        {showFilterPanel && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 animate-in slide-in-from-top duration-200">
            <div className="space-y-4">
              {/* 카테고리 필터 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">카테고리</h3>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(categoryConfig) as [Category, typeof categoryConfig[Category]][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleCategoryToggle(key)}
                      className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        selectedCategories.includes(key)
                          ? `${config.bgColor} ${config.color} border-2 ${config.borderColor}`
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                      }`}
                    >
                      {getCategoryIcon(key)}
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 지역 필터 */}
              {availableRegions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">지역</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableRegions.map(region => (
                      <button
                        key={region}
                        onClick={() => handleRegionToggle(region)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          selectedRegions.includes(region)
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 태그 필터 */}
              {availableTags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 rounded-full transition-all text-sm ${
                          selectedTags.includes(tag)
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 추가 필터 */}
              <div className="flex items-center justify-between pt-4 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={showActiveOnly}
                    onChange={(e) => setShowActiveOnly(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">활성 스팟만 표시</span>
                </label>
                
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 결과 요약 */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            총 <span className="font-semibold text-gray-900">{filteredAttractions.length}</span>개의 스팟
            {filteredAttractions.length !== attractions.length && (
              <span className="text-gray-500"> (전체 {attractions.length}개 중)</span>
            )}
          </p>
        </div>

        {/* 스팟 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAttractions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategories.length > 0 || selectedRegions.length > 0 || selectedTags.length > 0
                ? '검색 조건에 맞는 스팟이 없습니다.' 
                : '등록된 스팟이 없습니다.'}
            </p>
            <button
              onClick={() => { 
                if (searchTerm || selectedCategories.length > 0 || selectedRegions.length > 0 || selectedTags.length > 0) {
                  clearAllFilters();
                } else {
                  resetForm(); 
                  setIsModalOpen(true); 
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              {searchTerm || selectedCategories.length > 0 || selectedRegions.length > 0 || selectedTags.length > 0
                ? '필터 초기화' 
                : <>
                    <Plus className="w-4 h-4" />
                    첫 스팟 추가하기
                  </>
              }
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttractions.map(attraction => {
              const config = categoryConfig[attraction.category];
              return (
                <div key={attraction.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  {/* 이미지 섹션 */}
                  {attraction.main_image_url ? (
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={attraction.main_image_url} 
                        alt={attraction.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* 오버레이 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* 이미지 개수 표시 */}
                      {(() => {
                        const additionalImages = attraction.image_urls?.filter(url => url && url.trim()).length || 0;
                        const totalImages = additionalImages + 1;
                        return totalImages > 1 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openGallery(attraction);
                            }}
                            className="absolute bottom-3 left-3 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all backdrop-blur-sm"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            {totalImages}
                          </button>
                        ) : null;
                      })()}
                      
                      {/* 상태 표시 */}
                      {!attraction.is_active && (
                        <div className="absolute top-3 left-3 bg-gray-900/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                          비활성
                        </div>
                      )}
                      
                      {/* 액션 버튼 */}
                      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all shadow-md"
                          onClick={() => handleEdit(attraction)}
                          title="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all shadow-md"
                          onClick={() => handleDuplicate(attraction)}
                          title="복제"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all shadow-md"
                          onClick={() => handleToggleActive(attraction)}
                          title={attraction.is_active ? '비활성화' : '활성화'}
                        >
                          {attraction.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-600 hover:text-red-700 hover:bg-white transition-all shadow-md"
                          onClick={() => handleDelete(attraction.id)}
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                      <div className="text-gray-300">
                        {getCategoryIcon(attraction.category, "w-20 h-20")}
                      </div>
                      
                      {attraction.image_urls && attraction.image_urls.filter(url => url && url.trim()).length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openGallery(attraction);
                          }}
                          className="absolute bottom-3 left-3 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          {attraction.image_urls.filter(url => url && url.trim()).length}
                        </button>
                      )}
                      
                      {!attraction.is_active && (
                        <div className="absolute top-3 left-3 bg-gray-900/80 text-white text-xs px-3 py-1.5 rounded-full">
                          비활성
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        <button
                          className="p-2 bg-white/90 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all shadow-md"
                          onClick={() => handleEdit(attraction)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 bg-white/90 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all shadow-md"
                          onClick={() => handleDuplicate(attraction)}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 bg-white/90 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all shadow-md"
                          onClick={() => handleToggleActive(attraction)}
                        >
                          {attraction.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          className="p-2 bg-white/90 rounded-lg text-red-600 hover:text-red-700 hover:bg-white transition-all shadow-md"
                          onClick={() => handleDelete(attraction.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* 컨텐츠 섹션 */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1">{attraction.name}</h3>
                        {attraction.sub_category && (
                          <p className="text-sm text-gray-500">{attraction.sub_category}</p>
                        )}
                      </div>
                      <span className={`ml-3 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                        {config.label}
                      </span>
                    </div>
                    
                    {attraction.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{attraction.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {attraction.address && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                          <span className="line-clamp-1">{attraction.address}</span>
                        </div>
                      )}
                      
                      {attraction.recommended_duration && attraction.recommended_duration > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
                          <span>추천 체류시간: {attraction.recommended_duration}분</span>
                        </div>
                      )}
                    </div>
                    
                    {attraction.tags && attraction.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100">
                        {attraction.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs hover:bg-gray-200 transition-colors">
                            #{tag}
                          </span>
                        ))}
                        {attraction.tags.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{attraction.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">스팟 정보</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">체류시간</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAttractions.map(attraction => {
                  const config = categoryConfig[attraction.category];
                  return (
                    <tr key={attraction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {attraction.main_image_url ? (
                            <img 
                              src={attraction.main_image_url} 
                              alt={attraction.name}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                              {getCategoryIcon(attraction.category, "w-6 h-6 text-gray-400")}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{attraction.name}</div>
                            {attraction.address && (
                              <div className="text-sm text-gray-500 line-clamp-1">{attraction.address}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                          {getCategoryIcon(attraction.category, "w-3.5 h-3.5")}
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {attraction.region || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {attraction.recommended_duration ? `${attraction.recommended_duration}분` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                          attraction.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {attraction.is_active ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all"
                            onClick={() => handleEdit(attraction)}
                            title="수정"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all"
                            onClick={() => handleDuplicate(attraction)}
                            title="복제"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all"
                            onClick={() => handleToggleActive(attraction)}
                            title={attraction.is_active ? '비활성화' : '활성화'}
                          >
                            {attraction.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                            onClick={() => handleDelete(attraction.id)}
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 추가/수정 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingAttraction ? '스팟 수정' : '새 스팟 추가'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">이름 *</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">카테고리 *</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Category }))}
                    >
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {categoryConfig[formData.category].subCategories && (
                  <div>
                    <label className="block text-sm font-medium mb-1">세부 카테고리</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.sub_category}
                      onChange={(e) => setFormData(prev => ({ ...prev, sub_category: e.target.value }))}
                    >
                      <option value="">선택하세요</option>
                      {categoryConfig[formData.category].subCategories?.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">설명</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">주소</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">연락처</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.contact_info}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">운영시간</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.operating_hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, operating_hours: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">지역</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.region}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      placeholder="예: 전남 순천"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">추천 체류시간 (분)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.recommended_duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, recommended_duration: parseInt(e.target.value) || 60 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">주차 정보</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.parking_info}
                      onChange={(e) => setFormData(prev => ({ ...prev, parking_info: e.target.value }))}
                      placeholder="예: 무료 주차장 50대"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">입장료</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.entrance_fee}
                      onChange={(e) => setFormData(prev => ({ ...prev, entrance_fee: e.target.value }))}
                      placeholder="예: 성인 5,000원"
                    />
                  </div>
                </div>

                {formData.category === 'golf_round' && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">골프장 정보</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">홀 수</label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.golf_course_info.holes}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            golf_course_info: { ...prev.golf_course_info, holes: e.target.value }
                          }))}
                          placeholder="18홀"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">그린피</label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.golf_course_info.green_fee}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            golf_course_info: { ...prev.golf_course_info, green_fee: e.target.value }
                          }))}
                          placeholder="200,000원"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(formData.category === 'restaurant' || formData.category === 'club_meal') && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">식사 정보</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">식사 구분</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.meal_info.meal_type}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            meal_info: { ...prev.meal_info, meal_type: e.target.value }
                          }))}
                        >
                          <option value="">선택하세요</option>
                          <option value="조식">조식</option>
                          <option value="중식">중식</option>
                          <option value="석식">석식</option>
                          <option value="간식">간식</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">메뉴</label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.meal_info.menu}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            meal_info: { ...prev.meal_info, menu: e.target.value }
                          }))}
                          placeholder="한정식"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">가격</label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.meal_info.price}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            meal_info: { ...prev.meal_info, price: e.target.value }
                          }))}
                          placeholder="30,000원"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 이미지 업로드 Dropzone 컴포넌트 */}
                <ImageUploadDropzone
                  images={allImages}
                  mainImageIndex={mainImageIndex}
                  onImagesChange={setAllImages}
                  onMainImageChange={setMainImageIndex}
                  onUpload={handleImageUpload}
                  maxImages={10}
                />

                <div>
                  <label className="block text-sm font-medium mb-1">특징</label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={feature}
                        onChange={(e) => updateArrayField('features', index, e.target.value)}
                        placeholder="예: 템플스테이 체험 가능"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        onClick={() => removeArrayField('features', index)}
                        disabled={formData.features.length === 1}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 mt-2 flex items-center gap-2"
                    onClick={() => addArrayField('features')}
                  >
                    <Plus className="w-4 h-4" />
                    특징 추가
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">태그</label>
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={tag}
                        onChange={(e) => updateArrayField('tags', index, e.target.value)}
                        placeholder="예: 사찰, 포토존"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        onClick={() => removeArrayField('tags', index)}
                        disabled={formData.tags.length === 1}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 mt-2 flex items-center gap-2"
                    onClick={() => addArrayField('tags')}
                  >
                    <Plus className="w-4 h-4" />
                    태그 추가
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      checked={formData.booking_required}
                      onChange={(e) => setFormData(prev => ({ ...prev, booking_required: e.target.checked }))}
                    />
                    <span className="text-sm font-medium">사전 예약 필요</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    <span className="text-sm font-medium">활성 상태</span>
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingAttraction ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 이미지 갤러리 모달 */}
        {galleryModal.isOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white text-lg">
                  {galleryModal.currentIndex + 1} / {galleryModal.images.length}
                </span>
                <button
                  onClick={() => setGalleryModal({ isOpen: false, images: [], currentIndex: 0 })}
                  className="text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 flex items-center justify-center relative">
                <img
                  src={galleryModal.images[galleryModal.currentIndex]}
                  alt={`이미지 ${galleryModal.currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
                
                {galleryModal.currentIndex > 0 && (
                  <button
                    onClick={() => setGalleryModal(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                
                {galleryModal.currentIndex < galleryModal.images.length - 1 && (
                  <button
                    onClick={() => setGalleryModal(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {galleryModal.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setGalleryModal(prev => ({ ...prev, currentIndex: index }))}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === galleryModal.currentIndex
                        ? 'border-white opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`썸네일 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
