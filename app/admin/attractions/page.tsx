'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit2, Trash2, Image, Clock, MapPin, Tag } from 'lucide-react';

interface TouristAttraction {
  id: string;
  name: string;
  category: 'tourist_spot' | 'rest_area' | 'restaurant' | 'shopping' | 'activity';
  address?: string;
  description?: string;
  features?: string[];
  image_urls?: string[];
  main_image_url?: string;
  recommended_duration: number;
  tags?: string[];
  region?: string;
  is_active: boolean;
}

const CATEGORIES = {
  tourist_spot: { label: '관광명소', icon: '🏛️', color: 'bg-green-100 text-green-800' },
  rest_area: { label: '휴게소', icon: '☕', color: 'bg-orange-100 text-orange-800' },
  restaurant: { label: '맛집', icon: '🍴', color: 'bg-red-100 text-red-800' },
  shopping: { label: '쇼핑', icon: '🛒', color: 'bg-purple-100 text-purple-800' },
  activity: { label: '액티비티', icon: '🎯', color: 'bg-blue-100 text-blue-800' }
};

export default function AttractionsPage() {
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<TouristAttraction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    category: 'tourist_spot' as TouristAttraction['category'],
    address: '',
    description: '',
    features: [''],
    main_image_url: '',
    image_urls: [''],
    recommended_duration: 60,
    tags: [''],
    region: '',
    is_active: true
  });

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      const { data, error } = await supabase
        .from('tourist_attractions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttractions(data || []);
    } catch (error) {
      console.error('Error fetching attractions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        features: formData.features.filter(f => f.trim()),
        tags: formData.tags.filter(t => t.trim()),
        image_urls: formData.image_urls.filter(url => url.trim())
      };

      if (editingAttraction) {
        const { error } = await supabase
          .from('tourist_attractions')
          .update(dataToSubmit)
          .eq('id', editingAttraction.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tourist_attractions')
          .insert([dataToSubmit]);

        if (error) throw error;
      }

      resetForm();
      fetchAttractions();
    } catch (error) {
      console.error('Error saving attraction:', error);
    } finally {
      setLoading(false);
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
      fetchAttractions();
    } catch (error) {
      console.error('Error deleting attraction:', error);
    }
  };

  const handleEdit = (attraction: TouristAttraction) => {
    setEditingAttraction(attraction);
    setFormData({
      name: attraction.name,
      category: attraction.category || 'tourist_spot',
      address: attraction.address || '',
      description: attraction.description || '',
      features: attraction.features?.length ? attraction.features : [''],
      main_image_url: attraction.main_image_url || '',
      image_urls: attraction.image_urls?.length ? attraction.image_urls : [''],
      recommended_duration: attraction.recommended_duration,
      tags: attraction.tags?.length ? attraction.tags : [''],
      region: attraction.region || '',
      is_active: attraction.is_active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'tourist_spot',
      address: '',
      description: '',
      features: [''],
      main_image_url: '',
      image_urls: [''],
      recommended_duration: 60,
      tags: [''],
      region: '',
      is_active: true
    });
    setEditingAttraction(null);
    setShowModal(false);
  };

  const addArrayField = (field: 'features' | 'tags' | 'image_urls') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'features' | 'tags' | 'image_urls', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'features' | 'tags' | 'image_urls', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // 필터링된 관광지 목록
  const filteredAttractions = attractions.filter(attraction => {
    const matchesCategory = selectedCategory === 'all' || attraction.category === selectedCategory;
    const matchesSearch = attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attraction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attraction.region?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading && !showModal) {
    return <div className="flex justify-center items-center h-64">로딩 중...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">관광지 관리</h1>
        <p className="text-gray-600">투어에서 사용할 관광지, 휴게소, 맛집 등을 관리합니다.</p>
      </div>

      {/* 상단 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === key 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{value.icon}</span>
                <span>{value.label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              관광지 추가
            </button>
          </div>
        </div>
      </div>

      {/* 관광지 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAttractions.map((attraction) => {
          const category = CATEGORIES[attraction.category || 'tourist_spot'];
          
          return (
            <div key={attraction.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              {/* 이미지 영역 */}
              <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                {attraction.main_image_url ? (
                  <img 
                    src={attraction.main_image_url} 
                    alt={attraction.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Image className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                  {category.icon} {category.label}
                </div>
              </div>

              {/* 정보 영역 */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{attraction.name}</h3>
                
                {attraction.region && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{attraction.region}</span>
                  </div>
                )}

                {attraction.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {attraction.description}
                  </p>
                )}

                <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                  <Clock className="w-4 h-4" />
                  <span>추천 체류시간: {attraction.recommended_duration}분</span>
                </div>

                {attraction.tags && attraction.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {attraction.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t">
                  <span className={`text-sm ${attraction.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {attraction.is_active ? '활성' : '비활성'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(attraction)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(attraction.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingAttraction ? '관광지 수정' : '관광지 추가'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 기본 정보 */}
                  <div>
                    <label className="block text-sm font-medium mb-1">이름 *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">카테고리 *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as TouristAttraction['category'] })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(CATEGORIES).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.icon} {value.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">지역</label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      placeholder="예: 전남 순천"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">추천 체류시간 (분)</label>
                    <input
                      type="number"
                      value={formData.recommended_duration}
                      onChange={(e) => setFormData({ ...formData, recommended_duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">주소</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">설명</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 특징 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">특징</label>
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateArrayField('features', index, e.target.value)}
                          placeholder="예: 템플스테이 체험 가능"
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayField('features', index)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayField('features')}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + 특징 추가
                    </button>
                  </div>

                  {/* 대표 이미지 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">대표 이미지 URL</label>
                    <input
                      type="url"
                      value={formData.main_image_url}
                      onChange={(e) => setFormData({ ...formData, main_image_url: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 추가 이미지 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">추가 이미지 URL</label>
                    {formData.image_urls.map((url, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => updateArrayField('image_urls', index, e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayField('image_urls', index)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayField('image_urls')}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + 이미지 추가
                    </button>
                  </div>

                  {/* 태그 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">태그</label>
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => updateArrayField('tags', index, e.target.value)}
                          placeholder="예: 포토존"
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayField('tags', index)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayField('tags')}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + 태그 추가
                    </button>
                  </div>

                  {/* 활성 상태 */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">활성 상태</span>
                    </label>
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? '처리중...' : (editingAttraction ? '수정' : '추가')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
