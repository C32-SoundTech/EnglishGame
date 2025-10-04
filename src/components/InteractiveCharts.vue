<template>
  <div class="interactive-charts">
    <!-- 增强的学习时长趋势图 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3 class="chart-title">
          <TrendingUp class="w-5 h-5 mr-2" />
          学习时长趋势分析
        </h3>
        <div class="chart-controls">
          <a-select v-model:value="timeRange" size="small" style="width: 100px" @change="updateTimeRange">
            <a-select-option value="week">本周</a-select-option>
            <a-select-option value="month">本月</a-select-option>
            <a-select-option value="quarter">本季度</a-select-option>
            <a-select-option value="year">本年</a-select-option>
          </a-select>
          <a-button-group size="small">
            <a-button :type="chartType === 'line' ? 'primary' : 'default'" @click="chartType = 'line'">
              <TrendingUp class="w-3 h-3" />
            </a-button>
            <a-button :type="chartType === 'bar' ? 'primary' : 'default'" @click="chartType = 'bar'">
              <BarChart3 class="w-3 h-3" />
            </a-button>
          </a-button-group>
          <a-button size="small" @click="exportChart('studyTime')">
            <Download class="w-3 h-3 mr-1" />
            导出
          </a-button>
        </div>
      </div>
      
      <div class="chart-container" ref="studyTimeChart" @click="handleChartClick"></div>
      
      <div class="chart-insights">
        <a-row :gutter="16">
          <a-col :span="6">
            <div class="insight-item">
              <div class="insight-value">{{ totalStudyTime }}h</div>
              <div class="insight-label">总学习时长</div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="insight-item">
              <div class="insight-value">{{ averageStudyTime }}min</div>
              <div class="insight-label">平均每日</div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="insight-item">
              <div class="insight-value">{{ maxStudyDay }}</div>
              <div class="insight-label">最长学习日</div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="insight-item">
              <div class="insight-value" :class="trendClass">
                <component :is="trendIcon" class="w-3 h-3 mr-1" />
                {{ trendPercentage }}%
              </div>
              <div class="insight-label">趋势变化</div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- 技能雷达图增强版 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3 class="chart-title">
          <Target class="w-5 h-5 mr-2" />
          技能能力分析
        </h3>
        <div class="chart-controls">
          <a-button-group size="small">
            <a-button :type="skillViewMode === 'current' ? 'primary' : 'default'" @click="skillViewMode = 'current'">
              当前水平
            </a-button>
            <a-button :type="skillViewMode === 'compare' ? 'primary' : 'default'" @click="skillViewMode = 'compare'">
              历史对比
            </a-button>
            <a-button :type="skillViewMode === 'target' ? 'primary' : 'default'" @click="skillViewMode = 'target'">
              目标对比
            </a-button>
          </a-button-group>
          <a-button size="small" @click="showSkillDetail = true">
            <Eye class="w-3 h-3 mr-1" />
            详情
          </a-button>
        </div>
      </div>
      
      <div class="chart-container" ref="skillRadarChart"></div>
      
      <div class="skill-breakdown">
        <a-row :gutter="[16, 16]">
          <a-col :xs="12" :md="8" :lg="4" v-for="skill in skillData" :key="skill.name">
            <div class="skill-card" @click="drillDownSkill(skill)">
              <div class="skill-header">
                <span class="skill-name">{{ skill.name }}</span>
                <span class="skill-score" :style="{ color: getSkillColor(skill.score) }">
                  {{ skill.score }}
                </span>
              </div>
              <div class="skill-progress">
                <a-progress 
                  :percent="skill.score" 
                  :stroke-color="getSkillColor(skill.score)"
                  :show-info="false"
                  size="small"
                />
              </div>
              <div class="skill-change">
                <component :is="skill.change >= 0 ? TrendingUp : TrendingDown" class="w-3 h-3 mr-1" />
                <span :class="skill.change >= 0 ? 'positive' : 'negative'">
                  {{ Math.abs(skill.change) }}
                </span>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- 学习活跃度热力图 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3 class="chart-title">
          <Calendar class="w-5 h-5 mr-2" />
          学习活跃度热力图
        </h3>
        <div class="chart-controls">
          <a-select v-model:value="heatmapYear" size="small" style="width: 100px" @change="updateHeatmap">
            <a-select-option value="2024">2024年</a-select-option>
            <a-select-option value="2023">2023年</a-select-option>
          </a-select>
          <a-button size="small" @click="showActivityDetail = true">
            <Info class="w-3 h-3 mr-1" />
            统计
          </a-button>
        </div>
      </div>
      
      <div class="heatmap-container">
        <div class="chart-container" ref="activityHeatmap"></div>
        <div class="heatmap-legend">
          <span class="legend-label">少</span>
          <div class="legend-colors">
            <div 
              class="legend-color" 
              v-for="(color, index) in heatmapColors" 
              :key="color" 
              :style="{ backgroundColor: color }"
              @click="filterByActivity(index)"
            ></div>
          </div>
          <span class="legend-label">多</span>
        </div>
      </div>
      
      <div class="activity-stats">
        <a-row :gutter="16">
          <a-col :span="6">
            <div class="stat-card">
              <div class="stat-value">{{ currentStreak }}</div>
              <div class="stat-label">连续学习天数</div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="stat-card">
              <div class="stat-value">{{ totalActiveDays }}</div>
              <div class="stat-label">总活跃天数</div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="stat-card">
              <div class="stat-value">{{ averageActivity }}</div>
              <div class="stat-label">平均活跃度</div>
            </div>
          </a-col>
          <a-col :span="6">
            <div class="stat-card">
              <div class="stat-value">{{ bestMonth }}</div>
              <div class="stat-label">最佳月份</div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- 知识点掌握度矩阵 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3 class="chart-title">
          <Brain class="w-5 h-5 mr-2" />
          知识点掌握度矩阵
        </h3>
        <div class="chart-controls">
          <a-select v-model:value="knowledgeFilter" size="small" style="width: 120px" @change="updateKnowledgeMatrix">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="vocabulary">词汇</a-select-option>
            <a-select-option value="grammar">语法</a-select-option>
            <a-select-option value="listening">听力</a-select-option>
          </a-select>
          <a-button size="small" @click="showKnowledgeDetail = true">
            <BarChart3 class="w-3 h-3 mr-1" />
            分析
          </a-button>
        </div>
      </div>
      
      <div class="knowledge-matrix">
        <div class="matrix-grid">
          <div 
            class="knowledge-cell" 
            v-for="item in filteredKnowledgeData" 
            :key="item.name"
            :class="getKnowledgeLevel(item)"
            @click="drillDownKnowledge(item)"
          >
            <div class="cell-header">
              <span class="cell-name">{{ item.name }}</span>
              <span class="cell-percentage">{{ Math.round(item.mastery / item.total * 100) }}%</span>
            </div>
            <div class="cell-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ 
                    width: `${item.mastery / item.total * 100}%`,
                    backgroundColor: getKnowledgeColor(item)
                  }"
                ></div>
              </div>
            </div>
            <div class="cell-stats">
              <span class="mastered">{{ item.mastery }}/{{ item.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 技能详情弹窗 -->
    <a-modal v-model:open="showSkillDetail" title="技能详细分析" width="800px">
      <div class="skill-detail-content">
        <SkillRadarChart :skill-data="skillData" />
        <div class="skill-recommendations">
          <h4>提升建议</h4>
          <a-list :data-source="skillRecommendations" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <component :is="item.icon" class="w-4 h-4" :style="{ color: item.color }" />
                  </template>
                  <template #title>{{ item.title }}</template>
                  <template #description>{{ item.description }}</template>
                </a-list-item-meta>
                <template #actions>
                  <a-button size="small" type="link" @click="applyRecommendation(item)">
                    应用
                  </a-button>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </a-modal>

    <!-- 活跃度详情弹窗 -->
    <a-modal v-model:open="showActivityDetail" title="学习活跃度统计" width="600px">
      <div class="activity-detail-content">
        <a-row :gutter="[16, 16]">
          <a-col :span="12">
            <a-statistic title="本月学习天数" :value="monthlyActiveDays" suffix="天" />
          </a-col>
          <a-col :span="12">
            <a-statistic title="本月平均时长" :value="monthlyAverageTime" suffix="分钟" />
          </a-col>
          <a-col :span="12">
            <a-statistic title="最长连续学习" :value="longestStreak" suffix="天" />
          </a-col>
          <a-col :span="12">
            <a-statistic title="学习效率指数" :value="efficiencyIndex" :precision="1" />
          </a-col>
        </a-row>
        
        <div class="activity-trends">
          <h4>学习习惯分析</h4>
          <div class="trend-item" v-for="trend in activityTrends" :key="trend.type">
            <div class="trend-icon" :style="{ backgroundColor: trend.color + '20', color: trend.color }">
              <component :is="trend.icon" class="w-4 h-4" />
            </div>
            <div class="trend-content">
              <div class="trend-title">{{ trend.title }}</div>
              <div class="trend-description">{{ trend.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 知识点详情弹窗 -->
    <a-modal v-model:open="showKnowledgeDetail" title="知识点掌握度分析" width="700px">
      <div class="knowledge-detail-content">
        <div class="knowledge-summary">
          <a-row :gutter="16">
            <a-col :span="6">
              <div class="summary-card excellent">
                <div class="summary-value">{{ excellentCount }}</div>
                <div class="summary-label">优秀</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="summary-card good">
                <div class="summary-value">{{ goodCount }}</div>
                <div class="summary-label">良好</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="summary-card average">
                <div class="summary-value">{{ averageCount }}</div>
                <div class="summary-label">一般</div>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="summary-card poor">
                <div class="summary-value">{{ poorCount }}</div>
                <div class="summary-label">待提升</div>
              </div>
            </a-col>
          </a-row>
        </div>
        
        <div class="knowledge-actions">
          <h4>推荐练习</h4>
          <a-list :data-source="knowledgeRecommendations" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>{{ item.name }}</template>
                  <template #description>
                    掌握度: {{ Math.round(item.mastery / item.total * 100) }}% | 
                    难度: {{ getDifficultyText(item.difficulty) }}
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a-button size="small" type="primary" @click="practiceKnowledge(item)">
                    练习
                  </a-button>
                  <a-button size="small" @click="reviewKnowledge(item)">
                    复习
                  </a-button>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import SkillRadarChart from './SkillRadarChart.vue'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Calendar,
  Brain,
  Download,
  Eye,
  Info,
  Clock,
  Trophy,
  Lightbulb,
  AlertTriangle
} from 'lucide-vue-next'

// 接口定义
interface StudyTimeData {
  date: string
  duration: number
}

interface SkillData {
  name: string
  score: number
  change: number
  target?: number
  history?: number[]
}

interface ActivityData {
  date: string
  value: number
}

interface KnowledgeData {
  name: string
  mastery: number
  total: number
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
}

// Props
const props = withDefaults(defineProps<{
  studyTimeData?: StudyTimeData[]
  skillData?: SkillData[]
  activityData?: ActivityData[]
  knowledgeData?: KnowledgeData[]
}>(), {
  studyTimeData: () => [
    { date: '2024-01-15', duration: 45 },
    { date: '2024-01-16', duration: 60 },
    { date: '2024-01-17', duration: 30 },
    { date: '2024-01-18', duration: 75 },
    { date: '2024-01-19', duration: 50 },
    { date: '2024-01-20', duration: 90 },
    { date: '2024-01-21', duration: 40 }
  ],
  skillData: () => [
    { name: '听力', score: 85, change: 5, target: 90 },
    { name: '口语', score: 78, change: -2, target: 85 },
    { name: '阅读', score: 92, change: 8, target: 95 },
    { name: '写作', score: 80, change: 3, target: 88 },
    { name: '词汇', score: 88, change: 12, target: 90 },
    { name: '语法', score: 82, change: 6, target: 87 }
  ],
  activityData: () => {
    const data = []
    const startDate = new Date('2024-01-01')
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 5)
      })
    }
    return data
  },
  knowledgeData: () => [
    { name: '动物单词', mastery: 45, total: 50, subject: 'vocabulary', difficulty: 'easy' },
    { name: '颜色单词', mastery: 38, total: 40, subject: 'vocabulary', difficulty: 'easy' },
    { name: '一般现在时', mastery: 18, total: 20, subject: 'grammar', difficulty: 'medium' },
    { name: '听力理解', mastery: 25, total: 35, subject: 'listening', difficulty: 'hard' }
  ]
})

