"use client"

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { uploadImage, deleteImage, validateImageFile } from '@/utils/imageUpload';
import { 
  Plus, Edit, Trash2, MapPin, Clock, Star, Tag, Image as ImageIcon, 
  Phone, Upload, X as XIcon, Search, Coffee, ShoppingBag, Activity,
  Camera, Utensils, ShoppingCart, Home, Award, MoreHorizontal,
  ChevronLeft, ChevronRight
} from 'lucide-react';

// 확장된 카테고리 타입
type Category = 'boarding' | 'tourist_spot' | 'rest_area' | 'restaurant' | 'shopping' | 'activity' | 'mart' | 'golf_round' | 'club_meal' | 'others';

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
  subCategories?: string[];
}> = {
  'boarding': { 
    label: '탑승지', 
    icon: MapPin, 
    color: 'text-teal-800',
    bgColor: 'bg-teal-100',
    subCategories: ['버스탑승지', '픽업장소']
  },
  'tourist_spot': { 
    label: '관광명소', 
    icon: Camera, 
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    subCategories: ['사찰', '자연경관', '박물관', '전시관', '체험관', '테마파크']
  },
  'rest_area': { 
    label: '휴게소', 
    icon: Coffee, 
    color: 'text-gray-800',
    bgColor: 'bg-gray-100' 
  },
  'restaurant': { 
    label: '맛집', 
    icon: Utensils, 
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    subCategories: ['한식', '중식', '일식', '양식', '뷔페', '특별식']
  },
  'shopping': { 
    label: '쇼핑', 
    icon: ShoppingBag, 
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    subCategories: ['면세점', '아울렛', '전통시장', '특산품점']
  },
  'activity': { 
    label: '액티비티', 
    icon: Activity, 
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    subCategories: ['레저', '스포츠', '문화체험', '공연관람']
  },
  'mart': { 
    label: '마트', 
    icon: ShoppingCart, 
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100',
    subCategories: ['대형마트', '편의점', '로컬마트']
  },
  'golf_round': { 
    label: '골프 라운드', 
    icon: Award, 
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100',
    subCategories: ['18홀', '9홀', '퍼블릭', '프라이빗']
  },
  'club_meal': { 
    label: '클럽식', 
    icon: Utensils, 
    color: 'text-rose-800',
    bgColor: 'bg-rose-100',
    subCategories: ['조식', '중식', '석식', '간식']
  },
  'others': { 
    label: '기타', 
    icon: MoreHorizontal, 
    color: 'text-slate-800',
    bgColor: 'bg-slate-100',
    subCategories: ['개별휴식', '자유시간', '호텔휴식', '이동시간']
  }
};

