import { createClient } from '@supabase/supabase-js'

// 这些配置需要从环境变量或配置文件中获取
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key-for-development'

// 创建一个模拟的Supabase客户端用于开发
let supabase: any

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} catch (error) {
  // 如果Supabase配置无效，创建一个模拟客户端
  console.warn('Supabase配置无效，使用模拟数据模式')
  supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: null } })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null })
        }),
        order: () => Promise.resolve({ data: [], error: null })
      }),
      upsert: () => Promise.resolve({ error: null }),
      insert: () => Promise.resolve({ error: null }),
      update: () => Promise.resolve({ error: null }),
      delete: () => Promise.resolve({ error: null })
    })
  }
}

export { supabase }

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  STUDENT_PROFILES: 'student_profiles',
  GAME_LEVELS: 'game_levels',
  GAME_PROGRESS: 'game_progress',
  ASSESSMENTS: 'assessments',
  LEARNING_REPORTS: 'learning_reports'
} as const