<template>
  <div class="games-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <Gamepad2 class="w-8 h-8 mr-3 text-blue-500" />
            游戏化学习
          </h1>
          <p class="page-subtitle">在游戏中快乐学习英语</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <Trophy class="w-5 h-5 text-yellow-500" />
            <span class="stat-value">{{ totalPoints }}</span>
            <span class="stat-label">积分</span>
          </div>
          <div class="stat-item">
            <Star class="w-5 h-5 text-orange-500" />
            <span class="stat-value">{{ totalStars }}</span>
            <span class="stat-label">星星</span>
          </div>
          <div class="stat-item">
            <Flame class="w-5 h-5 text-red-500" />
            <span class="stat-value">{{ streakDays }}</span>
            <span class="stat-label">连续天数</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏关卡选择 -->
    <div class="games-content">
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :sm="12" :lg="8" v-for="level in availableLevels" :key="level.id">
          <a-card 
            class="game-level-card"
            :class="{ 
              'locked': !isLevelUnlocked(level),
              'completed': isLevelCompleted(level),
              'current': isCurrentLevel(level)
            }"
            hoverable
            @click="selectLevel(level)"
          >
            <template #cover>
              <div class="level-cover">
                <div class="level-icon">
                  <component :is="getLevelIcon(level.category)" class="w-12 h-12" />
                </div>
                <div class="level-status">
                  <Lock v-if="!isLevelUnlocked(level)" class="w-5 h-5 text-gray-400" />
                  <CheckCircle v-else-if="isLevelCompleted(level)" class="w-5 h-5 text-green-500" />
                  <Play v-else class="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </template>
            
            <a-card-meta 
              :title="level.name"
              :description="level.description"
            />
            
            <div class="level-info">
              <div class="difficulty-badge">
                <a-tag :color="getDifficultyColor(level.difficulty)">
                  {{ getDifficultyText(level.difficulty) }}
                </a-tag>
              </div>
              <div class="level-progress">
                <div class="progress-stars">
                  <Star 
                    v-for="i in 3" 
                    :key="i"
                    class="w-4 h-4"
                    :class="i <= getLevelStars(level) ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                  />
                </div>
                <div class="progress-text">
                  {{ getLevelProgress(level) }}%
                </div>
              </div>
            </div>
            
            <div class="level-rewards" v-if="level.rewards">
              <div class="reward-item" v-for="reward in level.rewards" :key="reward.type">
                <component :is="getRewardIcon(reward.type)" class="w-4 h-4" />
                <span>{{ reward.amount }}</span>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 游戏界面模态框 -->
    <a-modal
      v-model:open="showGameInterface"
      title="游戏进行中"
      width="90%"
      :footer="null"
      :closable="false"
      :mask-closable="false"
      class="game-modal"
    >
      <GameInterface
        v-if="selectedLevel"
        :level="selectedLevel"
        @game-complete="handleGameComplete"
        @game-exit="handleGameExit"
      />
    </a-modal>

    <!-- 成就解锁提示 -->
    <a-modal
      v-model:open="showAchievementModal"
      title="🎉 恭喜解锁新成就！"
      width="400px"
      :footer="null"
      centered
    >
      <div class="achievement-content" v-if="newAchievement">
        <div class="achievement-icon">
          <component :is="newAchievement.icon" class="w-16 h-16" :style="{ color: newAchievement.color }" />
        </div>
        <h3 class="achievement-name">{{ newAchievement.name }}</h3>
        <p class="achievement-description">{{ newAchievement.description }}</p>
        <div class="achievement-reward">
          <Trophy class="w-5 h-5 text-yellow-500" />
          <span>获得 {{ newAchievement.points }} 积分</span>
        </div>
      </div>
    </a-modal>

    <!-- 音效和动画组件 -->
    <SoundEffects ref="soundEffectsRef" />
    <RewardAnimation 
      ref="rewardAnimationRef"
      @animation-complete="onRewardAnimationComplete"
    />
    <FloatingElements
      :show-confetti="showConfetti"
      :show-stars="showStars"
      :show-notes="showNotes"
      :show-gifts="false"
      :count="12"
      :duration="3000"
      :intensity="0.8"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useGameStore } from '@/stores/game'
