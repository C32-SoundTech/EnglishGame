<template>
  <div class="learning-charts">
    <!-- 学习时长趋势图 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3 class="chart-title">
          <TrendingUp class="w-5 h-5 mr-2" />
          学习时长趋势
        </h3>
        <a-select v-model:value="timeRange" size="small" style="width: 100px">
          <a-select-option value="week">本周</a-select-option>
          <a-select-option value="month">本月</a-select-option>
          <a-select-option value="quarter">本季度</a-select-option>
        </a-select>
      </div>
      <div class="chart-container" ref="studyTimeChart"></div>
      <div class="chart-stats">
        <div class="stat-item">
          <span class="stat-label">总时长</span>
          <span class="stat-value">{{ totalStudyTime }}小时</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均时长</span>
          <span class="stat-value">{{ averageStudyTime }}分钟</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">最长单次</span>
          <span class="stat-value">{{ maxStudyTime }}分钟</span>
        </div>
      </div>
    </div>

    <!-- 技能发展雷达图 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3 class="chart-title">
          <Target class="w-5 h-5 mr-2" />
          技能发展雷达
        </h3>
        <a-button-group size="small">
          <a-button :type="skillViewMode === 'current' ? 'primary' : 'default'" @click="skillViewMode = 'current'">
            当前
          </a-button>
          <a-button :type="skillViewMode === 'compare' ? 'primary' : 'default'" @click="skillViewMode = 'compare'">
            对比
          </a-button>
        </a-button-group>
      </div>
      <div class="chart-container" ref="skillRadarChart"></div>
      <div class="skill-progress">
        <div class="skill-item" v-for="skill in skillData" :key="skill.name">
          <div class="skill-info">
            <span class="skill-name">{{ skill.name }}</span>
            <span class="skill-score">{{ skill.score }}分</span>
          </div>
          <a-progress 
            :percent="skill.score" 
            size="small" 
            :stroke-color="getSkillColor(skill.score)"
            :show-info="false"
          />
        </div>
      </div>
    </div>

    <!-- 学习类型分布 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3 class="chart-title">
          <PieChart class="w-5 h-5 mr-2" />
          学习类型分布
        </h3>
        <a-switch 
          v-model:checked="showPercentage" 
          checked-children="百分比" 
          un-checked-children="数值"
          size="small"
        />
      </div>
      <div class="chart-container" ref="categoryPieChart"></div>
      <div class="category-legend">
        <div 
          class="legend-item" 
          v-for="item in categoryData" 
          :key="item.name"
          @click="toggleCategoryItem(item)"
          :class="{ 'legend-disabled': disabledCategories.includes(item.name) }"
        >
          <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
          <span class="legend-name">{{ item.name }}</span>
          <span class="legend-value">{{ item.value }}{{ showPercentage ? '%' : '小时' }}</span>
        </div>
      </div>
    </div>

    <!-- 成绩变化趋势 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3 class="chart-title">
          <BarChart3 class="w-5 h-5 mr-2" />
          成绩变化趋势
        </h3>
        <a-button-group size="small">
          <a-button :type="scoreViewType === 'bar' ? 'primary' : 'default'" @click="scoreViewType = 'bar'">
            柱状图
          </a-button>
          <a-button :type="scoreViewType === 'line' ? 'primary' : 'default'" @click="scoreViewType = 'line'">
            折线图
          </a-button>
        </a-button-group>
      </div>
      <div class="chart-container" ref="scoreBarChart"></div>
      <div class="score-analysis">
        <div class="analysis-item">
          <div class="analysis-icon" style="background: #52c41a20; color: #52c41a;">
            <TrendingUp class="w-4 h-4" />
          </div>
          <div class="analysis-content">
            <span class="analysis-label">平均提升</span>
            <span class="analysis-value">+{{ averageImprovement }}分</span>
          </div>
        </div>
        <div class="analysis-item">
          <div class="analysis-icon" style="background: #1890ff20; color: #1890ff;">
            <Trophy class="w-4 h-4" />
          </div>
          <div class="analysis-content">
            <span class="analysis-label">最高分</span>
            <span class="analysis-value">{{ maxScore }}分</span>
          </div>
        </div>
        <div class="analysis-item">
          <div class="analysis-icon" style="background: #fa8c1620; color: #fa8c16;">
            <Target class="w-4 h-4" />
          </div>
          <div class="analysis-content">
            <span class="analysis-label">目标达成</span>
            <span class="analysis-value">{{ goalAchievement }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习活跃度热力图 -->
    <div class="chart-section chart-wide">
      <div class="chart-header">
        <h3 class="chart-title">
          <Calendar class="w-5 h-5 mr-2" />
          学习活跃度热力图
        </h3>
        <div class="heatmap-controls">
          <a-select v-model:value="heatmapYear" size="small" style="width: 80px">
            <a-select-option value="2024">2024</a-select-option>
            <a-select-option value="2023">2023</a-select-option>
          </a-select>
          <a-tooltip title="连续学习天数">
            <div class="streak-badge">
              <Flame class="w-4 h-4 mr-1" />
              {{ currentStreak }}天
            </div>
          </a-tooltip>
          <a-button size="small" @click="showInteractiveCharts = true">
            <Eye class="w-4 h-4 mr-1" />
            详细分析
          </a-button>
        </div>
      </div>
      <div class="chart-container heatmap-container" ref="activityHeatmap" @click="handleHeatmapClick"></div>
      <div class="heatmap-legend">
        <span class="legend-label">活跃度：</span>
        <div class="legend-colors">
          <div class="legend-step" v-for="(color, index) in heatmapColors" :key="index">
            <div class="legend-color" :style="{ backgroundColor: color }" @click="filterByActivity(index)"></div>
            <span class="legend-text">{{ index === 0 ? '无' : index }}</span>
          </div>
        </div>
        <div class="activity-stats">
          <span class="activity-stat">
            <strong>{{ totalActiveDays }}</strong> 活跃天数
          </span>
          <span class="activity-stat">
            <strong>{{ averageActivity }}</strong> 平均活跃度
          </span>
        </div>
      </div>
    </div>

    <!-- 知识点掌握度分析 -->
    <div class="chart-section chart-wide">
      <div class="chart-header">
        <h3 class="chart-title">
          <BookOpen class="w-5 h-5 mr-2" />
          知识点掌握度分析
        </h3>
        <div class="knowledge-controls">
          <a-select v-model:value="knowledgeCategory" size="small" style="width: 120px">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="vocabulary">词汇</a-select-option>
            <a-select-option value="grammar">语法</a-select-option>
          </a-select>
          <a-button size="small" @click="refreshKnowledgeData">
            <RotateCcw class="w-4 h-4" />
          </a-button>
        </div>
      </div>
      <div class="chart-container" ref="knowledgeChart"></div>
      <div class="knowledge-summary">
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-icon excellent">
              <CheckCircle class="w-5 h-5" />
            </div>
            <div class="summary-content">
              <span class="summary-label">精通</span>
              <span class="summary-value">{{ excellentCount }}个</span>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-icon good">
              <Clock class="w-5 h-5" />
            </div>
            <div class="summary-content">
              <span class="summary-label">熟练</span>
              <span class="summary-value">{{ goodCount }}个</span>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-icon average">
              <AlertCircle class="w-5 h-5" />
            </div>
            <div class="summary-content">
              <span class="summary-label">一般</span>
              <span class="summary-value">{{ averageCount }}个</span>
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-icon poor">
              <XCircle class="w-5 h-5" />
            </div>
            <div class="summary-content">
              <span class="summary-label">待提升</span>
              <span class="summary-value">{{ poorCount }}个</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 交互式图表弹窗 -->
    <a-modal 
      v-model:open="showInteractiveCharts" 
      title="详细数据分析" 
      width="90%" 
      :footer="null"
      :body-style="{ padding: '24px' }"
    >
      <InteractiveCharts 
        :study-time-data="studyTimeData"
        :skill-data="skillData"
        :activity-data="activityData"
        :knowledge-data="knowledgeData"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { 
  TrendingUp, 
  Target, 
  PieChart, 
  BarChart3, 
  Calendar,
  BookOpen,
  Trophy,
  Flame,
  RotateCcw,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Eye
} from 'lucide-vue-next'
import { message } from 'ant-design-vue'
import InteractiveCharts from './InteractiveCharts.vue'

// Props定义
interface StudyTimeData {
  date: string
  duration: number
}

interface SkillData {
  name: string
  score: number
}

interface CategoryData {
  name: string
  value: number
  color: string
}

interface ScoreData {
  date: string
  score: number
}

interface ActivityData {
  date: string
  value: number
}

interface KnowledgeData {
  name: string
  mastery: number
  total: number
}

const props = withDefaults(defineProps<{
  studyTimeData: StudyTimeData[]
  skillData: SkillData[]
  categoryData: CategoryData[]
  scoreData: ScoreData[]
  activityData: ActivityData[]
  knowledgeData: KnowledgeData[]
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
    { name: '听力', score: 85 },
    { name: '口语', score: 78 },
    { name: '阅读', score: 92 },
    { name: '写作', score: 80 },
    { name: '词汇', score: 88 },
    { name: '语法', score: 82 }
  ],
  categoryData: () => [
    { name: '词汇学习', value: 35, color: '#1890ff' },
    { name: '听力训练', value: 25, color: '#52c41a' },
    { name: '语法练习', value: 20, color: '#fa8c16' },
    { name: '口语练习', value: 20, color: '#722ed1' }
  ],
  scoreData: () => [
    { date: '第1周', score: 75 },
    { date: '第2周', score: 82 },
    { date: '第3周', score: 78 },
    { date: '第4周', score: 87 }
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
    { name: '动物单词', mastery: 45, total: 50 },
    { name: '颜色单词', mastery: 38, total: 40 },
    { name: '数字单词', mastery: 28, total: 30 },
    { name: '家庭成员', mastery: 22, total: 25 },
    { name: '食物单词', mastery: 35, total: 45 },
    { name: '一般现在时', mastery: 18, total: 20 },
    { name: '一般过去时', mastery: 15, total: 20 },
    { name: '现在进行时', mastery: 12, total: 15 }
  ]
})

