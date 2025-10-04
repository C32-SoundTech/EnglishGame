<template>
  <MainLayout>
    <div class="reports-page">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <BarChart3 class="w-6 h-6 mr-3" />
          学习报告
        </h1>
        <p class="page-subtitle">全面了解你的学习数据和成长轨迹</p>
      </div>

      <!-- 时间范围选择 -->
      <div class="time-selector">
        <a-radio-group v-model:value="selectedPeriod" button-style="solid" size="large">
          <a-radio-button value="week">本周</a-radio-button>
          <a-radio-button value="month">本月</a-radio-button>
          <a-radio-button value="quarter">本季度</a-radio-button>
          <a-radio-button value="year">本年</a-radio-button>
        </a-radio-group>
      </div>

      <!-- 概览统计 -->
      <div class="overview-stats">
        <a-row :gutter="[24, 24]">
          <a-col :xs="12" :md="6" v-for="stat in overviewStats" :key="stat.key">
            <div class="stat-card">
              <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
                <component :is="stat.icon" class="w-6 h-6" />
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-change" :class="stat.trend">
                  <component :is="stat.trend === 'up' ? TrendingUp : TrendingDown" class="w-3 h-3 mr-1" />
                  {{ stat.change }}
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 图表区域 -->
      <LearningCharts
        :study-time-data="studyTimeData"
        :skill-data="skillData"
        :category-data="categoryData"
        :score-data="scoreData"
        :activity-data="activityData"
        :knowledge-data="knowledgeData"
      />

      <!-- 详细数据表格 -->
      <div class="data-table-section">
        <h3 class="section-title">
          <FileText class="w-5 h-5 mr-2" />
          详细学习记录
        </h3>
        <div class="table-card">
          <a-table
            :columns="tableColumns"
            :data-source="tableData"
            :pagination="{ pageSize: 10, showSizeChanger: true }"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'type'">
                <a-tag :color="getTypeColor(record.type)">{{ record.type }}</a-tag>
              </template>
              <template v-if="column.key === 'score'">
                <div class="score-cell">
                  <span :class="getScoreClass(record.score)">{{ record.score }}分</span>
                  <a-progress
                    :percent="record.score"
                    :show-info="false"
                    size="small"
                    :stroke-color="getScoreColor(record.score)"
                  />
                </div>
              </template>
              <template v-if="column.key === 'duration'">
                <span class="duration-cell">
                  <Clock class="w-3 h-3 mr-1" />
                  {{ record.duration }}分钟
                </span>
              </template>
              <template v-if="column.key === 'date'">
                {{ formatDate(record.date) }}
              </template>
            </template>
          </a-table>
        </div>
      </div>

      <!-- 学习进度和成就系统 -->
      <LearningProgress />

      <!-- 学习分析组件 -->
      <LearningAnalytics 
        :knowledge-data="knowledgeAnalysisData"
        :efficiency-data="efficiencyAnalysisData"
        :activity-data="activityData"
      />

      <!-- 学习建议 -->
      <div class="suggestions-section">
        <h3 class="section-title">
          <Lightbulb class="w-5 h-5 mr-2" />
          基于数据的学习建议
        </h3>
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :md="12" :lg="8" v-for="suggestion in suggestions" :key="suggestion.id">
            <div class="suggestion-card">
              <div class="suggestion-icon" :style="{ backgroundColor: suggestion.color + '20', color: suggestion.color }">
                <component :is="suggestion.icon" class="w-6 h-6" />
              </div>
              <div class="suggestion-content">
                <h4 class="suggestion-title">{{ suggestion.title }}</h4>
                <p class="suggestion-desc">{{ suggestion.description }}</p>
                <div class="suggestion-data">
                  <span class="data-label">{{ suggestion.dataLabel }}：</span>
                  <span class="data-value">{{ suggestion.dataValue }}</span>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 导出功能 -->
      <div class="export-section">
        <a-space size="large">
          <a-button size="large" @click="exportPDF">
            <FileText class="w-4 h-4 mr-1" />
            导出PDF报告
          </a-button>
          <a-button size="large" @click="exportExcel">
            <Download class="w-4 h-4 mr-1" />
            导出Excel数据
          </a-button>
          <a-button size="large" @click="shareReport">
            <Share2 class="w-4 h-4 mr-1" />
            分享报告
          </a-button>
        </a-space>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import MainLayout from '@/layouts/MainLayout.vue'
