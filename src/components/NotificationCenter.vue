<template>
  <div class="notification-center">
    <!-- 通知中心头部 -->
    <div class="notification-header">
      <div class="header-left">
        <Bell class="w-5 h-5" />
        <h3>通知中心</h3>
        <a-badge :count="unreadCount" :offset="[10, 0]" />
      </div>
      <div class="header-right">
        <a-space>
          <a-button size="small" @click="markAllAsRead" :disabled="unreadCount === 0">
            全部已读
          </a-button>
          <a-button size="small" @click="clearAll">
            清空全部
          </a-button>
          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleFilterChange">
                <a-menu-item key="all">全部通知</a-menu-item>
                <a-menu-item key="unread">未读通知</a-menu-item>
                <a-menu-item key="system">系统通知</a-menu-item>
                <a-menu-item key="learning">学习提醒</a-menu-item>
                <a-menu-item key="achievement">成就通知</a-menu-item>
              </a-menu>
            </template>
            <a-button size="small">
              筛选 <ChevronDown class="w-4 h-4" />
            </a-button>
          </a-dropdown>
        </a-space>
      </div>
    </div>

    <!-- 通知列表 -->
    <div class="notification-list">
      <a-empty v-if="filteredNotifications.length === 0" description="暂无通知" />
      
      <div 
        v-for="notification in filteredNotifications" 
        :key="notification.id"
        class="notification-item"
        :class="{ 'unread': !notification.read, 'priority-high': notification.priority === 'high' }"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-icon">
          <component 
            :is="getNotificationIcon(notification.type)" 
            class="w-5 h-5"
            :class="getIconColor(notification.type)"
          />
        </div>
        
        <div class="notification-content">
          <div class="notification-title">
            {{ notification.title }}
            <a-tag v-if="notification.priority === 'high'" color="red" size="small">重要</a-tag>
          </div>
          <div class="notification-message">{{ notification.message }}</div>
          <div class="notification-meta">
            <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
            <a-tag :color="getTypeColor(notification.type)" size="small">
              {{ getTypeLabel(notification.type) }}
            </a-tag>
          </div>
        </div>
        
        <div class="notification-actions">
          <a-dropdown>
            <template #overlay>
              <a-menu @click="(e) => handleActionClick(e, notification)">
                <a-menu-item key="read" v-if="!notification.read">标记已读</a-menu-item>
                <a-menu-item key="unread" v-if="notification.read">标记未读</a-menu-item>
                <a-menu-item key="delete">删除</a-menu-item>
                <a-menu-item key="details" v-if="notification.actionUrl">查看详情</a-menu-item>
              </a-menu>
            </template>
            <a-button type="text" size="small">
              <MoreVertical class="w-4 h-4" />
            </a-button>
          </a-dropdown>
        </div>
      </div>
    </div>

    <!-- 通知详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="通知详情"
      :footer="null"
      width="600px"
    >
      <div v-if="selectedNotification" class="notification-detail">
        <div class="detail-header">
          <div class="detail-icon">
            <component 
              :is="getNotificationIcon(selectedNotification.type)" 
              class="w-8 h-8"
              :class="getIconColor(selectedNotification.type)"
            />
          </div>
          <div class="detail-info">
            <h3>{{ selectedNotification.title }}</h3>
            <div class="detail-meta">
              <a-tag :color="getTypeColor(selectedNotification.type)">
                {{ getTypeLabel(selectedNotification.type) }}
              </a-tag>
              <span class="detail-time">{{ formatTime(selectedNotification.timestamp) }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-content">
          <p>{{ selectedNotification.message }}</p>
          <div v-if="selectedNotification.details" class="detail-extra">
            <h4>详细信息</h4>
            <div v-html="selectedNotification.details"></div>
          </div>
        </div>
        
        <div class="detail-actions">
          <a-space>
            <a-button 
              v-if="selectedNotification.actionUrl" 
              type="primary" 
              @click="handleActionUrl(selectedNotification.actionUrl)"
            >
              {{ selectedNotification.actionText || '查看详情' }}
            </a-button>
            <a-button @click="markAsRead(selectedNotification.id)">
              标记已读
            </a-button>
            <a-button @click="detailModalVisible = false">
              关闭
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>

    <!-- 通知设置模态框 -->
    <a-modal
      v-model:open="settingsModalVisible"
      title="通知设置"
      @ok="saveNotificationSettings"
      width="500px"
    >
      <div class="notification-settings">
        <a-form layout="vertical">
          <a-form-item label="通知类型">
            <a-checkbox-group v-model:value="settings.enabledTypes">
              <a-checkbox value="system">系统通知</a-checkbox>
              <a-checkbox value="learning">学习提醒</a-checkbox>
              <a-checkbox value="achievement">成就通知</a-checkbox>
              <a-checkbox value="social">社交通知</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          
          <a-form-item label="通知方式">
            <a-checkbox-group v-model:value="settings.methods">
              <a-checkbox value="browser">浏览器通知</a-checkbox>
              <a-checkbox value="sound">声音提醒</a-checkbox>
              <a-checkbox value="email">邮件通知</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          
          <a-form-item label="免打扰时间">
            <a-time-range-picker 
              v-model:value="settings.quietHours" 
              format="HH:mm"
              placeholder="['开始时间', '结束时间']"
            />
          </a-form-item>
          
          <a-form-item label="学习提醒频率">
            <a-select v-model:value="settings.learningReminderFrequency" style="width: 100%">
              <a-select-option value="never">从不</a-select-option>
              <a-select-option value="daily">每天</a-select-option>
              <a-select-option value="weekly">每周</a-select-option>
              <a-select-option value="custom">自定义</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  Bell,
  ChevronDown,
  MoreVertical,
  AlertCircle,
  Info,
  CheckCircle,
  Award,
  BookOpen,
  Settings,
  Users,
  Zap
} from 'lucide-vue-next'

