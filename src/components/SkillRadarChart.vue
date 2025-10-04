<template>
  <div class="skill-radar-chart">
    <div class="chart-header">
      <h3 class="chart-title">
        <Target class="w-5 h-5 mr-2" />
        能力雷达图
      </h3>
      <p class="chart-subtitle">全面展示你的英语各项能力水平</p>
    </div>
    
    <div class="chart-container">
      <v-chart 
        class="chart" 
        :option="chartOption" 
        :autoresize="true"
        @click="handleChartClick"
      />
    </div>
    
    <div class="skill-details">
      <div class="skill-grid">
        <div 
          v-for="skill in skillData" 
          :key="skill.name"
          class="skill-item"
          :class="{ active: selectedSkill === skill.name }"
          @click="selectSkill(skill.name)"
        >
          <div class="skill-icon">
            <component :is="skill.icon" class="w-6 h-6" />
          </div>
          <div class="skill-info">
            <div class="skill-name">{{ skill.name }}</div>
            <div class="skill-score">{{ skill.score }}分</div>
            <div class="skill-level" :class="getSkillLevelClass(skill.score)">
              {{ getSkillLevel(skill.score) }}
            </div>
          </div>
          <div class="skill-progress">
            <a-progress 
              :percent="skill.score" 
              :show-info="false"
              :stroke-color="getProgressColor(skill.score)"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 技能详情弹窗 -->
    <a-modal
      v-model:open="showSkillDetail"
      :title="selectedSkillData?.name + ' 详细分析'"
      width="600px"
      :footer="null"
    >
      <div v-if="selectedSkillData" class="skill-detail-modal">
        <div class="detail-header">
          <div class="skill-score-large">
            <span class="score-number">{{ selectedSkillData.score }}</span>
            <span class="score-total">/100</span>
          </div>
          <div class="skill-level-badge" :class="getSkillLevelClass(selectedSkillData.score)">
            {{ getSkillLevel(selectedSkillData.score) }}
          </div>
        </div>
        
        <div class="detail-stats">
          <div class="stat-item">
            <div class="stat-label">准确率</div>
            <div class="stat-value">{{ selectedSkillData.accuracy }}%</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">用时</div>
            <div class="stat-value">{{ formatTime(selectedSkillData.timeUsed) }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">排名</div>
            <div class="stat-value">前{{ Math.round(100 - selectedSkillData.score) }}%</div>
          </div>
        </div>
        
        <div class="improvement-suggestion">
          <h4>
            <Lightbulb class="w-4 h-4 mr-2" />
            改进建议
          </h4>
          <p>{{ selectedSkillData.suggestion }}</p>
        </div>
        
        <div class="practice-recommendations">
          <h4>
            <BookOpen class="w-4 h-4 mr-2" />
            推荐练习
          </h4>
          <div class="recommendation-list">
            <div v-for="rec in getRecommendations(selectedSkillData.name)" :key="rec.id" class="recommendation-item">
              <component :is="rec.icon" class="w-4 h-4 mr-2" />
              <span>{{ rec.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { 
  Target, 
  Headphones, 
  MessageSquare, 
  BookOpen, 
  PenTool,
  Lightbulb,
  Clock,
  TrendingUp
} from 'lucide-vue-next'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

interface SkillData {
  name: string
  score: number
  accuracy: number
  timeUsed: number
  suggestion: string
  icon: any
}

const props = defineProps<{
  skillData: SkillData[]
  showComparison?: boolean
  comparisonData?: SkillData[]
}>()

const selectedSkill = ref<string>('')
const showSkillDetail = ref(false)

const selectedSkillData = computed(() => {
  return props.skillData.find(skill => skill.name === selectedSkill.value)
})

// 雷达图配置
const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      return `${params.name}: ${params.value}分`
    }
  },
  radar: {
    indicator: props.skillData.map(skill => ({
      name: skill.name,
      max: 100,
      color: '#374151'
    })),
    shape: 'polygon',
    splitNumber: 5,
    axisName: {
      color: '#6b7280',
      fontSize: 14,
      fontWeight: 600
    },
    splitLine: {
      lineStyle: {
        color: '#e5e7eb'
      }
    },
    splitArea: {
      show: true,
      areaStyle: {
        color: ['rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.02)']
      }
    },
    axisLine: {
      lineStyle: {
        color: '#d1d5db'
      }
    }
  },
  series: [
    {
      name: '当前水平',
      type: 'radar',
      data: [
        {
          value: props.skillData.map(skill => skill.score),
          name: '我的成绩',
          areaStyle: {
            color: 'rgba(59, 130, 246, 0.2)'
          },
          lineStyle: {
            color: '#3b82f6',
            width: 3
          },
          itemStyle: {
            color: '#3b82f6',
            borderColor: '#ffffff',
            borderWidth: 2
          }
        }
      ]
    }
  ]
}))

