import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage, STORAGE_KEYS } from '@/utils/storage'
import type { GameLevel, GameProgress, GameSession, GameQuestion } from '@/types'

// 学习进度分析接口
interface LearningAnalytics {
  totalStudyTime: number
  averageScore: number
  completionRate: number
  skillProgress: {
    listening: number
    speaking: number
    reading: number
    writing: number
  }
  weeklyProgress: Array<{
    date: string
    studyTime: number
    score: number
    completedLevels: number
  }>
  knowledgePoints: Array<{
    id: string
    name: string
    category: string
    masteryLevel: number
    practiceCount: number
    lastPracticed: string
  }>
}

export const useGameStore = defineStore('game', () => {
  const levels = ref<GameLevel[]>([
    // 添加一些模拟关卡数据
    {
      id: '1',
      name: '基础单词学习',
      title: '基础单词学习',
      description: '学习日常生活中的基础英语单词',
      difficulty: 'easy',
      category: 'vocabulary',
      unlock_points: 0,
      max_stars: 3,
      maxScore: 100,
      points: 20,
      totalQuestions: 10,
      estimatedTime: 15,
      locked: false,
      content: {
        words: ['apple', 'ball', 'cat', 'dog', 'elephant']
      }
    },
    {
      id: '2', 
      name: '语法基础',
      title: '语法基础',
      description: '学习基本的英语语法规则',
      difficulty: 'medium',
      category: 'grammar',
      unlock_points: 50,
      max_stars: 3,
      maxScore: 100,
      points: 30,
      totalQuestions: 8,
      estimatedTime: 20,
      locked: false,
      content: {}
    }
  ])
  
  const progress = ref<GameProgress[]>([
    {
      id: '1',
      student_id: 'demo-student',
      level_id: '1',
      levelId: '1',
      stars_earned: 2,
      stars: 2,
      points_earned: 80,
      score: 80,
      completed_at: new Date().toISOString(),
      attempts: 1
    }
  ])
  
  const currentSession = ref<GameSession | null>(null)
  const loading = ref(false)
  
  // 学习分析数据
  const learningAnalytics = ref<LearningAnalytics>({
    totalStudyTime: 0,
    averageScore: 0,
    completionRate: 0,
    skillProgress: {
      listening: 0,
      speaking: 0,
      reading: 0,
      writing: 0
    },
    weeklyProgress: [],
    knowledgePoints: []
  })
  
  // 学习会话记录
  const studySessions = ref<Array<{
    id: string
    date: string
    duration: number
    score: number
    levelId: string
    skillType: 'listening' | 'speaking' | 'reading' | 'writing'
    completedQuestions: number
    correctAnswers: number
  }>>([])
  
  // 知识点掌握记录
  const knowledgeMastery = ref<Map<string, {
    id: string
    name: string
    category: string
    masteryLevel: number
    practiceCount: number
    correctCount: number
    lastPracticed: string
    difficulty: 'easy' | 'medium' | 'hard'
  }>>(new Map())

  const completedLevels = computed(() => 
    progress.value.filter(p => p.stars_earned > 0)
  )

  const totalPoints = computed(() => 
    progress.value.reduce((sum, p) => sum + p.points_earned, 0)
  )

  const totalStars = computed(() => 
    progress.value.reduce((sum, p) => sum + p.stars_earned, 0)
  )

  // 获取所有关卡
  const fetchLevels = async () => {
    loading.value = true
    try {
      // 使用模拟数据，不需要实际的API调用
      await new Promise(resolve => setTimeout(resolve, 500)) // 模拟网络延迟
    } catch (error) {
      console.error('获取关卡失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取学生进度
  const fetchProgress = async (studentId: string) => {
    try {
      // 使用模拟数据，不需要实际的API调用
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      console.error('获取进度失败:', error)
    }
  }

  // 开始游戏会话
  const startGameSession = async (levelId: string) => {
    const level = levels.value.find(l => l.id === levelId)
    if (!level) return

    // 根据关卡内容生成题目
    const questions = generateQuestions(level)
    
    currentSession.value = {
      level_id: levelId,
      questions,
      current_question: 0,
      score: 0,
      stars: 0,
      start_time: new Date()
    }
    
    return currentSession.value
  }

  // 生成题目（模拟数据）
  const generateQuestions = (level: GameLevel): GameQuestion[] => {
    const questions: GameQuestion[] = []
    
    if (level.category === 'vocabulary') {
      // 词汇题目
      const words = level.content?.words || ['apple', 'ball', 'cat']
      words.forEach((word: string, index: number) => {
        questions.push({
          id: `q${index}`,
          question: `What is the meaning of "${word}"?`,
          options: ['苹果', '球', '猫', '狗'],
          correct_answer: '苹果',
          type: 'multiple_choice'
        })
      })
    } else if (level.category === 'grammar') {
      // 语法题目
      questions.push({
        id: 'g1',
        question: 'Choose the correct form: I ___ a student.',
        options: ['am', 'is', 'are', 'be'],
        correct_answer: 'am',
        type: 'multiple_choice'
      })
    }
    
    return questions.slice(0, 5) // 限制题目数量
  }

  // 回答问题
  const answerQuestion = (answer: string) => {
    if (!currentSession.value) return false
    
    const session = currentSession.value
    const question = session.questions[session.current_question]
    const isCorrect = answer === question.correct_answer
    
    if (isCorrect) {
      session.score += 20
    }
    
    return isCorrect
  }

  // 下一题
  const nextQuestion = () => {
    if (!currentSession.value) return false
    
    currentSession.value.current_question++
    return currentSession.value.current_question < currentSession.value.questions.length
  }

  // 完成游戏
  const completeGame = async (studentId: string) => {
    if (!currentSession.value) return
    
    const session = currentSession.value
    const stars = Math.min(3, Math.floor(session.score / 60)) // 根据分数计算星级
    
    try {
      // 模拟保存进度
      const existingProgressIndex = progress.value.findIndex(p => p.level_id === session.level_id)
      const newProgress = {
        id: existingProgressIndex >= 0 ? progress.value[existingProgressIndex].id : Date.now().toString(),
        student_id: studentId,
        level_id: session.level_id,
        levelId: session.level_id,
        stars_earned: stars,
        stars: stars,
        points_earned: session.score,
        score: session.score,
        completed_at: new Date().toISOString(),
        attempts: 1
      }
      
      if (existingProgressIndex >= 0) {
        progress.value[existingProgressIndex] = newProgress
      } else {
        progress.value.push(newProgress)
      }
      
      currentSession.value = null
      
      return { stars, score: session.score }
    } catch (error) {
      console.error('保存游戏进度失败:', error)
      throw error
    }
  }

  // 检查关卡是否解锁
  const isLevelUnlocked = (level: GameLevel) => {
    return totalPoints.value >= level.unlock_points
  }

  // 获取关卡进度
  const getLevelProgress = (levelId: string) => {
    return progress.value.find(p => p.level_id === levelId || p.levelId === levelId)
  }

  // 记录学习会话
  const recordStudySession = (sessionData: {
    levelId: string
    duration: number
    score: number
    skillType: 'listening' | 'speaking' | 'reading' | 'writing'
    completedQuestions: number
    correctAnswers: number
  }) => {
    const session = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...sessionData
    }
    
    studySessions.value.push(session)
    
    // 更新学习分析数据
    updateLearningAnalytics()
    
    // 保存到本地存储
    storage.setItem('study_sessions', studySessions.value)
  }
  
  // 更新知识点掌握度
  const updateKnowledgeMastery = (knowledgePointId: string, isCorrect: boolean, knowledgeData?: {
    name: string
    category: string
    difficulty: 'easy' | 'medium' | 'hard'
  }) => {
    const existing = knowledgeMastery.value.get(knowledgePointId)
    
    if (existing) {
      existing.practiceCount++
      if (isCorrect) existing.correctCount++
      existing.lastPracticed = new Date().toISOString()
      existing.masteryLevel = Math.min(100, (existing.correctCount / existing.practiceCount) * 100)
    } else if (knowledgeData) {
      knowledgeMastery.value.set(knowledgePointId, {
        id: knowledgePointId,
        name: knowledgeData.name,
        category: knowledgeData.category,
        difficulty: knowledgeData.difficulty,
        practiceCount: 1,
        correctCount: isCorrect ? 1 : 0,
        lastPracticed: new Date().toISOString(),
        masteryLevel: isCorrect ? 100 : 0
      })
    }
    
    // 保存到本地存储
    storage.setItem('knowledge_mastery', Array.from(knowledgeMastery.value.entries()))
  }
  
  // 更新学习分析数据
  const updateLearningAnalytics = () => {
    const sessions = studySessions.value
    const totalSessions = sessions.length
    
    if (totalSessions === 0) return
    
    // 计算总学习时间（分钟）
    learningAnalytics.value.totalStudyTime = sessions.reduce((sum, s) => sum + s.duration, 0)
    
    // 计算平均分数
    learningAnalytics.value.averageScore = sessions.reduce((sum, s) => sum + s.score, 0) / totalSessions
    
    // 计算完成率
    const totalQuestions = sessions.reduce((sum, s) => sum + s.completedQuestions, 0)
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0)
    learningAnalytics.value.completionRate = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
    
    // 计算技能进度
    const skillSessions = {
      listening: sessions.filter(s => s.skillType === 'listening'),
      speaking: sessions.filter(s => s.skillType === 'speaking'),
      reading: sessions.filter(s => s.skillType === 'reading'),
      writing: sessions.filter(s => s.skillType === 'writing')
    }
    
    Object.keys(skillSessions).forEach(skill => {
      const skillSessionList = skillSessions[skill as keyof typeof skillSessions]
      if (skillSessionList.length > 0) {
        const avgScore = skillSessionList.reduce((sum, s) => sum + s.score, 0) / skillSessionList.length
        learningAnalytics.value.skillProgress[skill as keyof typeof learningAnalytics.value.skillProgress] = avgScore
      }
    })
    
    // 生成周进度数据
    generateWeeklyProgress()
    
    // 更新知识点数据
    updateKnowledgePointsAnalytics()
  }
  
  // 生成周进度数据
  const generateWeeklyProgress = () => {
    const weeklyData: { [key: string]: { studyTime: number; score: number; completedLevels: number; sessions: number } } = {}
    
    studySessions.value.forEach(session => {
      const date = session.date
      if (!weeklyData[date]) {
        weeklyData[date] = { studyTime: 0, score: 0, completedLevels: 0, sessions: 0 }
      }
      
      weeklyData[date].studyTime += session.duration
      weeklyData[date].score += session.score
      weeklyData[date].sessions++
      if (session.score >= 80) { // 假设80分以上算完成关卡
        weeklyData[date].completedLevels++
      }
    })
    
    learningAnalytics.value.weeklyProgress = Object.entries(weeklyData)
      .map(([date, data]) => ({
        date,
        studyTime: data.studyTime,
        score: data.sessions > 0 ? data.score / data.sessions : 0,
        completedLevels: data.completedLevels
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7) // 最近7天
  }
  
  // 更新知识点分析数据
  const updateKnowledgePointsAnalytics = () => {
    learningAnalytics.value.knowledgePoints = Array.from(knowledgeMastery.value.values())
      .map(point => ({
        id: point.id,
        name: point.name,
        category: point.category,
        masteryLevel: point.masteryLevel,
        practiceCount: point.practiceCount,
        lastPracticed: point.lastPracticed
      }))
  }
  
  // 获取学习建议
  const getLearningRecommendations = () => {
    const recommendations: Array<{
      type: 'skill' | 'knowledge' | 'time'
      title: string
      description: string
      priority: 'high' | 'medium' | 'low'
    }> = []
    
    // 基于技能进度的建议
    const skillProgress = learningAnalytics.value.skillProgress
    const weakestSkill = Object.entries(skillProgress).reduce((min, [skill, score]) => 
      score < min.score ? { skill, score } : min, 
      { skill: '', score: 100 }
    )
    
    if (weakestSkill.score < 70) {
      recommendations.push({
        type: 'skill',
        title: `加强${weakestSkill.skill === 'listening' ? '听力' : 
                    weakestSkill.skill === 'speaking' ? '口语' :
                    weakestSkill.skill === 'reading' ? '阅读' : '写作'}练习`,
        description: `您的${weakestSkill.skill === 'listening' ? '听力' : 
                         weakestSkill.skill === 'speaking' ? '口语' :
                         weakestSkill.skill === 'reading' ? '阅读' : '写作'}成绩较低，建议多做相关练习`,
        priority: 'high'
      })
    }
    
    // 基于知识点掌握度的建议
    const weakKnowledgePoints = Array.from(knowledgeMastery.value.values())
      .filter(point => point.masteryLevel < 60)
      .sort((a, b) => a.masteryLevel - b.masteryLevel)
      .slice(0, 3)
    
    weakKnowledgePoints.forEach(point => {
      recommendations.push({
        type: 'knowledge',
        title: `复习${point.name}`,
        description: `该知识点掌握度较低（${Math.round(point.masteryLevel)}%），建议重点复习`,
        priority: point.masteryLevel < 40 ? 'high' : 'medium'
      })
    })
    
    // 基于学习时间的建议
    const recentSessions = studySessions.value.filter(s => {
      const sessionDate = new Date(s.date)
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      return sessionDate >= threeDaysAgo
    })
    
    if (recentSessions.length === 0) {
      recommendations.push({
        type: 'time',
        title: '保持学习习惯',
        description: '您已经3天没有学习了，建议每天至少学习15分钟',
        priority: 'high'
      })
    } else if (recentSessions.length < 3) {
      recommendations.push({
        type: 'time',
        title: '增加学习频率',
        description: '建议每天都进行学习，保持良好的学习习惯',
        priority: 'medium'
      })
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
  
  // 初始化数据
  const initializeData = () => {
    // 从本地存储加载数据
    const savedSessions = storage.getItem('study_sessions')
    if (savedSessions) {
      studySessions.value = savedSessions
    }
    
    const savedMastery = storage.getItem('knowledge_mastery')
    if (savedMastery) {
      knowledgeMastery.value = new Map(savedMastery)
    }
    
    // 更新分析数据
    updateLearningAnalytics()
  }

  // 获取学习统计数据
  const getLearningStatistics = () => {
    const sessions = studySessions.value
    const totalSessions = sessions.length
    
    if (totalSessions === 0) {
      return {
        totalSessions: 0,
        totalStudyTime: 0,
        averageScore: 0,
        bestScore: 0,
        completionRate: 0,
        streakDays: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        skillDistribution: {
          listening: 0,
          speaking: 0,
          reading: 0,
          writing: 0
        },
        difficultyDistribution: {
          easy: 0,
          medium: 0,
          hard: 0
        },
        monthlyProgress: []
      }
    }
    
    // 基础统计
    const totalStudyTime = sessions.reduce((sum, s) => sum + s.duration, 0)
    const totalScore = sessions.reduce((sum, s) => sum + s.score, 0)
    const bestScore = Math.max(...sessions.map(s => s.score))
    const totalQuestions = sessions.reduce((sum, s) => sum + s.completedQuestions, 0)
    const correctAnswers = sessions.reduce((sum, s) => sum + s.correctAnswers, 0)
    
    // 技能分布统计
    const skillDistribution = {
      listening: sessions.filter(s => s.skillType === 'listening').length,
      speaking: sessions.filter(s => s.skillType === 'speaking').length,
      reading: sessions.filter(s => s.skillType === 'reading').length,
      writing: sessions.filter(s => s.skillType === 'writing').length
    }
    
    // 难度分布（基于分数推断）
    const difficultyDistribution = {
      easy: sessions.filter(s => s.score >= 80).length,
      medium: sessions.filter(s => s.score >= 60 && s.score < 80).length,
      hard: sessions.filter(s => s.score < 60).length
    }
    
    // 计算连续学习天数
    const streakDays = calculateStreakDays()
    
    // 月度进度
    const monthlyProgress = generateMonthlyProgress()
    
    return {
      totalSessions,
      totalStudyTime: Math.round(totalStudyTime / 60), // 转换为分钟
      averageScore: Math.round(totalScore / totalSessions),
      bestScore,
      completionRate: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
      streakDays,
      totalQuestions,
      correctAnswers,
      skillDistribution,
      difficultyDistribution,
      monthlyProgress
    }
  }
  
  // 计算连续学习天数
  const calculateStreakDays = (): number => {
    const sessions = studySessions.value
    if (sessions.length === 0) return 0
    
    const uniqueDates = [...new Set(sessions.map(s => s.date))].sort()
    let streak = 0
    
    // 从今天开始往前计算
    let currentDate = new Date()
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      if (uniqueDates.includes(dateStr)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }
  
  // 生成月度进度数据
  const generateMonthlyProgress = () => {
    const monthlyData: { [key: string]: { studyTime: number; score: number; sessions: number } } = {}
    
    studySessions.value.forEach(session => {
      const month = session.date.substring(0, 7) // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { studyTime: 0, score: 0, sessions: 0 }
      }
      
      monthlyData[month].studyTime += session.duration
      monthlyData[month].score += session.score
      monthlyData[month].sessions++
    })
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        studyTime: Math.round(data.studyTime / 60), // 转换为分钟
        averageScore: Math.round(data.score / data.sessions),
        sessions: data.sessions
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // 最近6个月
  }
  
  // 导出学习报告
  const exportLearningReport = () => {
    try {
      const statistics = getLearningStatistics()
      const analytics = learningAnalytics.value
      const recommendations = getLearningRecommendations()
      const knowledgePointsArray = Array.from(knowledgeMastery.value.values())
      
      const report = {
        generatedAt: new Date().toISOString(),
        period: {
          start: studySessions.value.length > 0 ? studySessions.value[0].date : null,
          end: studySessions.value.length > 0 ? studySessions.value[studySessions.value.length - 1].date : null
        },
        summary: {
          totalStudyTime: statistics.totalStudyTime,
          totalSessions: statistics.totalSessions,
          averageScore: statistics.averageScore,
          bestScore: statistics.bestScore,
          completionRate: statistics.completionRate,
          streakDays: statistics.streakDays
        },
        skillAnalysis: {
          progress: analytics.skillProgress,
          distribution: statistics.skillDistribution,
          recommendations: recommendations.filter(r => r.type === 'skill')
        },
        knowledgeAnalysis: {
          totalPoints: knowledgePointsArray.length,
          masteredPoints: knowledgePointsArray.filter(p => p.masteryLevel >= 80).length,
          weakPoints: knowledgePointsArray.filter(p => p.masteryLevel < 60).length,
          averageMastery: knowledgePointsArray.length > 0 
            ? Math.round(knowledgePointsArray.reduce((sum, p) => sum + p.masteryLevel, 0) / knowledgePointsArray.length)
            : 0,
          recommendations: recommendations.filter(r => r.type === 'knowledge')
        },
        progressTrends: {
          weekly: analytics.weeklyProgress,
          monthly: statistics.monthlyProgress
        },
        recommendations: recommendations
      }
      
      // 生成可下载的JSON文件
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `learning-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      return report
    } catch (error) {
      console.error('导出学习报告失败:', error)
      throw new Error('导出学习报告失败')
    }
  }
  
  // 获取知识点详细分析
  const getKnowledgePointAnalysis = (pointId?: string) => {
    try {
      if (pointId) {
        const point = knowledgeMastery.value.get(pointId)
        if (!point) return null
        
        return {
          ...point,
          accuracy: point.practiceCount > 0 ? Math.round((point.correctCount / point.practiceCount) * 100) : 0,
          needsReview: point.masteryLevel < 60,
          lastPracticedDays: Math.floor((Date.now() - new Date(point.lastPracticed).getTime()) / (1000 * 60 * 60 * 24))
        }
      }
      
      // 返回所有知识点的分析
      const points = Array.from(knowledgeMastery.value.values())
      return {
        total: points.length,
        mastered: points.filter(p => p.masteryLevel >= 80).length,
        learning: points.filter(p => p.masteryLevel >= 60 && p.masteryLevel < 80).length,
        weak: points.filter(p => p.masteryLevel < 60).length,
        byCategory: points.reduce((acc, point) => {
          if (!acc[point.category]) {
            acc[point.category] = { total: 0, mastered: 0, average: 0 }
          }
          acc[point.category].total++
          if (point.masteryLevel >= 80) acc[point.category].mastered++
          acc[point.category].average += point.masteryLevel
          return acc
        }, {} as Record<string, { total: number; mastered: number; average: number }>),
        recentlyPracticed: points
          .sort((a, b) => new Date(b.lastPracticed).getTime() - new Date(a.lastPracticed).getTime())
          .slice(0, 5),
        needsReview: points
          .filter(p => p.masteryLevel < 60)
          .sort((a, b) => a.masteryLevel - b.masteryLevel)
          .slice(0, 10)
      }
    } catch (error) {
      console.error('获取知识点分析失败:', error)
      return null
    }
  }
  
  // 重置学习数据
  const resetLearningData = () => {
    try {
      studySessions.value = []
      knowledgeMastery.value.clear()
      learningAnalytics.value = {
        totalStudyTime: 0,
        averageScore: 0,
        completionRate: 0,
        skillProgress: {
          listening: 0,
          speaking: 0,
          reading: 0,
          writing: 0
        },
        weeklyProgress: [],
        knowledgePoints: []
      }
      
      // 清除本地存储
      storage.removeItem('study_sessions')
      storage.removeItem('knowledge_mastery')
      
      return true
    } catch (error) {
      console.error('重置学习数据失败:', error)
      return false
    }
  }

  return {
    // 状态
    levels,
    progress,
    currentSession,
    loading,
    learningAnalytics,
    studySessions,
    knowledgeMastery,
    
    // 计算属性
    completedLevels,
    totalPoints,
    totalStars,
    
    // 基础方法
    fetchLevels,
    fetchProgress,
    startGameSession,
    answerQuestion,
    nextQuestion,
    completeGame,
    isLevelUnlocked,
    getLevelProgress,
    
    // 分析方法
    recordStudySession,
    updateKnowledgeMastery,
    updateLearningAnalytics,
    getLearningRecommendations,
    getLearningStatistics,
    getKnowledgePointAnalysis,
    exportLearningReport,
    resetLearningData,
    initializeData
  }
})