export default function SpotManagementPage() {
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<TouristAttraction | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [galleryModal, setGalleryModal] = useState<{ isOpen: boolean; images: string[]; currentIndex: number }>({
    isOpen: false,
    images: [],
    currentIndex: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  // 모든 이미지를 통합 관리하기 위한 state
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
  }, [selectedCategory, searchTerm]);

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
      let query = supabase
        .from('tourist_attractions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      
      // 검색어가 있으면 필터링
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setAttractions(data || []);
    } catch (error) {
      console.error('Error fetching attractions:', error);
      alert('스팟 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 전체 이미지 갯수 확인
    if (allImages.length >= 10) {
      alert('최대 10장까지만 업로드할 수 있습니다.');
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploadingImage(true);
    try {
      const { url, error } = await uploadImage(file, 'tourist-attractions');
      if (error) {
        alert(`이미지 업로드에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
      } else if (url) {
        setAllImages(prev => [...prev, url]);
        // 첫 번째 이미지면 자동으로 대표 이미지로 설정
        if (allImages.length === 0) {
          setMainImageIndex(0);
        }
      }
    } catch (error: any) {
      alert(`이미지 업로드 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = allImages[index];
    if (imageUrl && imageUrl.includes('supabase')) {
      await deleteImage(imageUrl);
    }
    
    const newImages = allImages.filter((_, i) => i !== index);
    setAllImages(newImages);
    
    // 대표 이미지가 삭제된 경우 인덱스 조정
    if (index === mainImageIndex) {
      setMainImageIndex(0);
    } else if (index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 이미지가 있는데 대표 이미지가 선택되지 않은 경우
    if (allImages.length > 0 && (mainImageIndex < 0 || mainImageIndex >= allImages.length)) {
      alert('대표 이미지를 선택해주세요.');
      return;
    }
    
    try {
      // 이미지 분리: 대표 이미지와 추가 이미지
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

  const handleEdit = (attraction: TouristAttraction) => {
    setEditingAttraction(attraction);
    
    // 모든 이미지를 하나의 배열로 통합
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  // 이미지 순서 변경 함수
  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= allImages.length) return;
    
    const newImages = [...allImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    // 대표 이미지 인덱스 조정
    let newMainIndex = mainImageIndex;
    if (fromIndex === mainImageIndex) {
      newMainIndex = toIndex;
    } else if (fromIndex < mainImageIndex && toIndex >= mainImageIndex) {
      newMainIndex = mainImageIndex - 1;
    } else if (fromIndex > mainImageIndex && toIndex <= mainImageIndex) {
      newMainIndex = mainImageIndex + 1;
    }
    
    setAllImages(newImages);
    setMainImageIndex(newMainIndex);
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
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">스팟 관리</h1>
            <p className="text-sm text-gray-500 mt-1">투어 중 방문할 모든 장소를 통합 관리합니다</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 스팟 추가
          </button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 검색창 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="스팟명, 주소, 설명으로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedCategory('all')}
            >
              전체
            </button>
            {(Object.entries(categoryConfig) as [Category, typeof categoryConfig[Category]][]).map(([key, config]) => (
              <button
                key={key}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  selectedCategory === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory(key)}
              >
                {getCategoryIcon(key)}
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 스팟 목록 */}
      {loading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : attractions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4">
            {searchTerm ? '검색 결과가 없습니다.' : '등록된 스팟이 없습니다.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              첫 스팟 추가하기
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map(attraction => {
            const config = categoryConfig[attraction.category];
            return (
              <div key={attraction.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* 이미지 섹션 */}
                {attraction.main_image_url ? (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={attraction.main_image_url} 
                      alt={attraction.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* 이미지 개수 표시 */}
                    {(() => {
                      const additionalImages = attraction.image_urls?.filter(url => url && url.trim()).length || 0;
                      const totalImages = additionalImages + 1; // 대표 이미지 포함
                      return totalImages > 1 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openGallery(attraction);
                          }}
                          className="absolute bottom-2 left-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-colors"
                        >
                          <ImageIcon className="w-3 h-3" />
                          {totalImages}
                        </button>
                      ) : null;
                    })()}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
                        onClick={() => handleEdit(attraction)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-600 hover:text-red-700 hover:bg-white transition-all"
                        onClick={() => handleDelete(attraction.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-gray-400">
                      {getCategoryIcon(attraction.category, "w-16 h-16")}
                    </div>
                    {/* 추가 이미지만 있는 경우 */}
                    {attraction.image_urls && attraction.image_urls.filter(url => url && url.trim()).length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openGallery(attraction);
                        }}
                        className="absolute bottom-2 left-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-colors"
                      >
                        <ImageIcon className="w-3 h-3" />
                        {attraction.image_urls.filter(url => url && url.trim()).length}
                      </button>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
                        onClick={() => handleEdit(attraction)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-600 hover:text-red-700 hover:bg-white transition-all"
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
                    <h3 className="text-lg font-bold text-gray-900 flex-1 line-clamp-1">{attraction.name}</h3>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${config.bgColor} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  
                  {attraction.sub_category && (
                    <p className="text-sm text-gray-500 mb-2">{attraction.sub_category}</p>
                  )}
                  
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
                    
                    {attraction.contact_info && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span>{attraction.contact_info}</span>
                      </div>
                    )}
                    
                    {attraction.recommended_duration && attraction.recommended_duration > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span>추천 체류시간: {attraction.recommended_duration}분</span>
                      </div>
                    )}
                    
                    {attraction.entrance_fee && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span>입장료: {attraction.entrance_fee}</span>
                      </div>
                    )}
                  </div>
                  
                  {attraction.tags && attraction.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t border-gray-100">
                      {attraction.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs hover:bg-gray-200 transition-colors">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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

              {/* 세부 카테고리 (해당하는 경우만) */}
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

              {/* 추가 정보 */}
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

              {/* 골프장 정보 (골프 라운드인 경우) */}
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

              {/* 식사 정보 (식당/클럽식인 경우) */}
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

              {/* 이미지 관리 */}
              <div>
                <label className="block text-sm font-medium mb-1">이미지 관리</label>
                
                {/* 대표 이미지 미리보기 */}
                {allImages.length > 0 && mainImageIndex >= 0 && mainImageIndex < allImages.length && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">현재 선택된 대표 이미지</p>
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={allImages[mainImageIndex]} 
                        alt="대표 이미지 미리보기"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        대표 이미지 (#{mainImageIndex + 1})
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {allImages.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`이미지 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                        
                        {/* 이미지 번호 */}
                        <div className="absolute top-2 left-2 bg-gray-900/70 text-white text-xs px-2 py-1 rounded-full">
                          {index + 1}
                        </div>
                        
                        {/* 순서 변경 버튼 */}
                        <div className="absolute bottom-2 left-2 flex gap-1">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index - 1)}
                              className="p-1 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                              title="왼쪽으로 이동"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                          {index < allImages.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index + 1)}
                              className="p-1 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                              title="오른쪽으로 이동"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* 대표 이미지 선택 라디오 버튼 */}
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mainImage"
                          checked={mainImageIndex === index}
                          onChange={() => setMainImageIndex(index)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${mainImageIndex === index ? 'font-medium text-blue-600' : 'text-gray-600'}`}>
                          대표 이미지
                        </span>
                      </label>
                    </div>
                  ))}
                  
                  {/* 이미지 업로드 버튼 */}
                  {allImages.length < 10 && (
                    <div className="relative">
                      <div className="h-32">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-gray-700"
                        >
                          {uploadingImage ? (
                            <>
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                              <span className="text-xs">업로드 중...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-6 h-6" />
                              <span className="text-xs">이미지 추가</span>
                            </>
                          )}
                        </label>
                      </div>
                      <div className="mt-2 h-6"></div> {/* 라디오 버튼 자리 확보 */}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    최대 10장까지 업로드 가능합니다. 현재 {allImages.length}장의 이미지가 등록되어 있습니다.
                    {allImages.length > 0 && (
                      <span className={mainImageIndex === -1 ? 'text-red-500 font-medium' : ''}>
                        {' '}대표 이미지를 선택해주세요.
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    • 좌우 화살표 버튼으로 이미지 순서를 변경할 수 있습니다.<br/>
                    • 라디오 버튼을 클릭하여 대표 이미지를 변경할 수 있습니다.
                  </p>
                </div>
              </div>

              {/* 특징 */}
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

              {/* 태그 */}
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

              {/* 예약 필요 여부 */}
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
            {/* 헤더 */}
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
            
            {/* 이미지 */}
            <div className="flex-1 flex items-center justify-center relative">
              <img
                src={galleryModal.images[galleryModal.currentIndex]}
                alt={`이미지 ${galleryModal.currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* 이전/다음 버튼 */}
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
            
            {/* 썸네일 */}
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
  );
}