import GameInterface from '@/components/GameInterface.vue'
import SoundEffects from '@/components/animations/SoundEffects.vue'
import RewardAnimation from '@/components/animations/RewardAnimation.vue'
import FloatingElements from '@/components/animations/FloatingElements.vue'
import {
  Gamepad2,
  Trophy,
  Star,
  Flame,
  Lock,
  CheckCircle,
  Play,
  BookOpen,
  Headphones,
  MessageSquare,
  PenTool,
  Target,
  Zap,
  Award,
  Gift,
  Coins
} from 'lucide-vue-next'

const router = useRouter()
const gameStore = useGameStore()

// 响应式数据
const showGameInterface = ref(false)
const selectedLevel = ref(null)
const showAchievementModal = ref(false)
const newAchievement = ref(null)
const showConfetti = ref(false)
const showStars = ref(false)
const showNotes = ref(false)

// 音效和动画引用
const soundEffectsRef = ref()
const rewardAnimationRef = ref()

// 计算属性
const availableLevels = computed(() => gameStore.levels)
const totalPoints = computed(() => gameStore.totalPoints)
const totalStars = computed(() => gameStore.totalStars)
const streakDays = computed(() => {
  // 计算连续学习天数
  const sessions = gameStore.studySessions
  if (!sessions.length) return 0
  
  let streak = 0
  const today = new Date()
  const currentDate = new Date(today)
  
  for (let i = 0; i < 30; i++) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const hasSession = sessions.some(session => 
      session.date.startsWith(dateStr) && session.completed
    )
    
    if (hasSession) {
      streak++
    } else if (i > 0) {
      break
    }
    
    currentDate.setDate(currentDate.getDate() - 1)
  }
  
  return streak
})

// 关卡状态检查方法
const isLevelUnlocked = (level: any) => {
  const userPoints = gameStore.totalPoints
  return userPoints >= level.unlock_points
}

const isLevelCompleted = (level: any) => {
  const progress = gameStore.progress.find(p => p.level_id === level.id)
  return progress?.completed || false
}

const isCurrentLevel = (level: any) => {
  return selectedLevel.value?.id === level.id
}

const getLevelStars = (level: any) => {
  const progress = gameStore.progress.find(p => p.level_id === level.id)
  return progress?.stars || 0
}

const getLevelProgress = (level: any) => {
  const progress = gameStore.progress.find(p => p.level_id === level.id)
  return progress?.progress || 0
}

// 图标和样式方法
const getLevelIcon = (category: string) => {
  const iconMap = {
    vocabulary: BookOpen,
    listening: Headphones,
    speaking: MessageSquare,
    writing: PenTool,
    grammar: Target,
    comprehensive: Zap
  }
  return iconMap[category] || BookOpen
}

const getDifficultyColor = (difficulty: string) => {
  const colorMap = {
    easy: 'green',
    medium: 'orange',
    hard: 'red'
  }
  return colorMap[difficulty] || 'blue'
}

const getDifficultyText = (difficulty: string) => {
  const textMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return textMap[difficulty] || '未知'
}

const getRewardIcon = (type: string) => {
  const iconMap = {
    points: Trophy,
    stars: Star,
    badge: Award,
    gift: Gift,
    coins: Coins
  }
  return iconMap[type] || Trophy
}

// 游戏操作方法
const selectLevel = async (level: any) => {
  if (!isLevelUnlocked(level)) {
    message.warning('该关卡尚未解锁！')
    playSound('error')
    return
  }
  
  selectedLevel.value = level
  showGameInterface.value = true
  playSound('click')
}

const handleGameComplete = async (result: any) => {
  showGameInterface.value = false
  
  // 播放完成音效
  playSound('success')
  
  // 显示奖励动画
  if (rewardAnimationRef.value) {
    rewardAnimationRef.value.showScorePopup()
  }
  
  // 显示庆祝效果
  showConfetti.value = true
  showStars.value = true
  
  setTimeout(() => {
    showConfetti.value = false
    showStars.value = false
  }, 3000)
  
  // 更新游戏进度
  await gameStore.updateProgress(selectedLevel.value.id, result)
  
  // 检查是否解锁新成就
  checkForNewAchievements(result)
  
  message.success(`恭喜完成关卡！获得 ${result.points} 积分`)
}

