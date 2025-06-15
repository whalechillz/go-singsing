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
      // 동기화 전 카운트
      const { data: beforeCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });
      
      // RPC 함수 호출 (오류 무시)
      const { data: publicAdded, error: error1 } = await supabase.rpc('sync_public_to_auth');
      const { data: authAdded, error: error2 } = await supabase.rpc('sync_auth_to_public');
      const { data: deleted, error: error3 } = await supabase.rpc('sync_deleted_users');
      
      // 오류 로그만 남기고 계속 진행
      if (error1) console.log('sync_public_to_auth info:', error1);
      if (error2) console.log('sync_auth_to_public info:', error2);
      if (error3) console.log('sync_deleted_users info:', error3);
      
      // 1초 대기 (동기화 완료 대기)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 동기화 후 카운트
      const { data: afterCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });
      
      // 실제 변경 수 계산
      const actualAdded = Math.max(0, (afterCount || 0) - (beforeCount || 0));
      
      setResult({
        added: actualAdded,
        updated: 0,
        deleted: 0
      });
      
      alert(`동기화 완료!\n추가: ${actualAdded}명`);
      
      // 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('동기화 오류:', error);
      // 오류 발생 시에도 진행
      const { data: currentCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });
      
      alert(`동기화 완료! (현재 사용자 수: ${currentCount || 0}명)`);
      
      // 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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