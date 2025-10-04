<template>
  <MainLayout>
    <div class="home-page">
      <!-- 欢迎横幅 -->
      <a-card class="welcome-banner" :bordered="false">
        <div class="banner-content">
          <div class="welcome-text">
            <h1 class="welcome-title">
              <span class="wave-emoji">👋</span>
              欢迎回来，{{ authStore.studentProfile?.name || '小朋友' }}！
            </h1>
            <p class="welcome-subtitle">
              <span class="fire-emoji">🔥</span>
              今天也要加油学英语哦！你已经连续学习了 {{ consecutiveDays }} 天
            </p>
            <div class="weather-info">
              <Sun class="w-4 h-4 mr-1" />
              <span>今天是学习的好天气！</span>
            </div>
          </div>
          <div class="welcome-avatar">
            <a-badge :count="newNotifications" :offset="[-10, 10]">
              <a-avatar :size="80" :src="authStore.user?.avatar_url">
                <template #icon>
                  <User class="w-8 h-8" />
                </template>
              </a-avatar>
            </a-badge>
            <a-tag class="level-badge" color="gold">
              <Star class="w-4 h-4 mr-1" />
              Lv.{{ authStore.studentProfile?.level || 1 }}
            </a-tag>
          </div>
        </div>
      </a-card>

      <!-- 学习统计卡片 -->
      <div class="stats-section">
        <a-row :gutter="[16, 16]">
          <a-col :xs="12" :sm="6">
            <a-card class="stat-card" hoverable>
              <a-statistic
                title="总积分"
                :value="authStore.studentProfile?.total_points || 0"
                :prefix="Trophy"
                :value-style="{ color: '#faad14' }"
              />
              <div class="stat-trend">
                <ArrowUp class="w-3 h-3 text-green-500" />
                <span class="trend-text">+120 今日</span>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="12" :sm="6">
            <a-card class="stat-card" hoverable>
              <a-statistic
                title="完成关卡"
                :value="completedLevels"
                :prefix="Target"
                :value-style="{ color: '#1890ff' }"
              />
              <div class="stat-trend">
                <ArrowUp class="w-3 h-3 text-green-500" />
                <span class="trend-text">+2 本周</span>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="12" :sm="6">
            <a-card class="stat-card" hoverable>
              <a-statistic
                title="连续天数"
                :value="consecutiveDays"
                :prefix="Calendar"
                :value-style="{ color: '#52c41a' }"
              />
              <div class="stat-trend">
                <Fire class="w-3 h-3 text-orange-500" />
                <span class="trend-text">保持连击！</span>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="12" :sm="6">
            <a-card class="stat-card" hoverable>
              <a-statistic
                title="获得成就"
                :value="achievements.length"
                :prefix="Award"
                :value-style="{ color: '#722ed1' }"
              />
              <div class="stat-trend">
                <Sparkles class="w-3 h-3 text-purple-500" />
                <span class="trend-text">新成就！</span>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 快速功能入口 -->
      <div class="quick-actions">
        <a-typography-title :level="3" class="section-title">
          <Zap class="w-5 h-5 mr-2" />
          快速开始
        </a-typography-title>
        <a-row :gutter="[24, 24]">
          <a-col :xs="24" :sm="12" :md="8">
            <a-card class="action-card" hoverable @click="goToGames">
              <template #cover>
                <div class="action-cover">
                  <div class="action-icon">
                    <Gamepad2 class="w-12 h-12 text-blue-500" />
                  </div>
                  <div class="action-emoji">🎮</div>
                </div>
              </template>
              <a-card-meta
                title="游戏学习"
                description="通过有趣的游戏学习英语单词和语法"
              />
              <div class="action-progress">
                <a-progress
                  :percent="gameProgress"
                  :show-info="false"
                  stroke-color="#1890ff"
                  size="small"
                />
                <span class="progress-text">进度 {{ gameProgress }}%</span>
              </div>
              <a-button type="primary" block class="action-button">
                开始游戏
              </a-button>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8">
            <a-card class="action-card" hoverable @click="goToAssessment">
              <template #cover>
                <div class="action-cover">
                  <div class="action-icon">
                    <ClipboardCheck class="w-12 h-12 text-green-500" />
                  </div>
                  <div class="action-emoji">📝</div>
                </div>
              </template>
              <a-card-meta
                title="能力评估"
                description="测试你的英语水平，获得个性化建议"
              />
              <div class="action-badge">
                <a-tag v-if="lastAssessment" color="success">
                  上次得分: {{ lastAssessment.score }}分
                </a-tag>
                <a-tag v-else color="default">
                  还未参加测试
                </a-tag>
              </div>
              <a-button type="primary" block class="action-button">
                开始测试
              </a-button>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8">
            <a-card class="action-card" hoverable @click="goToProgress">
              <template #cover>
                <div class="action-cover">
                  <div class="action-icon">
                    <TrendingUp class="w-12 h-12 text-purple-500" />
                  </div>
                  <div class="action-emoji">📊</div>
                </div>
              </template>
              <a-card-meta
                title="学习进度"
                description="查看详细的学习数据和成长轨迹"
              />
              <div class="action-trend">
                <ArrowUp class="w-4 h-4 text-green-500" />
                <span>本周提升 15%</span>
              </div>
              <a-button type="primary" block class="action-button">
                查看报告
              </a-button>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 今日任务 -->
      <a-card class="daily-tasks" :bordered="false">
        <template #title>
          <a-typography-title :level="3" class="section-title">
            <CheckCircle class="w-5 h-5 mr-2" />
            今日任务
            <a-tag color="processing" class="ml-2">{{ completedTasksCount }}/{{ dailyTasks.length }}</a-tag>
          </a-typography-title>
        </template>
        <template #extra>
          <a-button type="link" size="small" @click="refreshTasks">
            <RotateCcw class="w-4 h-4 mr-1" />
            刷新
          </a-button>
        </template>
        <a-list
          :data-source="dailyTasks"
          :split="false"
          class="task-list"
        >
          <template #renderItem="{ item: task }">
            <a-list-item class="task-item" :class="{ completed: task.completed }">
              <template #actions>
                <a-button
                  v-if="!task.completed && task.current >= task.target"
                  type="primary"
                  size="small"
                  @click="completeTask(task.id)"
                >
                  <Gift class="w-4 h-4 mr-1" />
                  领取奖励
                </a-button>
              </template>
              <a-list-item-meta>
                <template #avatar>
                  <a-avatar :style="{ backgroundColor: task.completed ? '#52c41a' : '#1890ff' }">
                    <CheckCircle v-if="task.completed" class="w-4 h-4" />
                    <Circle v-else class="w-4 h-4" />
                  </a-avatar>
                </template>
                <template #title>
                  <div class="task-title">
                    {{ task.title }}
                    <a-tag color="gold" size="small" class="ml-2">
                      +{{ task.points }} 积分
                    </a-tag>
                  </div>
                </template>
                <template #description>
                  <div class="task-progress">
                    <a-progress
                      :percent="Math.min((task.current / task.target) * 100, 100)"
                      :show-info="false"
                      size="small"
                      :stroke-color="task.completed ? '#52c41a' : '#1890ff'"
                    />
                    <span class="progress-label">{{ task.current }}/{{ task.target }}</span>
                  </div>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </a-card>

      <!-- 最近成就 -->
      <a-card class="recent-achievements" v-if="achievements.length > 0" :bordered="false">
        <template #title>
          <a-typography-title :level="3" class="section-title">
            <Medal class="w-5 h-5 mr-2" />
            最近成就
            <a-tag color="gold" class="ml-2">{{ achievements.length }}</a-tag>
          </a-typography-title>
        </template>
        <template #extra>
          <a-button type="link" size="small" @click="goToAchievements">
            查看全部
            <ArrowRight class="w-4 h-4 ml-1" />
          </a-button>
        </template>
        <a-row :gutter="[16, 16]">
          <a-col
            v-for="achievement in achievements.slice(0, 3)"
            :key="achievement.id"
            :xs="24"
            :sm="8"
          >
            <a-card class="achievement-item" hoverable size="small">
              <template #cover>
                <div class="achievement-cover">
                  <div class="achievement-icon">
                    <Award class="w-8 h-8 text-yellow-500" />
                  </div>
                  <div class="achievement-emoji">🏆</div>
                </div>
              </template>
              <a-card-meta
                :title="achievement.title"
                :description="achievement.description"
              />
              <template #actions>
                <a-tooltip :title="formatDate(achievement.earned_at)">
                  <Clock class="w-4 h-4" />
                </a-tooltip>
                <a-tooltip title="分享成就">
                  <Share2 class="w-4 h-4" />
                </a-tooltip>
              </template>
            </a-card>
          </a-col>
        </a-row>
      </a-card>

      <!-- 学习提醒和目标设置 -->
      <a-row :gutter="[24, 24]" class="bottom-section">
        <a-col :xs="24" :md="12">
          <a-card title="学习提醒" :bordered="false" class="reminder-card">
            <template #extra>
              <a-switch
                v-model:checked="reminderEnabled"
                @change="toggleReminder"
                size="small"
              />
            </template>
            <div class="reminder-content">
              <div class="reminder-item">
                <Bell class="w-4 h-4 mr-2" />
                <span>每日学习提醒</span>
                <a-time-picker
                  v-model:value="reminderTime"
                  format="HH:mm"
                  size="small"
                  class="ml-auto"
                />
              </div>
              <div class="reminder-item">
                <Calendar class="w-4 h-4 mr-2" />
                <span>学习目标提醒</span>
                <a-switch size="small" class="ml-auto" />
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-card title="学习目标" :bordered="false" class="goal-card">
            <template #extra>
              <a-button type="link" size="small" @click="setGoals">
                <Settings class="w-4 h-4 mr-1" />
                设置
              </a-button>
            </template>
            <div class="goal-content">
              <div class="goal-item">
                <Target class="w-4 h-4 mr-2 text-blue-500" />
                <div class="goal-info">
                  <div class="goal-title">每日学习时间</div>
                  <a-progress
                    :percent="(todayStudyTime / dailyGoal) * 100"
                    size="small"
                    :show-info="false"
                  />
                  <div class="goal-text">{{ todayStudyTime }}/{{ dailyGoal }} 分钟</div>
                </div>
              </div>
              <div class="goal-item">
                <Trophy class="w-4 h-4 mr-2 text-yellow-500" />
                <div class="goal-info">
                  <div class="goal-title">每周积分目标</div>
                  <a-progress
                    :percent="(weeklyPoints / weeklyGoal) * 100"
                    size="small"
                    :show-info="false"
                  />
                  <div class="goal-text">{{ weeklyPoints }}/{{ weeklyGoal }} 积分</div>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import MainLayout from '@/layouts/MainLayout.vue'