const router = useRouter()

// 响应式数据
const timeRange = ref('month')
const chartType = ref('line')
const skillViewMode = ref('current')
const heatmapYear = ref('2024')
const knowledgeFilter = ref('all')

// 弹窗状态
const showSkillDetail = ref(false)
const showActivityDetail = ref(false)
const showKnowledgeDetail = ref(false)

// 图表引用
const studyTimeChart = ref<HTMLDivElement>()
const skillRadarChart = ref<HTMLDivElement>()
const activityHeatmap = ref<HTMLDivElement>()

// ECharts实例
let studyTimeChartInstance: echarts.ECharts | null = null
let skillRadarChartInstance: echarts.ECharts | null = null
let activityHeatmapInstance: echarts.ECharts | null = null

// 计算属性
const totalStudyTime = computed(() => {
  return Math.round(props.studyTimeData.reduce((total, item) => total + item.duration, 0) / 60 * 10) / 10
})

const averageStudyTime = computed(() => {
  return Math.round(props.studyTimeData.reduce((total, item) => total + item.duration, 0) / props.studyTimeData.length)
})

const maxStudyDay = computed(() => {
  const maxItem = props.studyTimeData.reduce((max, item) => item.duration > max.duration ? item : max)
  return maxItem.date.split('-').slice(1).join('/')
})

