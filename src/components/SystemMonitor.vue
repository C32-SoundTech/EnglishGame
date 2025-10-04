<template>
  <div class="system-monitor">
    <!-- 系统状态概览 -->
    <div class="status-overview">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card class="status-card">
            <div class="status-item">
              <div class="status-icon">
                <Server class="w-6 h-6" :class="systemStatus.server === 'healthy' ? 'text-green-500' : 'text-red-500'" />
              </div>
              <div class="status-info">
                <h4>服务器状态</h4>
                <p :class="systemStatus.server === 'healthy' ? 'text-green-600' : 'text-red-600'">
                  {{ systemStatus.server === 'healthy' ? '正常运行' : '异常' }}
                </p>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :span="8">
          <a-card class="status-card">
            <div class="status-item">
              <div class="status-icon">
                <Database class="w-6 h-6" :class="systemStatus.database === 'healthy' ? 'text-green-500' : 'text-red-500'" />
              </div>
              <div class="status-info">
                <h4>数据库状态</h4>
                <p :class="systemStatus.database === 'healthy' ? 'text-green-600' : 'text-red-600'">
                  {{ systemStatus.database === 'healthy' ? '连接正常' : '连接异常' }}
                </p>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :span="8">
          <a-card class="status-card">
            <div class="status-item">
              <div class="status-icon">
                <Wifi class="w-6 h-6" :class="systemStatus.network === 'healthy' ? 'text-green-500' : 'text-red-500'" />
              </div>
              <div class="status-info">
                <h4>网络状态</h4>
                <p :class="systemStatus.network === 'healthy' ? 'text-green-600' : 'text-red-600'">
                  {{ systemStatus.network === 'healthy' ? '网络畅通' : '网络异常' }}
                </p>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 性能监控 -->
    <a-row :gutter="16" class="performance-section">
      <a-col :span="12">
        <a-card title="系统性能" class="performance-card">
          <template #extra>
            <a-button size="small" @click="refreshPerformance">
              <RefreshCw class="w-4 h-4" />
            </a-button>
          </template>
          
          <div class="performance-metrics">
            <div class="metric-item">
              <div class="metric-label">CPU 使用率</div>
              <a-progress 
                :percent="performance.cpu" 
                :status="performance.cpu > 80 ? 'exception' : 'normal'"
                :stroke-color="getProgressColor(performance.cpu)"
              />
            </div>
            
            <div class="metric-item">
              <div class="metric-label">内存使用率</div>
              <a-progress 
                :percent="performance.memory" 
                :status="performance.memory > 85 ? 'exception' : 'normal'"
                :stroke-color="getProgressColor(performance.memory)"
              />
            </div>
            
            <div class="metric-item">
              <div class="metric-label">磁盘使用率</div>
              <a-progress 
                :percent="performance.disk" 
                :status="performance.disk > 90 ? 'exception' : 'normal'"
                :stroke-color="getProgressColor(performance.disk)"
              />
            </div>
            
            <div class="metric-item">
              <div class="metric-label">网络带宽</div>
              <a-progress 
                :percent="performance.network" 
                :stroke-color="getProgressColor(performance.network)"
              />
            </div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :span="12">
        <a-card title="实时统计" class="stats-card">
          <template #extra>
            <a-switch 
              v-model:checked="autoRefresh" 
              checked-children="自动刷新"
              un-checked-children="手动刷新"
              @change="toggleAutoRefresh"
            />
          </template>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ realTimeStats.onlineUsers }}</div>
              <div class="stat-label">在线用户</div>
              <div class="stat-trend">
                <TrendingUp class="w-4 h-4 text-green-500" />
                <span class="text-green-500">+5.2%</span>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-value">{{ realTimeStats.activeConnections }}</div>
              <div class="stat-label">活跃连接</div>
              <div class="stat-trend">
                <TrendingUp class="w-4 h-4 text-blue-500" />
                <span class="text-blue-500">+2.1%</span>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-value">{{ realTimeStats.requestsPerMinute }}</div>
              <div class="stat-label">请求/分钟</div>
              <div class="stat-trend">
                <TrendingDown class="w-4 h-4 text-orange-500" />
                <span class="text-orange-500">-1.3%</span>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-value">{{ realTimeStats.errorRate }}%</div>
              <div class="stat-label">错误率</div>
              <div class="stat-trend">
                <TrendingDown class="w-4 h-4 text-green-500" />
                <span class="text-green-500">-0.5%</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 系统日志 -->
    <a-card title="系统日志" class="logs-card">
      <template #extra>
        <a-space>
          <a-select v-model:value="logLevel" style="width: 120px" @change="filterLogs">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="error">错误</a-select-option>
            <a-select-option value="warning">警告</a-select-option>
            <a-select-option value="info">信息</a-select-option>
          </a-select>
          <a-button @click="clearLogs">清空日志</a-button>
          <a-button @click="exportLogs">导出日志</a-button>
        </a-space>
      </template>
      
      <div class="logs-container">
        <div 
          v-for="log in filteredLogs" 
          :key="log.id"
          class="log-entry"
          :class="`log-${log.level}`"
        >
          <div class="log-time">{{ formatTime(log.timestamp) }}</div>
          <div class="log-level">
            <a-tag :color="getLogLevelColor(log.level)">{{ log.level.toUpperCase() }}</a-tag>
          </div>
          <div class="log-message">{{ log.message }}</div>
          <div class="log-source">{{ log.source }}</div>
        </div>
      </div>
    </a-card>

    <!-- 系统警报 -->
    <a-card title="系统警报" class="alerts-card" v-if="alerts.length > 0">
      <template #extra>
        <a-button @click="clearAllAlerts" danger>清空所有警报</a-button>
      </template>
      
      <div class="alerts-list">
        <a-alert
          v-for="alert in alerts"
          :key="alert.id"
          :message="alert.title"
          :description="alert.description"
          :type="alert.type"
          :show-icon="true"
          closable
          @close="dismissAlert(alert.id)"
          class="alert-item"
        >
          <template #action>
            <a-button size="small" @click="handleAlert(alert)">
              处理
            </a-button>
          </template>
        </a-alert>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  Server,
  Database,
  Wifi,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-vue-next'