// 响应式数据
const timeRange = ref('month')
const skillViewMode = ref('current')
const showPercentage = ref(true)
const scoreViewType = ref('bar')
const heatmapYear = ref('2024')
const knowledgeCategory = ref('all')
const disabledCategories = ref<string[]>([])
const showInteractiveCharts = ref(false)

// 图表实例引用
const studyTimeChart = ref<HTMLDivElement>()
const skillRadarChart = ref<HTMLDivElement>()
const categoryPieChart = ref<HTMLDivElement>()
const scoreBarChart = ref<HTMLDivElement>()
const activityHeatmap = ref<HTMLDivElement>()
const knowledgeChart = ref<HTMLDivElement>()

// ECharts实例
let studyTimeChartInstance: echarts.ECharts | null = null
let skillRadarChartInstance: echarts.ECharts | null = null
let categoryPieChartInstance: echarts.ECharts | null = null
let scoreBarChartInstance: echarts.ECharts | null = null
let activityHeatmapInstance: echarts.ECharts | null = null
let knowledgeChartInstance: echarts.ECharts | null = null

// 计算属性
const totalStudyTime = computed(() => {
  return Math.round(props.studyTimeData.reduce((total, item) => total + item.duration, 0) / 60 * 10) / 10
})

const averageStudyTime = computed(() => {
  return Math.round(props.studyTimeData.reduce((total, item) => total + item.duration, 0) / props.studyTimeData.length)
})

