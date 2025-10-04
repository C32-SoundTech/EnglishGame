<template>
  <MainLayout>
    <div class="progress-page">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <TrendingUp class="w-6 h-6 mr-3" />
          学习进度
        </h1>
        <p class="page-subtitle">追踪你的学习成长轨迹</p>
      </div>

      <!-- 总体进度概览 -->
      <div class="progress-overview">
        <a-row :gutter="[24, 24]">
          <a-col :xs="24" :md="8">
            <div class="overview-card main-progress">
              <div class="card-header">
                <h3 class="card-title">
                  <Target class="w-5 h-5 mr-2" />
                  总体进度
                </h3>
              </div>
              <div class="progress-circle">
                <div class="circle-progress" :style="{ '--progress': overallProgress }">
                  <div class="progress-value">{{ overallProgress }}%</div>
                  <div class="progress-label">完成度</div>
                </div>
              </div>
              <div class="progress-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ completedLevels }}</span>
                  <span class="stat-label">已完成关卡</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ totalPoints }}</span>
                  <span class="stat-label">总积分</span>
                </div>
              </div>
            </div>
          </a-col>
          
          <a-col :xs="24" :md="8">
            <div class="overview-card level-info">
              <div class="card-header">
                <h3 class="card-title">
                  <Award class="w-5 h-5 mr-2" />
                  当前等级
                </h3>
              </div>
              <div class="level-display">
                <div class="level-badge">
                  <div class="level-icon">
                    <Crown class="w-8 h-8" />
                  </div>
                  <div class="level-info-text">
                    <div class="level-name">{{ currentLevel.name }}</div>
                    <div class="level-title">{{ currentLevel.title }}</div>
                  </div>
                </div>
                <div class="level-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: `${levelProgress}%` }"></div>
                  </div>
                  <div class="progress-text">
                    {{ currentLevelPoints }}/{{ nextLevelPoints }} 经验值
                  </div>
                </div>
              </div>
            </div>
          </a-col>
          
          <a-col :xs="24" :md="8">
            <div class="overview-card streak-info">
              <div class="card-header">
                <h3 class="card-title">
                  <Flame class="w-5 h-5 mr-2" />
                  学习连击
                </h3>
              </div>
              <div class="streak-display">
                <div class="streak-number">{{ studyStreak }}</div>
                <div class="streak-label">连续学习天数</div>
                <div class="streak-calendar">
                  <div
                    v-for="(day, index) in recentDays"
                    :key="index"
                    class="calendar-day"
                    :class="{ active: day.studied, today: day.isToday }"
                  >
                    <div class="day-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 技能进度 -->
      <div class="skills-section">
        <h3 class="section-title">
          <BookOpen class="w-5 h-5 mr-2" />
          技能进度
        </h3>
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :md="12" :lg="6" v-for="skill in skills" :key="skill.name">
            <div class="skill-card">
              <div class="skill-header">
                <div class="skill-icon" :style="{ backgroundColor: skill.color + '20', color: skill.color }">
                  <component :is="skill.icon" class="w-5 h-5" />
                </div>
                <div class="skill-info">
                  <h4 class="skill-name">{{ skill.name }}</h4>
                  <div class="skill-level">等级 {{ skill.level }}</div>
                </div>
              </div>
              <div class="skill-progress">
                <a-progress
                  :percent="skill.progress"
                  :stroke-color="skill.color"
                  :show-info="false"
                  size="small"
                />
                <div class="progress-info">
                  <span class="progress-text">{{ skill.progress }}%</span>
                  <span class="points-text">+{{ skill.recentPoints }}分</span>
                </div>
              </div>
              <div class="skill-stats">
                <div class="stat">
                  <span class="stat-label">完成练习</span>
                  <span class="stat-value">{{ skill.completedExercises }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">正确率</span>
                  <span class="stat-value">{{ skill.accuracy }}%</span>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 成就系统 -->
      <div class="achievements-section">
        <h3 class="section-title">
          <Trophy class="w-5 h-5 mr-2" />
          成就收集
        </h3>
        <div class="achievements-grid">
          <div
            v-for="achievement in achievements"
            :key="achievement.id"
            class="achievement-card"
            :class="{ unlocked: achievement.unlocked, featured: achievement.featured }"
            @click="showAchievementDetail(achievement)"
          >
            <div class="achievement-icon">
              <component :is="achievement.icon" class="w-6 h-6" />
            </div>
            <div class="achievement-info">
              <h4 class="achievement-name">{{ achievement.name }}</h4>
              <p class="achievement-desc">{{ achievement.description }}</p>
              <div class="achievement-progress" v-if="!achievement.unlocked">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${achievement.progress}%` }"></div>
                </div>
                <div class="progress-text">{{ achievement.current }}/{{ achievement.target }}</div>
              </div>
              <div class="achievement-reward" v-if="achievement.unlocked">
                <Zap class="w-3 h-3 mr-1" />
                +{{ achievement.points }}分
              </div>
            </div>
            <div class="achievement-badge" v-if="achievement.unlocked">
              <Check class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <!-- 学习统计 -->
      <div class="statistics-section">
        <h3 class="section-title">
          <BarChart3 class="w-5 h-5 mr-2" />
          学习统计
        </h3>
        <a-row :gutter="[24, 24]">
          <a-col :xs="24" :lg="12">
            <div class="stat-card">
              <div class="stat-header">
                <h4 class="stat-title">
                  <Calendar class="w-4 h-4 mr-2" />
                  本周学习时长
                </h4>
                <a-select v-model:value="timeRange" size="small" style="width: 80px">
                  <a-select-option value="week">本周</a-select-option>
                  <a-select-option value="month">本月</a-select-option>
                </a-select>
              </div>
              <div class="time-chart">
                <div class="chart-bars">
                  <div
                    v-for="(day, index) in weeklyData"
                    :key="index"
                    class="bar-container"
                  >
                    <div class="bar-label">{{ day.label }}</div>
                    <div class="bar-wrapper">
                      <div
                        class="time-bar"
                        :style="{ height: `${(day.minutes / 120) * 100}%` }"
                      >
                        <div class="bar-tooltip">{{ day.minutes }}分钟</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
          
          <a-col :xs="24" :lg="12">
            <div class="stat-card">
              <div class="stat-header">
                <h4 class="stat-title">
                  <Target class="w-4 h-4 mr-2" />
                  学习目标
                </h4>
                <a-button size="small" @click="showGoalSetting">设置</a-button>
              </div>
              <div class="goals-list">
                <div
                  v-for="goal in learningGoals"
                  :key="goal.id"
                  class="goal-item"
                >
                  <div class="goal-info">
                    <div class="goal-name">{{ goal.name }}</div>
                    <div class="goal-progress">
                      <a-progress
                        :percent="(goal.current / goal.target) * 100"
                        :stroke-color="goal.color"
                        size="small"
                        :show-info="false"
                      />
                      <span class="goal-text">{{ goal.current }}/{{ goal.target }} {{ goal.unit }}</span>
                    </div>
                  </div>
                  <div class="goal-status" :class="{ completed: goal.current >= goal.target }">
                    <component :is="goal.current >= goal.target ? Check : Clock" class="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 最近活动 -->
      <div class="activities-section">
        <h3 class="section-title">
          <Activity class="w-5 h-5 mr-2" />
          最近活动
        </h3>
        <div class="activities-timeline">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-time">{{ formatTime(activity.time) }}</div>
            <div class="activity-dot" :style="{ backgroundColor: activity.color }"></div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-desc">{{ activity.description }}</div>
              <div class="activity-reward" v-if="activity.points">
                <Zap class="w-3 h-3 mr-1" />
                +{{ activity.points }}分
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 成就详情弹窗 -->
      <a-modal
        v-model:open="achievementModalVisible"
        title="成就详情"
        :footer="null"
        width="400px"
      >
        <div class="achievement-detail" v-if="selectedAchievement">
          <div class="detail-icon" :class="{ unlocked: selectedAchievement.unlocked }">
            <component :is="selectedAchievement.icon" class="w-12 h-12" />
          </div>
          <h3 class="detail-title">{{ selectedAchievement.name }}</h3>
          <p class="detail-desc">{{ selectedAchievement.description }}</p>
          <div class="detail-progress" v-if="!selectedAchievement.unlocked">
            <a-progress
              :percent="selectedAchievement.progress"
              :stroke-color="selectedAchievement.color"
            />
            <div class="progress-info">
              <span>进度：{{ selectedAchievement.current }}/{{ selectedAchievement.target }}</span>
            </div>
          </div>
          <div class="detail-reward">
            <Zap class="w-4 h-4 mr-2" />
            奖励：{{ selectedAchievement.points }}积分
          </div>
        </div>
      </a-modal>

      <!-- 目标设置弹窗 -->
      <a-modal
        v-model:open="goalModalVisible"
        title="设置学习目标"
        @ok="saveGoals"
        width="500px"
      >
        <div class="goal-setting">
          <div v-for="goal in learningGoals" :key="goal.id" class="goal-setting-item">
            <div class="goal-label">{{ goal.name }}</div>
            <div class="goal-input">
              <a-input-number
                v-model:value="goal.target"
                :min="1"
                :max="goal.maxValue"
                style="width: 120px"
              />
              <span class="goal-unit">{{ goal.unit }}</span>
            </div>
          </div>
        </div>
      </a-modal>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import MainLayout from '@/layouts/MainLayout.vue'
import {
  TrendingUp,
  Target,
  Award,
  Crown,
  Flame,
  BookOpen,
  Trophy,
  Zap,
  Check,
  BarChart3,
  Calendar,
  Clock,
  Activity,
  Gamepad2,
  Headphones,
  PenTool,
  MessageSquare,
  Star,
  Gift,
  Users,
  Lightbulb
} from 'lucide-vue-next'

// 响应式数据
const timeRange = ref('week')
const achievementModalVisible = ref(false)
const goalModalVisible = ref(false)
const selectedAchievement = ref(null)

// 总体进度数据
const overallProgress = ref(68)
const completedLevels = ref(28)
const totalPoints = ref(2450)

// 当前等级信息
const currentLevel = ref({
  name: '学习达人',
  title: 'Level 5',
  level: 5
})

const currentLevelPoints = ref(2450)
const nextLevelPoints = ref(3000)
const levelProgress = computed(() => {
  return Math.round((currentLevelPoints.value / nextLevelPoints.value) * 100)
})

// 学习连击数据
const studyStreak = ref(12)
const recentDays = ref([
  { studied: true, isToday: false },
  { studied: true, isToday: false },
  { studied: false, isToday: false },
  { studied: true, isToday: false },
  { studied: true, isToday: false },
  { studied: true, isToday: false },
  { studied: true, isToday: true }
])

// 技能进度数据
const skills = ref([
  {
    name: '词汇',
    level: 6,
    progress: 85,
    color: '#1890ff',
    icon: BookOpen,
    recentPoints: 120,
    completedExercises: 45,
    accuracy: 92
  },
  {
    name: '听力',
    level: 4,
    progress: 62,
    color: '#52c41a',
    icon: Headphones,
    recentPoints: 80,
    completedExercises: 28,
    accuracy: 85
  },
  {
    name: '语法',
    level: 5,
    progress: 78,
    color: '#fa8c16',
    icon: PenTool,
    recentPoints: 95,
    completedExercises: 32,
    accuracy: 88
  },
  {
    name: '口语',
    level: 3,
    progress: 45,
    color: '#722ed1',
    icon: MessageSquare,
    recentPoints: 60,
    completedExercises: 18,
    accuracy: 78
  }
])

// 成就数据
const achievements = ref([
  {
    id: 1,
    name: '初学者',
    description: '完成第一个学习关卡',
    icon: Star,
    unlocked: true,
    points: 50,
    color: '#1890ff',
    featured: false,
    progress: 100,
    current: 1,
    target: 1
  },
  {
    id: 2,
    name: '词汇大师',
    description: '学会100个新单词',
    icon: BookOpen,
    unlocked: true,
    points: 200,
    color: '#52c41a',
    featured: true,
    progress: 100,
    current: 100,
    target: 100
  },
  {
    id: 3,
    name: '连击王者',
    description: '连续学习7天',
    icon: Flame,
    unlocked: true,
    points: 150,
    color: '#fa8c16',
    featured: false,
    progress: 100,
    current: 7,
    target: 7
  },
  {
    id: 4,
    name: '完美主义者',
    description: '在一次测试中获得100分',
    icon: Trophy,
    unlocked: false,
    points: 300,
    color: '#722ed1',
    featured: false,
    progress: 85,
    current: 95,
    target: 100
  },
  {
    id: 5,
    name: '社交达人',
    description: '与10个同学互动',
    icon: Users,
    unlocked: false,
    points: 100,
    color: '#13c2c2',
    featured: false,
    progress: 60,
    current: 6,
    target: 10
  },
  {
    id: 6,
    name: '探索者',
    description: '解锁所有学习模块',
    icon: Lightbulb,
    unlocked: false,
    points: 500,
    color: '#eb2f96',
    featured: true,
    progress: 75,
    current: 3,
    target: 4
  }
])

// 本周学习数据
const weeklyData = ref([
  { label: '周一', minutes: 45 },
  { label: '周二', minutes: 60 },
  { label: '周三', minutes: 30 },
  { label: '周四', minutes: 75 },
  { label: '周五', minutes: 50 },
  { label: '周六', minutes: 90 },
  { label: '周日', minutes: 40 }
])

// 学习目标
const learningGoals = ref([
  {
    id: 1,
    name: '每日学习时长',
    current: 45,
    target: 60,
    unit: '分钟',
    color: '#1890ff',
    maxValue: 180
  },
  {
    id: 2,
    name: '每周完成关卡',
    current: 5,
    target: 7,
    unit: '个',
    color: '#52c41a',
    maxValue: 20
  },
  {
    id: 3,
    name: '每月新单词',
    current: 85,
    target: 100,
    unit: '个',
    color: '#fa8c16',
    maxValue: 300
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '完成词汇练习',
    description: '学习了10个关于动物的新单词',
    time: new Date(Date.now() - 30 * 60 * 1000),
    points: 50,
    color: '#1890ff'
  },
  {
    id: 2,
    title: '解锁新成就',
    description: '获得"词汇大师"成就',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    points: 200,
    color: '#52c41a'
  },
  {
    id: 3,
    title: '完成听力训练',
    description: '完成日常对话听力练习',
    time: new Date(Date.now() - 4 * 60 * 60 * 1000),
    points: 30,
    color: '#fa8c16'
  },
  {
    id: 4,
    title: '升级技能',
    description: '词汇技能升级到6级',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000),
    points: 100,
    color: '#722ed1'
  }
])

// 方法
const showAchievementDetail = (achievement: any) => {
  selectedAchievement.value = achievement
  achievementModalVisible.value = true
}

const showGoalSetting = () => {
  goalModalVisible.value = true
}

const saveGoals = () => {
  message.success('学习目标已更新！')
  goalModalVisible.value = false
}

const formatTime = (time: Date) => {
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return `${days}天前`
  }
}
</script>

<style scoped lang="less">
.progress-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.progress-overview {
  margin-bottom: 40px;
}

.overview-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  height: 280px;
  display: flex;
  flex-direction: column;
}

.card-header {
  margin-bottom: 20px;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

// 主进度卡片
.main-progress {
  text-align: center;
}

.progress-circle {
  margin: 20px 0;
}

.circle-progress {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(#1890ff calc(var(--progress) * 1%), #f0f0f0 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 12px;
    border-radius: 50%;
    background: white;
  }
}

.progress-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  z-index: 1;
}

.progress-label {
  font-size: 12px;
  color: #6b7280;
  z-index: 1;
}

.progress-stats {
  display: flex;
  justify-content: space-around;
  margin-top: auto;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

// 等级信息卡片
.level-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.level-badge {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.level-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d48806;
}

.level-info-text {
  flex: 1;
}

.level-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.level-title {
  font-size: 14px;
  color: #6b7280;
}

.level-progress {
  margin-top: auto;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

// 连击信息卡片
.streak-display {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.streak-number {
  font-size: 48px;
  font-weight: 700;
  color: #fa8c16;
  line-height: 1;
}

.streak-label {
  font-size: 14px;
  color: #6b7280;
  margin: 8px 0 20px 0;
}

.streak-calendar {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
}

.calendar-day {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  transition: all 0.3s;

  &.active {
    background: #fa8c16;
  }

  &.today {
    border: 2px solid #1890ff;
  }
}

.day-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

// 技能部分
.skills-section,
.achievements-section,
.statistics-section,
.activities-section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.skill-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.skill-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.skill-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skill-info {
  flex: 1;
}

.skill-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.skill-level {
  font-size: 12px;
  color: #6b7280;
}

.skill-progress {
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.progress-text {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.points-text {
  font-size: 12px;
  color: #52c41a;
  font-weight: 500;
}

.skill-stats {
  display: flex;
  justify-content: space-between;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

// 成就部分
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.achievement-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  opacity: 0.6;

  &.unlocked {
    opacity: 1;
  }

  &.featured {
    border: 2px solid #1890ff;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.achievement-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;

  .unlocked & {
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #d48806;
  }
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.achievement-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.achievement-progress {
  margin-bottom: 8px;
}

.achievement-reward {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #52c41a;
  font-weight: 500;
}

.achievement-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #52c41a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 统计部分
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 300px;
  display: flex;
  flex-direction: column;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stat-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.time-chart {
  flex: 1;
  display: flex;
  align-items: end;
  padding: 20px 0;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  gap: 8px;
}

.bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: end;
  justify-content: center;
}

.time-bar {
  width: 100%;
  max-width: 32px;
  background: linear-gradient(180deg, #1890ff, #40a9ff);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    opacity: 0.8;
  }

  &:hover .bar-tooltip {
    opacity: 1;
  }
}

.bar-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
  margin-bottom: 4px;
}

// 目标部分
.goals-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.goal-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.goal-info {
  flex: 1;
}

.goal-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 8px;
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.goal-text {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.goal-status {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;

  &.completed {
    background: #52c41a;
    color: white;
  }
}

// 活动时间线
.activities-timeline {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.activity-time {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  min-width: 60px;
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.activity-desc {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.activity-reward {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #52c41a;
  font-weight: 500;
}

// 弹窗样式
.achievement-detail {
  text-align: center;
  padding: 20px 0;
}

.detail-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  margin: 0 auto 20px;

  &.unlocked {
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #d48806;
  }
}

.detail-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.detail-desc {
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.detail-progress {
  margin-bottom: 20px;
}

.detail-reward {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #52c41a;
  font-weight: 500;
}

.goal-setting {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.goal-setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goal-label {
  font-weight: 500;
  color: #1f2937;
}

.goal-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.goal-unit {
  color: #6b7280;
  font-size: 14px;
}

// 响应式设计
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .overview-card {
    height: auto;
    min-height: 200px;
  }

  .achievements-grid {
    grid-template-columns: 1fr;
  }

  .achievement-card {
    padding: 16px;
  }

  .stat-card {
    height: 250px;
    padding: 16px;
  }

  .activity-item {
    flex-direction: column;
    gap: 8px;
  }

  .activity-time {
    min-width: auto;
  }
}

@media (max-width: 576px) {
  .progress-circle {
    margin: 16px 0;
  }

  .circle-progress {
    width: 100px;
    height: 100px;
  }

  .progress-value {
    font-size: 20px;
  }

  .streak-number {
    font-size: 36px;
  }

  .skill-card {
    padding: 16px;
  }
}
</style>