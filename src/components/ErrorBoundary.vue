<template>
  <div class="error-boundary">
    <!-- 错误显示区域 -->
    <div v-if="hasError" class="error-display">
      <div class="error-container">
        <div class="error-icon">
          <AlertTriangle class="w-16 h-16 text-red-500" />
        </div>
        
        <div class="error-content">
          <h2 class="error-title">哎呀，出现了一些问题！</h2>
          <p class="error-message">{{ errorMessage }}</p>
          
          <div class="error-details" v-if="showDetails">
            <a-collapse>
              <a-collapse-panel key="1" header="错误详情">
                <pre class="error-stack">{{ errorStack }}</pre>
              </a-collapse-panel>
              
              <a-collapse-panel key="2" header="组件信息" v-if="errorInfo">
                <pre class="error-info">{{ errorInfo }}</pre>
              </a-collapse-panel>
              
              <a-collapse-panel key="3" header="用户操作记录" v-if="userActions.length > 0">
                <div class="action-list">
                  <div 
                    v-for="(action, index) in userActions" 
                    :key="index"
                    class="action-item"
                  >
                    <span class="action-time">{{ formatTime(action.timestamp) }}</span>
                    <span class="action-type">{{ action.type }}</span>
                    <span class="action-detail">{{ action.detail }}</span>
                  </div>
                </div>
              </a-collapse-panel>
            </a-collapse>
          </div>
          
          <div class="error-actions">
            <a-space>
              <a-button type="primary" @click="handleReload">
                <RefreshCw class="w-4 h-4" />
                重新加载
              </a-button>
              
              <a-button @click="handleRetry">
                <RotateCcw class="w-4 h-4" />
                重试
              </a-button>
              
              <a-button @click="handleGoHome">
                <Home class="w-4 h-4" />
                返回首页
              </a-button>
              
              <a-button @click="showDetails = !showDetails">
                <Info class="w-4 h-4" />
                {{ showDetails ? '隐藏' : '显示' }}详情
              </a-button>
              
              <a-button @click="handleReport">
                <Bug class="w-4 h-4" />
                报告问题
              </a-button>
            </a-space>
          </div>
          
          <div class="error-suggestions" v-if="suggestions.length > 0">
            <h4>建议解决方案：</h4>
            <ul>
              <li v-for="(suggestion, index) in suggestions" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 正常内容 -->
    <div v-else>
      <slot />
    </div>
    
    <!-- 错误报告模态框 -->
    <a-modal
      v-model:open="showReportModal"
      title="报告问题"
      @ok="submitReport"
      width="600px"
    >
      <a-form layout="vertical">
        <a-form-item label="问题描述">
          <a-textarea 
            v-model:value="reportForm.description"
            placeholder="请描述您遇到的问题..."
            :rows="4"
          />
        </a-form-item>
        
        <a-form-item label="重现步骤">
          <a-textarea 
            v-model:value="reportForm.steps"
            placeholder="请描述如何重现这个问题..."
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item label="联系方式（可选）">
          <a-input 
            v-model:value="reportForm.contact"
            placeholder="邮箱或其他联系方式"
          />
        </a-form-item>
        
        <a-form-item>
          <a-checkbox v-model:checked="reportForm.includeDetails">
            包含错误详情和用户操作记录
          </a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 网络错误提示 -->
    <a-modal
      v-model:open="showNetworkError"
      title="网络连接问题"
      :footer="null"
      width="400px"
    >
      <div class="network-error">
        <div class="network-icon">
          <WifiOff class="w-12 h-12 text-orange-500" />
        </div>
        <div class="network-content">
          <h3>网络连接异常</h3>
          <p>请检查您的网络连接，然后重试。</p>
          <a-space>
            <a-button type="primary" @click="checkNetwork">
              检查网络
            </a-button>
            <a-button @click="showNetworkError = false">
              关闭
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, onErrorCaptured, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  AlertTriangle,
  RefreshCw,
  RotateCcw,
  Home,
  Info,
  Bug,
  WifiOff
} from 'lucide-vue-next'

interface UserAction {
  timestamp: string
  type: string
  detail: string
}