import LearningCharts from '@/components/LearningCharts.vue'
import LearningProgress from '@/components/LearningProgress.vue'
import LearningAnalytics from '@/components/LearningAnalytics.vue'
import {
  BarChart3,
  Clock,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  FileText,
  Lightbulb,
  Download,
  Share2,
  Trophy,
  Gamepad2,
  BookOpen,
  Headphones,
  Calendar,
  Zap
} from 'lucide-vue-next'

// 响应式数据
const selectedPeriod = ref('month')
const studyTimeType = ref('daily')

// 概览统计数据
const overviewStats = ref([
  {
    key: 'totalTime',
    label: '学习时长',
    value: '45.5h',
    change: '+12%',
    trend: 'up',
    icon: Clock,
    color: '#1890ff'
  },
  {
    key: 'completedLevels',
    label: '完成关卡',
    value: '28',
    change: '+8',
    trend: 'up',
    icon: Trophy,
    color: '#52c41a'
  },
  {
    key: 'avgScore',
    label: '平均分数',
    value: '87',
    change: '+5',
    trend: 'up',
    icon: Target,
    color: '#fa8c16'
  },
  {
    key: 'studyDays',
    label: '学习天数',
    value: '22',
    change: '+3',
    trend: 'up',
    icon: Calendar,
    color: '#722ed1'
  }
])

// 学习时长数据（用于ECharts组件）
const studyTimeData = ref([
  { date: '2024-01-15', duration: 45 },
  { date: '2024-01-16', duration: 60 },
  { date: '2024-01-17', duration: 30 },
  { date: '2024-01-18', duration: 75 },
  { date: '2024-01-19', duration: 50 },
  { date: '2024-01-20', duration: 90 },
  { date: '2024-01-21', duration: 40 }
])

// 学习类型分布数据（用于ECharts组件）
const categoryData = ref([
  { name: '词汇学习', value: 35, color: '#1890ff' },
  { name: '听力训练', value: 25, color: '#52c41a' },
  { name: '语法练习', value: 20, color: '#fa8c16' },
  { name: '口语练习', value: 20, color: '#722ed1' }
])

// 成绩数据（用于ECharts组件）
const scoreData = ref([
  { date: '第1周', score: 75 },
  { date: '第2周', score: 82 },
  { date: '第3周', score: 78 },
  { date: '第4周', score: 87 }
])

// 技能数据（用于ECharts组件）
const skillData = ref([
  { name: '听力', score: 85 },
  { name: '口语', score: 78 },
  { name: '阅读', score: 92 },
  { name: '写作', score: 80 },
  { name: '词汇', score: 88 },
  { name: '语法', score: 82 }
])

// 学习活跃度数据
const activityData = ref(() => {
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
}())

// 知识点掌握度数据
const knowledgeData = ref([
  { name: '动物单词', mastery: 45, total: 50 },
  { name: '颜色单词', mastery: 38, total: 40 },
  { name: '数字单词', mastery: 28, total: 30 },
  { name: '家庭成员', mastery: 22, total: 25 },
  { name: '食物单词', mastery: 35, total: 45 },
  { name: '一般现在时', mastery: 18, total: 20 },
  { name: '一般过去时', mastery: 15, total: 20 },
  { name: '现在进行时', mastery: 12, total: 15 }
])

