<template>
  <div class="assessment-result-chart">
    <!-- 雷达图 -->
    <div class="chart-container">
      <h3 class="chart-title">
        <Target class="w-5 h-5 mr-2" />
        能力雷达图
      </h3>
      <div class="radar-chart" ref="radarChartRef"></div>
    </div>

    <!-- 技能进度条 -->
    <div class="skills-progress">
      <h3 class="chart-title">
        <TrendingUp class="w-5 h-5 mr-2" />
        技能详细分析
      </h3>
      <div class="skill-items">
        <div 
          v-for="skill in skillData" 
          :key="skill.name"
          class="skill-item"
        >
          <div class="skill-header">
            <div class="skill-info">
              <component :is="skill.icon" class="w-5 h-5 skill-icon" />
              <span class="skill-name">{{ skill.name }}</span>
            </div>
            <div class="skill-score">
              <span class="score-value">{{ skill.score }}</span>
              <span class="score-unit">分</span>
              <div class="score-level" :class="getScoreLevelClass(skill.score)">
                {{ getScoreLevel(skill.score) }}
              </div>
            </div>
          </div>
          
          <div class="skill-progress">
            <a-progress
              :percent="skill.score"
              :stroke-color="getProgressColor(skill.score)"
              :trail-color="'#f0f0f0'"
              :stroke-width="8"
              :show-info="false"
            />
          </div>
          
          <div class="skill-details">
            <div class="detail-item">
              <span class="detail-label">正确率:</span>
              <span class="detail-value">{{ skill.accuracy }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">用时:</span>
              <span class="detail-value">{{ skill.timeUsed }}s</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">建议:</span>
              <span class="detail-suggestion">{{ skill.suggestion }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习建议卡片 -->
    <div class="suggestions-section">
      <h3 class="chart-title">
        <Lightbulb class="w-5 h-5 mr-2" />
        个性化学习建议
      </h3>
      <div class="suggestions-grid">
        <div 
          v-for="suggestion in suggestions" 
          :key="suggestion.id"
          class="suggestion-card"
          :class="suggestion.priority"
        >
          <div class="suggestion-header">
            <div class="suggestion-icon">
              <component :is="suggestion.icon" class="w-6 h-6" />
            </div>
            <div class="suggestion-priority">
              {{ getPriorityText(suggestion.priority) }}
            </div>
          </div>
          <h4 class="suggestion-title">{{ suggestion.title }}</h4>
          <p class="suggestion-description">{{ suggestion.description }}</p>
          <div class="suggestion-actions">
            <a-button 
              type="primary" 
              size="small"
              @click="startLearning(suggestion.type)"
            >
              开始学习
            </a-button>
            <a-button 
              size="small"
              @click="viewDetails(suggestion.id)"
            >
              查看详情
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史对比图表 -->
    <div class="history-comparison" v-if="showHistory">
      <h3 class="chart-title">
        <BarChart3 class="w-5 h-5 mr-2" />
        历史成绩对比
      </h3>
      <div class="history-chart" ref="historyChartRef"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  Target,
  TrendingUp,
  Lightbulb,
  BarChart3,
  BookOpen,
  Headphones,
  PenTool,
  MessageSquare,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-vue-next'

interface SkillData {
  name: string
  score: number
  accuracy: number
  timeUsed: number
  suggestion: string
  icon: any
}

interface Suggestion {
  id: number
  title: string
  description: string
  type: string
  priority: 'high' | 'medium' | 'low'
  icon: any
}

interface Props {
  skillData: SkillData[]
  suggestions: Suggestion[]
  showHistory?: boolean
  historyData?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  showHistory: false,
  historyData: () => []
})

const radarChartRef = ref<HTMLElement>()
const historyChartRef = ref<HTMLElement>()
let radarChart: echarts.ECharts | null = null
let historyChart: echarts.ECharts | null = null

// 获取分数等级
const getScoreLevel = (score: number): string => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '需提高'
}

// 获取分数等级样式类
const getScoreLevelClass = (score: number): string => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'average'
  if (score >= 60) return 'pass'
  return 'poor'
}

// 获取进度条颜色
const getProgressColor = (score: number): string => {
  if (score >= 90) return '#52c41a'
  if (score >= 80) return '#1890ff'
  if (score >= 70) return '#fa8c16'
  if (score >= 60) return '#faad14'
  return '#f5222d'
}

// 获取优先级文本
const getPriorityText = (priority: string): string => {
  switch (priority) {
    case 'high': return '高优先级'
    case 'medium': return '中优先级'
    case 'low': return '低优先级'
    default: return ''
  }
}