interface ErrorReport {
  description: string
  steps: string
  contact: string
  includeDetails: boolean
}

interface ErrorInfo {
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  url: string
  userAgent: string
  userId?: string
}

// Props
interface Props {
  fallback?: string
  onError?: (error: Error, errorInfo: any) => void
  enableReporting?: boolean
  maxRetries?: number
}

const props = withDefaults(defineProps<Props>(), {
  fallback: '',
  enableReporting: true,
  maxRetries: 3
})

// Emits
const emit = defineEmits<{
  error: [error: Error, errorInfo: any]
  retry: [count: number]
  recover: []
}>()

// 响应式数据
const router = useRouter()
const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')
const errorInfo = ref('')
const showDetails = ref(false)
const showReportModal = ref(false)
const showNetworkError = ref(false)
const retryCount = ref(0)

// 用户操作记录
const userActions = ref<UserAction[]>([])

// 错误报告表单
const reportForm = reactive<ErrorReport>({
  description: '',
  steps: '',
  contact: '',
  includeDetails: true
})

// 错误建议
const suggestions = ref<string[]>([])

// 网络状态
const isOnline = ref(navigator.onLine)

// 错误捕获
onErrorCaptured((error: Error, instance, errorInfo) => {
  console.error('Error captured:', error)
  console.error('Error info:', errorInfo)
  
  handleError(error, errorInfo)
  
  // 阻止错误继续传播
  return false
})

// 全局错误处理
const handleGlobalError = (event: ErrorEvent) => {
  const error = new Error(event.message)
  error.stack = `${event.filename}:${event.lineno}:${event.colno}`
  handleError(error, 'Global error')
}

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  const error = new Error(`Unhandled promise rejection: ${event.reason}`)
  handleError(error, 'Promise rejection')
}

// 错误处理主函数
const handleError = (error: Error, info?: any) => {
  hasError.value = true
  errorMessage.value = getErrorMessage(error)
  errorStack.value = error.stack || ''
  errorInfo.value = typeof info === 'string' ? info : JSON.stringify(info, null, 2)
  
  // 生成建议
  generateSuggestions(error)
  
  // 记录错误信息
  logError(error, info)
  
  // 触发回调
  props.onError?.(error, info)
  emit('error', error, info)
  
  // 检查是否是网络错误
  if (isNetworkError(error)) {
    showNetworkError.value = true
  }
}

// 获取用户友好的错误消息
const getErrorMessage = (error: Error): string => {
  const errorMessages: Record<string, string> = {
    'ChunkLoadError': '资源加载失败，请刷新页面重试',
    'NetworkError': '网络连接异常，请检查网络设置',
    'TypeError': '数据类型错误，请联系技术支持',
    'ReferenceError': '引用错误，请刷新页面重试',
    'SyntaxError': '语法错误，请联系技术支持',
    'RangeError': '数值范围错误，请检查输入数据',
    'SecurityError': '安全错误，请检查权限设置'
  }
  
  for (const [type, message] of Object.entries(errorMessages)) {
    if (error.name.includes(type) || error.message.includes(type)) {
      return message
    }
  }
  
  return error.message || '发生了未知错误，请重试或联系技术支持'
}

// 生成解决建议
const generateSuggestions = (error: Error) => {
  suggestions.value = []
  
  if (error.name.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
    suggestions.value.push('刷新页面重新加载资源')
    suggestions.value.push('清除浏览器缓存后重试')
    suggestions.value.push('检查网络连接是否正常')
  } else if (isNetworkError(error)) {
    suggestions.value.push('检查网络连接')
    suggestions.value.push('尝试切换网络环境')
    suggestions.value.push('稍后重试')
  } else if (error.name.includes('TypeError')) {
    suggestions.value.push('刷新页面重试')
    suggestions.value.push('清除浏览器数据')
    suggestions.value.push('联系技术支持')
  } else {
    suggestions.value.push('刷新页面重试')
    suggestions.value.push('返回首页重新开始')
    suggestions.value.push('如果问题持续，请联系技术支持')
  }
}