// 获取技能等级
const getSkillLevel = (score: number): string => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '需提高'
}

// 获取技能等级样式类
const getSkillLevelClass = (score: number): string => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'average'
  if (score >= 60) return 'pass'
  return 'poor'
}

// 获取进度条颜色
const getProgressColor = (score: number): string => {
  if (score >= 90) return '#10b981'
  if (score >= 80) return '#3b82f6'
  if (score >= 70) return '#f59e0b'
  if (score >= 60) return '#ef4444'
  return '#6b7280'
}

// 选择技能
const selectSkill = (skillName: string) => {
  selectedSkill.value = skillName
  showSkillDetail.value = true
}

// 处理图表点击
const handleChartClick = (params: any) => {
  if (params.componentType === 'radar') {
    const skillName = props.skillData[params.dataIndex]?.name
    if (skillName) {
      selectSkill(skillName)
    }
  }
}

// 格式化时间
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}分${remainingSeconds}秒`
}

// 获取推荐练习
const getRecommendations = (skillName: string) => {
  const recommendations = {
    '听力': [
      { id: 1, title: '英语新闻听力练习', icon: Headphones },
      { id: 2, title: '日常对话训练', icon: MessageSquare },
      { id: 3, title: '听力理解游戏', icon: Target }
    ],
    '口语': [
      { id: 1, title: '发音纠正练习', icon: MessageSquare },
      { id: 2, title: '情景对话模拟', icon: BookOpen },
      { id: 3, title: '口语流利度训练', icon: TrendingUp }
    ],
    '阅读': [
      { id: 1, title: '阅读理解专项', icon: BookOpen },
      { id: 2, title: '词汇扩展练习', icon: Target },
      { id: 3, title: '快速阅读训练', icon: Clock }
    ],
    '写作': [
      { id: 1, title: '语法结构练习', icon: PenTool },
      { id: 2, title: '作文写作指导', icon: BookOpen },
      { id: 3, title: '词汇运用训练', icon: Target }
    ]
  }
  
  return recommendations[skillName] || []
}
</script>

<style scoped lang="less">
.skill-radar-chart {
  .chart-header {
    text-align: center;
    margin-bottom: 24px;

    .chart-title {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .chart-subtitle {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }
  }

  .chart-container {
    height: 400px;
    margin-bottom: 32px;

    .chart {
      width: 100%;
      height: 100%;
    }
  }

  .skill-details {
    .skill-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .skill-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #3b82f6;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
      }

      &.active {
        border-color: #3b82f6;
        background: #eff6ff;
      }

      .skill-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: #f3f4f6;
        border-radius: 12px;
        margin-right: 16px;
        color: #374151;
      }

      .skill-info {
        flex: 1;
        margin-right: 16px;

        .skill-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .skill-score {
          font-size: 20px;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 4px;
        }

        .skill-level {
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 12px;
          display: inline-block;

          &.excellent {
            background: #ecfdf5;
            color: #065f46;
          }

          &.good {
            background: #eff6ff;
            color: #1e40af;
          }

          &.average {
            background: #fef3c7;
            color: #92400e;
          }

          &.pass {
            background: #fef2f2;
            color: #991b1b;
          }

          &.poor {
            background: #f3f4f6;
            color: #374151;
          }
        }
      }

      .skill-progress {
        width: 80px;
      }
    }
  }
}

.skill-detail-modal {
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;

    .skill-score-large {
      .score-number {
        font-size: 48px;
        font-weight: 700;
        color: #3b82f6;
      }

      .score-total {
        font-size: 24px;
        color: #6b7280;
        margin-left: 4px;
      }
    }

    .skill-level-badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;

      &.excellent {
        background: #ecfdf5;
        color: #065f46;
      }

      &.good {
        background: #eff6ff;
        color: #1e40af;
      }

      &.average {
        background: #fef3c7;
        color: #92400e;
      }

      &.pass {
        background: #fef2f2;
        color: #991b1b;
      }

      &.poor {
        background: #f3f4f6;
        color: #374151;
      }
    }
  }

  .detail-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    .stat-item {
      text-align: center;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;

      .stat-label {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
      }
    }
  }

  .improvement-suggestion {
    margin-bottom: 24px;

    h4 {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 12px;
    }

    p {
      color: #6b7280;
      line-height: 1.6;
      margin: 0;
    }
  }

  .practice-recommendations {
    h4 {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 12px;
    }

    .recommendation-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .recommendation-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: #f9fafb;
        border-radius: 6px;
        color: #374151;
        font-size: 14px;
      }
    }
  }
}
</style>