interface Notification {
  id: string
  title: string
  message: string
  type: 'system' | 'learning' | 'achievement' | 'social' | 'warning' | 'info'
  priority: 'low' | 'medium' | 'high'
  read: boolean
  timestamp: string
  actionUrl?: string
  actionText?: string
  details?: string
}

interface NotificationSettings {
  enabledTypes: string[]
  methods: string[]
  quietHours: [string, string] | null
  learningReminderFrequency: string
}

// 响应式数据
const router = useRouter()
const currentFilter = ref('all')
const detailModalVisible = ref(false)
const settingsModalVisible = ref(false)
const selectedNotification = ref<Notification | null>(null)

// 通知数据
const notifications = ref<Notification[]>([
  {
    id: '1',
    title: '学习目标达成',
    message: '恭喜你完成了今天的学习目标！继续保持哦～',
    type: 'achievement',
    priority: 'medium',
    read: false,
    timestamp: new Date().toISOString(),
    actionUrl: '/reports',
    actionText: '查看报告',
    details: '今天你完成了3个单词学习任务，掌握了15个新单词，学习时长达到30分钟。'
  },
  {
    id: '2',
    title: '系统维护通知',
    message: '系统将于今晚22:00-23:00进行维护，期间可能无法正常使用',
    type: 'system',
    priority: 'high',
    read: false,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: '维护内容包括：数据库优化、新功能上线、bug修复等。维护期间请保存好学习进度。'
  },
  {
    id: '3',
    title: '学习提醒',
    message: '该学习英语啦！今天还没有开始学习哦',
    type: 'learning',
    priority: 'medium',
    read: true,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    actionUrl: '/games',
    actionText: '开始学习'
  },
  {
    id: '4',
    title: '新徽章获得',
    message: '获得"单词达人"徽章！你已经掌握了100个单词',
    type: 'achievement',
    priority: 'medium',
    read: true,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    actionUrl: '/profile',
    actionText: '查看徽章'
  },
  {
    id: '5',
    title: '好友邀请',
    message: '小明邀请你一起学习英语，快来接受挑战吧！',
    type: 'social',
    priority: 'low',
    read: false,
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    actionUrl: '/social',
    actionText: '查看邀请'
  }
])

// 通知设置
const settings = ref<NotificationSettings>({
  enabledTypes: ['system', 'learning', 'achievement'],
  methods: ['browser', 'sound'],
  quietHours: null,
  learningReminderFrequency: 'daily'
})

// 计算属性
const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)

const filteredNotifications = computed(() => {
  let filtered = notifications.value

  switch (currentFilter.value) {
    case 'unread':
      filtered = filtered.filter(n => !n.read)
      break
    case 'system':
    case 'learning':
    case 'achievement':
      filtered = filtered.filter(n => n.type === currentFilter.value)
      break
  }

  return filtered.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
})

// 方法
const handleFilterChange = ({ key }: { key: string }) => {
  currentFilter.value = key
}

const handleNotificationClick = (notification: Notification) => {
  selectedNotification.value = notification
  detailModalVisible.value = true
  
  if (!notification.read) {
    markAsRead(notification.id)
  }
}

const handleActionClick = ({ key }: { key: string }, notification: Notification) => {
  switch (key) {
    case 'read':
      markAsRead(notification.id)
      break
    case 'unread':
      markAsUnread(notification.id)
      break
    case 'delete':
      deleteNotification(notification.id)
      break
    case 'details':
      handleNotificationClick(notification)
      break
  }
}

