<template>
  <div class="home-page">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <a-card class="banner-card">
        <div class="banner-content">
          <div class="banner-text">
            <h1 class="welcome-title">
              <Sparkles class="w-8 h-8 mr-3 text-yellow-500" />
              欢迎来到英语学习乐园！
            </h1>
            <p class="welcome-subtitle">让我们一起开启有趣的英语学习之旅吧！</p>
            <div class="user-greeting" v-if="userInfo.name">
              <span class="greeting-text">你好，{{ userInfo.name }}！</span>
              <span class="level-badge">
                <Crown class="w-4 h-4 mr-1" />
                {{ userInfo.level }} 级学员
              </span>
            </div>
          </div>
          <div class="banner-actions">
            <a-button 
              type="primary" 
              size="large" 
              @click="enhancedStartLearning"
              class="start-btn"
            >
              <Play class="w-5 h-5 mr-2" />
              开始学习
            </a-button>
            <a-button 
              size="large" 
              @click="enhancedTakeAssessment"
              class="assessment-btn"
            >
              <Target class="w-5 h-5 mr-2" />
              能力测评
            </a-button>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 学习统计 -->
    <div class="stats-section">
      <a-row :gutter="[24, 24]">
        <a-col :xs="12" :sm="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon streak">
                <Flame class="w-6 h-6" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ userStats.streak }}</div>
                <div class="stat-label">连续学习天数</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="12" :sm="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon points">
                <Star class="w-6 h-6" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ userStats.totalPoints }}</div>
                <div class="stat-label">总积分</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="12" :sm="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon achievements">
                <Trophy class="w-6 h-6" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ userStats.achievements }}</div>
                <div class="stat-label">获得成就</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="12" :sm="6">
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon time">
                <Clock class="w-6 h-6" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ userStats.studyTime }}</div>
                <div class="stat-label">学习时长(分钟)</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 快速入口 -->
    <div class="quick-access">
      <a-card title="快速开始" class="access-card">
        <a-row :gutter="[16, 16]">
          <a-col :xs="12" :sm="8" :lg="6" v-for="activity in quickActivities" :key="activity.id">
            <div 
              class="activity-card" 
              @click="enhancedStartActivity(activity.id)"
              :class="{ disabled: !activity.unlocked }"
            >
              <div class="activity-icon" :style="{ backgroundColor: activity.color + '20', color: activity.color }">
                <component :is="activity.icon" class="w-8 h-8" />
              </div>
              <div class="activity-content">
                <h3 class="activity-title">{{ activity.title }}</h3>
                <p class="activity-description">{{ activity.description }}</p>
                <div class="activity-meta">
                  <span class="difficulty" :class="activity.difficulty">{{ activity.difficultyText }}</span>
                  <span class="duration">{{ activity.duration }}分钟</span>
                </div>
              </div>
              <div v-if="!activity.unlocked" class="lock-overlay">
                <Lock class="w-6 h-6" />
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 今日推荐 -->
    <div class="daily-recommendations">
      <a-card title="今日推荐" class="recommendations-card">
        <div class="recommendation-list">
          <div 
            class="recommendation-item" 
            v-for="recommendation in dailyRecommendations" 
            :key="recommendation.id"
            @click="enhancedStartRecommendation(recommendation.id)"
          >
            <div class="recommendation-header">
              <div class="recommendation-icon" :style="{ backgroundColor: recommendation.color + '20', color: recommendation.color }">
                <component :is="recommendation.icon" class="w-6 h-6" />
              </div>
              <div class="recommendation-info">
                <h4 class="recommendation-title">{{ recommendation.title }}</h4>
                <p class="recommendation-description">{{ recommendation.description }}</p>
              </div>
              <div class="recommendation-badge">
                <a-tag :color="recommendation.tagColor">{{ recommendation.tag }}</a-tag>
              </div>
            </div>
            <div class="recommendation-progress" v-if="recommendation.progress !== undefined">
              <a-progress 
                :percent="recommendation.progress" 
                size="small" 
                :show-info="false"
                :stroke-color="recommendation.color"
              />
              <span class="progress-text">{{ recommendation.progress }}% 完成</span>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 学习日历 -->
    <div class="study-calendar">
      <a-card title="学习日历" class="calendar-card">
        <div class="calendar-content">
          <a-calendar 
            v-model:value="selectedDate" 
            :fullscreen="false"
            @select="onDateSelect"
          >
            <template #dateCellRender="{ current }">
              <div class="calendar-cell">
                <div 
                  v-if="getStudyData(current)" 
                  class="study-indicator"
                  :class="getStudyLevel(current)"
                >
                  <div class="study-points">{{ getStudyData(current).points }}</div>
                </div>
              </div>
            </template>
          </a-calendar>
        </div>
      </a-card>
    </div>

    <!-- 奖励动画组件 -->
    <RewardAnimation
      ref="rewardAnimationRef"
      :score-gain="rewardPoints"
      :bonus="bonusPoints"
      :streak-count="streakCount"
      :earned-badge="earnedBadge"
      :old-level="oldLevel"
      :new-level="newLevel"
      :is-perfect="isPerfect"
      @animation-complete="onRewardAnimationComplete"
    />

    <!-- 音效组件 -->
    <SoundEffects
      ref="soundEffectsRef"
      :enabled="soundEnabled"
      :volume="soundVolume"
    />

    <!-- 浮动元素 -->
    <FloatingElements
      :show-bubbles="true"
      :show-stars="true"
      :show-hearts="true"
      :show-rainbows="false"
      :show-clouds="true"
      :show-flowers="true"
      :show-notes="true"
      :show-gifts="false"
      :count="8"
      :duration="15000"
      :intensity="0.3"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { storage } from '@/utils/storage'