const maxStudyTime = computed(() => {
  return Math.max(...props.studyTimeData.map(item => item.duration))
})

const averageImprovement = computed(() => {
  if (props.scoreData.length < 2) return 0
  const first = props.scoreData[0].score
  const last = props.scoreData[props.scoreData.length - 1].score
  return Math.round((last - first) / (props.scoreData.length - 1))
})

const maxScore = computed(() => {
  return Math.max(...props.scoreData.map(item => item.score))
})

const goalAchievement = computed(() => {
  const target = 85
  const current = props.scoreData[props.scoreData.length - 1]?.score || 0
  return Math.min(100, Math.round(current / target * 100))
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

// 工具函数
const getSkillColor = (score: number) => {
  if (score >= 90) return '#52c41a'
  if (score >= 80) return '#1890ff'
  if (score >= 70) return '#fa8c16'
  return '#f5222d'
}

const toggleCategoryItem = (item: CategoryData) => {
  const index = disabledCategories.value.indexOf(item.name)
  if (index > -1) {
    disabledCategories.value.splice(index, 1)
  } else {
    disabledCategories.value.push(item.name)
  }
  initCategoryPieChart()
}

const refreshKnowledgeData = () => {
  initKnowledgeChart()
}

const handleHeatmapClick = (params: any) => {
  if (params.componentType === 'series') {
    message.info(`点击了 ${params.name}: 活跃度 ${params.value}`)
  }
}

const filterByActivity = (level: number) => {
  message.info(`筛选活跃度等级: ${level}`)
  // 这里可以添加筛选逻辑
}

// 图表初始化函数
const initStudyTimeChart = () => {
  if (!studyTimeChart.value) return
  
  studyTimeChartInstance = echarts.init(studyTimeChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}分钟',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' }
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
      type: 'line',
      smooth: true,
      lineStyle: { color: '#1890ff', width: 3 },
      itemStyle: { color: '#1890ff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
          ]
        }
      },
      animationDuration: 2000,
      animationEasing: 'cubicOut'
    }]
  }
  
  studyTimeChartInstance.setOption(option)
}

