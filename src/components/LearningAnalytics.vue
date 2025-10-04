<template>
  <div class="learning-analytics">
    <!-- 知识点掌握度分析 -->
    <div class="analytics-section">
      <div class="section-header">
        <h3 class="section-title">
          <Brain class="w-5 h-5 mr-2" />
          知识点掌握度分析
        </h3>
        <a-select v-model:value="selectedSubject" size="small" style="width: 120px">
          <a-select-option value="all">全部</a-select-option>
          <a-select-option value="vocabulary">词汇</a-select-option>
          <a-select-option value="grammar">语法</a-select-option>
          <a-select-option value="listening">听力</a-select-option>
        </a-select>
      </div>
      
      <div class="knowledge-grid">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :lg="6" v-for="item in filteredKnowledgeData" :key="item.name">
            <div class="knowledge-card" :class="getMasteryLevel(item.mastery, item.total)">
              <div class="knowledge-header">
                <span class="knowledge-name">{{ item.name }}</span>
                <span class="knowledge-percentage">{{ Math.round(item.mastery / item.total * 100) }}%</span>
              </div>
              <div class="knowledge-progress">
                <a-progress 
                  :percent="Math.round(item.mastery / item.total * 100)"
                  :stroke-color="getMasteryColor(item.mastery, item.total)"
                  :show-info="false"
                  size="small"
                />
              </div>
              <div class="knowledge-stats">
                <span class="mastered">已掌握: {{ item.mastery }}</span>
                <span class="total">总计: {{ item.total }}</span>
              </div>
              <div class="knowledge-actions">
                <a-button size="small" type="link" @click="practiceKnowledge(item)">
                  <Play class="w-3 h-3 mr-1" />
                  练习
                </a-button>
                <a-button size="small" type="link" @click="reviewKnowledge(item)">
                  <BookOpen class="w-3 h-3 mr-1" />
                  复习
                </a-button>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- 学习效率统计 -->
    <div class="analytics-section">
      <div class="section-header">
        <h3 class="section-title">
          <Zap class="w-5 h-5 mr-2" />
          学习效率统计
        </h3>
        <a-radio-group v-model:value="efficiencyPeriod" button-style="solid" size="small">
          <a-radio-button value="week">本周</a-radio-button>
          <a-radio-button value="month">本月</a-radio-button>
          <a-radio-button value="quarter">本季度</a-radio-button>
        </a-radio-group>
      </div>
      
      <div class="efficiency-dashboard">
        <a-row :gutter="[24, 24]">
          <a-col :xs="24" :md="12" :lg="8">
            <div class="efficiency-card">
              <div class="efficiency-header">
                <div class="efficiency-icon" style="background: #1890ff20; color: #1890ff;">
                  <Clock class="w-6 h-6" />
                </div>
                <div class="efficiency-info">
                  <h4>平均学习时长</h4>
                  <p class="efficiency-value">{{ averageStudyTime }}分钟</p>
                  <p class="efficiency-change" :class="studyTimeChange >= 0 ? 'positive' : 'negative'">
                    <component :is="studyTimeChange >= 0 ? TrendingUp : TrendingDown" class="w-3 h-3 mr-1" />
                    {{ Math.abs(studyTimeChange) }}%
                  </p>
                </div>
              </div>
              <div class="efficiency-chart" ref="studyTimeEfficiencyChart"></div>
            </div>
          </a-col>
          
          <a-col :xs="24" :md="12" :lg="8">
            <div class="efficiency-card">
              <div class="efficiency-header">
                <div class="efficiency-icon" style="background: #52c41a20; color: #52c41a;">
                  <Target class="w-6 h-6" />
                </div>
                <div class="efficiency-info">
                  <h4>正确率趋势</h4>
                  <p class="efficiency-value">{{ averageAccuracy }}%</p>
                  <p class="efficiency-change" :class="accuracyChange >= 0 ? 'positive' : 'negative'">
                    <component :is="accuracyChange >= 0 ? TrendingUp : TrendingDown" class="w-3 h-3 mr-1" />
                    {{ Math.abs(accuracyChange) }}%
                  </p>
                </div>
              </div>
              <div class="efficiency-chart" ref="accuracyTrendChart"></div>
            </div>
          </a-col>
          
          <a-col :xs="24" :md="12" :lg="8">
            <div class="efficiency-card">
              <div class="efficiency-header">
                <div class="efficiency-icon" style="background: #fa8c1620; color: #fa8c16;">
                  <Gamepad2 class="w-6 h-6" />
                </div>
                <div class="efficiency-info">
                  <h4>学习专注度</h4>
                  <p class="efficiency-value">{{ focusScore }}分</p>
                  <p class="efficiency-change" :class="focusChange >= 0 ? 'positive' : 'negative'">
                    <component :is="focusChange >= 0 ? TrendingUp : TrendingDown" class="w-3 h-3 mr-1" />
                    {{ Math.abs(focusChange) }}%
                  </p>
                </div>
              </div>
              <div class="efficiency-chart" ref="focusScoreChart"></div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- 个性化学习建议 -->
    <div class="analytics-section">
      <div class="section-header">
        <h3 class="section-title">
          <Lightbulb class="w-5 h-5 mr-2" />
          个性化学习建议
        </h3>
        <a-button size="small" @click="refreshSuggestions">
          <RotateCcw class="w-3 h-3 mr-1" />
          刷新建议
        </a-button>
      </div>
      
      <div class="suggestions-grid">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :md="12" v-for="suggestion in personalizedSuggestions" :key="suggestion.id">
            <div class="suggestion-card" :class="suggestion.priority">
              <div class="suggestion-header">
                <div class="suggestion-icon" :style="{ backgroundColor: suggestion.color + '20', color: suggestion.color }">
                  <component :is="suggestion.icon" class="w-5 h-5" />
                </div>
                <div class="suggestion-meta">
                  <h4 class="suggestion-title">{{ suggestion.title }}</h4>
                  <a-tag :color="getPriorityColor(suggestion.priority)" size="small">
                    {{ getPriorityText(suggestion.priority) }}
                  </a-tag>
                </div>
              </div>
              <p class="suggestion-description">{{ suggestion.description }}</p>
              <div class="suggestion-data">
                <div class="data-item" v-for="data in suggestion.data" :key="data.label">
                  <span class="data-label">{{ data.label }}:</span>
                  <span class="data-value" :style="{ color: data.color }">{{ data.value }}</span>
                </div>
              </div>
              <div class="suggestion-actions">
                <a-button type="primary" size="small" @click="applySuggestion(suggestion)">
                  {{ suggestion.actionText }}
                </a-button>
                <a-button size="small" @click="dismissSuggestion(suggestion.id)">
                  忽略
                </a-button>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- 学习热力图 -->
    <div class="analytics-section">
      <div class="section-header">
        <h3 class="section-title">
          <Calendar class="w-5 h-5 mr-2" />
          学习活跃度热力图
        </h3>
        <a-select v-model:value="heatmapYear" size="small" style="width: 100px">
          <a-select-option value="2024">2024年</a-select-option>
          <a-select-option value="2023">2023年</a-select-option>
        </a-select>
      </div>
      
      <div class="heatmap-container">
        <div class="heatmap-chart" ref="learningHeatmap"></div>
        <div class="heatmap-legend">
          <span class="legend-label">少</span>
          <div class="legend-colors">
            <div class="legend-color" v-for="color in heatmapColors" :key="color" :style="{ backgroundColor: color }"></div>
          </div>
          <span class="legend-label">多</span>
        </div>
        <div class="heatmap-stats">
          <div class="stat-item">
            <span class="stat-label">连续学习天数</span>
            <span class="stat-value">{{ currentStreak }}天</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总活跃天数</span>
            <span class="stat-value">{{ totalActiveDays }}天</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均活跃度</span>
            <span class="stat-value">{{ averageActivity }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  Brain,
  Zap,
  Lightbulb,
  Calendar,
  Clock,
  Target,
  Gamepad2,
  TrendingUp,
  TrendingDown,
  Play,
  BookOpen,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-vue-next'

// 接口定义
interface KnowledgeItem {
  name: string
  mastery: number
  total: number
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  lastPracticed: string
}

interface EfficiencyData {
  date: string
  studyTime: number
  accuracy: number
  focusScore: number
}

interface Suggestion {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  type: 'weakness' | 'strength' | 'habit' | 'goal'
  icon: any
  color: string
  data: Array<{ label: string; value: string; color: string }>
  actionText: string
}

// Props
const props = withDefaults(defineProps<{
  knowledgeData?: KnowledgeItem[]
  efficiencyData?: EfficiencyData[]
  activityData?: Array<{ date: string; value: number }>
}>(), {
  knowledgeData: () => [
    { name: '动物单词', mastery: 45, total: 50, subject: 'vocabulary', difficulty: 'easy', lastPracticed: '2024-01-20' },
    { name: '颜色单词', mastery: 38, total: 40, subject: 'vocabulary', difficulty: 'easy', lastPracticed: '2024-01-19' },
    { name: '一般现在时', mastery: 18, total: 20, subject: 'grammar', difficulty: 'medium', lastPracticed: '2024-01-18' },
    { name: '听力理解', mastery: 25, total: 35, subject: 'listening', difficulty: 'hard', lastPracticed: '2024-01-17' }
  ],
  efficiencyData: () => {
    const data = []
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        studyTime: Math.floor(Math.random() * 60) + 30,
        accuracy: Math.floor(Math.random() * 30) + 70,
        focusScore: Math.floor(Math.random() * 20) + 80
      })
    }
    return data.reverse()
  },
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
  }
})

