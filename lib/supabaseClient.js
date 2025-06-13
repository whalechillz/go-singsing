import { createClient } from '@supabase/supabase-js';

// 임시로 하드코딩 (프로덕션에서는 환경 변수 사용 권장)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://weciawnqjutghprtpztg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlY2lhd25xanV0Z2hwcnRwenRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4ODgzMjIsImV4cCI6MjA2MjQ2NDMyMn0.FSImMugc14M31IlNoRUJTIBTBxg4mgG_A7yllI4sWlM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
