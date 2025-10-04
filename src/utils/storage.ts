/**
 * 本地存储工具类
 * 提供统一的数据存储和同步功能
 */

export interface UserProfile {
  id: string
  name: string
  age: number
  grade: string
  avatar?: string
  learningGoals: string[]
  interests: string[]
  bio: string
  createdAt: Date
  updatedAt: Date
}

export interface LearningProgress {
  userId: string
  totalPoints: number
  level: number
  consecutiveDays: number
  completedLessons: number
  totalLessons: number
  skillLevels: {
    listening: number
    speaking: number
    reading: number
    writing: number
  }
  achievements: Achievement[]
  lastStudyDate: Date
  studyStreak: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earnedAt: Date
  points: number
  category: 'study' | 'streak' | 'skill' | 'special'
}

export interface StudySession {
  id: string
  userId: string
  startTime: Date
  endTime: Date
  duration: number // 分钟
  gameType: string
  score: number
  pointsEarned: number
  correctAnswers: number
  totalQuestions: number
  skillsImproved: string[]
}

export interface LearningGoal {
  id: string
  userId: string
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string // 'minutes', 'points', 'lessons'
  deadline: Date
  completed: boolean
  createdAt: Date
}

export interface NotificationSettings {
  studyReminder: boolean
  achievementNotification: boolean
  systemMessage: boolean
  soundAlert: boolean
  reminderTime: string
  dailyGoalReminder: boolean
}

// 存储键名常量
const STORAGE_KEYS = {
  USER_PROFILE: 'english_platform_user_profile',
  LEARNING_PROGRESS: 'english_platform_learning_progress',
  STUDY_SESSIONS: 'english_platform_study_sessions',
  LEARNING_GOALS: 'english_platform_learning_goals',
  NOTIFICATION_SETTINGS: 'english_platform_notification_settings',
  GAME_SETTINGS: 'english_platform_game_settings',
  LAST_SYNC: 'english_platform_last_sync',
  OFFLINE_QUEUE: 'english_platform_offline_queue'
} as const

/**
 * 本地存储管理类
 */
class StorageManager {
  private syncQueue: Array<{ key: string; data: any; timestamp: number }> = []
  private isOnline = navigator.onLine

  constructor() {
    // 监听网络状态
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncOfflineData()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // 加载离线队列
    this.loadOfflineQueue()
  }

  /**
   * 存储数据
   */
  setItem<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0'
      })
      localStorage.setItem(key, serializedData)

      // 如果离线，添加到同步队列
      if (!this.isOnline) {
        this.addToSyncQueue(key, data)
      }
    } catch (error) {
      console.error('存储数据失败:', error)
      throw new Error('存储空间不足或数据格式错误')
    }
  }

  /**
   * 获取数据
   */
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const parsed = JSON.parse(item)
      return parsed.data as T
    } catch (error) {
      console.error('读取数据失败:', error)
      return null
    }
  }

  /**
   * 删除数据
   */
  removeItem(key: string): void {
    localStorage.removeItem(key)
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    this.syncQueue = []
    this.saveOfflineQueue()
  }

  /**
   * 获取存储大小
   */
  getStorageSize(): { used: number; total: number } {
    let used = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length
      }
    }
    
    // 估算总容量（通常为5-10MB）
    const total = 5 * 1024 * 1024 // 5MB
    
    return { used, total }
  }

  /**
   * 添加到同步队列
   */
  private addToSyncQueue(key: string, data: any): void {
    this.syncQueue.push({
      key,
      data,
      timestamp: Date.now()
    })
    this.saveOfflineQueue()
  }

  /**
   * 保存离线队列
   */
  private saveOfflineQueue(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error('保存离线队列失败:', error)
    }
  }

  /**
   * 加载离线队列
   */
  private loadOfflineQueue(): void {
    try {
      const queue = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE)
      if (queue) {
        this.syncQueue = JSON.parse(queue)
      }
    } catch (error) {
      console.error('加载离线队列失败:', error)
      this.syncQueue = []
    }
  }

  /**
   * 同步离线数据
   */
  private async syncOfflineData(): Promise<void> {
    if (this.syncQueue.length === 0) return

    try {
      // 这里可以实现与服务器的同步逻辑
      console.log('开始同步离线数据:', this.syncQueue.length, '条记录')
      
      // 模拟同步过程
      for (const item of this.syncQueue) {
        await this.syncToServer(item.key, item.data)
      }

      // 清空同步队列
      this.syncQueue = []
      this.saveOfflineQueue()
      
      // 更新最后同步时间
      this.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString())
      
      console.log('离线数据同步完成')
    } catch (error) {
      console.error('同步离线数据失败:', error)
    }
  }

  /**
   * 同步到服务器（模拟）
   */
  private async syncToServer(key: string, data: any): Promise<void> {
    // 这里实现实际的服务器同步逻辑
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`同步数据到服务器: ${key}`)
        resolve()
      }, 100)
    })
  }

  /**
   * 导出数据
   */
  exportData(): string {
    const data: Record<string, any> = {}
    
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = this.getItem(key)
      if (item) {
        data[key] = item
      }
    })

    return JSON.stringify(data, null, 2)
  }

  /**
   * 导入数据
   */
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData)
      
      Object.entries(data).forEach(([key, value]) => {
        if (Object.values(STORAGE_KEYS).includes(key as any)) {
          this.setItem(key, value)
        }
      })
      
      console.log('数据导入成功')
    } catch (error) {
      console.error('数据导入失败:', error)
      throw new Error('数据格式错误')
    }
  }
}

