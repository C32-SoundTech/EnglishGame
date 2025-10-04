/**
 * 本地存储工具类
 * 提供统一的数据存储和管理功能
 */

// 存储键名常量
export const STORAGE_KEYS = {
  // 用户数据
  USER_PROFILE: 'user_profile',
  USER_SETTINGS: 'user_settings',
  USER_PREFERENCES: 'user_preferences',
  
  // 学习数据
  LEARNING_PROGRESS: 'learning_progress',
  ASSESSMENT_RESULTS: 'assessment_results',
  SKILL_SCORES: 'skill_scores',
  LEARNING_HISTORY: 'learning_history',
  
  // 游戏数据
  GAME_SCORES: 'game_scores',
  GAME_ACHIEVEMENTS: 'game_achievements',
  GAME_STATISTICS: 'game_statistics',
  
  // 徽章和成就
  BADGES: 'badges',
  ACHIEVEMENTS: 'achievements',
  UNLOCKED_CONTENT: 'unlocked_content',
  
  // 推荐系统
  RECOMMENDATIONS: 'recommendations',
  RECOMMENDATION_HISTORY: 'recommendation_history',
  
  // 应用状态
  APP_STATE: 'app_state',
  CACHE_DATA: 'cache_data',
  OFFLINE_DATA: 'offline_data'
} as const

// 数据类型定义
export interface UserProfile {
  id: string
  name: string
  avatar?: string
  level: number
  experience: number
  joinDate: Date
  lastLoginDate: Date
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US'
  soundEnabled: boolean
  animationEnabled: boolean
  notificationEnabled: boolean
  autoSave: boolean
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface LearningProgress {
  totalStudyTime: number
  completedLessons: number
  currentStreak: number
  longestStreak: number
  skillLevels: Record<string, number>
  weeklyGoal: number
  weeklyProgress: number
}

export interface AssessmentResult {
  id: string
  type: 'listening' | 'speaking' | 'reading' | 'writing'
  score: number
  maxScore: number
  completedAt: Date
  timeSpent: number
  answers: any[]
  skillBreakdown: Record<string, number>
}

// 存储管理类
class StorageManager {
  private prefix = 'english_platform_'
  
  /**
   * 设置数据到本地存储
   */
  setItem<T>(key: string, value: T): boolean {
    try {
      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        version: '1.0'
      })
      localStorage.setItem(this.prefix + key, serializedValue)
      return true
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
      return false
    }
  }
  
  /**
   * 从本地存储获取数据
   */
  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key)
      if (!item) {
        return defaultValue || null
      }
      
      const parsed = JSON.parse(item)
      return parsed.data as T
    } catch (error) {
      console.error('Failed to read from localStorage:', error)
      return defaultValue || null
    }
  }
  
  /**
   * 删除本地存储数据
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(this.prefix + key)
      return true
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
      return false
    }
  }
  
  /**
   * 清空所有应用数据
   */
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
      return true
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
      return false
    }
  }
  
  /**
   * 获取存储使用情况
   */
  getStorageInfo(): {
    used: number
    available: number
    total: number
    percentage: number
  } {
    try {
      let used = 0
      const keys = Object.keys(localStorage)
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          used += localStorage.getItem(key)?.length || 0
        }
      })
      
      // 估算可用空间（通常为5MB）
      const total = 5 * 1024 * 1024 // 5MB in bytes
      const available = total - used
      const percentage = (used / total) * 100
      
      return {
        used,
        available,
        total,
        percentage: Math.round(percentage * 100) / 100
      }
    } catch (error) {
      console.error('Failed to get storage info:', error)
      return {
        used: 0,
        available: 0,
        total: 0,
        percentage: 0
      }
    }
  }
  
  /**
   * 导出所有数据
   */
  exportData(): string {
    try {
      const data: Record<string, any> = {}
      const keys = Object.keys(localStorage)
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const cleanKey = key.replace(this.prefix, '')
          data[cleanKey] = this.getItem(cleanKey)
        }
      })
      
      return JSON.stringify({
        exportDate: new Date().toISOString(),
        version: '1.0',
        data
      }, null, 2)
    } catch (error) {
      console.error('Failed to export data:', error)
      return ''
    }
  }
  
  /**
   * 导入数据
   */
  importData(jsonData: string): boolean {
    try {
      const parsed = JSON.parse(jsonData)
      
      if (!parsed.data) {
        throw new Error('Invalid data format')
      }
      
      Object.entries(parsed.data).forEach(([key, value]) => {
        this.setItem(key, value)
      })
      
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }
  
  /**
   * 数据同步到云端（模拟）
   */
  async syncToCloud(): Promise<boolean> {
    try {
      const data = this.exportData()
      
      // 模拟网络请求
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 这里应该调用实际的云端API
      console.log('Data synced to cloud:', data.length, 'characters')
      
      // 记录同步时间
      this.setItem('last_sync_time', new Date().toISOString())
      
      return true
    } catch (error) {
      console.error('Failed to sync to cloud:', error)
      return false
    }
  }
  
  /**
   * 从云端同步数据（模拟）
   */
  async syncFromCloud(): Promise<boolean> {
    try {
      // 模拟网络请求
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 这里应该调用实际的云端API获取数据
      // const cloudData = await api.getUserData()
      
      console.log('Data synced from cloud')
      return true
    } catch (error) {
      console.error('Failed to sync from cloud:', error)
      return false
    }
  }
}