const trendPercentage = computed(() => {
  if (props.studyTimeData.length < 2) return 0
  const recent = props.studyTimeData.slice(-3).reduce((sum, item) => sum + item.duration, 0) / 3
  const previous = props.studyTimeData.slice(-6, -3).reduce((sum, item) => sum + item.duration, 0) / 3
  return Math.round((recent - previous) / previous * 100)
})

const trendClass = computed(() => trendPercentage.value >= 0 ? 'positive' : 'negative')
const trendIcon = computed(() => trendPercentage.value >= 0 ? TrendingUp : TrendingDown)

const currentStreak = computed(() => {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const activity = props.activityData.find(item => item.date === dateStr)
    if (activity && activity.value > 0) {
      streak++
    } else {
      break
    }
  }
  return streak
})

const totalActiveDays = computed(() => {
  return props.activityData.filter(item => item.value > 0).length
})

const averageActivity = computed(() => {
  const total = props.activityData.reduce((sum, item) => sum + item.value, 0)
  return Math.round(total / props.activityData.length * 10) / 10
})

const bestMonth = computed(() => {
  const monthlyData: { [key: string]: number } = {}
  props.activityData.forEach(item => {
    const month = item.date.substring(0, 7)
    monthlyData[month] = (monthlyData[month] || 0) + item.value
  })
  
  const bestMonthKey = Object.keys(monthlyData).reduce((a, b) => 
    monthlyData[a] > monthlyData[b] ? a : b
  )
  
  return bestMonthKey.split('-')[1] + '月'
})