const router = useRouter()

// 响应式数据
const selectedSubject = ref('all')
const efficiencyPeriod = ref('month')
const heatmapYear = ref('2024')

// 图表引用
const studyTimeEfficiencyChart = ref<HTMLDivElement>()
const accuracyTrendChart = ref<HTMLDivElement>()
const focusScoreChart = ref<HTMLDivElement>()
const learningHeatmap = ref<HTMLDivElement>()

// ECharts实例
let studyTimeChartInstance: echarts.ECharts | null = null
let accuracyChartInstance: echarts.ECharts | null = null
let focusChartInstance: echarts.ECharts | null = null
let heatmapInstance: echarts.ECharts | null = null

// 计算属性
const filteredKnowledgeData = computed(() => {
  if (selectedSubject.value === 'all') {
    return props.knowledgeData
  }
  return props.knowledgeData.filter(item => item.subject === selectedSubject.value)
})

const averageStudyTime = computed(() => {
  const recent = props.efficiencyData.slice(-7)
  return Math.round(recent.reduce((sum, item) => sum + item.studyTime, 0) / recent.length)
})

const studyTimeChange = computed(() => {
  const recent = props.efficiencyData.slice(-7)
  const previous = props.efficiencyData.slice(-14, -7)
  if (previous.length === 0) return 0
  
  const recentAvg = recent.reduce((sum, item) => sum + item.studyTime, 0) / recent.length
  const previousAvg = previous.reduce((sum, item) => sum + item.studyTime, 0) / previous.length
  
  return Math.round((recentAvg - previousAvg) / previousAvg * 100)
})