// 创建存储管理器实例
const storageManager = new StorageManager()

/**
 * 用户相关存储操作
 */
export const userStorage = {
  // 保存用户资料
  saveProfile(profile: UserProfile): void {
    storageManager.setItem(STORAGE_KEYS.USER_PROFILE, profile)
  },

  // 获取用户资料
  getProfile(): UserProfile | null {
    return storageManager.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE)
  },

  // 更新用户资料
  updateProfile(updates: Partial<UserProfile>): void {
    const profile = this.getProfile()
    if (profile) {
      const updatedProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date()
      }
      this.saveProfile(updatedProfile)
    }
  }
}

/**
 * 学习进度相关存储操作
 */
export const progressStorage = {
  // 保存学习进度
  saveProgress(progress: LearningProgress): void {
    storageManager.setItem(STORAGE_KEYS.LEARNING_PROGRESS, progress)
  },

  // 获取学习进度
  getProgress(): LearningProgress | null {
    return storageManager.getItem<LearningProgress>(STORAGE_KEYS.LEARNING_PROGRESS)
  },

  // 更新学习进度
  updateProgress(updates: Partial<LearningProgress>): void {
    const progress = this.getProgress()
    if (progress) {
      const updatedProgress = { ...progress, ...updates }
      this.saveProgress(updatedProgress)
    }
  },

  // 添加积分
  addPoints(points: number): void {
    const progress = this.getProgress()
    if (progress) {
      progress.totalPoints += points
      // 检查是否升级
      const newLevel = Math.floor(progress.totalPoints / 1000) + 1
      if (newLevel > progress.level) {
        progress.level = newLevel
        // 触发升级事件
        window.dispatchEvent(new CustomEvent('levelUp', { detail: { newLevel } }))
      }
      this.saveProgress(progress)
    }
  },

  // 更新连续学习天数
  updateStreak(): void {
    const progress = this.getProgress()
    if (progress) {
      const today = new Date().toDateString()
      const lastStudy = new Date(progress.lastStudyDate).toDateString()
      
      if (today !== lastStudy) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
        
        if (lastStudy === yesterday) {
          progress.consecutiveDays += 1
        } else {
          progress.consecutiveDays = 1
        }
        
        progress.lastStudyDate = new Date()
        this.saveProgress(progress)
      }
    }
  }
}

/**
 * 学习会话相关存储操作
 */