import RewardAnimation from '@/components/RewardAnimation.vue'
import SoundEffects from '@/components/animations/SoundEffects.vue'
import FloatingElements from '@/components/animations/FloatingElements.vue'
import {
  Sparkles,
  Crown,
  Play,
  Target,
  Flame,
  Star,
  Trophy,
  Clock,
  Lock,
  Headphones,
  Mic,
  BookOpen,
  PenTool,
  Gamepad2,
  Brain,
  Zap,
  Heart
} from 'lucide-vue-next'

const router = useRouter()

// 响应式数据
const selectedDate = ref(new Date())
const activeTab = ref('overview')

// 动画和音效相关数据
const rewardAnimationRef = ref()
const soundEffectsRef = ref()
const rewardPoints = ref(0)
const bonusPoints = ref(0)
const streakCount = ref(0)
const earnedBadge = ref(null)
const oldLevel = ref(1)
const newLevel = ref(1)
const isPerfect = ref(false)
const soundEnabled = ref(true)
const soundVolume = ref(0.7)

// 用户信息
const userInfo = ref({
  name: '小明',
  level: 5,
  avatar: '/avatars/default.png'
})

// 用户统计数据
const userStats = ref({
  streak: 7,
  totalPoints: 1250,
  achievements: 12,
  studyTime: 180
})

// 快速活动
const quickActivities = ref([
  {
    id: 'listening',
    title: '听力练习',
    description: '提升英语听力理解能力',
    icon: Headphones,
    color: '#1890ff',
    difficulty: 'easy',
    difficultyText: '简单',
    duration: 15,
    unlocked: true
  },
  {
    id: 'speaking',
    title: '口语练习',
    description: '练习英语发音和表达',
    icon: Mic,
    color: '#52c41a',
    difficulty: 'medium',
    difficultyText: '中等',
    duration: 20,
    unlocked: true
  },
  {
    id: 'reading',
    title: '阅读理解',
    description: '提高英语阅读能力',
    icon: BookOpen,
    color: '#fa8c16',
    difficulty: 'medium',
    difficultyText: '中等',
    duration: 25,
    unlocked: true
  },
  {
    id: 'writing',
    title: '写作练习',
    description: '提升英语写作技巧',
    icon: PenTool,
    color: '#722ed1',
    difficulty: 'hard',
    difficultyText: '困难',
    duration: 30,
    unlocked: false
  },
  {
    id: 'games',
    title: '趣味游戏',
    description: '在游戏中学习英语',
    icon: Gamepad2,
    color: '#eb2f96',
    difficulty: 'easy',
    difficultyText: '简单',
    duration: 10,
    unlocked: true
  },
  {
    id: 'vocabulary',
    title: '词汇挑战',
    description: '扩展英语词汇量',
    icon: Brain,
    color: '#13c2c2',
    difficulty: 'medium',
    difficultyText: '中等',
    duration: 15,
    unlocked: true
  }
])