const filteredKnowledgeData = computed(() => {
  if (knowledgeFilter.value === 'all') {
    return props.knowledgeData
  }
  return props.knowledgeData.filter(item => item.subject === knowledgeFilter.value)
})

const excellentCount = computed(() => {
  return props.knowledgeData.filter(item => (item.mastery / item.total) >= 0.9).length
})

const goodCount = computed(() => {
  return props.knowledgeData.filter(item => {
    const ratio = item.mastery / item.total
    return ratio >= 0.8 && ratio < 0.9
  }).length
})

const averageCount = computed(() => {
  return props.knowledgeData.filter(item => {
    const ratio = item.mastery / item.total
    return ratio >= 0.6 && ratio < 0.8
  }).length
})

const poorCount = computed(() => {
  return props.knowledgeData.filter(item => (item.mastery / item.total) < 0.6).length
})

// 模拟数据
const heatmapColors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']

const monthlyActiveDays = ref(18)
const monthlyAverageTime = ref(52)
const longestStreak = ref(12)
const efficiencyIndex = ref(8.7)

const skillRecommendations = ref([
  {
    icon: AlertTriangle,
    color: '#f5222d',
    title: '加强口语练习',
    description: '建议每天进行15分钟口语对话练习'
  },
  {
    icon: Trophy,
    color: '#52c41a',
    title: '保持阅读优势',
    description: '继续阅读英文故事，扩大词汇量'
  }
])

