// Supabase Admin API를 사용한 비밀번호 재설정
// 이 코드는 서버 사이드에서만 실행해야 함 (보안상)

import { createClient } from '@supabase/supabase-js'

// Service Role Key 필요 (Dashboard > Settings > API에서 확인)
const supabaseAdmin = createClient(
  'https://weciawnqjutghprtpztg.supabase.co',
  'SERVICE_ROLE_KEY_HERE' // Dashboard에서 복사
)

// 비밀번호 업데이트 함수
async function updateUserPassword(email: string, newPassword: string) {
  const { data: user, error: fetchError } = await supabaseAdmin.auth.admin.getUserByEmail(email)
  
  if (fetchError) {
    console.error('사용자 조회 실패:', fetchError)
    return
  }

  if (user) {
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )
    
    if (updateError) {
      console.error('비밀번호 업데이트 실패:', updateError)
    } else {
      console.log(`${email} 비밀번호 업데이트 성공`)
    }
  }
}

// 사용자들 비밀번호 업데이트
const users = [
  'singsinggolf@naver.com',
  'singsingstour@naver.com',
  'mas9golf2@gmail.com',
  'mas9golf3@gmail.com'
]

users.forEach(email => {
  updateUserPassword(email, '90001004')
})