// 今日推荐
const dailyRecommendations = ref([
  {
    id: 'daily-word',
    title: '每日单词',
    description: '学习今天的新单词：Adventure',
    icon: Star,
    color: '#faad14',
    tagColor: 'gold',
    tag: '每日必学',
    progress: 0
  },
  {
    id: 'listening-story',
    title: '英语小故事',
    description: '听一个有趣的英语故事',
    icon: Headphones,
    color: '#1890ff',
    tagColor: 'blue',
    tag: '推荐',
    progress: 60
  },
  {
    id: 'grammar-quiz',
    title: '语法小测试',
    description: '测试你的语法掌握程度',
    icon: Zap,
    color: '#52c41a',
    tagColor: 'green',
    tag: '挑战',
    progress: undefined
  }
])

// 学习日历数据
const studyCalendarData = ref({
  '2024-01-15': { points: 50, level: 'high' },
  '2024-01-16': { points: 30, level: 'medium' },
  '2024-01-17': { points: 80, level: 'high' },
  '2024-01-18': { points: 20, level: 'low' },
  '2024-01-19': { points: 60, level: 'high' }
})

// 方法
const playSound = (soundType: string) => {
  if (soundEffectsRef.value && soundEnabled.value) {
    soundEffectsRef.value.playSound(soundType)
  }
}

const showRewardAnimation = (type: string, data: any = {}) => {
  if (rewardAnimationRef.value) {
    switch (type) {
      case 'points':
        rewardPoints.value = data.points || 0
        rewardAnimationRef.value.showScorePopup()
        break
      case 'streak':
        streakCount.value = data.count || 0
        rewardAnimationRef.value.showStreakPopup()
        break
      case 'badge':
        earnedBadge.value = data.badge || null
        rewardAnimationRef.value.showBadgeEarned()
        break
    }
  }
}

const onRewardAnimationComplete = () => {
  rewardPoints.value = 0
  bonusPoints.value = 0
  streakCount.value = 0
  earnedBadge.value = null
  isPerfect.value = false
}

// 增强的方法
const enhancedStartLearning = () => {
  playSound('success')
  showRewardAnimation('points', { points: 10 })
  setTimeout(() => {
    router.push('/games')
  }, 500)
}

const enhancedTakeAssessment = () => {
  playSound('click')
  router.push('/assessment')
}

const enhancedStartActivity = (activityId: string) => {
  const activity = quickActivities.value.find(a => a.id === activityId)
  if (!activity?.unlocked) {
    playSound('error')
    message.warning('该功能尚未解锁，继续学习来解锁更多内容！')
    return
  }
  
  playSound('click')
  message.success(`开始${activity.title}！`)
  
  // 根据活动类型跳转到相应页面
  switch (activityId) {
    case 'games':
      router.push('/games')
      break
    case 'listening':
    case 'speaking':
    case 'reading':
    case 'writing':
      router.push('/assessment')
      break
    default:
      router.push('/games')
  }
}

const enhancedStartRecommendation = (recommendationId: string) => {
  playSound('pop')
  const recommendation = dailyRecommendations.value.find(r => r.id === recommendationId)
  message.success(`开始学习：${recommendation?.title}`)
  
  // 模拟学习进度更新
  if (recommendation && recommendation.progress !== undefined) {
    recommendation.progress = Math.min(100, recommendation.progress + 20)
  }
  
  showRewardAnimation('points', { points: 5 })
}

const onDateSelect = (date: any) => {
  playSound('click')
  selectedDate.value = date
  const studyData = getStudyData(date)
  if (studyData) {
    message.info(`${date.format('YYYY-MM-DD')} 学习了 ${studyData.points} 积分`)
  }
}

const getStudyData = (date: any) => {
  const dateStr = date.format('YYYY-MM-DD')
  return studyCalendarData.value[dateStr]
}

const getStudyLevel = (date: any) => {
  const data = getStudyData(date)
  return data ? data.level : ''
}

// 生命周期
onMounted(() => {
  // 加载用户数据
  loadUserData()
  
  // 播放欢迎音效
  setTimeout(() => {
    playSound('welcome')
  }, 1000)
})

const loadUserData = () => {
  // 从本地存储加载用户数据
  const savedUserInfo = storage.get('userInfo')
  const savedUserStats = storage.get('userStats')
  
  if (savedUserInfo) {
    userInfo.value = { ...userInfo.value, ...savedUserInfo }
  }
  
  if (savedUserStats) {
    userStats.value = { ...userStats.value, ...savedUserStats }
  }
}
</script>