const activityTrends = ref([
  {
    type: 'time',
    icon: Clock,
    color: '#1890ff',
    title: '最佳学习时段',
    description: '下午2-4点学习效率最高'
  },
  {
    type: 'consistency',
    icon: Target,
    color: '#52c41a',
    title: '学习一致性',
    description: '保持每日学习的好习惯'
  }
])

const knowledgeRecommendations = computed(() => {
  return props.knowledgeData
    .filter(item => (item.mastery / item.total) < 0.8)
    .sort((a, b) => (a.mastery / a.total) - (b.mastery / b.total))
    .slice(0, 5)
})

// 工具函数
const getSkillColor = (score: number) => {
  if (score >= 90) return '#52c41a'
  if (score >= 80) return '#1890ff'
  if (score >= 70) return '#fa8c16'
  return '#f5222d'
}

const getKnowledgeLevel = (item: KnowledgeData) => {
  const percentage = item.mastery / item.total
  if (percentage >= 0.9) return 'excellent'
  if (percentage >= 0.8) return 'good'
  if (percentage >= 0.6) return 'average'
  return 'poor'
}

const getKnowledgeColor = (item: KnowledgeData) => {
  const percentage = item.mastery / item.total
  if (percentage >= 0.9) return '#52c41a'
  if (percentage >= 0.8) return '#1890ff'
  if (percentage >= 0.6) return '#fa8c16'
  return '#f5222d'
}

const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return '简单'
    case 'medium': return '中等'
    case 'hard': return '困难'
    default: return '未知'
  }
}

// 事件处理
const handleChartClick = (params: any) => {
  if (params.componentType === 'series') {
    message.info(`点击了 ${params.name}: ${params.value}分钟`)
  }
}

const drillDownSkill = (skill: SkillData) => {
  router.push(`/games?type=${skill.name.toLowerCase()}`)
}

const drillDownKnowledge = (item: KnowledgeData) => {
  router.push(`/courses?subject=${item.subject}&topic=${item.name}`)
}

const filterByActivity = (level: number) => {
  message.info(`筛选活跃度等级: ${level}`)
  // 这里可以添加筛选逻辑
}

const exportChart = (type: string) => {
  message.success(`导出${type}图表成功`)
  // 这里可以添加导出逻辑
}

const applyRecommendation = (recommendation: any) => {
  message.success(`已应用建议: ${recommendation.title}`)
}

const practiceKnowledge = (item: KnowledgeData) => {
  router.push(`/games?type=${item.subject}&topic=${item.name}`)
}

const reviewKnowledge = (item: KnowledgeData) => {
  router.push(`/courses?subject=${item.subject}&topic=${item.name}`)
}

// 图表更新函数
const updateTimeRange = () => {
  initStudyTimeChart()
}

const updateHeatmap = () => {
  initActivityHeatmap()
}

const updateKnowledgeMatrix = () => {
  // 知识点矩阵更新逻辑
}

// 图表初始化
const initCharts = () => {
  initStudyTimeChart()
  initSkillRadarChart()
  initActivityHeatmap()
}

const initStudyTimeChart = () => {
  if (!studyTimeChart.value) return
  
  studyTimeChartInstance = echarts.init(studyTimeChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}分钟'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.studyTimeData.map(item => item.date.split('-').slice(1).join('/')),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: {
      type: 'value',
      name: '分钟',
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [{
      data: props.studyTimeData.map(item => item.duration),
      type: chartType.value,
      smooth: chartType.value === 'line',
      lineStyle: chartType.value === 'line' ? { color: '#1890ff', width: 3 } : undefined,
      areaStyle: chartType.value === 'line' ? { color: 'rgba(24, 144, 255, 0.1)' } : undefined,
      itemStyle: { color: '#1890ff' },
      barWidth: chartType.value === 'bar' ? '60%' : undefined,
      animationDuration: 2000,
      animationEasing: 'bounceOut'
    }]
  }
  
  studyTimeChartInstance.setOption(option)
  studyTimeChartInstance.on('click', handleChartClick)
}