// 学习分析数据
const knowledgeAnalysisData = ref([
  { name: '动物单词', mastery: 45, total: 50, subject: 'vocabulary', difficulty: 'easy', lastPracticed: '2024-01-20' },
  { name: '颜色单词', mastery: 38, total: 40, subject: 'vocabulary', difficulty: 'easy', lastPracticed: '2024-01-19' },
  { name: '数字单词', mastery: 28, total: 30, subject: 'vocabulary', difficulty: 'easy', lastPracticed: '2024-01-18' },
  { name: '家庭成员', mastery: 22, total: 25, subject: 'vocabulary', difficulty: 'medium', lastPracticed: '2024-01-17' },
  { name: '食物单词', mastery: 35, total: 45, subject: 'vocabulary', difficulty: 'medium', lastPracticed: '2024-01-16' },
  { name: '一般现在时', mastery: 18, total: 20, subject: 'grammar', difficulty: 'medium', lastPracticed: '2024-01-15' },
  { name: '一般过去时', mastery: 15, total: 20, subject: 'grammar', difficulty: 'hard', lastPracticed: '2024-01-14' },
  { name: '现在进行时', mastery: 12, total: 15, subject: 'grammar', difficulty: 'medium', lastPracticed: '2024-01-13' },
  { name: '听力理解', mastery: 25, total: 35, subject: 'listening', difficulty: 'hard', lastPracticed: '2024-01-12' }
])

const efficiencyAnalysisData = ref(() => {
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
}())

// 智能学习分析洞察
const analysisInsights = ref([
  {
    id: 1,
    type: '学习效率',
    title: '最佳学习时段',
    description: '根据你的学习数据分析，下午2-4点是你学习效率最高的时段',
    icon: Clock,
    color: '#1890ff',
    data: [
      { label: '效率提升', value: '+25%', color: '#52c41a' },
      { label: '专注时长', value: '45分钟', color: '#1890ff' }
    ],
    actionText: '设置学习提醒'
  },
  {
    id: 2,
    type: '知识薄弱点',
    title: '语法练习需加强',
    description: '语法练习的正确率相对较低，建议增加相关练习',
    icon: BookOpen,
    color: '#fa8c16',
    data: [
      { label: '当前正确率', value: '68%', color: '#fa8c16' },
      { label: '目标正确率', value: '85%', color: '#52c41a' }
    ],
    actionText: '开始语法练习'
  },
  {
    id: 3,
    type: '学习习惯',
    title: '连续学习表现优秀',
    description: '你已经连续学习12天，保持了良好的学习习惯',
    icon: Trophy,
    color: '#52c41a',
    data: [
      { label: '连续天数', value: '12天', color: '#52c41a' },
      { label: '目标天数', value: '30天', color: '#1890ff' }
    ],
    actionText: '查看奖励'
  }
])

// 学习习惯分析
const learningHabits = ref([
  {
    key: 'studyTime',
    title: '平均学习时长',
    value: '42分钟',
    description: '每日平均学习时间',
    trend: 'up',
    change: '+8分钟',
    icon: Clock,
    color: '#1890ff'
  },
  {
    key: 'consistency',
    title: '学习一致性',
    value: '85%',
    description: '按计划完成学习的比例',
    trend: 'up',
    change: '+5%',
    icon: Target,
    color: '#52c41a'
  },
  {
    key: 'difficulty',
    title: '挑战难度',
    value: '中等',
    description: '当前学习内容难度',
    trend: 'up',
    change: '适中',
    icon: Zap,
    color: '#fa8c16'
  },
  {
    key: 'engagement',
    title: '参与度',
    value: '92%',
    description: '学习过程中的参与程度',
    trend: 'up',
    change: '+3%',
    icon: Gamepad2,
    color: '#722ed1'
  }
])

// 掌握程度等级
const masteryLevels = ref([
  { level: 0, label: '未学习', color: '#f5f5f5' },
  { level: 1, label: '初学', color: '#ffccc7' },
  { level: 2, label: '了解', color: '#ffd666' },
  { level: 3, label: '熟练', color: '#95de64' },
  { level: 4, label: '精通', color: '#52c41a' }
])

// 知识点主题
const knowledgeTopics = ref([
  {
    id: 1,
    name: '词汇学习',
    points: [
      { id: 1, name: '动物', mastery: 85 },
      { id: 2, name: '颜色', mastery: 92 },
      { id: 3, name: '数字', mastery: 78 },
      { id: 4, name: '家庭', mastery: 88 },
      { id: 5, name: '食物', mastery: 75 },
      { id: 6, name: '身体', mastery: 65 }
    ]
  },
  {
    id: 2,
    name: '语法知识',
    points: [
      { id: 7, name: '现在时', mastery: 90 },
      { id: 8, name: '过去时', mastery: 75 },
      { id: 9, name: '进行时', mastery: 80 },
      { id: 10, name: '疑问句', mastery: 70 },
      { id: 11, name: '否定句', mastery: 85 },
      { id: 12, name: '复数', mastery: 95 }
    ]
  }
])