interface SystemStatus {
  server: 'healthy' | 'unhealthy'
  database: 'healthy' | 'unhealthy'
  network: 'healthy' | 'unhealthy'
}

interface Performance {
  cpu: number
  memory: number
  disk: number
  network: number
}

interface RealTimeStats {
  onlineUsers: number
  activeConnections: number
  requestsPerMinute: number
  errorRate: number
}

interface LogEntry {
  id: string
  timestamp: string
  level: 'error' | 'warning' | 'info'
  message: string
  source: string
}

interface Alert {
  id: string
  title: string
  description: string
  type: 'error' | 'warning' | 'info'
  timestamp: string
}

// 响应式数据
const autoRefresh = ref(true)
const logLevel = ref('all')
let refreshInterval: NodeJS.Timeout | null = null

// 系统状态
const systemStatus = reactive<SystemStatus>({
  server: 'healthy',
  database: 'healthy',
  network: 'healthy'
})

// 性能数据
const performance = reactive<Performance>({
  cpu: 45,
  memory: 62,
  disk: 78,
  network: 35
})

// 实时统计
const realTimeStats = reactive<RealTimeStats>({
  onlineUsers: 186,
  activeConnections: 234,
  requestsPerMinute: 1250,
  errorRate: 0.8
})

// 日志数据
const logs = ref<LogEntry[]>([
  {
    id: '1',
    timestamp: new Date().toISOString(),
    level: 'info',
    message: '系统启动成功',
    source: 'System'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    level: 'warning',
    message: 'CPU使用率较高，当前45%',
    source: 'Monitor'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    level: 'error',
    message: '数据库连接超时',
    source: 'Database'
  }
])

const filteredLogs = ref<LogEntry[]>([...logs.value])

// 警报数据
const alerts = ref<Alert[]>([
  {
    id: '1',
    title: 'CPU使用率过高',
    description: '当前CPU使用率为85%，建议检查系统负载',
    type: 'warning',
    timestamp: new Date().toISOString()
  }
])

// 方法
const refreshPerformance = async () => {
  try {
    // 模拟获取性能数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    performance.cpu = Math.floor(Math.random() * 100)
    performance.memory = Math.floor(Math.random() * 100)
    performance.disk = Math.floor(Math.random() * 100)
    performance.network = Math.floor(Math.random() * 100)
    
    message.success('性能数据已刷新')
  } catch (error) {
    message.error('刷新性能数据失败')
  }
}