const initSkillRadarChart = () => {
  if (!skillRadarChart.value) return
  
  skillRadarChartInstance = echarts.init(skillRadarChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: props.skillData.map(item => ({ name: item.name, max: 100 })),
      radius: '70%',
      splitArea: {
        areaStyle: {
          color: ['rgba(114, 172, 209, 0.2)', 'rgba(114, 172, 209, 0.4)']
        }
      }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: props.skillData.map(item => item.score),
          name: '当前水平',
          areaStyle: { color: 'rgba(24, 144, 255, 0.3)' },
          lineStyle: { color: '#1890ff', width: 2 }
        },
        ...(skillViewMode.value === 'target' ? [{
          value: props.skillData.map(item => item.target || 85),
          name: '目标水平',
          areaStyle: { color: 'rgba(82, 196, 26, 0.2)' },
          lineStyle: { color: '#52c41a', width: 2, type: 'dashed' }
        }] : [])
      ]
    }]
  }
  
  skillRadarChartInstance.setOption(option)
}

const initActivityHeatmap = () => {
  if (!activityHeatmap.value) return
  
  activityHeatmapInstance = echarts.init(activityHeatmap.value)
  
  const startDate = new Date(`${heatmapYear.value}-01-01`)
  const endDate = new Date(`${heatmapYear.value}-12-31`)
  const data = []
  
  for (let time = startDate.getTime(); time <= endDate.getTime(); time += 24 * 60 * 60 * 1000) {
    const date = new Date(time)
    const dateStr = date.toISOString().split('T')[0]
    const activity = props.activityData.find(item => item.date === dateStr)
    data.push([dateStr, activity ? activity.value : 0])
  }
  
  const option = {
    tooltip: {
      formatter: (params: any) => {
        const date = new Date(params.data[0])
        return `${date.getMonth() + 1}月${date.getDate()}日<br/>学习活跃度: ${params.data[1]}`
      }
    },
    visualMap: {
      min: 0,
      max: 4,
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      top: 'bottom',
      pieces: [
        { min: 0, max: 0, color: heatmapColors[0] },
        { min: 1, max: 1, color: heatmapColors[1] },
        { min: 2, max: 2, color: heatmapColors[2] },
        { min: 3, max: 3, color: heatmapColors[3] },
        { min: 4, max: 4, color: heatmapColors[4] }
      ],
      show: false
    },
    calendar: {
      top: 20,
      left: 30,
      right: 30,
      cellSize: ['auto', 13],
      range: heatmapYear.value,
      itemStyle: {
        borderWidth: 0.5
      },
      yearLabel: { show: false }
    },
    series: [{
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: data
    }]
  }
  
  activityHeatmapInstance.setOption(option)
}

const handleResize = () => {
  studyTimeChartInstance?.resize()
  skillRadarChartInstance?.resize()
  activityHeatmapInstance?.resize()
}

// 监听器
watch([timeRange, chartType], () => {
  initStudyTimeChart()
})

watch(skillViewMode, () => {
  initSkillRadarChart()
})

watch(heatmapYear, () => {
  initActivityHeatmap()
})

// 生命周期
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  studyTimeChartInstance?.dispose()
  skillRadarChartInstance?.dispose()
  activityHeatmapInstance?.dispose()
})
</script>

