// 통합 표지 생성 다이얼로그 수정 예시

interface CoverGenerationDialogProps {
  tourId: string;
  onClose: () => void;
  onGenerate: (data: any) => void;
}

export function CoverGenerationDialog({ tourId, onClose, onGenerate }: CoverGenerationDialogProps) {
  const [specialNotices, setSpecialNotices] = useState<string[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<string>('');
  
  useEffect(() => {
    // 투어의 긴급공지 가져오기
    const fetchNotices = async () => {
      const { data } = await supabase
        .from('singsing_tours')
        .select('special_notices')
        .eq('id', tourId)
        .single();
      
      if (data?.special_notices) {
        const notices = data.special_notices.map((n: any) => n.content);
        setSpecialNotices(notices);
        if (notices.length > 0) {
          setSelectedNotice(notices[0]); // 첫 번째 공지를 기본값으로
        }
      }
    };
    
    fetchNotices();
  }, [tourId]);
  
  return (
    <Dialog>
      {/* ... 다른 필드들 ... */}
      
      {/* 특별공지사항 선택 (긴급공지에서 가져옴) */}
      {specialNotices.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            특별공지사항 (선택)
          </label>
          <select 
            value={selectedNotice}
            onChange={(e) => setSelectedNotice(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">선택 안 함</option>
            {specialNotices.map((notice, index) => (
              <option key={index} value={notice}>
                {notice.substring(0, 50)}...
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            투어 수정 {'>'} 긴급공지에서 관리된 공지사항입니다
          </p>
        </div>
      )}
      
      {/* 긴급공지가 없는 경우 안내 */}
      {specialNotices.length === 0 && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">
            특별공지사항을 추가하려면 투어 수정 {'>'} 긴급공지 탭에서 추가하세요
          </p>
        </div>
      )}
    </Dialog>
  );
}