const initSkillRadarChart = () => {
  if (!skillRadarChart.value) return
  
  skillRadarChartInstance = echarts.init(skillRadarChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1
    },
    radar: {
      indicator: props.skillData.map(item => ({ name: item.name, max: 100 })),
      radius: '70%',
      splitArea: {
        areaStyle: {
          color: ['rgba(24, 144, 255, 0.05)', 'rgba(24, 144, 255, 0.1)']
        }
      },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      splitLine: { lineStyle: { color: '#e5e7eb' } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: props.skillData.map(item => item.score),
        name: '技能水平',
        itemStyle: { color: '#1890ff' },
        areaStyle: { color: 'rgba(24, 144, 255, 0.2)' }
      }],
      animationDuration: 2000,
      animationEasing: 'elasticOut'
    }]
  }
  
  skillRadarChartInstance.setOption(option)
}

const initCategoryPieChart = () => {
  if (!categoryPieChart.value) return
  
  categoryPieChartInstance = echarts.init(categoryPieChart.value)
  
  const filteredData = props.categoryData.filter(item => 
    !disabledCategories.value.includes(item.name)
  )
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}% ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1
    },
    series: [{
      name: '学习类型',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: filteredData.map(item => ({
        value: item.value,
        name: item.name,
        itemStyle: { color: item.color }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: (idx: number) => idx * 100
    }]
  }
  
  categoryPieChartInstance.setOption(option)
}

const initScoreBarChart = () => {
  if (!scoreBarChart.value) return
  
  scoreBarChartInstance = echarts.init(scoreBarChart.value)
  
  const chartType = scoreViewType.value
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}分',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.scoreData.map(item => item.date),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: {
      type: 'value',
      name: '分数',
      min: 0,
      max: 100,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [{
      data: props.scoreData.map(item => ({
        value: item.score,
        itemStyle: {
          color: item.score >= 90 ? '#52c41a' : 
                 item.score >= 80 ? '#1890ff' : 
                 item.score >= 70 ? '#fa8c16' : '#f5222d'
        }
      })),
      type: chartType,
      ...(chartType === 'bar' ? { barWidth: '60%' } : { 
        smooth: true,
        lineStyle: { width: 3 },
        areaStyle: { opacity: 0.3 }
      }),
      animationDuration: 2000,
      animationEasing: 'bounceOut',
      animationDelay: (idx: number) => idx * 200
    }]
  }
  
  scoreBarChartInstance.setOption(option)
}