<style lang="less" scoped>
.interactive-charts {
  .chart-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid #f0f0f0;
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      .chart-title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        color: #262626;
        margin: 0;
      }
      
      .chart-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
    
    .chart-container {
      height: 300px;
      margin-bottom: 20px;
    }
    
    .chart-insights {
      .insight-item {
        text-align: center;
        
        .insight-value {
          font-size: 20px;
          font-weight: 600;
          color: #262626;
          margin-bottom: 4px;
          
          &.positive {
            color: #52c41a;
          }
          
          &.negative {
            color: #f5222d;
          }
        }
        
        .insight-label {
          font-size: 12px;
          color: #8c8c8c;
        }
      }
    }
  }
  
  .skill-breakdown {
    .skill-card {
      background: #fafafa;
      border-radius: 6px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: #f0f0f0;
        transform: translateY(-2px);
      }
      
      .skill-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .skill-name {
          font-size: 12px;
          color: #595959;
        }
        
        .skill-score {
          font-size: 14px;
          font-weight: 600;
        }
      }
      
      .skill-progress {
        margin-bottom: 8px;
      }
      
      .skill-change {
        display: flex;
        align-items: center;
        font-size: 11px;
        
        .positive {
          color: #52c41a;
        }
        
        .negative {
          color: #f5222d;
        }
      }
    }
  }
  
  .heatmap-container {
    .chart-container {
      height: 160px;
      margin-bottom: 16px;
    }
    
    .heatmap-legend {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      
      .legend-label {
        font-size: 12px;
        color: #8c8c8c;
      }
      
      .legend-colors {
        display: flex;
        margin: 0 8px;
        
        .legend-color {
          width: 12px;
          height: 12px;
          margin: 0 1px;
          border-radius: 2px;
          cursor: pointer;
          transition: transform 0.2s ease;
          
          &:hover {
            transform: scale(1.2);
          }
        }
      }
    }
  }
  
  .activity-stats {
    .stat-card {
      text-align: center;
      background: #fafafa;
      border-radius: 6px;
      padding: 12px;
      
      .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: #262626;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 12px;
        color: #8c8c8c;
      }
    }
  }
  
  .knowledge-matrix {
    .matrix-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      
      .knowledge-cell {
        background: #fafafa;
        border-radius: 8px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        border-left: 4px solid transparent;
        
        &:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
        }
        
        &.excellent {
          border-left-color: #52c41a;
        }
        
        &.good {
          border-left-color: #1890ff;
        }
        
        &.average {
          border-left-color: #fa8c16;
        }
        
        &.poor {
          border-left-color: #f5222d;
        }
        
        .cell-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          
          .cell-name {
            font-weight: 500;
            color: #262626;
          }
          
          .cell-percentage {
            font-weight: 600;
            color: #1890ff;
          }
        }
        
        .cell-progress {
          margin-bottom: 8px;
          
          .progress-bar {
            height: 4px;
            background: #f0f0f0;
            border-radius: 2px;
            overflow: hidden;
            
            .progress-fill {
              height: 100%;
              transition: width 0.3s ease;
            }
          }
        }
        
        .cell-stats {
          font-size: 12px;
          color: #8c8c8c;
        }
      }
    }
  }
  
  // 弹窗样式
  .skill-detail-content {
    .skill-recommendations {
      margin-top: 24px;
      
      h4 {
        margin-bottom: 16px;
        color: #262626;
      }
    }
  }
  
  .activity-detail-content {
    .activity-trends {
      margin-top: 24px;
      
      h4 {
        margin-bottom: 16px;
        color: #262626;
      }
      
      .trend-item {
        display: flex;
        align-items: center;
        padding: 12px;
        background: #fafafa;
        border-radius: 6px;
        margin-bottom: 8px;
        
        .trend-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }
        
        .trend-content {
          .trend-title {
            font-weight: 500;
            color: #262626;
            margin-bottom: 4px;
          }
          
          .trend-description {
            font-size: 12px;
            color: #8c8c8c;
          }
        }
      }
    }
  }
  
  .knowledge-detail-content {
    .knowledge-summary {
      margin-bottom: 24px;
      
      .summary-card {
        text-align: center;
        padding: 16px;
        border-radius: 6px;
        
        &.excellent {
          background: #f6ffed;
          border: 1px solid #b7eb8f;
        }
        
        &.good {
          background: #e6f7ff;
          border: 1px solid #91d5ff;
        }
        
        &.average {
          background: #fff7e6;
          border: 1px solid #ffd591;
        }
        
        &.poor {
          background: #fff2f0;
          border: 1px solid #ffb3b3;
        }
        
        .summary-value {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .summary-label {
          font-size: 12px;
          color: #8c8c8c;
        }
      }
    }
    
    .knowledge-actions {
      h4 {
        margin-bottom: 16px;
        color: #262626;
      }
    }
  }
}

@media (max-width: 768px) {
  .interactive-charts {
    .chart-section {
      padding: 16px;
      
      .chart-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        
        .chart-controls {
          width: 100%;
          justify-content: space-between;
        }
      }
      
      .chart-container {
        height: 250px;
      }
    }
    
    .knowledge-matrix {
      .matrix-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>