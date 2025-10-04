<template>
  <div class="reports-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <a-card class="header-card">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">
              <BarChart3 class="w-8 h-8 mr-3" />
              学习报告
            </h1>
            <p class="page-description">
              全面了解你的学习进度和成果，发现学习规律，制定更好的学习计划
            </p>
          </div>
          <div class="header-actions">
            <a-button type="primary" @click="generateReport">
              <FileText class="w-4 h-4 mr-1" />
              生成报告
            </a-button>
            <a-button @click="exportData">
              <Download class="w-4 h-4 mr-1" />
              导出数据
            </a-button>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 时间范围选择 -->
    <div class="time-filter">
      <a-card>
        <div class="filter-content">
          <div class="filter-label">
            <Calendar class="w-4 h-4 mr-2" />
            时间范围：
          </div>
          <a-radio-group v-model:value="selectedTimeRange" @change="handleTimeRangeChange">
            <a-radio-button value="week">最近一周</a-radio-button>
            <a-radio-button value="month">最近一月</a-radio-button>
            <a-radio-button value="quarter">最近三月</a-radio-button>
            <a-radio-button value="year">最近一年</a-radio-button>
          </a-radio-group>
          <a-range-picker
            v-model:value="customDateRange"
            @change="handleCustomDateChange"
            style="margin-left: 16px"
          />
        </div>
      </a-card>
    </div>

    <!-- 学习概览统计 -->
    <div class="overview-stats">
      <a-row :gutter="[16, 16]">
        <a-col :xs="12" :sm="6" v-for="stat in overviewStats" :key="stat.key">
          <a-card class="stat-card" :class="stat.trend">
            <div class="stat-content">
              <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
                <component :is="stat.icon" class="w-6 h-6" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-change" :class="stat.trend">
                  <component :is="stat.trend === 'up' ? TrendingUp : TrendingDown" class="w-3 h-3 mr-1" />
                  {{ stat.change }}
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 学习进度趋势 -->
    <div class="progress-trend">
      <a-card title="学习进度趋势" class="chart-card">
        <template #extra>
          <a-button size="small" @click="showProgressDetail = true">
            <Eye class="w-4 h-4 mr-1" />
            详细分析
          </a-button>
        </template>
        <ProgressTrendChart 
            :trend-data="progressTrendData" 
            :height="300"
            @skill-click="handleSkillClick"
          />
      </a-card>
    </div>

    <!-- 技能分析和学习活跃度 -->
    <a-row :gutter="16">
      <a-col :xs="24" :lg="12">
        <!-- 技能雷达图 -->
        <a-card title="技能分析" class="chart-card">
          <template #extra>
            <a-button size="small" @click="showSkillDetail = true">
              <Target class="w-4 h-4 mr-1" />
              技能详情
            </a-button>
          </template>
          <SkillRadarChart 
            :skill-scores="currentSkillScores"
            :height="280"
            @skill-select="handleSkillSelect"
          />
        </a-card>
      </a-col>
      
      <a-col :xs="24" :lg="12">
        <!-- 学习活跃度热力图 -->
        <a-card title="学习活跃度" class="chart-card">
          <template #extra>
            <div class="activity-stats">
              <a-tooltip title="当前连续学习天数">
                <div class="streak-info">
                  <Flame class="w-4 h-4 mr-1" />
                  {{ currentStreak }}天
                </div>
              </a-tooltip>
            </div>
          </template>
          <LearningCharts 
            :activity-data="activityData"
            :height="280"
            chart-type="heatmap"
          />
        </a-card>
      </a-col>
    </a-row>

    <!-- 知识点掌握度和学习建议 -->
    <a-row :gutter="16">
      <a-col :xs="24" :lg="14">
        <!-- 知识点掌握度 -->
        <a-card title="知识点掌握度" class="chart-card">
          <template #extra>
            <a-select 
              v-model:value="selectedSubject" 
              style="width: 120px"
              @change="handleSubjectChange"
            >
              <a-select-option value="vocabulary">词汇</a-select-option>
              <a-select-option value="grammar">语法</a-select-option>
              <a-select-option value="listening">听力</a-select-option>
              <a-select-option value="speaking">口语</a-select-option>
            </a-select>
          </template>
          <InteractiveCharts 
            :knowledge-data="knowledgeData"
            :height="320"
            chart-type="knowledge"
            @knowledge-click="handleKnowledgeClick"
          />
        </a-card>
      </a-col>
      
      <a-col :xs="24" :lg="10">
        <!-- 学习建议 -->
        <a-card title="学习建议" class="suggestions-card">
          <template #extra>
            <a-button size="small" @click="refreshSuggestions">
              <RefreshCw class="w-4 h-4 mr-1" />
              刷新建议
            </a-button>
          </template>
          <div class="suggestions-content">
            <div 
              v-for="suggestion in skillRecommendations" 
              :key="suggestion.skill"
              class="suggestion-item"
            >
              <div class="suggestion-header">
                <component :is="suggestion.icon" class="w-5 h-5 mr-2 text-blue-500" />
                <h4 class="suggestion-title">{{ suggestion.skill }}</h4>
              </div>
              <p class="suggestion-description">{{ suggestion.suggestion }}</p>
              <div class="suggestion-actions">
                <a-button size="small" type="primary" @click="startPractice(suggestion.skill)">
                  开始练习
                </a-button>
                <a-button size="small" @click="viewDetails(suggestion.skill)">
                  查看详情
                </a-button>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 学习成就和目标进度 -->
    <a-row :gutter="16">
      <a-col :xs="24" :lg="12">
        <!-- 学习成就 -->
        <a-card title="学习成就" class="achievements-card">
          <div class="achievements-grid">
            <div 
              v-for="achievement in recentAchievements" 
              :key="achievement.id"
              class="achievement-item"
              :class="{ 'unlocked': achievement.unlocked }"
            >
              <div class="achievement-icon" :style="{ backgroundColor: achievement.color + '20', color: achievement.color }">
                <component :is="achievement.icon" class="w-6 h-6" />
              </div>
              <div class="achievement-info">
                <h4 class="achievement-name">{{ achievement.name }}</h4>
                <p class="achievement-desc">{{ achievement.description }}</p>
                <div v-if="achievement.unlocked" class="achievement-date">
                  {{ formatDate(achievement.unlockedAt) }}
                </div>
                <div v-else class="achievement-progress">
                  <a-progress 
                    :percent="achievement.progress" 
                    size="small"
                    :show-info="false"
                  />
                  <span class="progress-text">{{ achievement.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :lg="12">
        <!-- 学习目标进度 -->
        <a-card title="学习目标进度" class="goals-card">
          <div class="goals-list">
            <div v-for="goal in learningGoals" :key="goal.id" class="goal-item">
              <div class="goal-header">
                <div class="goal-icon">
                  <CheckCircle v-if="goal.completed" class="w-5 h-5 text-green-500" />
                  <Target v-else class="w-5 h-5 text-blue-500" />
                </div>
                <div class="goal-info">
                  <h4 class="goal-title">{{ goal.title }}</h4>
                  <p class="goal-deadline">截止：{{ formatDate(goal.deadline) }}</p>
                </div>
                <div class="goal-status">
                  <a-tag :color="goal.completed ? 'green' : getGoalStatusColor(goal.deadline)">
                    {{ goal.completed ? '已完成' : getGoalStatusText(goal.deadline) }}
                  </a-tag>
                </div>
              </div>
              <div class="goal-progress">
                <a-progress 
                  :percent="goal.progress" 
                  :stroke-color="goal.completed ? '#52c41a' : '#1890ff'"
                />
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 详细分析模态框 -->
    <a-modal 
      v-model:open="showProgressDetail" 
      title="学习进度详细分析" 
      width="900px"
      :footer="null"
    >
      <div class="progress-detail-content">
        <ProgressTrendChart 
          :trend-data="progressTrendData" 
          :height="400"
          :show-controls="true"
          @skill-click="handleSkillClick"
        />
        <div class="analysis-summary">
          <h4>分析总结</h4>
          <div class="summary-items">
            <div v-for="item in progressAnalysis" :key="item.skill" class="summary-item">
              <div class="item-header">
                <component :is="item.icon" class="w-4 h-4 mr-2" :class="item.trend === 'up' ? 'text-green-500' : 'text-red-500'" />
                <span class="item-title">{{ item.skill }}</span>
                <a-tag :color="item.trend === 'up' ? 'green' : 'red'">
                  {{ item.trend === 'up' ? '上升' : '下降' }} {{ item.change }}%
                </a-tag>
              </div>
              <p class="item-description">{{ item.analysis }}</p>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 技能详情模态框 -->
    <a-modal 
      v-model:open="showSkillDetail" 
      title="技能详细分析" 
      width="700px"
      :footer="null"
    >
      <div class="skill-detail-content">
        <div class="skill-overview">
          <a-row :gutter="16">
            <a-col :span="8" v-for="skill in skillDetailData" :key="skill.name">
              <div class="skill-card">
                <div class="skill-header">
                  <component :is="skill.icon" class="w-5 h-5 mr-2" />
                  <span class="skill-name">{{ skill.name }}</span>
                </div>
                <div class="skill-score">{{ skill.score }}%</div>
                <div class="skill-level">{{ getSkillLevel(skill.score) }}</div>
                <a-progress 
                  :percent="skill.score" 
                  :stroke-color="getSkillColor(skill.score)"
                  size="small"
                />
              </div>
            </a-col>
          </a-row>
        </div>
        <div class="skill-recommendations">
          <h4>提升建议</h4>
          <div class="recommendations-list">
            <div v-for="rec in skillRecommendations" :key="rec.skill" class="recommendation-item">
              <div class="rec-header">
                <AlertCircle class="w-4 h-4 mr-2 text-orange-500" />
                <span class="rec-skill">{{ rec.skill }}</span>
              </div>
              <p class="rec-suggestion">{{ rec.suggestion }}</p>
              <div class="rec-actions">
                <a-button size="small" type="primary" @click="startSkillTraining(rec.skill)">
                  开始训练
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 奖励动画组件 -->
    <RewardAnimation
      ref="rewardAnimationRef"
      :points="rewardPoints"
      :bonus-points="bonusPoints"
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
    <FloatingElements />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import { storage } from '@/utils/storage'
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  Target,
  Flame,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Headphones,
  MessageSquare,
  PenTool,
  Trophy,
  Award,
  Zap,
  Clock,
  RefreshCw
} from 'lucide-vue-next'

import ProgressTrendChart from '@/components/charts/ProgressTrendChart.vue'
import SkillRadarChart from '@/components/charts/SkillRadarChart.vue'
import LearningCharts from '@/components/charts/LearningCharts.vue'
import InteractiveCharts from '@/components/charts/InteractiveCharts.vue'
import RewardAnimation from '@/components/RewardAnimation.vue'
import SoundEffects from '@/components/animations/SoundEffects.vue'
import FloatingElements from '@/components/animations/FloatingElements.vue'

interface OverviewStat {
  key: string
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: any
  color: string
}

interface LearningGoal {
  id: string
  title: string
  progress: number
  deadline: Date
  completed: boolean
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: any
  color: string
  unlocked: boolean
  unlockedAt?: Date
  progress?: number
}

interface LearningSuggestion {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  icon: any
  color: string
}

const router = useRouter()

// 响应式数据
const selectedTimeRange = ref('month')
const customDateRange = ref()
const showProgressDetail = ref(false)
const showSkillDetail = ref(false)
const selectedSubject = ref('vocabulary')
const currentStreak = ref(15)

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

// 动画和音效方法
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

// 概览统计数据
const overviewStats = ref<OverviewStat[]>([
  {
    key: 'totalStudyTime',
    label: '总学习时长',
    value: '128h',
    change: '+12%',
    trend: 'up',
    icon: Clock,
    color: '#1890ff'
  },
  {
    key: 'completedLessons',
    label: '完成课程',
    value: '45',
    change: '+8',
    trend: 'up',
    icon: BookOpen,
    color: '#52c41a'
  },
  {
    key: 'averageScore',
    label: '平均分数',
    value: '87%',
    change: '+5%',
    trend: 'up',
    icon: Trophy,
    color: '#fadb14'
  },
  {
    key: 'streakDays',
    label: '连续学习',
    value: '15天',
    change: '+3天',
    trend: 'up',
    icon: Flame,
    color: '#ff4d4f'
  }
])

// 学习进度趋势数据
const progressTrendData = ref([
  {
    date: '2024-01-01',
    listening: 75,
    speaking: 68,
    reading: 82,
    writing: 71,
    vocabulary: 85,
    grammar: 79
  },
  {
    date: '2024-01-08',
    listening: 78,
    speaking: 72,
    reading: 85,
    writing: 74,
    vocabulary: 87,
    grammar: 81
  },
  {
    date: '2024-01-15',
    listening: 82,
    speaking: 75,
    reading: 88,
    writing: 77,
    vocabulary: 90,
    grammar: 84
  },
  {
    date: '2024-01-22',
    listening: 85,
    speaking: 79,
    reading: 91,
    writing: 80,
    vocabulary: 92,
    grammar: 87
  }
])

// 当前技能分数
const currentSkillScores = computed(() => {
  const latest = progressTrendData.value[progressTrendData.value.length - 1]
  return {
    listening: latest.listening,
    speaking: latest.speaking,
    reading: latest.reading,
    writing: latest.writing,
    vocabulary: latest.vocabulary,
    grammar: latest.grammar
  }
})

// 学习活跃度数据
const activityData = ref([
  { date: '2024-01-01', value: 3 },
  { date: '2024-01-02', value: 2 },
  { date: '2024-01-03', value: 4 },
  { date: '2024-01-04', value: 1 },
  { date: '2024-01-05', value: 3 },
  // ... 更多数据
])

// 知识点掌握度数据
const knowledgeData = ref([
  { name: '基础词汇', mastery: 92, total: 500, learned: 460 },
  { name: '高级词汇', mastery: 68, total: 300, learned: 204 },
  { name: '语法规则', mastery: 85, total: 120, learned: 102 },
  { name: '句型结构', mastery: 78, total: 80, learned: 62 },
  { name: '发音规则', mastery: 73, total: 60, learned: 44 }
])

// 推荐系统引用
const recommendationSystemRef = ref(null)

// 最近成就
const recentAchievements = ref<Achievement[]>([
  {
    id: '1',
    name: '词汇大师',
    description: '学会1000个单词',
    icon: BookOpen,
    color: '#1890ff',
    unlocked: true,
    unlockedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    name: '连续学习者',
    description: '连续学习30天',
    icon: Flame,
    color: '#ff4d4f',
    unlocked: false,
    progress: 50
  },
  {
    id: '3',
    name: '听力专家',
    description: '听力测试满分',
    icon: Headphones,
    color: '#52c41a',
    unlocked: true,
    unlockedAt: new Date('2024-01-18')
  }
])

// 学习目标
const learningGoals = ref<LearningGoal[]>([
  {
    id: '1',
    title: '完成基础课程',
    progress: 85,
    deadline: new Date('2024-02-01'),
    completed: false
  },
  {
    id: '2',
    title: '词汇量达到2000',
    progress: 75,
    deadline: new Date('2024-02-15'),
    completed: false
  },
  {
    id: '3',
    title: '口语流利度提升',
    progress: 100,
    deadline: new Date('2024-01-25'),
    completed: true
  }
])

// 进度分析数据
const progressAnalysis = ref([
  {
    skill: '听力理解',
    trend: 'up',
    change: 12,
    icon: Headphones,
    analysis: '听力技能持续提升，建议继续保持每日听力练习的习惯'
  },
  {
    skill: '口语表达',
    trend: 'up',
    change: 8,
    icon: MessageSquare,
    analysis: '口语进步明显，可以尝试更复杂的对话练习'
  },
  {
    skill: '阅读理解',
    trend: 'up',
    change: 15,
    icon: BookOpen,
    analysis: '阅读能力大幅提升，可以挑战更高难度的阅读材料'
  }
])

// 技能详情数据
const skillDetailData = ref([
  { name: '听力', score: 85, icon: Headphones },
  { name: '口语', score: 79, icon: MessageSquare },
  { name: '阅读', score: 91, icon: BookOpen },
  { name: '写作', score: 80, icon: PenTool },
  { name: '词汇', score: 92, icon: Zap },
  { name: '语法', score: 87, icon: Target }
])

// 技能推荐
const skillRecommendations = ref([
  {
    skill: '口语表达',
    suggestion: '建议每天进行15分钟的口语练习，重点练习日常对话和发音准确性',
    icon: MessageSquare
  },
  {
    skill: '写作技能',
    suggestion: '多练习不同类型的写作，如记叙文、说明文等，注意语法和词汇的运用',
    icon: PenTool
  },
  {
    skill: '听力理解',
    suggestion: '通过听英语歌曲、看英语动画片来提高听力水平，每天至少20分钟',
    icon: Headphones
  },
  {
    skill: '词汇积累',
    suggestion: '每天学习10个新单词，通过游戏和练习加深记忆',
    icon: Zap
  }
])

// 知识点掌握度数据
const knowledgeData = ref([
  { name: '基础词汇', mastery: 85, total: 500, learned: 425 },
  { name: '日常对话', mastery: 78, total: 100, learned: 78 },
  { name: '语法规则', mastery: 72, total: 50, learned: 36 },
  { name: '阅读理解', mastery: 88, total: 200, learned: 176 },
  { name: '听力技巧', mastery: 75, total: 80, learned: 60 }
])

// 学习活跃度数据
const activityData = ref([
  { date: '2024-01-01', value: 3 },
  { date: '2024-01-02', value: 5 },
  { date: '2024-01-03', value: 2 },
  { date: '2024-01-04', value: 4 },
  { date: '2024-01-05', value: 6 },
  { date: '2024-01-06', value: 1 },
  { date: '2024-01-07', value: 0 }
])

// 方法
const handleTimeRangeChange = (e: any) => {
  playSound('click')
  message.info(`切换到${getTimeRangeText(e.target.value)}`)
  // 重新加载数据
  loadReportsData()
}

const handleCustomDateChange = (dates: any) => {
  if (dates && dates.length === 2) {
    message.info('自定义时间范围已设置')
    // 重新加载数据
  }
}

const handleSkillClick = (skill: string) => {
  playSound('click')
  message.info(`点击了技能：${skill}`)
}

const handleSkillSelect = (skill: string) => {
  playSound('click')
  message.info(`选择了技能：${skill}`)
}

const handleSubjectChange = (value: string) => {
  playSound('click')
  message.info(`切换到${value}知识点分析`)
}

const handleKnowledgeClick = (knowledge: any) => {
  playSound('click')
  message.info(`点击了知识点：${knowledge.name}`)
}

const generateReport = () => {
  playSound('click')
  message.success('正在生成学习报告...')
  // 模拟报告生成成功
  setTimeout(() => {
    playSound('success')
    showRewardAnimation('points', { points: 20 })
    message.success('学习报告生成完成！')
  }, 2000)
}

const exportData = () => {
  playSound('click')
  message.success('数据导出成功')
  playSound('success')
  showRewardAnimation('points', { points: 10 })
}

const refreshSuggestions = () => {
  playSound('click')
  // 刷新建议逻辑
  const newSuggestions = [
    {
      skill: '语法练习',
      suggestion: '重点练习时态和语态，通过练习题巩固语法知识',
      icon: Target
    },
    {
      skill: '阅读速度',
      suggestion: '每天阅读英语短文，逐步提高阅读速度和理解能力',
      icon: BookOpen
    }
  ]
  skillRecommendations.value = [...skillRecommendations.value.slice(0, 2), ...newSuggestions]
  playSound('success')
  message.success('学习建议已刷新')
}

const startPractice = (skill: string) => {
  playSound('click')
  message.success(`开始${skill}练习`)
  showRewardAnimation('points', { points: 5 })
  router.push('/games')
}

const viewDetails = (skill: string) => {
  playSound('click')
  message.info(`查看${skill}详细信息`)
  // 可以跳转到具体的技能详情页面
}

const startSkillTraining = (skill: string) => {
  playSound('click')
  message.success(`开始${skill}训练`)
  router.push('/games')
}

// 工具函数
const getTimeRangeText = (range: string): string => {
  const texts: Record<string, string> = {
    week: '最近一周',
    month: '最近一月',
    quarter: '最近三月',
    year: '最近一年'
  }
  return texts[range] || range
}

const getPriorityText = (priority: string): string => {
  const texts: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return texts[priority] || priority
}

const getSkillLevel = (score: number): string => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '一般'
  if (score >= 60) return '及格'
  return '需提升'
}