const initActivityHeatmap = () => {
  if (!activityHeatmap.value) return
  
  activityHeatmapInstance = echarts.init(activityHeatmap.value)
  
  const option = {
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        return `${params.data[0]}: ${params.data[1]}次学习`
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1
    },
    visualMap: {
      min: 0,
      max: 4,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: 'top',
      inRange: { color: heatmapColors },
      textStyle: { color: '#6b7280' }
    },
    calendar: {
      top: 60,
      left: 30,
      right: 30,
      cellSize: ['auto', 13],
      range: heatmapYear.value,
      itemStyle: { borderWidth: 0.5, borderColor: '#fff' },
      yearLabel: { show: false },
      monthLabel: { color: '#6b7280' },
      dayLabel: { color: '#6b7280' }
    },
    series: [{
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: props.activityData.map(item => [item.date, item.value]),
      animationDuration: 1000
    }]
  }
  
  activityHeatmapInstance.setOption(option)
}

const initKnowledgeChart = () => {
  if (!knowledgeChart.value) return
  
  knowledgeChartInstance = echarts.init(knowledgeChart.value)
  
  const filteredData = knowledgeCategory.value === 'all' 
    ? props.knowledgeData 
    : props.knowledgeData.filter(item => {
        if (knowledgeCategory.value === 'vocabulary') {
          return item.name.includes('单词')
        }
        if (knowledgeCategory.value === 'grammar') {
          return item.name.includes('时')
        }
        return true
      })
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        const knowledge = filteredData[data.dataIndex]
        return `${knowledge.name}<br/>掌握: ${knowledge.mastery}/${knowledge.total} (${Math.round(knowledge.mastery / knowledge.total * 100)}%)`
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: filteredData.map(item => item.name),
      axisLabel: { rotate: 45, color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } }
    },
    yAxis: {
      type: 'value',
      name: '掌握率(%)',
      min: 0,
      max: 100,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [{
      data: filteredData.map(item => {
        const percentage = Math.round(item.mastery / item.total * 100)
        return {
          value: percentage,
          itemStyle: {
            color: percentage >= 90 ? '#52c41a' : 
                   percentage >= 80 ? '#1890ff' : 
                   percentage >= 60 ? '#fa8c16' : '#f5222d'
          }
        }
      }),
      type: 'bar',
      barWidth: '60%',
      animationDuration: 2000,
      animationEasing: 'elasticOut',
      animationDelay: (idx: number) => idx * 100
    }]
  }
  
  knowledgeChartInstance.setOption(option)
}

// 初始化所有图表
const initAllCharts = async () => {
  await nextTick()
  initStudyTimeChart()
  initSkillRadarChart()
  initCategoryPieChart()
  initScoreBarChart()
  initActivityHeatmap()
  initKnowledgeChart()
}

// 响应窗口大小变化
const handleResize = () => {
  studyTimeChartInstance?.resize()
  skillRadarChartInstance?.resize()
  categoryPieChartInstance?.resize()
  scoreBarChartInstance?.resize()
  activityHeatmapInstance?.resize()
  knowledgeChartInstance?.resize()
}

// 监听变化
watch(timeRange, () => {
  initStudyTimeChart()
})

watch(skillViewMode, () => {
  initSkillRadarChart()
})

watch(showPercentage, () => {
  initCategoryPieChart()
})

