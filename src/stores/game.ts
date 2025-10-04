import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { GameLevel, GameProgress, GameSession, GameQuestion } from '@/types'

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

  return {
    levels,
    progress,
    currentSession,
    loading,
    completedLevels,
    totalPoints,
    totalStars,
    fetchLevels,
    fetchProgress,
    startGameSession,
    answerQuestion,
    nextQuestion,
    completeGame,
    isLevelUnlocked,
    getLevelProgress
  }
})