// 判断是否是网络错误
const isNetworkError = (error: Error): boolean => {
  const networkKeywords = ['NetworkError', 'fetch', 'network', 'timeout', 'connection']
  return networkKeywords.some(keyword => 
    error.message.toLowerCase().includes(keyword.toLowerCase())
  )
}

// 记录错误信息
const logError = (error: Error, info?: any) => {
  const errorLog: ErrorInfo = {
    message: error.message,
    stack: error.stack,
    componentStack: typeof info === 'string' ? info : JSON.stringify(info),
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  }
  
  // 保存到本地存储
  const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]')
  existingLogs.unshift(errorLog)
  
  // 保持最近50条错误记录
  if (existingLogs.length > 50) {
    existingLogs.splice(50)
  }
  
  localStorage.setItem('errorLogs', JSON.stringify(existingLogs))
  
  // 发送到错误监控服务（如果配置了）
  sendErrorToService(errorLog)
}

// 发送错误到监控服务
const sendErrorToService = async (errorLog: ErrorInfo) => {
  try {
    // 这里可以集成第三方错误监控服务
    // 例如：Sentry, LogRocket, Bugsnag 等
    console.log('Error logged:', errorLog)
  } catch (e) {
    console.error('Failed to send error to monitoring service:', e)
  }
}

// 记录用户操作
const recordUserAction = (type: string, detail: string) => {
  const action: UserAction = {
    timestamp: new Date().toISOString(),
    type,
    detail
  }
  
  userActions.value.unshift(action)
  
  // 保持最近20条操作记录
  if (userActions.value.length > 20) {
    userActions.value.splice(20)
  }
}

// 处理重新加载
const handleReload = () => {
  recordUserAction('reload', '用户点击重新加载')
  window.location.reload()
}

// 处理重试
const handleRetry = async () => {
  if (retryCount.value >= props.maxRetries) {
    message.warning(`已达到最大重试次数 (${props.maxRetries})`)
    return
  }
  
  retryCount.value++
  recordUserAction('retry', `第${retryCount.value}次重试`)
  
  hasError.value = false
  errorMessage.value = ''
  errorStack.value = ''
  errorInfo.value = ''
  showDetails.value = false
  
  emit('retry', retryCount.value)
  
  // 等待下一个tick，让组件重新渲染
  await nextTick()
  
  try {
    // 这里可以添加重试逻辑
    emit('recover')
    message.success('重试成功')
  } catch (error) {
    handleError(error as Error, 'Retry failed')
  }
}

// 返回首页
const handleGoHome = () => {
  recordUserAction('navigate', '返回首页')
  router.push('/')
}

// 显示错误报告
const handleReport = () => {
  if (!props.enableReporting) {
    message.info('错误报告功能未启用')
    return
  }
  
  showReportModal.value = true
}

// 提交错误报告
const submitReport = async () => {
  try {
    const report = {
      ...reportForm,
      errorMessage: errorMessage.value,
      errorStack: reportForm.includeDetails ? errorStack.value : '',
      userActions: reportForm.includeDetails ? userActions.value : [],
      timestamp: new Date().toISOString(),
      url: window.location.href
    }
    
    // 这里可以发送到后端API
    console.log('Error report submitted:', report)
    
    message.success('问题报告已提交，感谢您的反馈！')
    showReportModal.value = false
    
    // 重置表单
    Object.assign(reportForm, {
      description: '',
      steps: '',
      contact: '',
      includeDetails: true
    })
  } catch (error) {
    message.error('提交报告失败，请稍后重试')
  }
}

// 检查网络连接
const checkNetwork = async () => {
  try {
    const response = await fetch('/api/health', { 
      method: 'HEAD',
      cache: 'no-cache'
    })
    
    if (response.ok) {
      message.success('网络连接正常')
      showNetworkError.value = false
    } else {
      message.error('服务器连接异常')
    }
  } catch (error) {
    message.error('网络连接失败')
  }
}

// 网络状态监听
const handleOnline = () => {
  isOnline.value = true
  message.success('网络连接已恢复')
  showNetworkError.value = false
}

const handleOffline = () => {
  isOnline.value = false
  message.warning('网络连接已断开')
  showNetworkError.value = true
}