const getSkillColor = (score: number): string => {
  if (score >= 90) return '#52c41a'
  if (score >= 80) return '#1890ff'
  if (score >= 70) return '#fa8c16'
  if (score >= 60) return '#fadb14'
  return '#ff4d4f'
}

const getGoalStatusColor = (deadline: Date): string => {
  const now = new Date()
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysLeft < 0) return 'red'
  if (daysLeft <= 3) return 'orange'
  if (daysLeft <= 7) return 'yellow'
  return 'blue'
}

const getGoalStatusText = (deadline: Date): string => {
  const now = new Date()
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysLeft < 0) return '已逾期'
  if (daysLeft === 0) return '今天截止'
  if (daysLeft === 1) return '明天截止'
  return `${daysLeft}天后截止`
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 音效和动画方法
const playSound = (type: string) => {
  if (soundEffectsRef.value && soundEnabled.value) {
    soundEffectsRef.value.playSound(type)
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
  // 动画完成后的回调
  rewardPoints.value = 0
  bonusPoints.value = 0
  streakCount.value = 0
  earnedBadge.value = null
  isPerfect.value = false
  playSound('complete')
}

// 数据加载方法
const loadReportsData = () => {
  // 模拟数据加载
  playSound('loading')
  message.loading('正在加载数据...', 1)
  
  // 根据时间范围更新数据
  setTimeout(() => {
    playSound('success')
    message.success('数据加载完成')
  }, 1000)
}

// 数据存储和同步方法
const saveReportsData = () => {
  const reportsData = {
    overviewStats: overviewStats.value,
    progressTrendData: progressTrendData.value,
    activityData: activityData.value,
    knowledgeData: knowledgeData.value,
    recentAchievements: recentAchievements.value,
    learningGoals: learningGoals.value,
    lastUpdated: new Date().toISOString()
  }
  
  storage.set('reportsData', reportsData)
  playSound('save')
  message.success('数据已保存')
}

const loadStoredData = () => {
  const storedData = storage.get('reportsData')
  if (storedData) {
    overviewStats.value = storedData.overviewStats || overviewStats.value
    progressTrendData.value = storedData.progressTrendData || progressTrendData.value
    activityData.value = storedData.activityData || activityData.value
    knowledgeData.value = storedData.knowledgeData || knowledgeData.value
    recentAchievements.value = storedData.recentAchievements || recentAchievements.value
    learningGoals.value = storedData.learningGoals || learningGoals.value
    
    message.success('已加载本地数据')
  }
}

// 生命周期
onMounted(() => {
  // 初始化数据
  playSound('pageLoad')
  loadStoredData()
  
  // 定期保存数据
  setInterval(() => {
    saveReportsData()
  }, 300000) // 每5分钟自动保存一次
})
</script>

<style scoped lang="less">
.reports-page {
  .page-header {
    margin-bottom: 24px;

    .header-card {
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-info {
          .page-title {
            display: flex;
            align-items: center;
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 8px 0;
          }

          .page-description {
            color: #6b7280;
            margin: 0;
          }
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }
      }
    }
  }

  .time-filter {
    margin-bottom: 24px;

    .filter-content {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;

      .filter-label {
        display: flex;
        align-items: center;
        font-weight: 500;
        color: #374151;
      }
    }
  }

  .overview-stats {
    margin-bottom: 24px;

    .stat-card {
      height: 100%;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 4px;
          }

          .stat-change {
            display: flex;
            align-items: center;
            font-size: 12px;
            font-weight: 500;

            &.up {
              color: #10b981;
            }

            &.down {
              color: #ef4444;
            }

            &.stable {
              color: #6b7280;
            }
          }
        }
      }
    }
  }

  .progress-trend {
    margin-bottom: 24px;

    .chart-card {
      .ant-card-head-title {
        font-weight: 600;
      }
    }
  }

  .chart-card {
    margin-bottom: 24px;
    
    .activity-stats {
      display: flex;
      align-items: center;
      gap: 16px;

      .streak-info {
        display: flex;
        align-items: center;
        color: #ff4d4f;
        font-weight: 500;
      }
    }
  }

  .suggestions-card {
    .suggestions-content {
      .suggestion-item {
        padding: 16px;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        margin-bottom: 16px;
        transition: all 0.3s ease;

        &:hover {
          border-color: #d9d9d9;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        &:last-child {
          margin-bottom: 0;
        }

        .suggestion-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .suggestion-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .suggestion-info {
            flex: 1;

            .suggestion-title {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              margin: 0 0 4px 0;
            }
          }
        }

        .suggestion-description {
          color: #6b7280;
          margin: 0 0 12px 0;
          line-height: 1.5;
        }

        .suggestion-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .achievements-card {
    .achievements-grid {
      .achievement-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        margin-bottom: 12px;
        transition: all 0.3s ease;

        &:hover {
          border-color: #d9d9d9;
        }

        &.unlocked {
          background: linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%);
          border-color: #b7eb8f;
        }

        &:last-child {
          margin-bottom: 0;
        }

        .achievement-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .achievement-info {
          flex: 1;

          .achievement-name {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 4px 0;
          }

          .achievement-desc {
            font-size: 12px;
            color: #6b7280;
            margin: 0 0 4px 0;
          }

          .achievement-date {
            font-size: 12px;
            color: #10b981;
            font-weight: 500;
          }

          .achievement-progress {
            display: flex;
            align-items: center;
            gap: 8px;

            .progress-text {
              font-size: 12px;
              color: #6b7280;
            }
          }
        }
      }
    }
  }

  .goals-card {
    .goals-list {
      .goal-item {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .goal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .goal-icon {
            flex-shrink: 0;
          }

          .goal-info {
            flex: 1;

            .goal-title {
              font-size: 14px;
              font-weight: 600;
              color: #1f2937;
              margin: 0 0 4px 0;
            }

            .goal-deadline {
              font-size: 12px;
              color: #6b7280;
              margin: 0;
            }
          }

          .goal-status {
            flex-shrink: 0;
          }
        }

        .goal-progress {
          margin-left: 32px;
        }
      }
    }
  }

  .progress-detail-content {
    .analysis-summary {
      margin-top: 24px;

      h4 {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 16px;
      }

      .summary-items {
        .summary-item {
          padding: 12px;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          .item-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;

            .item-title {
              font-weight: 500;
              color: #374151;
            }
          }

          .item-description {
            color: #6b7280;
            margin: 0;
            line-height: 1.5;
          }
        }
      }
    }
  }

  .skill-detail-content {
    .skill-overview {
      margin-bottom: 24px;

      .skill-card {
        text-align: center;
        padding: 16px;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          border-color: #d9d9d9;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .skill-header {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;

          .skill-name {
            font-weight: 500;
            color: #374151;
          }
        }

        .skill-score {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .skill-level {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 12px;
        }
      }
    }

    .skill-recommendations {
      h4 {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 16px;
      }

      .recommendations-list {
        .recommendation-item {
          padding: 12px;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          .rec-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;

            .rec-skill {
              font-weight: 500;
              color: #374151;
            }
          }

          .rec-suggestion {
            color: #6b7280;
            margin: 0 0 12px 0;
            line-height: 1.5;
          }

          .rec-actions {
            display: flex;
            gap: 8px;
          }
        }
      }
    }
  }
}