const markAsRead = (id: string) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
    message.success('已标记为已读')
  }
}

const markAsUnread = (id: string) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = false
    message.success('已标记为未读')
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
  message.success('所有通知已标记为已读')
}

const deleteNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
    message.success('通知已删除')
  }
}

const clearAll = () => {
  notifications.value = []
  message.success('所有通知已清空')
}

const handleActionUrl = (url: string) => {
  router.push(url)
  detailModalVisible.value = false
}

const saveNotificationSettings = () => {
  // 保存通知设置到本地存储
  localStorage.setItem('notificationSettings', JSON.stringify(settings.value))
  message.success('通知设置已保存')
  settingsModalVisible.value = false
}

// 工具函数
const getNotificationIcon = (type: string) => {
  const icons: Record<string, any> = {
    system: Settings,
    learning: BookOpen,
    achievement: Award,
    social: Users,
    warning: AlertCircle,
    info: Info
  }
  return icons[type] || Info
}

const getIconColor = (type: string): string => {
  const colors: Record<string, string> = {
    system: 'text-blue-500',
    learning: 'text-green-500',
    achievement: 'text-yellow-500',
    social: 'text-purple-500',
    warning: 'text-red-500',
    info: 'text-gray-500'
  }
  return colors[type] || 'text-gray-500'
}

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    system: 'blue',
    learning: 'green',
    achievement: 'gold',
    social: 'purple',
    warning: 'red',
    info: 'default'
  }
  return colors[type] || 'default'
}

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    system: '系统',
    learning: '学习',
    achievement: '成就',
    social: '社交',
    warning: '警告',
    info: '信息'
  }
  return labels[type] || '未知'
}

const formatTime = (timestamp: string): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now.getTime() - time.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return time.toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  // 从本地存储加载通知设置
  const savedSettings = localStorage.getItem('notificationSettings')
  if (savedSettings) {
    settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
  }
  
  // 请求浏览器通知权限
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
})

// 暴露给父组件的方法
defineExpose({
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    notifications.value.unshift(newNotification)
    
    // 显示浏览器通知
    if (settings.value.methods.includes('browser') && 
        'Notification' in window && 
        Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      })
    }
  }
})
</script>

<style scoped lang="less">
.notification-center {
  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e8e8e8;
    background: #fafafa;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }

  .notification-list {
    max-height: 600px;
    overflow-y: auto;

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: #f8f9fa;
      }

      &.unread {
        background-color: #f6ffed;
        border-left: 3px solid #52c41a;

        .notification-title {
          font-weight: 600;
        }
      }

      &.priority-high {
        border-left: 3px solid #ff4d4f;
      }

      .notification-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #f5f5f5;
      }

      .notification-content {
        flex: 1;
        min-width: 0;

        .notification-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          font-size: 14px;
          line-height: 1.4;
        }

        .notification-message {
          margin-bottom: 8px;
          font-size: 13px;
          color: #666;
          line-height: 1.4;
        }

        .notification-meta {
          display: flex;
          align-items: center;
          gap: 8px;

          .notification-time {
            font-size: 12px;
            color: #999;
          }
        }
      }

      .notification-actions {
        flex-shrink: 0;
      }
    }
  }

  .notification-detail {
    .detail-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;

      .detail-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background-color: #f5f5f5;
      }

      .detail-info {
        flex: 1;

        h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .detail-meta {
          display: flex;
          align-items: center;
          gap: 12px;

          .detail-time {
            font-size: 13px;
            color: #666;
          }
        }
      }
    }

    .detail-content {
      margin-bottom: 24px;

      p {
        margin-bottom: 16px;
        line-height: 1.6;
        color: #333;
      }

      .detail-extra {
        h4 {
          margin: 16px 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        :deep(div) {
          font-size: 13px;
          line-height: 1.6;
          color: #666;
        }
      }
    }

    .detail-actions {
      text-align: right;
    }
  }

  .notification-settings {
    :deep(.ant-form-item) {
      margin-bottom: 20px;
    }

    :deep(.ant-checkbox-group) {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .notification-center {
    .notification-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .header-right {
        :deep(.ant-space) {
          justify-content: center;
        }
      }
    }

    .notification-item {
      .notification-content {
        .notification-meta {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
      }
    }

    .detail-header {
      flex-direction: column;
      text-align: center;

      .detail-info {
        text-align: center;

        .detail-meta {
          justify-content: center;
        }
      }
    }
  }
}
</style>