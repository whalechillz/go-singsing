'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileText, Copy, ExternalLink, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface DocumentLink {
  id: string;
  tour_id: string;
  document_type: string;
  access_token: string;
  is_active: boolean;
  expires_at: string | null;
  view_count: number;
  created_at: string;
}

interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
}

export default function DocumentLinksPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.tourId as string;
  
  const [tour, setTour] = useState<Tour | null>(null);
  const [documentLinks, setDocumentLinks] = useState<DocumentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // 새 문서 링크 폼 상태
  const [newDocumentType, setNewDocumentType] = useState('customer_schedule');
  const [expirationDays, setExpirationDays] = useState('');

  const documentTypeOptions = [
    { value: 'customer_schedule', label: '고객용 일정표' },
    { value: 'staff_schedule', label: '스탭용 일정표' },
    { value: 'customer_boarding', label: '고객용 탑승안내' },
    { value: 'staff_boarding', label: '스탭용 탑승안내' },
  ];

  useEffect(() => {
    fetchData();
  }, [tourId]);

  const fetchData = async () => {
    try {
      // 투어 정보 가져오기
      const { data: tourData, error: tourError } = await supabase
        .from('singsing_tours')
        .select('*')
        .eq('id', tourId)
        .single();

      if (tourError) throw tourError;
      setTour(tourData);

      // 문서 링크 목록 가져오기
      const { data: linksData, error: linksError } = await supabase
        .from('public_document_links')
        .select('*')
        .eq('tour_id', tourId)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;
      setDocumentLinks(linksData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const generateAccessToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const handleCreateLink = async () => {
    try {
      const expiresAt = expirationDays 
        ? new Date(Date.now() + parseInt(expirationDays) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('public_document_links')
        .insert({
          tour_id: tourId,
          document_type: newDocumentType,
          access_token: generateAccessToken(),
          expires_at: expiresAt,
          is_active: true,
          view_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      setDocumentLinks([data, ...documentLinks]);
      setIsCreateModalOpen(false);
      setNewDocumentType('customer_schedule');
      setExpirationDays('');
      toast.success('문서 링크가 생성되었습니다.');
    } catch (error) {
      console.error('Error creating link:', error);
      toast.error('문서 링크 생성 중 오류가 발생했습니다.');
    }
  };

  const handleToggleActive = async (linkId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('public_document_links')
        .update({ is_active: !currentStatus })
        .eq('id', linkId);

      if (error) throw error;

      setDocumentLinks(documentLinks.map(link => 
        link.id === linkId ? { ...link, is_active: !currentStatus } : link
      ));
      
      toast.success(currentStatus ? '링크가 비활성화되었습니다.' : '링크가 활성화되었습니다.');
    } catch (error) {
      console.error('Error toggling link status:', error);
      toast.error('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('정말로 이 링크를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('public_document_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      setDocumentLinks(documentLinks.filter(link => link.id !== linkId));
      toast.success('문서 링크가 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('링크 삭제 중 오류가 발생했습니다.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('링크가 복사되었습니다.');
  };

  const getDocumentUrl = (token: string) => {
    return `${window.location.origin}/doc/${token}`;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">문서 링크 관리</h1>
        <p className="text-gray-600">
          {tour?.title} ({new Date(tour?.start_date || '').toLocaleDateString('ko-KR')} ~ 
          {new Date(tour?.end_date || '').toLocaleDateString('ko-KR')})
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          새 문서 링크 생성
        </Button>
      </div>

      {documentLinks.length === 0 ? (
        <Alert>
          <AlertDescription>
            아직 생성된 문서 링크가 없습니다. 위의 버튼을 클릭하여 새로운 링크를 생성하세요.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {documentLinks.map((link) => {
            const documentType = documentTypeOptions.find(opt => opt.value === link.document_type);
            const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
            
            return (
              <Card key={link.id} className={isExpired ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">
                        {documentType?.label || link.document_type}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={link.is_active ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleToggleActive(link.id, link.is_active)}
                      >
                        {link.is_active ? '활성' : '비활성'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLink(link.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={getDocumentUrl(link.access_token)}
                        readOnly
                        className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(getDocumentUrl(link.access_token))}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getDocumentUrl(link.access_token), '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>조회수: {link.view_count}회</span>
                      <span>생성일: {new Date(link.created_at).toLocaleDateString('ko-KR')}</span>
                      {link.expires_at && (
                        <span className={isExpired ? 'text-red-600' : ''}>
                          만료일: {new Date(link.expires_at).toLocaleDateString('ko-KR')}
                          {isExpired && ' (만료됨)'}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 문서 링크 생성</DialogTitle>
            <DialogDescription>
              공개적으로 접근 가능한 문서 링크를 생성합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-type">문서 종류</Label>
              <Select
                value={newDocumentType}
                onValueChange={setNewDocumentType}
              >
                <SelectTrigger id="document-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="expiration">만료 기한 (일)</Label>
              <Input
                id="expiration"
                type="number"
                placeholder="비워두면 무제한"
                value={expirationDays}
                onChange={(e) => setExpirationDays(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                링크가 자동으로 만료될 날짜를 설정합니다.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreateLink}>
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