<style scoped lang="less">
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;

  .welcome-banner {
    margin-bottom: 24px;

    .banner-card {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
      border: none;
      border-radius: 16px;
      overflow: hidden;

      .banner-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;

        .banner-text {
          flex: 1;

          .welcome-title {
            font-size: 32px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
          }

          .welcome-subtitle {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 16px;
          }

          .user-greeting {
            display: flex;
            align-items: center;
            gap: 12px;

            .greeting-text {
              font-size: 16px;
              color: rgba(255, 255, 255, 0.95);
            }

            .level-badge {
              display: flex;
              align-items: center;
              background: rgba(255, 255, 255, 0.2);
              padding: 4px 12px;
              border-radius: 20px;
              color: #fff;
              font-size: 14px;
              font-weight: 500;
            }
          }
        }

        .banner-actions {
          display: flex;
          gap: 12px;

          .start-btn {
            background: #52c41a;
            border-color: #52c41a;
            height: 48px;
            padding: 0 24px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 24px;

            &:hover {
              background: #73d13d;
              border-color: #73d13d;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4);
            }
          }

          .assessment-btn {
            height: 48px;
            padding: 0 24px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.3);
            color: #fff;

            &:hover {
              background: rgba(255, 255, 255, 0.3);
              border-color: rgba(255, 255, 255, 0.4);
              transform: translateY(-2px);
            }
          }
        }
      }
    }
  }

  .stats-section {
    margin-bottom: 24px;

    .stat-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 12px;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;

          &.streak {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          }

          &.points {
            background: linear-gradient(135deg, #feca57, #ff9ff3);
          }

          &.achievements {
            background: linear-gradient(135deg, #48dbfb, #0abde3);
          }

          &.time {
            background: linear-gradient(135deg, #1dd1a1, #55a3ff);
          }
        }

        .stat-info {
          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #262626;
            line-height: 1;
          }

          .stat-label {
            font-size: 12px;
            color: #8c8c8c;
            margin-top: 4px;
          }
        }
      }
    }
  }

  .quick-access {
    margin-bottom: 24px;

    .access-card {
      border-radius: 16px;
      border: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

      .activity-card {
        position: relative;
        background: #fff;
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;

        &:hover:not(.disabled) {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border-color: #1890ff;
        }

        &.disabled {
          opacity: 0.6;
          cursor: not-allowed;

          .lock-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            color: #8c8c8c;
          }
        }

        .activity-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .activity-content {
          .activity-title {
            font-size: 16px;
            font-weight: 600;
            color: #262626;
            margin-bottom: 8px;
          }

          .activity-description {
            font-size: 14px;
            color: #8c8c8c;
            margin-bottom: 12px;
            line-height: 1.4;
          }

          .activity-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .difficulty {
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;

              &.easy {
                background: #f6ffed;
                color: #52c41a;
              }

              &.medium {
                background: #fff7e6;
                color: #fa8c16;
              }

              &.hard {
                background: #fff2f0;
                color: #ff4d4f;
              }
            }

            .duration {
              font-size: 12px;
              color: #8c8c8c;
            }
          }
        }
      }
    }
  }

  .daily-recommendations {
    margin-bottom: 24px;

    .recommendations-card {
      border-radius: 16px;
      border: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

      .recommendation-list {
        .recommendation-item {
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;

          &:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: #1890ff;
          }

          &:last-child {
            margin-bottom: 0;
          }

          .recommendation-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;

            .recommendation-icon {
              width: 40px;
              height: 40px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .recommendation-info {
              flex: 1;

              .recommendation-title {
                font-size: 16px;
                font-weight: 600;
                color: #262626;
                margin-bottom: 4px;
              }

              .recommendation-description {
                font-size: 14px;
                color: #8c8c8c;
                margin: 0;
              }
            }

            .recommendation-badge {
              flex-shrink: 0;
            }
          }

          .recommendation-progress {
            display: flex;
            align-items: center;
            gap: 8px;

            .progress-text {
              font-size: 12px;
              color: #8c8c8c;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }

  .study-calendar {
    .calendar-card {
      border-radius: 16px;
      border: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

      .calendar-content {
        .calendar-cell {
          position: relative;

          .study-indicator {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;

            &.low {
              background: #ffe7ba;
            }

            &.medium {
              background: #bae7ff;
            }

            &.high {
              background: #b7eb8f;
            }

            .study-points {
              font-size: 10px;
              font-weight: 600;
              color: #262626;
            }
          }
        }
      }
    }
  }
}

/* 响应式设计 - 平板设备 */
@media (max-width: 1024px) {
  .home-page {
    .quick-access {
      :deep(.ant-row) {
        .ant-col {
          margin-bottom: 16px;
        }
      }
    }

    .daily-recommendations {
      .recommendation-list {
        .recommendation-item {
          .recommendation-header {
            .recommendation-info {
              .recommendation-title {
                font-size: 15px;
              }

              .recommendation-description {
                font-size: 13px;
              }
            }
          }
        }
      }
    }
  }
}

/* 响应式设计 - 手机设备 */
@media (max-width: 768px) {
  .home-page {
    padding: 12px;

    .welcome-banner {
      margin-bottom: 16px;

      .banner-card {
        .banner-content {
          flex-direction: column;
          text-align: center;
          gap: 16px;

          .banner-text {
            .welcome-title {
              font-size: 24px;
              flex-direction: column;
              gap: 8px;
            }

            .welcome-subtitle {
              font-size: 14px;
            }

            .user-greeting {
              .greeting-text {
                font-size: 14px;
              }

              .level-badge {
                font-size: 12px;
                padding: 2px 8px;
              }
            }
          }

          .banner-actions {
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px;

            :deep(.ant-button) {
              flex: 1;
              min-width: 120px;
            }
          }
        }
      }
    }

    .stats-section {
      margin-bottom: 16px;

      :deep(.ant-row) {
        .ant-col {
          margin-bottom: 12px;
        }
      }

      .stat-card {
        .stat-content {
          flex-direction: column;
          text-align: center;
          gap: 8px;

          .stat-icon {
            width: 40px;
            height: 40px;
          }

          .stat-info {
            .stat-value {
              font-size: 20px;
            }

            .stat-label {
              font-size: 12px;
            }
          }
        }
      }
    }

    .quick-access {
      margin-bottom: 16px;

      .access-card {
        :deep(.ant-row) {
          .ant-col {
            margin-bottom: 12px;
          }
        }

        .activity-card {
          padding: 12px;
          min-height: 140px;

          .activity-icon {
            width: 40px;
            height: 40px;
            margin-bottom: 8px;
          }

          .activity-info {
            .activity-title {
              font-size: 14px;
            }

            .activity-description {
              font-size: 12px;
              margin-bottom: 8px;
            }

            .activity-meta {
              .difficulty {
                font-size: 10px;
                padding: 1px 6px;
              }

              .duration {
                font-size: 10px;
              }
            }
          }
        }
      }
    }

    .daily-recommendations {
      margin-bottom: 16px;

      .recommendations-card {
        .recommendation-list {
          .recommendation-item {
            padding: 12px;
            margin-bottom: 8px;

            .recommendation-header {
              gap: 8px;

              .recommendation-icon {
                width: 32px;
                height: 32px;
              }

              .recommendation-info {
                .recommendation-title {
                  font-size: 14px;
                }

                .recommendation-description {
                  font-size: 12px;
                }
              }
            }

            .recommendation-progress {
              .progress-text {
                font-size: 10px;
              }
            }
          }
        }
      }
    }

    .study-calendar {
      .calendar-card {
        .calendar-content {
          .calendar-cell {
            .study-indicator {
              width: 16px;
              height: 16px;

              .study-points {
                font-size: 8px;
              }
            }
          }
        }
      }
    }
  }
}

/* 响应式设计 - 小屏手机 */
@media (max-width: 480px) {
  .home-page {
    padding: 8px;

    .welcome-banner {
      .banner-card {
        .banner-content {
          .banner-text {
            .welcome-title {
              font-size: 20px;
            }

            .welcome-subtitle {
              font-size: 13px;
            }
          }

          .banner-actions {
            :deep(.ant-button) {
              width: 100%;
              margin-bottom: 8px;
            }
          }
        }
      }
    }

    .stats-section {
      :deep(.ant-row) {
        .ant-col {
          margin-bottom: 8px;
        }
      }
    }

    .quick-access {
      .access-card {
        :deep(.ant-row) {
          .ant-col {
            margin-bottom: 8px;
          }
        }

        .activity-card {
          padding: 8px;
          min-height: 120px;

          .activity-icon {
            width: 32px;
            height: 32px;
          }

          .activity-info {
            .activity-title {
              font-size: 13px;
            }

            .activity-description {
              font-size: 11px;
            }
          }
        }
      }
    }

    .daily-recommendations {
      .recommendations-card {
        .recommendation-list {
          .recommendation-item {
            padding: 8px;

            .recommendation-header {
              .recommendation-icon {
                width: 28px;
                height: 28px;
              }

              .recommendation-info {
                .recommendation-title {
                  font-size: 13px;
                }

                .recommendation-description {
                  font-size: 11px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
