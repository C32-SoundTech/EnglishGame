<template>
  <div class="progress-trend-chart">
    <div class="chart-header">
      <div class="header-left">
        <h3 class="chart-title">
          <TrendingUp class="w-5 h-5 mr-2" />
          学习进度趋势
        </h3>
        <p class="chart-subtitle">追踪你的学习成长轨迹</p>
      </div>
      <div class="header-controls">
        <a-select v-model:value="selectedPeriod" @change="updateChart" class="period-select">
          <a-select-option value="week">最近一周</a-select-option>
          <a-select-option value="month">最近一月</a-select-option>
          <a-select-option value="quarter">最近三月</a-select-option>
          <a-select-option value="year">最近一年</a-select-option>
        </a-select>
        <a-button @click="toggleSkillVisibility" size="small">
          <Eye class="w-4 h-4 mr-1" />
          显示/隐藏技能
        </a-button>
      </div>
    </div>
    
    <div class="chart-container">
      <v-chart 
        class="chart" 
        :option="chartOption" 
        :autoresize="true"
        @click="handleChartClick"
      />
    </div>
    
    <div class="trend-summary">
      <div class="summary-grid">
        <div class="summary-item" v-for="skill in trendSummary" :key="skill.name">
          <div class="skill-header">
            <component :is="skill.icon" class="w-5 h-5 mr-2" />
            <span class="skill-name">{{ skill.name }}</span>
          </div>
          <div class="trend-info">
            <div class="trend-change" :class="skill.trend > 0 ? 'positive' : skill.trend < 0 ? 'negative' : 'neutral'">
              <component :is="skill.trend > 0 ? TrendingUp : skill.trend < 0 ? TrendingDown : Minus" class="w-4 h-4 mr-1" />
              {{ skill.trend > 0 ? '+' : '' }}{{ skill.trend }}分
            </div>
            <div class="current-score">当前: {{ skill.currentScore }}分</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 技能切换面板 -->
    <a-drawer
      v-model:open="showSkillPanel"
      title="选择显示的技能"
      placement="right"
      width="300"
    >
      <div class="skill-toggle-list">
        <div v-for="skill in allSkills" :key="skill.name" class="skill-toggle-item">
          <a-switch 
            v-model:checked="skill.visible"
            @change="updateChart"
          />
          <div class="skill-info">
            <component :is="skill.icon" class="w-4 h-4 mr-2" />
            <span>{{ skill.name }}</span>
          </div>
          <div class="skill-color" :style="{ backgroundColor: skill.color }"></div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { 
  TrendingUp, 
  TrendingDown,
  Minus,
  Eye,
  Headphones, 
  MessageSquare, 
  BookOpen, 
  PenTool 
} from 'lucide-vue-next'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
])

interface TrendData {
  date: string
  listening: number
  speaking: number
  reading: number
  writing: number
}

const props = defineProps<{
  trendData: TrendData[]
}>()

const selectedPeriod = ref('month')
const showSkillPanel = ref(false)

// 技能配置
const allSkills = ref([
  { name: '听力', key: 'listening', visible: true, color: '#3b82f6', icon: Headphones },
  { name: '口语', key: 'speaking', visible: true, color: '#10b981', icon: MessageSquare },
  { name: '阅读', key: 'reading', visible: true, color: '#f59e0b', icon: BookOpen },
  { name: '写作', key: 'writing', visible: true, color: '#ef4444', icon: PenTool }
])

// 过滤后的数据
const filteredData = computed(() => {
  const now = new Date()
  let startDate = new Date()
  
  switch (selectedPeriod.value) {
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3)
      break
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1)
      break
  }
  
  return props.trendData.filter(item => new Date(item.date) >= startDate)
})

// 图表配置
const chartOption = computed(() => {
  const visibleSkills = allSkills.value.filter(skill => skill.visible)
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: (params: any[]) => {
        let result = `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`
        params.forEach(param => {
          result += `
            <div style="display: flex; align-items: center; margin-bottom: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
              <span style="flex: 1;">${param.seriesName}</span>
              <span style="font-weight: 600; margin-left: 8px;">${param.value}分</span>
            </div>
          `
        })
        return result
      }
    },
    legend: {
      data: visibleSkills.map(skill => skill.name),
      top: 10,
      textStyle: {
        fontSize: 14,
        color: '#374151'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: filteredData.value.map(item => {
        const date = new Date(item.date)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }),
      axisLabel: {
        color: '#6b7280',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
        formatter: '{value}分'
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed'
        }
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      }
    ],
    series: visibleSkills.map(skill => ({
      name: skill.name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: skill.color,
        width: 3
      },
      itemStyle: {
        color: skill.color,
        borderColor: '#ffffff',
        borderWidth: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: skill.color + '40' },
            { offset: 1, color: skill.color + '10' }
          ]
        }
      },
      data: filteredData.value.map(item => item[skill.key])
    }))
  }
})

// 趋势摘要
const trendSummary = computed(() => {
  if (filteredData.value.length < 2) return []
  
  const latest = filteredData.value[filteredData.value.length - 1]
  const previous = filteredData.value[filteredData.value.length - 2]
  
  return allSkills.value.map(skill => ({
    name: skill.name,
    icon: skill.icon,
    currentScore: latest[skill.key],
    trend: latest[skill.key] - previous[skill.key]
  }))
})

// 更新图表
const updateChart = () => {
  // 图表会自动重新渲染
}

// 切换技能显示
const toggleSkillVisibility = () => {
  showSkillPanel.value = true
}

// 处理图表点击
const handleChartClick = (params: any) => {
  if (params.componentType === 'series') {
    // 可以添加点击处理逻辑
    console.log('Clicked on:', params.seriesName, params.value)
  }
}

onMounted(() => {
  updateChart()
})
</script>

<style scoped lang="less">
.progress-trend-chart {
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .header-left {
      .chart-title {
        display: flex;
        align-items: center;
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

    .header-controls {
      display: flex;
      gap: 12px;
      align-items: center;

      .period-select {
        width: 120px;
      }
    }
  }

  .chart-container {
    height: 400px;
    margin-bottom: 32px;
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .chart {
      width: 100%;
      height: 100%;
    }
  }

  .trend-summary {
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .summary-item {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #3b82f6;

      .skill-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .skill-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
      }

      .trend-info {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .trend-change {
          display: flex;
          align-items: center;
          font-weight: 600;
          font-size: 14px;

          &.positive {
            color: #10b981;
          }

          &.negative {
            color: #ef4444;
          }

          &.neutral {
            color: #6b7280;
          }
        }

        .current-score {
          font-size: 14px;
          color: #6b7280;
        }
      }
    }
  }
}

.skill-toggle-list {
  .skill-toggle-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;

    &:last-child {
      border-bottom: none;
    }

    .skill-info {
      display: flex;
      align-items: center;
      flex: 1;
      margin: 0 12px;
      font-size: 14px;
      color: #374151;
    }

    .skill-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 0 1px #e5e7eb;
    }
  }
}

@media (max-width: 768px) {
  .progress-trend-chart {
    .chart-header {
      flex-direction: column;
      gap: 16px;

      .header-controls {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .trend-summary {
      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>