// 格式化时间
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  // 监听全局错误
  window.addEventListener('error', handleGlobalError)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  
  // 监听网络状态
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // 记录页面加载
  recordUserAction('mount', '组件挂载')
})

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener('error', handleGlobalError)
  window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

// 暴露给父组件的方法
defineExpose({
  clearError: () => {
    hasError.value = false
    errorMessage.value = ''
    errorStack.value = ''
    errorInfo.value = ''
    retryCount.value = 0
  },
  
  triggerError: (error: Error, info?: any) => {
    handleError(error, info)
  },
  
  recordAction: recordUserAction,
  
  getErrorLogs: () => {
    return JSON.parse(localStorage.getItem('errorLogs') || '[]')
  },
  
  clearErrorLogs: () => {
    localStorage.removeItem('errorLogs')
    message.success('错误日志已清空')
  }
})
</script>

<style scoped lang="less">
.error-boundary {
  .error-display {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

    .error-container {
      max-width: 600px;
      width: 100%;
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      text-align: center;

      .error-icon {
        margin-bottom: 24px;
        animation: shake 0.5s ease-in-out;
      }

      .error-content {
        .error-title {
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }

        .error-message {
          font-size: 16px;
          color: #666;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .error-details {
          margin: 24px 0;
          text-align: left;

          .error-stack,
          .error-info {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            max-height: 200px;
            overflow-y: auto;
            white-space: pre-wrap;
            word-break: break-all;
          }

          .action-list {
            .action-item {
              display: flex;
              gap: 12px;
              padding: 8px 0;
              border-bottom: 1px solid #f0f0f0;
              font-size: 12px;

              &:last-child {
                border-bottom: none;
              }

              .action-time {
                color: #999;
                flex-shrink: 0;
                width: 120px;
              }

              .action-type {
                color: #1890ff;
                font-weight: 500;
                flex-shrink: 0;
                width: 80px;
              }

              .action-detail {
                color: #666;
                flex: 1;
              }
            }
          }
        }

        .error-actions {
          margin: 24px 0;
        }

        .error-suggestions {
          text-align: left;
          background: #f6ffed;
          border: 1px solid #b7eb8f;
          border-radius: 6px;
          padding: 16px;
          margin-top: 24px;

          h4 {
            color: #52c41a;
            margin-bottom: 12px;
            font-size: 14px;
          }

          ul {
            margin: 0;
            padding-left: 20px;

            li {
              color: #666;
              margin-bottom: 8px;
              line-height: 1.5;

              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }
      }
    }
  }

  .network-error {
    text-align: center;
    padding: 20px;

    .network-icon {
      margin-bottom: 16px;
    }

    .network-content {
      h3 {
        margin-bottom: 12px;
        color: #333;
      }

      p {
        color: #666;
        margin-bottom: 20px;
      }
    }
  }
}

// 动画效果
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

// 响应式设计
@media (max-width: 768px) {
  .error-boundary {
    .error-display {
      padding: 20px 10px;

      .error-container {
        padding: 24px 20px;

        .error-content {
          .error-title {
            font-size: 20px;
          }

          .error-message {
            font-size: 14px;
          }

          .error-actions {
            :deep(.ant-space) {
              flex-wrap: wrap;
              justify-content: center;
            }

            :deep(.ant-btn) {
              margin-bottom: 8px;
            }
          }
        }
      }
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .error-boundary {
    .error-display {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);

      .error-container {
        background: #1f2937;
        color: #f9fafb;

        .error-content {
          .error-title {
            color: #f9fafb;
          }

          .error-message {
            color: #d1d5db;
          }

          .error-details {
            .error-stack,
            .error-info {
              background: #374151;
              color: #f9fafb;
            }

            .action-list {
              .action-item {
                border-bottom-color: #374151;

                .action-time {
                  color: #9ca3af;
                }

                .action-type {
                  color: #60a5fa;
                }

                .action-detail {
                  color: #d1d5db;
                }
              }
            }
          }

          .error-suggestions {
            background: #065f46;
            border-color: #10b981;

            h4 {
              color: #34d399;
            }

            ul li {
              color: #d1fae5;
            }
          }
        }
      }
    }
  }
}
</style>