const averageAccuracy = computed(() => {
  const recent = props.efficiencyData.slice(-7)
  return Math.round(recent.reduce((sum, item) => sum + item.accuracy, 0) / recent.length)
})

const accuracyChange = computed(() => {
  const recent = props.efficiencyData.slice(-7)
  const previous = props.efficiencyData.slice(-14, -7)
  if (previous.length === 0) return 0
  
  const recentAvg = recent.reduce((sum, item) => sum + item.accuracy, 0) / recent.length
  const previousAvg = previous.reduce((sum, item) => sum + item.accuracy, 0) / previous.length
  
  return Math.round((recentAvg - previousAvg) / previousAvg * 100)
})

const focusScore = computed(() => {
  const recent = props.efficiencyData.slice(-7)
  return Math.round(recent.reduce((sum, item) => sum + item.focusScore, 0) / recent.length)
})

const focusChange = computed(() => {
  const recent = props.efficiencyData.slice(-7)
  const previous = props.efficiencyData.slice(-14, -7)
  if (previous.length === 0) return 0
  
  const recentAvg = recent.reduce((sum, item) => sum + item.focusScore, 0) / recent.length
  const previousAvg = previous.reduce((sum, item) => sum + item.focusScore, 0) / previous.length
  
  return Math.round((recentAvg - previousAvg) / previousAvg * 100)
})

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

const heatmapColors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']

