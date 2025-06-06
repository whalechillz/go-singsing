"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';



import { Plus, Edit, Trash2, MapPin, Clock, Star, Tag, Image as ImageIcon } from 'lucide-react';

type Category = '관광명소' | '휴게소' | '맛집' | '쇼핑' | '액티비티';

interface TouristAttraction {
  id: number;
  name: string;
  category: Category;
  description?: string;
  address?: string;
  phone?: string;
  opening_hours?: string;
  admission_fee?: string;
  recommended_duration?: number;
  images?: string[];
  features?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export default function AttractionsPage() {
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<TouristAttraction | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: '관광명소' as Category,
    description: '',
    address: '',
    phone: '',
    opening_hours: '',
    admission_fee: '',
    recommended_duration: 60,
    images: [''],
    features: [''],
    tags: ['']
  });

  useEffect(() => {
    fetchAttractions();
  }, [selectedCategory]);

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
      
      const { data, error } = await query;
      
      if (error) throw error;
      setAttractions(data || []);
    } catch (error) {
      console.error('Error fetching attractions:', error);
      alert('관광지 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataToSubmit = {
        ...formData,
        images: formData.images.filter(img => img.trim()),
        features: formData.features.filter(feat => feat.trim()),
        tags: formData.tags.filter(tag => tag.trim())
      };
      
      if (editingAttraction) {
        const { error } = await supabase
          .from('tourist_attractions')
          .update(dataToSubmit)
          .eq('id', editingAttraction.id);
        
        if (error) throw error;
        alert('관광지 정보가 수정되었습니다');
      } else {
        const { error } = await supabase
          .from('tourist_attractions')
          .insert([dataToSubmit]);
        
        if (error) throw error;
        alert('새 관광지가 추가되었습니다');
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchAttractions();
    } catch (error) {
      console.error('Error saving attraction:', error);
      alert('저장에 실패했습니다');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from('tourist_attractions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      alert('관광지가 삭제되었습니다');
      fetchAttractions();
    } catch (error) {
      console.error('Error deleting attraction:', error);
      alert('삭제에 실패했습니다');
    }
  };

  const handleEdit = (attraction: TouristAttraction) => {
    setEditingAttraction(attraction);
    setFormData({
      name: attraction.name,
      category: attraction.category,
      description: attraction.description || '',
      address: attraction.address || '',
      phone: attraction.phone || '',
      opening_hours: attraction.opening_hours || '',
      admission_fee: attraction.admission_fee || '',
      recommended_duration: attraction.recommended_duration || 60,
      images: attraction.images?.length ? attraction.images : [''],
      features: attraction.features?.length ? attraction.features : [''],
      tags: attraction.tags?.length ? attraction.tags : ['']
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingAttraction(null);
    setFormData({
      name: '',
      category: '관광명소',
      description: '',
      address: '',
      phone: '',
      opening_hours: '',
      admission_fee: '',
      recommended_duration: 60,
      images: [''],
      features: [''],
      tags: ['']
    });
  };

  const addArrayField = (field: 'images' | 'features' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'images' | 'features' | 'tags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'images' | 'features' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const categoryColors: Record<Category, string> = {
    '관광명소': 'bg-blue-100 text-blue-800',
    '휴게소': 'bg-gray-100 text-gray-800',
    '맛집': 'bg-orange-100 text-orange-800',
    '쇼핑': 'bg-purple-100 text-purple-800',
    '액티비티': 'bg-green-100 text-green-800'
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">관광지 관리</h1>
            <p className="text-sm text-gray-500 mt-1">투어 중 방문할 관광지, 휴게소, 맛집 등을 관리합니다</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 관광지 추가
          </button>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-6">
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
        {(['관광명소', '휴게소', '맛집', '쇼핑', '액티비티'] as Category[]).map(category => (
          <button
            key={category}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 관광지 목록 */}
      {loading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attractions.map(attraction => (
            <div key={attraction.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{attraction.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${categoryColors[attraction.category]}`}>
                      {attraction.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-1 text-gray-600 hover:text-gray-900"
                      onClick={() => handleEdit(attraction)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(attraction.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                {attraction.images && attraction.images[0] && (
                  <img 
                    src={attraction.images[0]} 
                    alt={attraction.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                {attraction.description && (
                  <p className="text-sm text-gray-600 mb-2">{attraction.description}</p>
                )}
                <div className="space-y-1 text-sm">
                  {attraction.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{attraction.address}</span>
                    </div>
                  )}
                  {attraction.recommended_duration && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>추천 체류시간: {attraction.recommended_duration}분</span>
                    </div>
                  )}
                  {attraction.tags && attraction.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {attraction.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 추가/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingAttraction ? '관광지 수정' : '새 관광지 추가'}
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
                    <option value="관광명소">관광명소</option>
                    <option value="휴게소">휴게소</option>
                    <option value="맛집">맛집</option>
                    <option value="쇼핑">쇼핑</option>
                    <option value="액티비티">액티비티</option>
                  </select>
                </div>
              </div>

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
                  <label className="block text-sm font-medium mb-1">전화번호</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">운영시간</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.opening_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, opening_hours: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">입장료</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.admission_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, admission_fee: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">추천 체류시간 (분)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.recommended_duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, recommended_duration: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              {/* 이미지 URL */}
              <div>
                <label className="block text-sm font-medium mb-1">이미지 URL</label>
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={image}
                      onChange={(e) => updateArrayField('images', index, e.target.value)}
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                      onClick={() => removeArrayField('images', index)}
                      disabled={formData.images.length === 1}
                    >
                      삭제
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 mt-2 flex items-center gap-2"
                  onClick={() => addArrayField('images')}
                >
                  <Plus className="w-4 h-4" />
                  이미지 추가
                </button>
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
    </div>
  );
}