// 家长查看数据
const parentSummary = ref({
  weeklyTime: 8.5,
  completedExercises: 156,
  averageAccuracy: 87,
  streak: 12,
  performance: {
    score: 87,
    level: 'excellent',
    title: '表现优秀',
    description: '孩子在本周的学习中表现出色，各项指标都达到了预期目标。'
  }
})

// 家长建议
const parentSuggestions = ref([
  {
    id: 1,
    title: '鼓励持续学习',
    description: '孩子已经连续学习12天，建议给予适当的奖励和鼓励',
    icon: Trophy,
    color: '#52c41a',
    tips: [
      '设置小目标，达成后给予奖励',
      '与孩子一起制定学习计划',
      '关注孩子的学习情绪变化'
    ]
  },
  {
    id: 2,
    title: '加强语法练习',
    description: '语法部分相对薄弱，建议增加相关练习时间',
    icon: BookOpen,
    color: '#fa8c16',
    tips: [
      '每天安排15分钟语法练习',
      '通过游戏化方式学习语法',
      '结合实际情境练习语法'
    ]
  }
])

// 表格列定义
const tableColumns = [
  { title: '日期', dataIndex: 'date', key: 'date', width: 120, fixed: 'left' },
  { title: '学习类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
  { title: '时长', dataIndex: 'duration', key: 'duration', width: 100 },
  { title: '得分', dataIndex: 'score', key: 'score', width: 120 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

// 表格数据
const tableData = ref([
  {
    key: '1',
    date: new Date('2024-01-20'),
    type: '词汇学习',
    content: '动物单词学习',
    duration: 30,
    score: 92
  },
  {
    key: '2',
    date: new Date('2024-01-20'),
    type: '听力训练',
    content: '日常对话听力',
    duration: 25,
    score: 85
  },
  {
    key: '3',
    date: new Date('2024-01-19'),
    type: '语法练习',
    content: '一般现在时练习',
    duration: 20,
    score: 78
  },
  {
    key: '4',
    date: new Date('2024-01-19'),
    type: '口语练习',
    content: '自我介绍练习',
    duration: 35,
    score: 88
  },
  {
    key: '5',
    date: new Date('2024-01-18'),
    type: '词汇学习',
    content: '颜色单词学习',
    duration: 28,
    score: 95
  }
])

// 学习建议数据
const suggestions = ref([
  {
    id: 1,
    title: '加强语法练习',
    description: '你的语法练习正确率为68%，建议多做相关练习题',
    dataLabel: '当前正确率',
    dataValue: '68%',
    icon: BookOpen,
    color: '#fa8c16'
  },
  {
    id: 2,
    title: '保持听力训练',
    description: '听力能力表现优秀，继续保持每日练习',
    dataLabel: '听力得分',
    dataValue: '85分',
    icon: Headphones,
    color: '#52c41a'
  },
  {
    id: 3,
    title: '增加口语练习',
    description: '口语练习时间较少，建议增加练习频率',
    dataLabel: '本周练习',
    dataValue: '2次',
    icon: Gamepad2,
    color: '#722ed1'
  }
])

// 计算属性
const filteredTableData = computed(() => {
  let filtered = [...tableData.value]
  
  if (tableFilter.value.type) {
    filtered = filtered.filter(item => item.type === tableFilter.value.type)
  }
  
  if (tableFilter.value.dateRange && tableFilter.value.dateRange.length === 2) {
    const [start, end] = tableFilter.value.dateRange
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= start && itemDate <= end
    })
  }
  
  return filtered
})

// 工具函数
const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN')
}

const getTypeColor = (type: string) => {
  const colors = {
    '词汇学习': 'blue',
    '听力训练': 'green',
    '语法练习': 'orange',
    '口语练习': 'purple'
  }
  return colors[type] || 'default'
}