// 创建存储管理器实例
export const storage = new StorageManager()

// 便捷方法
export const saveUserProfile = (profile: UserProfile): boolean => {
  return storage.setItem(STORAGE_KEYS.USER_PROFILE, profile)
}

export const getUserProfile = (): UserProfile | null => {
  return storage.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE)
}

export const saveUserSettings = (settings: UserSettings): boolean => {
  return storage.setItem(STORAGE_KEYS.USER_SETTINGS, settings)
}

export const getUserSettings = (): UserSettings => {
  return storage.getItem<UserSettings>(STORAGE_KEYS.USER_SETTINGS, {
    theme: 'light',
    language: 'zh-CN',
    soundEnabled: true,
    animationEnabled: true,
    notificationEnabled: true,
    autoSave: true,
    difficulty: 'medium'
  })!
}

export const saveLearningProgress = (progress: LearningProgress): boolean => {
  return storage.setItem(STORAGE_KEYS.LEARNING_PROGRESS, progress)
}

export const getLearningProgress = (): LearningProgress | null => {
  return storage.getItem<LearningProgress>(STORAGE_KEYS.LEARNING_PROGRESS)
}

export const saveAssessmentResult = (result: AssessmentResult): boolean => {
  const results = getAssessmentResults()
  results.push(result)
  
  // 只保留最近100次评估结果
  if (results.length > 100) {
    results.splice(0, results.length - 100)
  }
  
  return storage.setItem(STORAGE_KEYS.ASSESSMENT_RESULTS, results)
}

export const getAssessmentResults = (): AssessmentResult[] => {
  return storage.getItem<AssessmentResult[]>(STORAGE_KEYS.ASSESSMENT_RESULTS, [])!
}

export const saveGameScore = (gameType: string, score: number): boolean => {
  const scores = storage.getItem<Record<string, number[]>>(STORAGE_KEYS.GAME_SCORES, {})!
  
  if (!scores[gameType]) {
    scores[gameType] = []
  }
  
  scores[gameType].push(score)
  
  // 只保留最近50次分数
  if (scores[gameType].length > 50) {
    scores[gameType].splice(0, scores[gameType].length - 50)
  }
  
  return storage.setItem(STORAGE_KEYS.GAME_SCORES, scores)
}

export const getGameScores = (gameType?: string): Record<string, number[]> | number[] => {
  const scores = storage.getItem<Record<string, number[]>>(STORAGE_KEYS.GAME_SCORES, {})!
  
  if (gameType) {
    return scores[gameType] || []
  }
  
  return scores
}

export const saveBadges = (badges: any[]): boolean => {
  return storage.setItem(STORAGE_KEYS.BADGES, badges)
}

export const getBadges = (): any[] => {
  return storage.getItem<any[]>(STORAGE_KEYS.BADGES, [])!
}

export const saveRecommendations = (recommendations: any[]): boolean => {
  return storage.setItem(STORAGE_KEYS.RECOMMENDATIONS, recommendations)
}

export const getRecommendations = (): any[] => {
  return storage.getItem<any[]>(STORAGE_KEYS.RECOMMENDATIONS, [])!
}

// 数据迁移工具
export const migrateData = (fromVersion: string, toVersion: string): boolean => {
  try {
    console.log(`Migrating data from ${fromVersion} to ${toVersion}`)
    
    // 这里可以添加具体的数据迁移逻辑
    // 例如：字段重命名、数据结构调整等
    
    return true
  } catch (error) {
    console.error('Data migration failed:', error)
    return false
  }
}

// 数据备份工具
export const createBackup = (): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const data = storage.exportData()
  
  // 创建备份文件名
  const filename = `english_platform_backup_${timestamp}.json`
  
  // 在实际应用中，这里可以触发文件下载
  console.log(`Backup created: ${filename}`)
  
  return data
}

// 数据恢复工具
export const restoreBackup = (backupData: string): boolean => {
  try {
    // 先备份当前数据
    const currentBackup = storage.exportData()
    storage.setItem('restore_backup', currentBackup)
    
    // 恢复数据
    const success = storage.importData(backupData)
    
    if (success) {
      console.log('Data restored successfully')
    } else {
      // 恢复失败，回滚到之前的数据
      storage.importData(currentBackup)
      console.error('Restore failed, rolled back to previous data')
    }
    
    return success
  } catch (error) {
    console.error('Restore backup failed:', error)
    return false
  }
}

export default storage