import {
  User,
  Star,
  Trophy,
  Target,
  Calendar,
  Award,
  Zap,
  Gamepad2,
  ClipboardCheck,
  TrendingUp,
  ArrowUp,
  CheckCircle,
  Circle,
  Medal,
  Sun,
  Fire,
  Sparkles,
  RotateCcw,
  Gift,
  ArrowRight,
  Clock,
  Share2,
  Bell,
  Settings
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()

// 模拟数据
const consecutiveDays = ref(7)
const completedLevels = ref(12)
const gameProgress = ref(68)
const lastAssessment = ref({ score: 85 })

const achievements = ref([
  {
    id: 1,
    title: '单词达人',
    description: '累计学习100个单词',
    earned_at: new Date('2024-01-15')
  },
  {
    id: 2,
    title: '坚持不懈',
    description: '连续学习7天',
    earned_at: new Date('2024-01-14')
  },
  {
    id: 3,
    title: '游戏高手',
    description: '完成10个游戏关卡',
    earned_at: new Date('2024-01-13')
  }
])

const dailyTasks = ref([
  {
    id: 1,
    title: '完成3个游戏关卡',
    points: 30,
    current: 2,
    target: 3,
    completed: false
  },
  {
    id: 2,
    title: '学习20个新单词',
    points: 20,
    current: 20,
    target: 20,
    completed: true
  },
  {
    id: 3,
    title: '参加一次能力评估',
    points: 50,
    current: 0,
    target: 1,
    completed: false
  }
])

// 新增的响应式数据
const newNotifications = ref(3)
const reminderEnabled = ref(true)
const reminderTime = ref(null)
const todayStudyTime = ref(25)
const dailyGoal = ref(30)
const weeklyPoints = ref(280)
const weeklyGoal = ref(500)

// 计算属性
const completedTasksCount = computed(() => {
  return dailyTasks.value.filter(task => task.completed).length
})

// 导航方法
const goToGames = () => {
  router.push('/games')
}

const goToAssessment = () => {
  router.push('/assessment')
}

const goToProgress = () => {
  router.push('/progress')
}

const goToAchievements = () => {
  router.push('/achievements')
}

// 新增的方法
const refreshTasks = () => {
  // 刷新任务逻辑
  console.log('刷新任务')
}

const completeTask = (taskId: number) => {
  const task = dailyTasks.value.find(t => t.id === taskId)
  if (task) {
    task.completed = true
    // 添加积分奖励动画
    console.log(`完成任务，获得 ${task.points} 积分`)
  }
}

const toggleReminder = (enabled: boolean) => {
  console.log('学习提醒:', enabled)
}

const setGoals = () => {
  console.log('设置学习目标')
}

// 格式化日期
const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  // 加载用户数据
  if (authStore.isAuthenticated) {
    gameStore.fetchGameLevels()
    gameStore.fetchGameProgress()
  }
})
</script>