const getScoreClass = (score: number) => {
  if (score >= 90) return 'text-green-500 font-semibold'
  if (score >= 80) return 'text-blue-500 font-semibold'
  if (score >= 70) return 'text-orange-500 font-semibold'
  return 'text-red-500 font-semibold'
}

const getScoreColor = (score: number) => {
  if (score >= 90) return '#52c41a'
  if (score >= 80) return '#1890ff'
  if (score >= 70) return '#fa8c16'
  return '#ff4d4f'
}

const getMasteryColor = (mastery: number) => {
  if (mastery >= 90) return '#52c41a'
  if (mastery >= 75) return '#95de64'
  if (mastery >= 60) return '#ffd666'
  if (mastery >= 30) return '#ffccc7'
  return '#f5f5f5'
}

// 事件处理函数
const handleInsightAction = (insight: any) => {
  message.info(`执行操作：${insight.actionText}`)
}

const showKnowledgeDetail = (point: any) => {
  message.info(`查看知识点详情：${point.name}`)
}

const resetTableFilter = () => {
  tableFilter.value = {
    type: undefined,
    dateRange: undefined
  }
}

const viewDetail = (record: any) => {
  message.info(`查看详情：${record.content}`)
}

const retryExercise = (record: any) => {
  message.info(`重新练习：${record.content}`)
}

const applySuggestion = (suggestion: any) => {
  message.success(`开始学习：${suggestion.title}`)
}

const dismissSuggestion = (suggestion: any) => {
  message.info(`已忽略建议：${suggestion.title}`)
}

const exportPDF = async () => {
  exportLoading.value.pdf = true
  try {
    // 模拟导出过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    message.success('PDF报告导出成功！')
  } catch (error) {
    message.error('导出失败，请重试')
  } finally {
    exportLoading.value.pdf = false
  }
}

const exportExcel = async () => {
  exportLoading.value.excel = true
  try {
    // 模拟导出过程
    await new Promise(resolve => setTimeout(resolve, 1500))
    message.success('Excel数据导出成功！')
  } catch (error) {
    message.error('导出失败，请重试')
  } finally {
    exportLoading.value.excel = false
  }
}

const shareReport = async () => {
  exportLoading.value.share = true
  try {
    // 模拟分享过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('报告分享链接已生成！')
  } catch (error) {
    message.error('分享失败，请重试')
  } finally {
    exportLoading.value.share = false
  }
}

const generateWeeklyReport = () => {
  message.info('正在生成周报...')
}

const scheduleReport = () => {
  message.info('设置定时报告...')
}

// 监听家长模式切换
watch(isParentMode, (newValue) => {
  if (newValue) {
    message.info('已切换到家长查看模式')
  } else {
    message.info('已切换到学生模式')
  }
})
</script>

<style scoped lang="less">
.reports-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  
  .page-title {
    font-size: 28px;
    font-weight: bold;
    color: #1a1a1a;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .page-subtitle {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }
}

.time-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.overview-stats {
  margin-bottom: 32px;
  
  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-number {
    font-size: 24px;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 8px;
  }
  
  .stat-change {
    font-size: 12px;
    display: flex;
    align-items: center;
    
    &.up {
      color: #52c41a;
    }
    
    &.down {
      color: #ff4d4f;
    }
  }
}

.analysis-insights {
  margin-bottom: 32px;
  
  .insight-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    height: 100%;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
  }
  
  .insight-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .insight-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .insight-type {
    font-size: 12px;
    color: #6b7280;
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  .insight-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }
  
  .insight-description {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 16px 0;
    line-height: 1.5;
  }
  
  .insight-data {
    margin-bottom: 16px;
  }
  
  .data-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .data-label {
    font-size: 14px;
    color: #6b7280;
  }
  
  .data-value {
    font-size: 14px;
    font-weight: 600;
  }
  
  .insight-action {
    text-align: right;
  }
}

.habit-analysis {
  margin-bottom: 32px;
  
  .habit-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    text-align: center;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
  }
  
  .habit-icon {
    width: 60px;
    height: 60px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }
  
  .habit-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }
  
  .habit-value {
    font-size: 24px;
    font-weight: bold;
    color: #1890ff;
    margin-bottom: 8px;
  }
  
  .habit-description {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 12px;
  }
  
  .habit-trend {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
  }
}

