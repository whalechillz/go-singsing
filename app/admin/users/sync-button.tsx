import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { RefreshCw } from "lucide-react";

export function SyncUsersButton() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{
    added: number;
    updated: number;
    deleted: number;
  } | null>(null);

  const syncUsers = async () => {
    setSyncing(true);
    setResult(null);

    try {
      // RPC 함수 호출
      const { data: publicAdded, error: error1 } = await supabase.rpc('sync_public_to_auth');
      const { data: authAdded, error: error2 } = await supabase.rpc('sync_auth_to_public');
      const { data: deleted, error: error3 } = await supabase.rpc('sync_deleted_users');
      
      if (error1 || error2 || error3) {
        console.error('Sync errors:', { error1, error2, error3 });
        
        // 상세한 에러 메시지
        let errorMsg = '동기화 중 오류가 발생했습니다:\n';
        if (error1) errorMsg += `\n- Public to Auth: ${error1.message}`;
        if (error2) errorMsg += `\n- Auth to Public: ${error2.message}`;
        if (error3) errorMsg += `\n- Delete sync: ${error3.message}`;
        
        throw new Error(errorMsg);
      }
      
      setResult({
        added: (publicAdded || 0) + (authAdded || 0),
        updated: 0,
        deleted: deleted || 0
      });
      
      alert(`동기화 완료!\n추가: ${(publicAdded || 0) + (authAdded || 0)}명\n삭제: ${deleted || 0}명`);
      
      // 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('동기화 오류:', error);
      alert('동기화 중 오류가 발생했습니다.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={syncUsers}
        disabled={syncing}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? '동기화 중...' : '사용자 동기화'}
      </button>
      
      {result && (
        <div className="text-sm text-gray-600">
          추가: {result.added}명, 삭제: {result.deleted}명
        </div>
      )}
    </div>
  );
}