/* 响应式设计 - 平板设备 */
@media (max-width: 1024px) {
  .reports-page {
    .page-header {
      .header-card {
        .header-content {
          .header-info {
            .page-title {
              font-size: 24px;
            }

            .page-description {
              font-size: 14px;
            }
          }
        }
      }
    }

    .overview-stats {
      :deep(.ant-row) {
        .ant-col {
          margin-bottom: 16px;
        }
      }
    }

    .progress-detail-content {
      .analysis-summary {
        .summary-items {
          .summary-item {
            .item-header {
              .item-title {
                font-size: 14px;
              }
            }

            .item-description {
              font-size: 13px;
            }
          }
        }
      }
    }
  }
}

/* 响应式设计 - 手机设备 */
@media (max-width: 768px) {
  .reports-page {
    padding: 12px;

    .page-header {
      margin-bottom: 16px;

      .header-card {
        .header-content {
          flex-direction: column;
          text-align: center;
          gap: 16px;

          .header-info {
            .page-title {
              font-size: 20px;
              flex-direction: column;
              gap: 8px;
            }

            .page-description {
              font-size: 13px;
            }
          }

          .header-actions {
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px;

            :deep(.ant-button) {
              flex: 1;
              min-width: 120px;
            }

            :deep(.ant-radio-group) {
              width: 100%;
              margin-bottom: 8px;
            }

            :deep(.ant-picker) {
              width: 100%;
            }
          }
        }
      }
    }

    .overview-stats {
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

    .progress-chart {
      margin-bottom: 16px;

      .chart-card {
        .chart-header {
          flex-direction: column;
          gap: 12px;

          .chart-title {
            font-size: 16px;
          }

          .chart-actions {
            justify-content: center;
          }
        }
      }
    }

    .skills-overview {
      margin-bottom: 16px;

      .skills-card {
        .skills-grid {
          :deep(.ant-row) {
            .ant-col {
              margin-bottom: 12px;
            }
          }

          .skill-item {
            padding: 12px;

            .skill-header {
              .skill-name {
                font-size: 14px;
              }
            }

            .skill-score {
              font-size: 18px;
            }

            .skill-level {
              font-size: 11px;
            }
          }
        }
      }
    }

    .achievements-section {
      margin-bottom: 16px;

      .achievements-card {
        .achievements-list {
          .achievement-item {
            padding: 12px;
            margin-bottom: 8px;

            .achievement-header {
              gap: 8px;

              .achievement-icon {
                width: 32px;
                height: 32px;
              }

              .achievement-info {
                .achievement-title {
                  font-size: 14px;
                }

                .achievement-description {
                  font-size: 12px;
                }
              }
            }

            .achievement-progress {
              .progress-text {
                font-size: 10px;
              }
            }
          }
        }
      }
    }

    .goals-section {
      margin-bottom: 16px;

      .goals-card {
        .goals-list {
          .goal-item {
            margin-bottom: 12px;

            .goal-header {
              gap: 8px;

              .goal-info {
                .goal-title {
                  font-size: 13px;
                }

                .goal-deadline {
                  font-size: 11px;
                }
              }
            }

            .goal-progress {
              margin-left: 24px;
            }
          }
        }
      }
    }

    .suggestions-section {
      .suggestions-card {
        .suggestions-content {
          .suggestion-item {
            padding: 12px;
            margin-bottom: 12px;

            .suggestion-header {
              .suggestion-title {
                font-size: 14px;
              }
            }

            .suggestion-description {
              font-size: 12px;
            }

            .suggestion-actions {
              flex-wrap: wrap;
              gap: 8px;

              :deep(.ant-button) {
                flex: 1;
                min-width: 100px;
              }
            }
          }
        }
      }
    }

    .progress-detail-content {
      .analysis-summary {
        .summary-items {
          .summary-item {
            padding: 8px;
            margin-bottom: 8px;

            .item-header {
              .item-title {
                font-size: 13px;
              }
            }

            .item-description {
              font-size: 12px;
            }
          }
        }
      }
    }

    .skill-detail-content {
      .skill-overview {
        .skill-card {
          padding: 12px;

          .skill-header {
            .skill-name {
              font-size: 14px;
            }
          }

          .skill-score {
            font-size: 20px;
          }

          .skill-level {
            font-size: 11px;
          }
        }
      }

      .skill-recommendations {
        .recommendations-list {
          .recommendation-item {
            padding: 8px;
            margin-bottom: 8px;

            .rec-header {
              .rec-skill {
                font-size: 13px;
              }
            }

            .rec-suggestion {
              font-size: 12px;
            }

            .rec-actions {
              flex-wrap: wrap;
              gap: 6px;

              :deep(.ant-button) {
                flex: 1;
                min-width: 80px;
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
  .reports-page {
    padding: 8px;

    .page-header {
      .header-card {
        .header-content {
          .header-info {
            .page-title {
              font-size: 18px;
            }

            .page-description {
              font-size: 12px;
            }
          }

          .header-actions {
            :deep(.ant-button) {
              width: 100%;
              margin-bottom: 8px;
            }

            :deep(.ant-radio-group) {
              :deep(.ant-radio-button) {
                font-size: 12px;
                padding: 4px 8px;
              }
            }
          }
        }
      }
    }

    .overview-stats {
      :deep(.ant-row) {
        .ant-col {
          margin-bottom: 8px;
        }
      }

      .stat-card {
        .stat-content {
          .stat-icon {
            width: 32px;
            height: 32px;
          }

          .stat-info {
            .stat-value {
              font-size: 16px;
            }

            .stat-label {
              font-size: 11px;
            }
          }
        }
      }
    }

    .skills-overview {
      .skills-card {
        .skills-grid {
          :deep(.ant-row) {
            .ant-col {
              margin-bottom: 8px;
            }
          }

          .skill-item {
            padding: 8px;

            .skill-header {
              .skill-name {
                font-size: 13px;
              }
            }

            .skill-score {
              font-size: 16px;
            }

            .skill-level {
              font-size: 10px;
            }
          }
        }
      }
    }

    .achievements-section {
      .achievements-card {
        .achievements-list {
          .achievement-item {
            padding: 8px;

            .achievement-header {
              .achievement-icon {
                width: 28px;
                height: 28px;
              }

              .achievement-info {
                .achievement-title {
                  font-size: 13px;
                }

                .achievement-description {
                  font-size: 11px;
                }
              }
            }
          }
        }
      }
    }

    .goals-section {
      .goals-card {
        .goals-list {
          .goal-item {
            .goal-header {
              .goal-info {
                .goal-title {
                  font-size: 12px;
                }

                .goal-deadline {
                  font-size: 10px;
                }
              }
            }

            .goal-progress {
              margin-left: 20px;
            }
          }
        }
      }
    }

    .suggestions-section {
      .suggestions-card {
        .suggestions-content {
          .suggestion-item {
            padding: 8px;

            .suggestion-header {
              .suggestion-title {
                font-size: 13px;
              }
            }

            .suggestion-description {
              font-size: 11px;
            }

            .suggestion-actions {
              :deep(.ant-button) {
                width: 100%;
                margin-bottom: 6px;
              }
            }
          }
        }
      }
    }
  }
}
</style>