.knowledge-heatmap {
  margin-bottom: 32px;
  
  .heatmap-container {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .heatmap-legend {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  
  .legend-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
  }
  
  .legend-colors {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    border: 1px solid #e5e7eb;
  }
  
  .legend-text {
    font-size: 12px;
    color: #6b7280;
  }
  
  .knowledge-grid {
    display: grid;
    gap: 24px;
  }
  
  .knowledge-topic {
    .topic-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 12px 0;
    }
    
    .topic-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 8px;
    }
    
    .knowledge-point {
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      cursor: pointer;
      transition: all 0.3s;
      text-align: center;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .point-name {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #1a1a1a;
        margin-bottom: 4px;
      }
      
      .point-mastery {
        font-size: 12px;
        color: #6b7280;
      }
    }
  }
}

.parent-view {
  margin-bottom: 32px;
  
  .parent-summary {
    margin-bottom: 32px;
  }
  
  .summary-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    height: 100%;
  }
  
  .summary-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 16px 0;
  }
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .summary-label {
    font-size: 14px;
    color: #6b7280;
  }
  
  .summary-value {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
  }
  
  .performance-rating {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .rating-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    &.excellent {
      background: linear-gradient(135deg, #52c41a, #73d13d);
      color: white;
    }
    
    &.good {
      background: linear-gradient(135deg, #1890ff, #40a9ff);
      color: white;
    }
    
    &.average {
      background: linear-gradient(135deg, #fa8c16, #ffa940);
      color: white;
    }
  }
  
  .rating-text {
    font-size: 24px;
    font-weight: bold;
  }
  
  .rating-label {
    font-size: 12px;
  }
  
  .rating-description {
    flex: 1;
  }
  
  .rating-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }
  
  .rating-desc {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
  }
  
  .parent-suggestions {
    .suggestions-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 16px 0;
    }
    
    .suggestions-list {
      display: grid;
      gap: 16px;
    }
    
    .parent-suggestion-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      display: flex;
      gap: 16px;
    }
    
    .suggestion-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .suggestion-content {
      flex: 1;
    }
    
    .suggestion-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 8px 0;
    }
    
    .suggestion-desc {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }
    
    .suggestion-tips {
      .tip-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 14px;
        color: #4b5563;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.data-table-section {
  margin-bottom: 32px;
  
  .table-controls {
    margin-bottom: 16px;
  }
  
  .table-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .score-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .duration-cell {
    display: flex;
    align-items: center;
    color: #6b7280;
  }
}

.suggestions-section {
  margin-bottom: 32px;
  
  .suggestion-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    height: 100%;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
  }
  
  .suggestion-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }
  
  .suggestion-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }
  
  .suggestion-desc {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 16px 0;
    line-height: 1.5;
  }
  
  .suggestion-data {
    margin-bottom: 16px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
  }
  
  .data-label {
    font-size: 14px;
    color: #6b7280;
  }
  
  .data-value {
    font-size: 16px;
    font-weight: 600;
    color: #1890ff;
  }
  
  .suggestion-actions {
    display: flex;
    gap: 8px;
  }
}

.export-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  .export-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .section-title {
      margin: 0;
    }
  }
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
}

// 响应式设计
@media (max-width: 768px) {
  .reports-page {
    padding: 16px;
  }
  
  .page-header {
    .page-title {
      font-size: 24px;
    }
  }
  
  .overview-stats {
    .stat-card {
      padding: 16px;
      gap: 12px;
    }
    
    .stat-icon {
      width: 40px;
      height: 40px;
    }
    
    .stat-number {
      font-size: 20px;
    }
  }
  
  .analysis-insights,
  .habit-analysis,
  .suggestions-section {
    .ant-col {
      margin-bottom: 16px;
    }
  }
  
  .knowledge-heatmap {
    .topic-grid {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    }
  }
  
  .parent-view {
    .performance-rating {
      flex-direction: column;
      text-align: center;
      gap: 16px;
    }
    
    .parent-suggestion-card {
      flex-direction: column;
      text-align: center;
    }
  }
  
  .export-section {
    .export-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }
    
    .ant-space {
      justify-content: center;
    }
  }
}
</style>