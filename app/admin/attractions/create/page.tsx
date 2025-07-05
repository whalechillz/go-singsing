'use client';

import { useState } from 'react';
import { Search, Sparkles, ImageIcon, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  displayLink: string;
}

interface GeneratedContent {
  description: string;
  keywords: string[];
  model: string;
}

interface GeneratedImage {
  url: string;
  thumbnailUrl?: string;
  model: string;
  prompt: string;
}

export default function CreateAttractionPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '명소',
    address: '',
    description: '',
    features: [] as string[],
    tags: [] as string[],
    operating_hours: {},
    contact_info: {},
  });

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<number[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  // 1단계: 검색
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/attractions/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: formData.name }),
      });
      const data = await response.json();
      setSearchResults(data.results || []);
      setStep(2);
    } catch (error) {
      console.error('검색 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2단계: 콘텐츠 생성
  const handleGenerateContent = async () => {
    setLoading(true);
    try {
      const selectedData = selectedResults.map(i => searchResults[i]);
      const response = await fetch('/api/attractions/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          searchResults: selectedData,
        }),
      });
      const data = await response.json();
      setGeneratedContent(data);
      setFormData({
        ...formData,
        description: data.description,
        tags: data.keywords,
      });
      setStep(3);
    } catch (error) {
      console.error('콘텐츠 생성 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 3단계: 이미지 생성
  const handleGenerateImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/attractions/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          keywords: generatedContent?.keywords || [],
          description: formData.description,
        }),
      });
      const data = await response.json();
      setGeneratedImages(data.images || []);
      setStep(4);
    } catch (error) {
      console.error('이미지 생성 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 4단계: 저장
  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/attractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ai_generated_description: generatedContent?.description,
          description_model: generatedContent?.model,
          search_keywords: generatedContent?.keywords,
          images: generatedImages,
        }),
      });
      
      if (response.ok) {
        alert('관광지가 성공적으로 등록되었습니다!');
        // 리스트 페이지로 이동
        window.location.href = '/admin/attractions';
      }
    } catch (error) {
      console.error('저장 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">AI 관광지 등록</h1>

      {/* 진행 단계 표시 */}
      <div className="flex items-center mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= i ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {i}
            </div>
            {i < 4 && <div className={`w-20 h-1 ${step > i ? 'bg-blue-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* 1단계: 기본 정보 입력 */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold mb-4">1단계: 기본 정보 입력</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">관광지명</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 경복궁"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">카테고리</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="명소">명소</option>
              <option value="맛집">맛집</option>
              <option value="숙박">숙박</option>
              <option value="액티비티">액티비티</option>
              <option value="쇼핑">쇼핑</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">주소</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 서울특별시 종로구 사직로 161"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={!formData.name || loading}
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                검색하기
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* 2단계: 검색 결과 선택 */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold mb-4">2단계: 관련 정보 선택</h2>
          
          <div className="space-y-3">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedResults.includes(index)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => {
                  setSelectedResults(
                    selectedResults.includes(index)
                      ? selectedResults.filter((i) => i !== index)
                      : [...selectedResults, index]
                  );
                }}
              >
                <h3 className="font-semibold">{result.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{result.snippet}</p>
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline mt-2 inline-block"
                  onClick={(e) => e.stopPropagation()}
                >
                  {result.displayLink}
                </a>
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerateContent}
            disabled={selectedResults.length === 0 || loading}
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                콘텐츠 생성
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* 3단계: 생성된 콘텐츠 확인 및 수정 */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold mb-4">3단계: 콘텐츠 확인 및 수정</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">태그</label>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateImages}
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ImageIcon className="w-5 h-5 mr-2" />
                이미지 생성
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* 4단계: 이미지 확인 및 최종 저장 */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold mb-4">4단계: 최종 확인 및 저장</h2>
          
          <div>
            <h3 className="font-semibold mb-3">생성된 이미지</h3>
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={`생성된 이미지 ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">등록 정보 요약</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex">
                <dt className="font-medium w-24">관광지명:</dt>
                <dd>{formData.name}</dd>
              </div>
              <div className="flex">
                <dt className="font-medium w-24">카테고리:</dt>
                <dd>{formData.category}</dd>
              </div>
              <div className="flex">
                <dt className="font-medium w-24">주소:</dt>
                <dd>{formData.address}</dd>
              </div>
              <div className="flex">
                <dt className="font-medium w-24">이미지:</dt>
                <dd>{generatedImages.length}개</dd>
              </div>
            </dl>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-300 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                저장하기
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