// 初始化雷达图
const initRadarChart = () => {
  if (!radarChartRef.value) return

  radarChart = echarts.init(radarChartRef.value)
  
  const option = {
    title: {
      text: '能力评估雷达图',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: props.skillData.map(skill => ({
        name: skill.name,
        max: 100
      })),
      center: ['50%', '55%'],
      radius: '70%',
      axisName: {
        color: '#666',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: '#e8e8e8'
        }
      },
      axisLine: {
        lineStyle: {
          color: '#d9d9d9'
        }
      }
    },
    series: [{
      name: '能力评估',
      type: 'radar',
      data: [{
        value: props.skillData.map(skill => skill.score),
        name: '当前水平',
        areaStyle: {
          color: 'rgba(24, 144, 255, 0.2)'
        },
        lineStyle: {
          color: '#1890ff',
          width: 2
        },
        itemStyle: {
          color: '#1890ff'
        }
      }]
    }]
  }

  radarChart.setOption(option)
}

// 初始化历史对比图表
const initHistoryChart = () => {
  if (!historyChartRef.value || !props.showHistory) return

  historyChart = echarts.init(historyChartRef.value)
  
  const option = {
    title: {
      text: '历史成绩趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['听力', '口语', '阅读', '写作'],
      bottom: 10
    },
    xAxis: {
      type: 'category',
      data: ['第1次', '第2次', '第3次', '第4次', '第5次']
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}分'
      }
    },
    series: [
      {
        name: '听力',
        type: 'line',
        data: [65, 72, 78, 82, 85],
        smooth: true,
        lineStyle: { color: '#1890ff' },
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '口语',
        type: 'line',
        data: [58, 65, 70, 75, 78],
        smooth: true,
        lineStyle: { color: '#52c41a' },
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '阅读',
        type: 'line',
        data: [70, 75, 80, 85, 87],
        smooth: true,
        lineStyle: { color: '#fa8c16' },
        itemStyle: { color: '#fa8c16' }
      },
      {
        name: '写作',
        type: 'line',
        data: [62, 68, 72, 76, 80],
        smooth: true,
        lineStyle: { color: '#f5222d' },
        itemStyle: { color: '#f5222d' }
      }
    ]
  }

  historyChart.setOption(option)
}

// 开始学习
const startLearning = (type: string) => {
  // 根据类型跳转到相应的学习页面
  console.log('Start learning:', type)
}

// 查看详情
const viewDetails = (id: number) => {
  console.log('View details:', id)
}

onMounted(async () => {
  await nextTick()
  initRadarChart()
  initHistoryChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    radarChart?.resize()
    historyChart?.resize()
  })
})
</script>

<style scoped lang="less">
.assessment-result-chart {
  .chart-container,
  .skills-progress,
  .suggestions-section,
  .history-comparison {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .chart-title {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 20px 0;
  }

  .radar-chart,
  .history-chart {
    height: 400px;
    width: 100%;
  }

  .skills-progress {
    .skill-items {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .skill-item {
      padding: 20px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #f0f0f0;
    }

    .skill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .skill-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .skill-icon {
        color: #1890ff;
      }

      .skill-name {
        font-size: 16px;
        font-weight: 500;
        color: #1f2937;
      }
    }

    .skill-score {
      display: flex;
      align-items: center;
      gap: 8px;

      .score-value {
        font-size: 24px;
        font-weight: 600;
        color: #1f2937;
      }

      .score-unit {
        font-size: 14px;
        color: #6b7280;
      }

      .score-level {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;

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

        &.pass {
          background: #fffbe6;
          color: #faad14;
        }

        &.poor {
          background: #fff2f0;
          color: #f5222d;
        }
      }
    }

    .skill-progress {
      margin-bottom: 12px;
    }

    .skill-details {
      display: flex;
      gap: 24px;
      font-size: 14px;

      .detail-item {
        display: flex;
        gap: 4px;

        .detail-label {
          color: #6b7280;
        }

        .detail-value {
          color: #1f2937;
          font-weight: 500;
        }

        .detail-suggestion {
          color: #1890ff;
          flex: 1;
        }
      }
    }
  }

  .suggestions-section {
    .suggestions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .suggestion-card {
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #f0f0f0;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      &.high {
        border-left: 4px solid #f5222d;
        background: linear-gradient(135deg, #fff2f0 0%, #ffffff 100%);
      }

      &.medium {
        border-left: 4px solid #fa8c16;
        background: linear-gradient(135deg, #fff7e6 0%, #ffffff 100%);
      }

      &.low {
        border-left: 4px solid #52c41a;
        background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
      }
    }

    .suggestion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .suggestion-icon {
        padding: 8px;
        border-radius: 8px;
        background: #f0f9ff;
        color: #1890ff;
      }

      .suggestion-priority {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 12px;
        background: #f0f0f0;
        color: #666;
      }
    }

    .suggestion-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 8px 0;
    }

    .suggestion-description {
      color: #6b7280;
      line-height: 1.5;
      margin: 0 0 16px 0;
    }

    .suggestion-actions {
      display: flex;
      gap: 8px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .assessment-result-chart {
    .skill-details {
      flex-direction: column;
      gap: 8px;
    }

    .suggestions-grid {
      grid-template-columns: 1fr;
    }

    .radar-chart,
    .history-chart {
      height: 300px;
    }
  }
}
</style>