<style scoped lang="less">
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin-bottom: 32px;
  color: white;
  overflow: hidden;

  :deep(.ant-card-body) {
    padding: 32px;
  }
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.welcome-text {
  flex: 1;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  
  .wave-emoji {
    display: inline-block;
    animation: wave 2s infinite;
    margin-right: 8px;
  }
}

.welcome-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 8px 0;
  
  .fire-emoji {
    margin-right: 8px;
  }
}

.weather-info {
  display: flex;
  align-items: center;
  font-size: 14px;
  opacity: 0.8;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-20deg); }
}

.welcome-avatar {
  position: relative;
  text-align: center;
}

.level-badge {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.stats-section {
  margin-bottom: 32px;
}

.stat-card {
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
  }

  .stat-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 12px;
    
    .trend-text {
      color: #52c41a;
    }
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(24, 144, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.quick-actions {
  margin-bottom: 32px;
}

.action-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
  }

  .action-cover {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    padding: 24px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;

    .action-emoji {
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 24px;
      opacity: 0.8;
    }
  }

  .action-progress {
    margin: 16px 0;
    text-align: left;
  }

  .action-button {
    margin-top: 16px;
  }

  .action-badge {
    margin: 16px 0;
  }

  .action-trend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #059669;
    font-size: 14px;
    font-weight: 500;
    margin: 16px 0;
  }
}