export const sessionStorage = {
  // 保存学习会话
  saveSession(session: StudySession): void {
    const sessions = this.getSessions()
    sessions.push(session)
    storageManager.setItem(STORAGE_KEYS.STUDY_SESSIONS, sessions)
  },

  // 获取所有学习会话
  getSessions(): StudySession[] {
    return storageManager.getItem<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS) || []
  },

  // 获取今日学习会话
  getTodaySessions(): StudySession[] {
    const sessions = this.getSessions()
    const today = new Date().toDateString()
    
    return sessions.filter(session => 
      new Date(session.startTime).toDateString() === today
    )
  },

  // 获取学习统计
  getStudyStats(days: number = 7): {
    totalTime: number
    totalSessions: number
    averageScore: number
    pointsEarned: number
  } {
    const sessions = this.getSessions()
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    const recentSessions = sessions.filter(session => 
      new Date(session.startTime) >= cutoffDate
    )

    const totalTime = recentSessions.reduce((sum, session) => sum + session.duration, 0)
    const totalSessions = recentSessions.length
    const averageScore = totalSessions > 0 
      ? recentSessions.reduce((sum, session) => sum + session.score, 0) / totalSessions 
      : 0
    const pointsEarned = recentSessions.reduce((sum, session) => sum + session.pointsEarned, 0)

    return {
      totalTime,
      totalSessions,
      averageScore,
      pointsEarned
    }
  }
}

/**
 * 学习目标相关存储操作
 */
export const goalStorage = {
  // 保存学习目标
  saveGoal(goal: LearningGoal): void {
    const goals = this.getGoals()
    const existingIndex = goals.findIndex(g => g.id === goal.id)
    
    if (existingIndex >= 0) {
      goals[existingIndex] = goal
    } else {
      goals.push(goal)
    }
    
    storageManager.setItem(STORAGE_KEYS.LEARNING_GOALS, goals)
  },

  // 获取所有学习目标
  getGoals(): LearningGoal[] {
    return storageManager.getItem<LearningGoal[]>(STORAGE_KEYS.LEARNING_GOALS) || []
  },

  // 获取活跃目标
  getActiveGoals(): LearningGoal[] {
    const goals = this.getGoals()
    return goals.filter(goal => !goal.completed && new Date(goal.deadline) > new Date())
  },

  // 更新目标进度
  updateGoalProgress(goalId: string, progress: number): void {
    const goals = this.getGoals()
    const goal = goals.find(g => g.id === goalId)
    
    if (goal) {
      goal.currentValue = Math.min(progress, goal.targetValue)
      goal.completed = goal.currentValue >= goal.targetValue
      
      if (goal.completed) {
        // 触发目标完成事件
        window.dispatchEvent(new CustomEvent('goalCompleted', { detail: { goal } }))
      }
      
      storageManager.setItem(STORAGE_KEYS.LEARNING_GOALS, goals)
    }
  },

  // 删除目标
  deleteGoal(goalId: string): void {
    const goals = this.getGoals()
    const filteredGoals = goals.filter(g => g.id !== goalId)
    storageManager.setItem(STORAGE_KEYS.LEARNING_GOALS, filteredGoals)
  }
}

/**
 * 通知设置相关存储操作
 */
export const notificationStorage = {
  // 保存通知设置
  saveSettings(settings: NotificationSettings): void {
    storageManager.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, settings)
  },

  // 获取通知设置
  getSettings(): NotificationSettings {
    return storageManager.getItem<NotificationSettings>(STORAGE_KEYS.NOTIFICATION_SETTINGS) || {
      studyReminder: true,
      achievementNotification: true,
      systemMessage: true,
      soundAlert: false,
      reminderTime: '19:00',
      dailyGoalReminder: true
    }
  },

  // 更新通知设置
  updateSettings(updates: Partial<NotificationSettings>): void {
    const settings = this.getSettings()
    const updatedSettings = { ...settings, ...updates }
    this.saveSettings(updatedSettings)
  }
}

// 导出存储管理器和工具函数
export { storageManager, STORAGE_KEYS }

// 导出便捷方法
export const storage = {
  user: userStorage,
  progress: progressStorage,
  session: sessionStorage,
  goal: goalStorage,
  notification: notificationStorage,
  
  // 通用方法
  clear: () => storageManager.clear(),
  export: () => storageManager.exportData(),
  import: (data: string) => storageManager.importData(data),
  getSize: () => storageManager.getStorageSize()
}

export default storage