watch(scoreViewType, () => {
  initScoreBarChart()
})

watch(heatmapYear, () => {
  initActivityHeatmap()
})

watch(knowledgeCategory, () => {
  initKnowledgeChart()
})

onMounted(() => {
  initAllCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  studyTimeChartInstance?.dispose()
  skillRadarChartInstance?.dispose()
  categoryPieChartInstance?.dispose()
  scoreBarChartInstance?.dispose()
  activityHeatmapInstance?.dispose()
  knowledgeChartInstance?.dispose()
})
</script>

<style scoped lang="less">
.learning-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  .chart-wide {
    grid-column: 1 / -1;
  }
}

.chart-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f0f0f0;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border-color: #d9d9d9;
  }
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.chart-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.chart-container {
  width: 100%;
  height: 300px;
  
  &.heatmap-container {
    height: 200px;
  }
}

.chart-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
  
  .stat-label {
    display: block;
    font-size: 12px;
    color: #8c8c8c;
    margin-bottom: 4px;
  }
  
  .stat-value {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #1890ff;
  }
}

.skill-progress {
  margin-top: 16px;
  
  .skill-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    .skill-info {
      display: flex;
      justify-content: space-between;
      width: 120px;
      margin-right: 16px;
      
      .skill-name {
        font-size: 14px;
        color: #595959;
      }
      
      .skill-score {
        font-size: 14px;
        font-weight: 600;
        color: #1890ff;
      }
    }
  }
}

.category-legend {
  margin-top: 16px;
  
  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s;
    
    &:hover {
      background: #f5f5f5;
    }
    
    &.legend-disabled {
      opacity: 0.5;
    }
    
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      margin-right: 8px;
    }
    
    .legend-name {
      flex: 1;
      font-size: 14px;
      color: #595959;
    }
    
    .legend-value {
      font-size: 14px;
      font-weight: 600;
      color: #1890ff;
    }
  }
}

.score-analysis {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  
  .analysis-item {
    display: flex;
    align-items: center;
    
    .analysis-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
    }
    
    .analysis-content {
      display: flex;
      flex-direction: column;
      
      .analysis-label {
        font-size: 12px;
        color: #8c8c8c;
        margin-bottom: 2px;
      }
      
      .analysis-value {
        font-size: 14px;
        font-weight: 600;
      }
    }
  }
}

.heatmap-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .streak-badge {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #ff6b6b, #ffa500);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  
  .legend-label {
    font-size: 14px;
    color: #595959;
    margin-right: 12px;
  }
  
  .legend-colors {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .legend-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        margin-bottom: 4px;
      }
      
      .legend-text {
        font-size: 10px;
        color: #8c8c8c;
      }
    }
  }
  
  .activity-stats {
    display: flex;
    gap: 16px;
    
    .activity-stat {
      font-size: 12px;
      color: #595959;
      
      strong {
        color: #1890ff;
      }
    }
  }
}

.knowledge-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.knowledge-summary {
  margin-top: 16px;
  
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    
    .summary-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;
      
      .summary-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;
        
        &.excellent {
          background: #f6ffed;
          color: #52c41a;
        }
        
        &.good {
          background: #e6f7ff;
          color: #1890ff;
        }
        
        &.average {
          background: #fff7e6;
          color: #fa8c16;
        }
        
        &.poor {
          background: #fff2f0;
          color: #f5222d;
        }
      }
      
      .summary-content {
        display: flex;
        flex-direction: column;
        
        .summary-label {
          font-size: 12px;
          color: #8c8c8c;
          margin-bottom: 2px;
        }
        
        .summary-value {
          font-size: 14px;
          font-weight: 600;
          color: #262626;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .learning-charts {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 250px;
    
    &.heatmap-container {
      height: 180px;
    }
  }
  
  .chart-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .score-analysis {
    flex-direction: column;
    gap: 12px;
  }
  
  .heatmap-legend {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>