const refreshRealTimeStats = () => {
  // 模拟实时数据变化
  realTimeStats.onlineUsers += Math.floor(Math.random() * 10) - 5
  realTimeStats.activeConnections += Math.floor(Math.random() * 20) - 10
  realTimeStats.requestsPerMinute += Math.floor(Math.random() * 100) - 50
  realTimeStats.errorRate = Math.max(0, realTimeStats.errorRate + (Math.random() - 0.5) * 0.2)
  
  // 确保数值在合理范围内
  realTimeStats.onlineUsers = Math.max(0, realTimeStats.onlineUsers)
  realTimeStats.activeConnections = Math.max(0, realTimeStats.activeConnections)
  realTimeStats.requestsPerMinute = Math.max(0, realTimeStats.requestsPerMinute)
  realTimeStats.errorRate = Math.min(10, Math.max(0, realTimeStats.errorRate))
}

const toggleAutoRefresh = (checked: boolean) => {
  if (checked) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const startAutoRefresh = () => {
  if (refreshInterval) return
  
  refreshInterval = setInterval(() => {
    refreshRealTimeStats()
  }, 5000) // 每5秒刷新一次
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

const filterLogs = () => {
  if (logLevel.value === 'all') {
    filteredLogs.value = [...logs.value]
  } else {
    filteredLogs.value = logs.value.filter(log => log.level === logLevel.value)
  }
}

const clearLogs = () => {
  logs.value = []
  filteredLogs.value = []
  message.success('日志已清空')
}

const exportLogs = () => {
  // 模拟导出日志
  const logData = logs.value.map(log => 
    `${log.timestamp} [${log.level.toUpperCase()}] ${log.source}: ${log.message}`
  ).join('\n')
  
  const blob = new Blob([logData], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `system-logs-${new Date().toISOString().split('T')[0]}.txt`
  a.click()
  URL.revokeObjectURL(url)
  
  message.success('日志导出成功')
}

const dismissAlert = (alertId: string) => {
  const index = alerts.value.findIndex(alert => alert.id === alertId)
  if (index !== -1) {
    alerts.value.splice(index, 1)
  }
}

const handleAlert = (alert: Alert) => {
  message.info(`正在处理警报: ${alert.title}`)
  dismissAlert(alert.id)
}

const clearAllAlerts = () => {
  alerts.value = []
  message.success('所有警报已清空')
}

// 工具函数
const getProgressColor = (percent: number): string => {
  if (percent < 50) return '#52c41a'
  if (percent < 80) return '#faad14'
  return '#ff4d4f'
}

const getLogLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    error: 'red',
    warning: 'orange',
    info: 'blue'
  }
  return colors[level] || 'default'
}

const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped lang="less">
.system-monitor {
  .status-overview {
    margin-bottom: 24px;

    .status-card {
      .status-item {
        display: flex;
        align-items: center;
        gap: 16px;

        .status-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #f5f5f5;
        }

        .status-info {
          h4 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
          }

          p {
            margin: 0;
            font-size: 14px;
            font-weight: 500;
          }
        }
      }
    }
  }

  .performance-section {
    margin-bottom: 24px;

    .performance-card {
      .performance-metrics {
        .metric-item {
          margin-bottom: 16px;

          &:last-child {
            margin-bottom: 0;
          }

          .metric-label {
            margin-bottom: 8px;
            font-weight: 500;
            color: #666;
          }
        }
      }
    }

    .stats-card {
      .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;

        .stat-item {
          text-align: center;
          padding: 16px;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          transition: all 0.3s;

          &:hover {
            border-color: #1890ff;
            box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
          }

          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #1890ff;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
          }

          .stat-trend {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            font-size: 12px;
          }
        }
      }
    }
  }

  .logs-card {
    margin-bottom: 24px;

    .logs-container {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e8e8e8;
      border-radius: 6px;

      .log-entry {
        display: grid;
        grid-template-columns: 150px 80px 1fr 120px;
        gap: 12px;
        padding: 12px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 12px;
        align-items: center;

        &:last-child {
          border-bottom: none;
        }

        &.log-error {
          background-color: #fff2f0;
        }

        &.log-warning {
          background-color: #fffbe6;
        }

        &.log-info {
          background-color: #f6ffed;
        }

        .log-time {
          color: #666;
          font-family: monospace;
        }

        .log-message {
          font-weight: 500;
        }

        .log-source {
          color: #666;
          text-align: right;
        }
      }
    }
  }

  .alerts-card {
    .alerts-list {
      .alert-item {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .system-monitor {
    .performance-section {
      :deep(.ant-col) {
        margin-bottom: 16px;
      }
    }

    .stats-card {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }

    .logs-container {
      .log-entry {
        grid-template-columns: 1fr;
        gap: 4px;
        text-align: left;

        .log-source {
          text-align: left;
        }
      }
    }
  }
}
</style>