// 个性化建议
const personalizedSuggestions = ref<Suggestion[]>([
  {
    id: '1',
    title: '加强听力练习',
    description: '你的听力成绩相对较弱，建议增加听力练习时间',
    priority: 'high',
    type: 'weakness',
    icon: AlertTriangle,
    color: '#f5222d',
    data: [
      { label: '当前水平', value: '71%', color: '#f5222d' },
      { label: '目标水平', value: '85%', color: '#52c41a' }
    ],
    actionText: '开始听力训练'
  },
  {
    id: '2',
    title: '保持词汇学习优势',
    description: '你在词汇方面表现优秀，继续保持这个学习节奏',
    priority: 'medium',
    type: 'strength',
    icon: CheckCircle,
    color: '#52c41a',
    data: [
      { label: '掌握率', value: '92%', color: '#52c41a' },
      { label: '进步幅度', value: '+15%', color: '#1890ff' }
    ],
    actionText: '继续练习'
  },
  {
    id: '3',
    title: '调整学习时间',
    description: '根据数据分析，下午2-4点是你学习效率最高的时段',
    priority: 'low',
    type: 'habit',
    icon: Info,
    color: '#1890ff',
    data: [
      { label: '最佳时段', value: '14:00-16:00', color: '#1890ff' },
      { label: '效率提升', value: '+25%', color: '#52c41a' }
    ],
    actionText: '设置提醒'
  }
])

// 工具函数
const getMasteryLevel = (mastery: number, total: number) => {
  const percentage = mastery / total
  if (percentage >= 0.9) return 'excellent'
  if (percentage >= 0.8) return 'good'
  if (percentage >= 0.6) return 'average'
  return 'poor'
}

const getMasteryColor = (mastery: number, total: number) => {
  const percentage = mastery / total
  if (percentage >= 0.9) return '#52c41a'
  if (percentage >= 0.8) return '#1890ff'
  if (percentage >= 0.6) return '#fa8c16'
  return '#f5222d'
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'red'
    case 'medium': return 'orange'
    case 'low': return 'blue'
    default: return 'default'
  }
}

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return '高优先级'
    case 'medium': return '中优先级'
    case 'low': return '低优先级'
    default: return '普通'
  }
}

// 事件处理
const practiceKnowledge = (item: KnowledgeItem) => {
  router.push(`/games?type=${item.subject}&topic=${item.name}`)
}

const reviewKnowledge = (item: KnowledgeItem) => {
  router.push(`/courses?subject=${item.subject}&topic=${item.name}`)
}

const applySuggestion = (suggestion: Suggestion) => {
  message.success(`已应用建议: ${suggestion.title}`)
  // 这里可以添加具体的应用逻辑
}

const dismissSuggestion = (id: string) => {
  const index = personalizedSuggestions.value.findIndex(s => s.id === id)
  if (index > -1) {
    personalizedSuggestions.value.splice(index, 1)
    message.info('已忽略该建议')
  }
}

const refreshSuggestions = () => {
  message.loading('正在生成新的学习建议...', 1)
  // 这里可以添加重新生成建议的逻辑
}

// 图表初始化
const initCharts = () => {
  initStudyTimeChart()
  initAccuracyChart()
  initFocusChart()
  initHeatmap()
}

const initStudyTimeChart = () => {
  if (!studyTimeEfficiencyChart.value) return
  
  studyTimeChartInstance = echarts.init(studyTimeEfficiencyChart.value)
  
  const data = props.efficiencyData.slice(-7)
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
      data: data.map(item => item.date.split('-').slice(1).join('/')),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 10, color: '#8c8c8c' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 10, color: '#8c8c8c' },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [{
      data: data.map(item => item.studyTime),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#1890ff', width: 2 },
      areaStyle: { color: 'rgba(24, 144, 255, 0.1)' },
      symbol: 'circle',
      symbolSize: 4
    }]
  }
  
  studyTimeChartInstance.setOption(option)
}

const initAccuracyChart = () => {
  if (!accuracyTrendChart.value) return
  
  accuracyChartInstance = echarts.init(accuracyTrendChart.value)
  
  const data = props.efficiencyData.slice(-7)
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date.split('-').slice(1).join('/')),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 10, color: '#8c8c8c' }
    },
    yAxis: {
      type: 'value',
      min: 60,
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 10, color: '#8c8c8c' },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [{
      data: data.map(item => item.accuracy),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#52c41a', width: 2 },
      areaStyle: { color: 'rgba(82, 196, 26, 0.1)' },
      symbol: 'circle',
      symbolSize: 4
    }]
  }
  
  accuracyChartInstance.setOption(option)
}

