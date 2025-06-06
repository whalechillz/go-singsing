"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">관광지 관리</h1>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          새 관광지 추가
        </Button>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
        >
          전체
        </Button>
        {(['관광명소', '휴게소', '맛집', '쇼핑', '액티비티'] as Category[]).map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* 관광지 목록 */}
      {loading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attractions.map(attraction => (
            <Card key={attraction.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{attraction.name}</CardTitle>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${categoryColors[attraction.category]}`}>
                      {attraction.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(attraction)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(attraction.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
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
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">카테고리 *</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: Category) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="관광명소">관광명소</SelectItem>
                      <SelectItem value="휴게소">휴게소</SelectItem>
                      <SelectItem value="맛집">맛집</SelectItem>
                      <SelectItem value="쇼핑">쇼핑</SelectItem>
                      <SelectItem value="액티비티">액티비티</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">설명</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">주소</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">전화번호</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">운영시간</label>
                  <Input
                    value={formData.opening_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, opening_hours: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">입장료</label>
                  <Input
                    value={formData.admission_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, admission_fee: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">추천 체류시간 (분)</label>
                  <Input
                    type="number"
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
                    <Input
                      value={image}
                      onChange={(e) => updateArrayField('images', index, e.target.value)}
                      placeholder="https://..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeArrayField('images', index)}
                      disabled={formData.images.length === 1}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayField('images')}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  이미지 추가
                </Button>
              </div>

              {/* 특징 */}
              <div>
                <label className="block text-sm font-medium mb-1">특징</label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateArrayField('features', index, e.target.value)}
                      placeholder="예: 템플스테이 체험 가능"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeArrayField('features', index)}
                      disabled={formData.features.length === 1}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayField('features')}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  특징 추가
                </Button>
              </div>

              {/* 태그 */}
              <div>
                <label className="block text-sm font-medium mb-1">태그</label>
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={tag}
                      onChange={(e) => updateArrayField('tags', index, e.target.value)}
                      placeholder="예: 사찰, 포토존"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeArrayField('tags', index)}
                      disabled={formData.tags.length === 1}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayField('tags')}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  태그 추가
                </Button>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  취소
                </Button>
                <Button type="submit">
                  {editingAttraction ? '수정' : '추가'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}