.action-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(24, 144, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.action-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.action-desc {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.action-progress {
  text-align: left;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.action-badge {
  background: #f3f4f6;
  color: #374151;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}

.action-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #059669;
  font-size: 14px;
  font-weight: 500;
}

.daily-tasks {
  margin-bottom: 32px;

  .task-item {
    transition: all 0.3s;

    &.completed {
      opacity: 0.8;
      
      :deep(.ant-list-item-meta-title) {
        text-decoration: line-through;
        color: #52c41a;
      }
    }

    &:hover {
      background: #f9f9f9;
    }
  }

  .task-title {
    font-weight: 500;
    color: #1f2937;
  }

  .task-progress {
    .progress-label {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
  }
}

.task-icon {
  margin-right: 16px;
}

.task-content {
  flex: 1;
}

.task-title {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.task-reward {
  font-size: 12px;
  color: #fa8c16;
  font-weight: 500;
}

.task-progress {
  width: 120px;
  text-align: right;
}

.progress-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  display: block;
}

.recent-achievements {
  margin-bottom: 32px;

  .achievement-item {
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
    }

    .achievement-cover {
      background: linear-gradient(135deg, #fff7e6 0%, #fff1b8 100%);
      padding: 20px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 80px;

      .achievement-emoji {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 16px;
        opacity: 0.8;
      }
    }
  }
}

.achievement-icon {
  margin-right: 16px;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.achievement-desc {
  font-size: 14px;
  color: #6b7280;
}

.achievement-date {
  font-size: 12px;
  color: #9ca3af;
}

// 新增样式
.bottom-section {
  margin-top: 32px;
}

.reminder-card, .goal-card {
  .reminder-content, .goal-content {
    .reminder-item, .goal-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }
    }

    .goal-info {
      flex: 1;
      margin-left: 8px;

      .goal-title {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .goal-text {
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .welcome-banner {
    :deep(.ant-card-body) {
      padding: 24px;
    }
  }

  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .welcome-subtitle {
    font-size: 14px;
  }

  .stat-number {
    font-size: 20px;
  }

  .action-card {
    padding: 20px;
  }

  .action-icon {
    width: 48px;
    height: 48px;
  }

  .task-item,
  .achievement-item {
    padding: 16px;
  }
}
</style>