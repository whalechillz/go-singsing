import { supabase } from './supabaseClient';

export type UserRole = 'admin' | 'manager' | 'staff' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
  team?: string;
  department?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// 현재 로그인한 사용자 정보 가져오기
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // active_users 뷰에서 사용자 정보 조회 (먼저 id로 시도)
    let { data: profile } = await supabase
      .from('active_users')
      .select('*')
      .eq('id', user.id)
      .single();

    // id로 찾지 못하면 email로 시도
    if (!profile) {
      const { data: profileByEmail } = await supabase
        .from('active_users')
        .select('*')
        .eq('email', user.email)
        .single();
      
      profile = profileByEmail;
    }

    if (!profile) {
      // active_users에 없으면 users 테이블에서 조회
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return userProfile;
    }

    return profile;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

// 로그아웃
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error };
  }
}

// 사용자 역할 확인
export async function checkUserRole(requiredRoles: UserRole[]) {
  const user = await getCurrentUser();
  if (!user) return false;
  return requiredRoles.includes(user.role as UserRole);
}

// 세션 확인
export async function getSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// 인증 상태 변경 리스너
export function onAuthStateChange(callback: (event: any, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

// 사용자 활성화 상태 확인
export async function isUserActive() {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.is_active === true;
}
