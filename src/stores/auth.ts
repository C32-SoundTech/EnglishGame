import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User, StudentProfile } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // 使用模拟用户数据
  const user = ref<User | null>({
    id: 'demo-user-123',
    email: 'demo@example.com',
    role: 'student',
    name: '小明',
    avatar_url: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  
  const studentProfile = ref<StudentProfile | null>({
    id: 'demo-profile-123',
    user_id: 'demo-user-123',
    grade: 3,
    total_points: 150,
    level: 2,
    parent_id: undefined,
    created_at: new Date().toISOString()
  })
  
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isStudent = computed(() => user.value?.role === 'student')
  const isParent = computed(() => user.value?.role === 'parent')
  const isTeacher = computed(() => user.value?.role === 'teacher')

  // 登录 - 使用模拟数据
  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      // 模拟登录延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟成功登录
      user.value = {
        id: 'demo-user-123',
        email: email,
        role: 'student',
        name: '小明',
        avatar_url: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 注册 - 使用模拟数据
  const signUp = async (email: string, password: string, name: string, role: 'student' | 'parent' | 'teacher' = 'student') => {
    loading.value = true
    try {
      // 模拟注册延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { success: true, data: { user: { email, name, role } } }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 登出
  const signOut = async () => {
    loading.value = true
    try {
      user.value = null
      studentProfile.value = null
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 获取用户资料 - 使用模拟数据
  const fetchUserProfile = async (userId: string) => {
    try {
      // 模拟已有用户数据，无需实际API调用
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      console.error('获取用户资料失败:', error)
    }
  }

  // 获取学生档案 - 使用模拟数据
  const fetchStudentProfile = async (userId: string) => {
    try {
      // 模拟已有学生档案数据，无需实际API调用
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      console.error('获取学生档案失败:', error)
    }
  }

  // 初始化认证状态 - 使用模拟数据
  const initialize = async () => {
    // 模拟已登录状态，无需实际的session检查
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return {
    user,
    studentProfile,
    loading,
    isAuthenticated,
    isStudent,
    isParent,
    isTeacher,
    signIn,
    signUp,
    signOut,
    fetchUserProfile,
    fetchStudentProfile,
    initialize
  }
})