const initFocusChart = () => {
  if (!focusScoreChart.value) return
  
  focusChartInstance = echarts.init(focusScoreChart.value)
  
  const data = props.efficiencyData.slice(-7)
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}分'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date.split('-').slice(1).join('/')),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 10, color: '#8c8c8c' }
    },
    yAxis: {
      type: 'value',
      min: 70,
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 10, color: '#8c8c8c' },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [{
      data: data.map(item => item.focusScore),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#fa8c16', width: 2 },
      areaStyle: { color: 'rgba(250, 140, 22, 0.1)' },
      symbol: 'circle',
      symbolSize: 4
    }]
  }
  
  focusChartInstance.setOption(option)
}

const initHeatmap = () => {
  if (!learningHeatmap.value) return
  
  heatmapInstance = echarts.init(learningHeatmap.value)
  
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
  
  heatmapInstance.setOption(option)
}

const handleResize = () => {
  studyTimeChartInstance?.resize()
  accuracyChartInstance?.resize()
  focusChartInstance?.resize()
  heatmapInstance?.resize()
}

// 监听器
watch([selectedSubject, efficiencyPeriod, heatmapYear], () => {
  initCharts()
})

// 生命周期
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  studyTimeChartInstance?.dispose()
  accuracyChartInstance?.dispose()
  focusChartInstance?.dispose()
  heatmapInstance?.dispose()
})
</script>

<style lang="less" scoped>
.learning-analytics {
  .analytics-section {
    margin-bottom: 32px;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .section-title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        color: #262626;
        margin: 0;
      }
    }
  }
  
  .knowledge-grid {
    .knowledge-card {
      background: white;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #f0f0f0;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
      
      &.excellent {
        border-left: 4px solid #52c41a;
      }
      
      &.good {
        border-left: 4px solid #1890ff;
      }
      
      &.average {
        border-left: 4px solid #fa8c16;
      }
      
      &.poor {
        border-left: 4px solid #f5222d;
      }
      
      .knowledge-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .knowledge-name {
          font-weight: 500;
          color: #262626;
        }
        
        .knowledge-percentage {
          font-weight: 600;
          color: #1890ff;
        }
      }
      
      .knowledge-progress {
        margin-bottom: 8px;
      }
      
      .knowledge-stats {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #8c8c8c;
        margin-bottom: 12px;
      }
      
      .knowledge-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
  
  .efficiency-dashboard {
    .efficiency-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      border: 1px solid #f0f0f0;
      height: 200px;
      
      .efficiency-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16px;
        
        .efficiency-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }
        
        .efficiency-info {
          flex: 1;
          
          h4 {
            margin: 0 0 4px 0;
            font-size: 14px;
            color: #8c8c8c;
          }
          
          .efficiency-value {
            font-size: 24px;
            font-weight: 600;
            color: #262626;
            margin: 0 0 4px 0;
          }
          
          .efficiency-change {
            display: flex;
            align-items: center;
            font-size: 12px;
            
            &.positive {
              color: #52c41a;
            }
            
            &.negative {
              color: #f5222d;
            }
          }
        }
      }
      
      .efficiency-chart {
        height: 80px;
      }
    }
  }
  
  .suggestions-grid {
    .suggestion-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      border: 1px solid #f0f0f0;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      &.high {
        border-left: 4px solid #f5222d;
      }
      
      &.medium {
        border-left: 4px solid #fa8c16;
      }
      
      &.low {
        border-left: 4px solid #1890ff;
      }
      
      .suggestion-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        
        .suggestion-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }
        
        .suggestion-meta {
          flex: 1;
          
          .suggestion-title {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 500;
            color: #262626;
          }
        }
      }
      
      .suggestion-description {
        color: #595959;
        margin-bottom: 12px;
        line-height: 1.5;
      }
      
      .suggestion-data {
        margin-bottom: 16px;
        
        .data-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 12px;
          
          .data-label {
            color: #8c8c8c;
          }
          
          .data-value {
            font-weight: 500;
          }
        }
      }
      
      .suggestion-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
  
  .heatmap-container {
    background: white;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #f0f0f0;
    
    .heatmap-chart {
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
        }
      }
    }
    
    .heatmap-stats {
      display: flex;
      justify-content: space-around;
      
      .stat-item {
        text-align: center;
        
        .stat-label {
          display: block;
          font-size: 12px;
          color: #8c8c8c;
          margin-bottom: 4px;
        }
        
        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: #262626;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .learning-analytics {
    .efficiency-dashboard {
      .efficiency-card {
        height: auto;
        
        .efficiency-chart {
          height: 60px;
        }
      }
    }
    
    .heatmap-container {
      .heatmap-chart {
        height: 120px;
      }
    }
  }
}
</style>