const handleGameExit = () => {
  showGameInterface.value = false
  selectedLevel.value = null
  playSound('click')
}

// 成就检查
const checkForNewAchievements = (result: any) => {
  // 模拟成就检查逻辑
  const achievements = [
    {
      id: 'first_perfect',
      name: '完美表现',
      description: '首次获得满分！',
      icon: Star,
      color: '#ffd700',
      points: 50,
      condition: (result: any) => result.score === 100
    },
    {
      id: 'speed_master',
      name: '速度大师',
      description: '在规定时间内完成挑战！',
      icon: Zap,
      color: '#ff6b35',
      points: 30,
      condition: (result: any) => result.timeBonus > 0
    },
    {
      id: 'streak_warrior',
      name: '连击战士',
      description: '连续答对10题！',
      icon: Flame,
      color: '#ff4757',
      points: 40,
      condition: (result: any) => result.maxStreak >= 10
    }
  ]
  
  for (const achievement of achievements) {
    if (achievement.condition(result)) {
      newAchievement.value = achievement
      showAchievementModal.value = true
      playSound('achievement')
      break
    }
  }
}

// 音效播放
const playSound = (soundType: string) => {
  if (soundEffectsRef.value) {
    soundEffectsRef.value.playSound(soundType)
  }
}

// 动画完成回调
const onRewardAnimationComplete = () => {
  // 动画完成后的处理
}

// 生命周期
onMounted(async () => {
  // 加载游戏数据
  await gameStore.loadGameData()
})
</script>

<style lang="less" scoped>
.games-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;

  .page-header {
    margin-bottom: 32px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.95);
      padding: 24px 32px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      
      .title-section {
        .page-title {
          display: flex;
          align-items: center;
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .page-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
        }
      }
      
      .header-stats {
        display: flex;
        gap: 24px;
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          min-width: 80px;
          
          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
          }
          
          .stat-label {
            font-size: 12px;
            color: #6b7280;
          }
        }
      }
    }
  }

  .games-content {
    .game-level-card {
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      }
      
      &.locked {
        opacity: 0.6;
        cursor: not-allowed;
        
        &:hover {
          transform: none;
        }
      }
      
      &.completed {
        border-color: #10b981;
        background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
      }
      
      &.current {
        border-color: #3b82f6;
        background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
      }
      
      .level-cover {
        position: relative;
        height: 120px;
        background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        
        .level-icon {
          color: #6b7280;
        }
        
        .level-status {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          padding: 8px;
        }
      }
      
      .level-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        
        .level-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .progress-stars {
            display: flex;
            gap: 2px;
          }
          
          .progress-text {
            font-size: 12px;
            color: #6b7280;
          }
        }
      }
      
      .level-rewards {
        display: flex;
        gap: 12px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
        
        .reward-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
        }
      }
    }
  }
}

// 成就模态框样式
.achievement-content {
  text-align: center;
  padding: 24px;
  
  .achievement-icon {
    margin-bottom: 16px;
  }
  
  .achievement-name {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  .achievement-description {
    color: #6b7280;
    margin-bottom: 16px;
  }
  
  .achievement-reward {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: #fef3c7;
    border-radius: 8px;
    color: #92400e;
    font-weight: 500;
  }
}

// 游戏模态框样式
:deep(.game-modal) {
  .ant-modal-content {
    border-radius: 16px;
    overflow: hidden;
  }
  
  .ant-modal-body {
    padding: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .games-page {
    padding: 16px;
    
    .page-header {
      .header-content {
        flex-direction: column;
        gap: 20px;
        padding: 20px;
        
        .header-stats {
          gap: 16px;
          
          .stat-item {
            min-width: 70px;
            padding: 12px;
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .games-page {
    padding: 12px;
    
    .page-header {
      .header-content {
        padding: 16px;
        
        .title-section {
          .page-title {
            font-size: 24px;
          }
        }
        
        .header-stats {
          .stat-item {
            .stat-value {
              font-size: 18px;
            }
          }
        }
      }
    }
  }
}
</style>