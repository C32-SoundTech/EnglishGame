import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { storage, STORAGE_KEYS } from '@/utils/storage'
import type { User, StudentProfile } from '@/types'

// 用户角色类型
export type UserRole = 'student' | 'parent' | 'teacher' | 'admin'

// 权限类型
export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

// 角色权限映射
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  student: [
    'games:play',
    'assessment:take',
    'progress:view',
    'profile:edit',
    'reports:view'
  ],
  parent: [
    'student:view',
    'progress:view',
    'reports:view',
    'goals:manage',
    'reminders:manage'
  ],
  teacher: [
    'student:manage',
    'assessment:create',
    'progress:manage',
    'reports:generate',
    'content:manage'
  ],
  admin: [
    'user:manage',
    'system:config',
    'data:export',
    'analytics:view',
    'content:manage'
  ]
}

export const useAuthStore = defineStore('auth', () => {
  // 从本地存储加载用户数据
  const user = ref<User | null>(storage.getItem(STORAGE_KEYS.USER_PROFILE))
  
  const studentProfile = ref<StudentProfile | null>(
    storage.getItem(STORAGE_KEYS.STUDENT_PROFILE) || null
  )
  
  const loading = ref(false)
  const sessionExpiry = ref<Date | null>(null)
  const lastActivity = ref<Date>(new Date())

  // 计算属性
  const isAuthenticated = computed(() => !!user.value && !isSessionExpired.value)
  const isStudent = computed(() => user.value?.role === 'student')
  const isParent = computed(() => user.value?.role === 'parent')
  const isTeacher = computed(() => user.value?.role === 'teacher')
  const isAdmin = computed(() => user.value?.role === 'admin')
  
  // 会话是否过期
  const isSessionExpired = computed(() => {
    if (!sessionExpiry.value) return false
    return new Date() > sessionExpiry.value
  })
  
  // 获取用户权限
  const userPermissions = computed(() => {
    if (!user.value) return []
    return ROLE_PERMISSIONS[user.value.role as UserRole] || []
  })
  
  // 检查权限
  const hasPermission = (permission: string): boolean => {
    return userPermissions.value.includes(permission)
  }
  
  // 检查多个权限（需要全部满足）
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }
  
  // 检查多个权限（满足任一即可）
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  // 更新最后活动时间
  const updateLastActivity = () => {
    lastActivity.value = new Date()
  }
  
  // 设置会话过期时间
  const setSessionExpiry = (hours: number = 24) => {
    const expiry = new Date()
    expiry.setHours(expiry.getHours() + hours)
    sessionExpiry.value = expiry
  }
  
  // 登录
  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      // 模拟登录延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 根据邮箱确定角色和用户信息
      let role: UserRole = 'student'
      let name = '小明'
      
      if (email.includes('parent')) {
        role = 'parent'
        name = '家长'
      } else if (email.includes('teacher')) {
        role = 'teacher'
        name = '老师'
      } else if (email.includes('admin')) {
        role = 'admin'
        name = '管理员'
      }
      
      // 创建用户对象
      const userData: User = {
        id: `user-${Date.now()}`,
        email: email,
        role: role,
        name: name,
        avatar_url: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      user.value = userData
      
      // 如果是学生，创建学生档案
      if (role === 'student') {
        const profileData: StudentProfile = {
          id: `profile-${Date.now()}`,
          user_id: userData.id,
          grade: 3,
          total_points: 150,
          level: 2,
          parent_id: undefined,
          created_at: new Date().toISOString()
        }
        studentProfile.value = profileData
        storage.setItem(STORAGE_KEYS.STUDENT_PROFILE, profileData)
      }
      
      // 保存到本地存储
      storage.setItem(STORAGE_KEYS.USER_PROFILE, userData)
      
      // 设置会话过期时间
      setSessionExpiry(24)
      updateLastActivity()
      
      return { success: true, user: userData }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 注册
  const signUp = async (email: string, password: string, name: string, role: UserRole = 'student', grade?: number) => {
    loading.value = true
    try {
      // 模拟注册延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 检查邮箱是否已存在（模拟）
      const existingUser = storage.getItem(`user_${email}`)
      if (existingUser) {
        return { success: false, error: '该邮箱已被注册' }
      }
      
      // 创建新用户
      const userData: User = {
        id: `user-${Date.now()}`,
        email: email,
        role: role,
        name: name,
        avatar_url: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // 如果是学生，创建学生档案
      let profileData: StudentProfile | null = null
      if (role === 'student') {
        profileData = {
          id: `profile-${Date.now()}`,
          user_id: userData.id,
          grade: grade || 1,
          total_points: 0,
          level: 1,
          parent_id: undefined,
          created_at: new Date().toISOString()
        }
      }
      
      // 保存用户信息（模拟数据库存储）
      storage.setItem(`user_${email}`, userData)
      if (profileData) {
        storage.setItem(`profile_${userData.id}`, profileData)
      }
      
      return { 
        success: true, 
        data: { 
          user: userData,
          profile: profileData
        } 
      }
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
      // 清除用户数据
      user.value = null
      studentProfile.value = null
      sessionExpiry.value = null
      
      // 清除本地存储
      storage.removeItem(STORAGE_KEYS.USER_PROFILE)
      storage.removeItem(STORAGE_KEYS.STUDENT_PROFILE)
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }
  
  // 更新用户资料
  const updateProfile = async (updates: Partial<User>) => {
    if (!user.value) return { success: false, error: '用户未登录' }
    
    try {
      const updatedUser = {
        ...user.value,
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      user.value = updatedUser
      storage.setItem(STORAGE_KEYS.USER_PROFILE, updatedUser)
      
      return { success: true, user: updatedUser }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  // 更新学生档案
  const updateStudentProfile = async (updates: Partial<StudentProfile>) => {
    if (!studentProfile.value) return { success: false, error: '学生档案不存在' }
    
    try {
      const updatedProfile = {
        ...studentProfile.value,
        ...updates
      }
      
      studentProfile.value = updatedProfile
      storage.setItem(STORAGE_KEYS.STUDENT_PROFILE, updatedProfile)
      
      return { success: true, profile: updatedProfile }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  // 切换用户角色（仅管理员）
  const switchUserRole = async (userId: string, newRole: UserRole) => {
    if (!hasPermission('user:manage')) {
      return { success: false, error: '权限不足' }
    }
    
    try {
      // 模拟角色切换
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 如果是当前用户，更新当前用户信息
      if (user.value && user.value.id === userId) {
        const updatedUser = {
          ...user.value,
          role: newRole,
          updated_at: new Date().toISOString()
        }
        user.value = updatedUser
        storage.setItem(STORAGE_KEYS.USER_PROFILE, updatedUser)
      }
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  // 批量管理用户
  const batchManageUsers = async (userIds: string[], action: 'activate' | 'deactivate' | 'delete') => {
    if (!hasPermission('user:manage')) {
      return { success: false, error: '权限不足' }
    }
    
    try {
      // 模拟批量操作
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { success: true, affectedCount: userIds.length }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  // 获取用户列表（管理员功能）
  const getUserList = async (filters?: {
    role?: UserRole
    status?: string
    search?: string
    page?: number
    pageSize?: number
  }) => {
    if (!hasPermission('user:view')) {
      return { success: false, error: '权限不足' }
    }
    
    try {
      // 模拟获取用户列表
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 模拟用户数据
      const mockUsers = [
        {
          id: '1',
          name: '小明',
          email: 'xiaoming@example.com',
          role: 'student' as UserRole,
          status: 'active',
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        },
        {
          id: '2',
          name: '李老师',
          email: 'teacher@example.com',
          role: 'teacher' as UserRole,
          status: 'active',
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        }
      ]
      
      return { 
        success: true, 
        data: {
          users: mockUsers,
          total: mockUsers.length,
          page: filters?.page || 1,
          pageSize: filters?.pageSize || 10
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  // 创建用户（管理员功能）
  const createUser = async (userData: {
    name: string
    email: string
    password: string
    role: UserRole
    grade?: number
  }) => {
    if (!hasPermission('user:create')) {
      return { success: false, error: '权限不足' }
    }
    
    try {
      // 模拟创建用户
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar_url: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // 如果是学生，创建学生档案
      let profile: StudentProfile | null = null
      if (userData.role === 'student') {
        profile = {
          id: `profile-${Date.now()}`,
          user_id: newUser.id,
          grade: userData.grade || 1,
          total_points: 0,
          level: 1,
          parent_id: undefined,
          created_at: new Date().toISOString()
        }
      }
      
      return { 
        success: true, 
        data: { 
          user: newUser,
          profile: profile
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  // 更新用户信息（管理员功能）
  const updateUser = async (userId: string, updates: Partial<User>) => {
    if (!hasPermission('user:edit')) {
      return { success: false, error: '权限不足' }
    }
    
    try {
      // 模拟更新用户
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  // 删除用户（管理员功能）
  const deleteUser = async (userId: string) => {
    if (!hasPermission('user:delete')) {
      return { success: false, error: '权限不足' }
    }
    
    try {
      // 模拟删除用户
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  // 重置用户密码（管理员功能）
  const resetUserPassword = async (userId: string, newPassword: string) => {
    if (!hasPermission('user:edit')) {
      return { success: false, error: '权限不足' }
    }
    
    try {
      // 模拟重置密码
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  // 获取角色列表
  const getRoles = async () => {
    if (!hasPermission('user:view')) {
      return { success: false, error: '权限不足' }
    }
    
    try {
      const roles = [
        {
          id: 'student',
          name: 'student',
          displayName: '学生',
          description: '普通学生用户',
          permissions: ['games:play', 'assessment:take', 'progress:view'],
          isSystem: true
        },
        {
          id: 'parent',
          name: 'parent',
          displayName: '家长',
          description: '学生家长',
          permissions: ['progress:view', 'assessment:view_results'],
          isSystem: true
        },
        {
          id: 'teacher',
          name: 'teacher',
          displayName: '老师',
          description: '教师用户',
          permissions: ['games:create', 'assessment:create', 'progress:manage', 'user:view'],
          isSystem: true
        },
        {
          id: 'admin',
          name: 'admin',
          displayName: '管理员',
          description: '系统管理员',
          permissions: Object.values(ROLE_PERMISSIONS).flat(),
          isSystem: true
        }
      ]
      
      return { success: true, data: roles }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
  
  // 更新角色权限
  const updateRolePermissions = async (roleId: string, permissions: Permission[]) => {
    if (!hasPermission('system:settings')) {
      return { success: false, error: '权限不足' }
    }
    
    try {
      // 模拟更新角色权限
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
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
    // 状态
    user,
    studentProfile,
    loading,
    sessionExpiry,
    lastActivity,
    
    // 计算属性
    isAuthenticated,
    isStudent,
    isParent,
    isTeacher,
    isAdmin,
    isSessionExpired,
    userPermissions,
    
    // 权限检查方法
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    
    // 认证方法
    signIn,
    signUp,
    signOut,
    
    // 资料管理方法
    updateProfile,
    updateStudentProfile,
    switchUserRole,
    
    // 用户管理方法（管理员功能）
    batchManageUsers,
    getUserList,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    
    // 角色管理方法
    getRoles,
    updateRolePermissions,
    
    // 数据获取方法
    fetchUserProfile,
    fetchStudentProfile,
    
    // 会话管理方法
    setSessionExpiry,
    updateLastActivity,
    
    // 初始化方法
    initialize
  }
})