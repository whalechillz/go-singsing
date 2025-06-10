'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { FileText, Calendar, Users, ExternalLink, Eye } from 'lucide-react';

interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  participant_count?: number;
  document_link_count?: number;
  recent_document_views?: number;
}

interface DocumentLink {
  id: string;
  tour_id: string;
  document_type: string;
  is_active: boolean;
  view_count: number;
  created_at: string;
  expires_at: string | null;
}

export default function TourDocumentsPage() {
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'past'>('all');

  useEffect(() => {
    fetchToursWithDocuments();
  }, []);

  const fetchToursWithDocuments = async () => {
    try {
      // 투어 목록 가져오기
      const { data: toursData, error: toursError } = await supabase
        .from('singsing_tours')
        .select('*')
        .order('start_date', { ascending: false });

      if (toursError) throw toursError;

      // 각 투어의 문서 링크 정보 가져오기
      const toursWithStats = await Promise.all(
        (toursData || []).map(async (tour) => {
          // 문서 링크 정보
          const { data: linksData, error: linksError } = await supabase
            .from('public_document_links')
            .select('*')
            .eq('tour_id', tour.id);

          if (linksError) console.error('Error fetching links:', linksError);

          const links = linksData || [];
          const activeLinks = links.filter(link => link.is_active);
          const totalViews = links.reduce((sum, link) => sum + (link.view_count || 0), 0);

          // 참가자 수
          const { count: participantCount } = await supabase
            .from('singsing_participants')
            .select('*', { count: 'exact', head: true })
            .eq('tour_id', tour.id);

          return {
            ...tour,
            participant_count: participantCount || 0,
            document_link_count: activeLinks.length,
            recent_document_views: totalViews
          };
        })
      );

      setTours(toursWithStats);
    } catch (error) {
      console.error('Error fetching tours:', error);
      alert('투어 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTours = tours.filter(tour => {
    // 검색어 필터
    if (searchTerm && !tour.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // 상태 필터
    const today = new Date();
    const startDate = new Date(tour.start_date);
    const endDate = new Date(tour.end_date);

    if (filterStatus === 'active' && endDate < today) return false;
    if (filterStatus === 'past' && endDate >= today) return false;

    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const getTourStatus = (tour: Tour) => {
    const today = new Date();
    const startDate = new Date(tour.start_date);
    const endDate = new Date(tour.end_date);

    if (today < startDate) return { label: '예정', color: 'bg-blue-100 text-blue-800' };
    if (today > endDate) return { label: '종료', color: 'bg-gray-100 text-gray-800' };
    return { label: '진행중', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">투어별 문서 링크 관리</h1>
        <p className="text-gray-600">
          각 투어의 문서 링크를 관리하고 조회 현황을 확인할 수 있습니다.
        </p>
      </div>

      {/* 필터 및 검색 */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="투어명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-md transition-colors ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-md transition-colors ${
              filterStatus === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            진행중
          </button>
          <button
            onClick={() => setFilterStatus('past')}
            className={`px-4 py-2 rounded-md transition-colors ${
              filterStatus === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            종료됨
          </button>
        </div>
      </div>

      {/* 투어 목록 */}
      {filteredTours.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
          검색 결과가 없습니다.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTours.map((tour) => {
            const status = getTourStatus(tour);
            
            return (
              <div 
                key={tour.id} 
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/admin/tours/${tour.id}/document-links`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{tour.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(tour.start_date)} ~ {formatDate(tour.end_date)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-md p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">참가자</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {tour.participant_count || 0}명
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-md p-3">
                      <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">활성 문서</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {tour.document_link_count || 0}개
                      </p>
                    </div>
                    
                    <div className="bg-green-50 rounded-md p-3">
                      <div className="flex items-center gap-2 text-green-600 mb-1">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">총 조회수</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {tour.recent_document_views || 0}회
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
