<template>
  <div class="notification-center">
    <!-- 通知铃铛图标 -->
    <a-badge :count="unreadCount" :offset="[-2, 2]">
      <a-button 
        type="text" 
        shape="circle" 
        size="large"
        @click="toggleNotifications"
        :class="{ 'notification-active': showNotifications }"
      >
        <Bell class="w-5 h-5" />
      </a-button>
    </a-badge>

    <!-- 通知面板 -->
    <div 
      v-if="showNotifications" 
      class="notification-panel"
      v-click-outside="closeNotifications"
    >
      <div class="panel-header">
        <h3 class="panel-title">通知中心</h3>
        <div class="header-actions">
          <a-button 
            type="text" 
            size="small" 
            @click="markAllAsRead"
            :disabled="unreadCount === 0"
          >
            全部已读
          </a-button>
          <a-button type="text" size="small" @click="showSettings = true">
            <Settings class="w-4 h-4" />
          </a-button>
        </div>
      </div>

      <!-- 通知筛选 -->
      <div class="notification-filters">
        <a-radio-group 
          v-model:value="activeFilter" 
          button-style="solid" 
          size="small"
          @change="filterNotifications"
        >
          <a-radio-button value="all">全部</a-radio-button>
          <a-radio-button value="unread">未读</a-radio-button>
          <a-radio-button value="achievement">成就</a-radio-button>
          <a-radio-button value="reminder">提醒</a-radio-button>
        </a-radio-group>
      </div>

      <!-- 通知列表 -->
      <div class="notification-list">
        <div 
          v-for="notification in filteredNotifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ 
            'unread': !notification.read,
            [`type-${notification.type}`]: true 
          }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon" :style="getNotificationIconStyle(notification.type)">
            <component :is="getNotificationIcon(notification.type)" class="w-4 h-4" />
          </div>
          
          <div class="notification-content">
            <div class="notification-header">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            
            <!-- 成就通知特殊显示 -->
            <div v-if="notification.type === 'achievement'" class="achievement-info">
              <div class="achievement-badge">
                <Trophy class="w-3 h-3 mr-1" />
                {{ notification.achievementName }}
              </div>
              <div class="achievement-points">+{{ notification.points }} 积分</div>
            </div>
            
            <!-- 学习提醒特殊显示 -->
            <div v-if="notification.type === 'reminder'" class="reminder-actions">
              <a-button size="small" type="primary" @click.stop="startLearning(notification)">
                开始学习
              </a-button>
              <a-button size="small" @click.stop="snoozeReminder(notification)">
                稍后提醒
              </a-button>
            </div>
          </div>
          
          <div class="notification-actions">
            <a-button 
              type="text" 
              size="small" 
              @click.stop="toggleRead(notification)"
              :title="notification.read ? '标记为未读' : '标记为已读'"
            >
              <component :is="notification.read ? 'Mail' : 'MailOpen'" class="w-3 h-3" />
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              @click.stop="deleteNotification(notification.id)"
              title="删除通知"
            >
              <X class="w-3 h-3" />
            </a-button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="filteredNotifications.length === 0" class="empty-notifications">
          <div class="empty-icon">
            <Bell class="w-12 h-12" />
          </div>
          <p class="empty-text">
            {{ activeFilter === 'unread' ? '没有未读通知' : '暂无通知' }}
          </p>
        </div>
      </div>

      <!-- 查看更多 -->
      <div class="panel-footer" v-if="notifications.length > 5">
        <a-button type="link" @click="showAllNotifications">
          查看全部通知
        </a-button>
      </div>
    </div>

    <!-- 通知设置弹窗 -->
    <a-modal 
      v-model:open="showSettings" 
      title="通知设置" 
      @ok="saveNotificationSettings"
      width="500px"
    >
      <div class="notification-settings">
        <div class="setting-group">
          <h4 class="group-title">通知类型</h4>
          <div class="setting-item" v-for="type in notificationTypes" :key="type.key">
            <div class="setting-info">
              <span class="setting-name">{{ type.name }}</span>
              <span class="setting-description">{{ type.description }}</span>
            </div>
            <a-switch v-model:checked="notificationSettings[type.key]" />
          </div>
        </div>

        <div class="setting-group">
          <h4 class="group-title">提醒时间</h4>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-name">学习提醒时间</span>
              <span class="setting-description">每日学习提醒的时间</span>
            </div>
            <a-time-picker 
              v-model:value="notificationSettings.reminderTime" 
              format="HH:mm"
              placeholder="选择时间"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-name">提前提醒</span>
              <span class="setting-description">在目标截止前提醒</span>
            </div>
            <a-select 
              v-model:value="notificationSettings.advanceReminder" 
              style="width: 120px"
            >
              <a-select-option value="1">1天前</a-select-option>
              <a-select-option value="3">3天前</a-select-option>
              <a-select-option value="7">7天前</a-select-option>
            </a-select>
          </div>
        </div>

        <div class="setting-group">
          <h4 class="group-title">声音设置</h4>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-name">通知声音</span>
              <span class="setting-description">接收通知时播放声音</span>
            </div>
            <a-switch v-model:checked="notificationSettings.soundEnabled" />
          </div>
          
          <div class="setting-item" v-if="notificationSettings.soundEnabled">
            <div class="setting-info">
              <span class="setting-name">声音类型</span>
            </div>
            <a-select v-model:value="notificationSettings.soundType" style="width: 120px">
              <a-select-option value="default">默认</a-select-option>
              <a-select-option value="chime">铃声</a-select-option>
              <a-select-option value="ding">叮咚</a-select-option>
            </a-select>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 浮动通知 -->
    <transition-group name="toast" tag="div" class="toast-container">
      <div 
        v-for="toast in toastNotifications" 
        :key="toast.id"
        class="toast-notification"
        :class="`toast-${toast.type}`"
      >
        <div class="toast-icon">
          <component :is="getNotificationIcon(toast.type)" class="w-5 h-5" />
        </div>
        <div class="toast-content">
          <h4 class="toast-title">{{ toast.title }}</h4>
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        <a-button 
          type="text" 
          size="small" 
          @click="dismissToast(toast.id)"
          class="toast-close"
        >
          <X class="w-4 h-4" />
        </a-button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import dayjs, { Dayjs } from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  Bell,
  Settings,
  Trophy,
  Clock,
  Target,
  BookOpen,
  Mail,
  MailOpen,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  Gift
} from 'lucide-vue-next'

dayjs.extend(relativeTime)

const router = useRouter()

// 响应式数据
const showNotifications = ref(false)
const showSettings = ref(false)
const activeFilter = ref('all')
const toastNotifications = ref<any[]>([])

// 通知设置
const notificationSettings = reactive({
  achievement: true,
  reminder: true,
  progress: true,
  system: true,
  reminderTime: dayjs('18:00', 'HH:mm'),
  advanceReminder: '3',
  soundEnabled: true,
  soundType: 'default'
})

// 通知类型配置
const notificationTypes = [
  {
    key: 'achievement',
    name: '成就通知',
    description: '获得新成就时通知'
  },
  {
    key: 'reminder',
    name: '学习提醒',
    description: '定时学习提醒'
  },
  {
    key: 'progress',
    name: '进度通知',
    description: '学习进度更新通知'
  },
  {
    key: 'system',
    name: '系统通知',
    description: '系统更新和重要消息'
  }
]

// 通知数据
const notifications = ref([
  {
    id: 1,
    type: 'achievement',
    title: '🎉 新成就解锁！',
    message: '恭喜您获得"连续学习7天"成就！',
    achievementName: '坚持不懈',
    points: 100,
    read: false,
    createdAt: '2024-01-26T10:30:00Z',
    actionUrl: '/achievements'
  },
  {
    id: 2,
    type: 'reminder',
    title: '⏰ 学习时间到了',
    message: '该开始今天的英语学习了，坚持就是胜利！',
    read: false,
    createdAt: '2024-01-26T09:00:00Z',
    actionUrl: '/games'
  },
  {
    id: 3,
    type: 'progress',
    title: '📈 学习进度更新',
    message: '您的词汇掌握度已达到85%，继续加油！',
    read: true,
    createdAt: '2024-01-25T16:45:00Z',
    actionUrl: '/reports'
  },
  {
    id: 4,
    type: 'system',
    title: '🆕 新功能上线',
    message: '口语练习功能已上线，快来体验吧！',
    read: true,
    createdAt: '2024-01-25T14:20:00Z',
    actionUrl: '/games'
  },
  {
    id: 5,
    type: 'achievement',
    title: '🏆 目标达成',
    message: '本月单词学习目标已完成！',
    achievementName: '词汇大师',
    points: 200,
    read: false,
    createdAt: '2024-01-24T20:15:00Z',
    actionUrl: '/goals'
  },
  {
    id: 6,
    type: 'reminder',
    title: '📅 目标即将到期',
    message: '您的"每周练习口语5次"目标将在2天后到期',
    read: true,
    createdAt: '2024-01-24T12:00:00Z',
    actionUrl: '/goals'
  }
])

// 计算属性
const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)

const filteredNotifications = computed(() => {
  let filtered = notifications.value

  switch (activeFilter.value) {
    case 'unread':
      filtered = filtered.filter(n => !n.read)
      break
    case 'achievement':
      filtered = filtered.filter(n => n.type === 'achievement')
      break
    case 'reminder':
      filtered = filtered.filter(n => n.type === 'reminder')
      break
  }

  return filtered.slice(0, 10) // 限制显示数量
})

// 方法
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const closeNotifications = () => {
  showNotifications.value = false
}

const filterNotifications = () => {
  // 筛选逻辑已在计算属性中实现
}

const getNotificationIcon = (type: string) => {
  const icons = {
    achievement: Trophy,
    reminder: Clock,
    progress: Target,
    system: Info,
    goal: Target,
    learning: BookOpen
  }
  return icons[type as keyof typeof icons] || Bell
}

const getNotificationIconStyle = (type: string) => {
  const styles = {
    achievement: { background: '#fff7e6', color: '#fa8c16' },
    reminder: { background: '#e6f7ff', color: '#1890ff' },
    progress: { background: '#f6ffed', color: '#52c41a' },
    system: { background: '#f0f0f0', color: '#595959' }
  }
  return styles[type as keyof typeof styles] || styles.system
}

const formatTime = (time: string) => {
  return dayjs(time).fromNow()
}

const handleNotificationClick = (notification: any) => {
  if (!notification.read) {
    toggleRead(notification)
  }
  
  if (notification.actionUrl) {
    router.push(notification.actionUrl)
    closeNotifications()
  }
}

const toggleRead = (notification: any) => {
  notification.read = !notification.read
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
  message.success('所有通知已标记为已读')
}

const deleteNotification = (id: number) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
    message.success('通知已删除')
  }
}

const startLearning = (notification: any) => {
  router.push('/games')
  closeNotifications()
  message.success('开始学习！')
}

const snoozeReminder = (notification: any) => {
  // 延迟提醒逻辑
  message.info('将在30分钟后再次提醒')
  deleteNotification(notification.id)
}

const showAllNotifications = () => {
  // 跳转到完整的通知页面
  router.push('/notifications')
  closeNotifications()
}

const saveNotificationSettings = () => {
  // 保存通知设置
  message.success('通知设置已保存')
  showSettings.value = false
}

// 添加新通知
const addNotification = (notification: any) => {
  const newNotification = {
    id: Date.now(),
    read: false,
    createdAt: new Date().toISOString(),
    ...notification
  }
  
  notifications.value.unshift(newNotification)
  
  // 显示浮动通知
  if (notificationSettings[notification.type as keyof typeof notificationSettings]) {
    showToast(newNotification)
  }
  
  // 播放通知声音
  if (notificationSettings.soundEnabled) {
    playNotificationSound()
  }
}

// 显示浮动通知
const showToast = (notification: any) => {
  const toast = {
    id: Date.now(),
    type: notification.type,
    title: notification.title,
    message: notification.message
  }
  
  toastNotifications.value.push(toast)
  
  // 3秒后自动消失
  setTimeout(() => {
    dismissToast(toast.id)
  }, 3000)
}

const dismissToast = (id: number) => {
  const index = toastNotifications.value.findIndex(t => t.id === id)
  if (index > -1) {
    toastNotifications.value.splice(index, 1)
  }
}

// 播放通知声音
const playNotificationSound = () => {
  if ('Audio' in window) {
    const audio = new Audio('/sounds/notification.mp3')
    audio.volume = 0.5
    audio.play().catch(() => {
      // 忽略播放失败的错误
    })
  }
}

// 模拟定时通知
const setupNotificationTimer = () => {
  // 每分钟检查一次是否需要发送提醒
  const timer = setInterval(() => {
    const now = dayjs()
    const reminderTime = notificationSettings.reminderTime
    
    if (
      now.hour() === reminderTime.hour() && 
      now.minute() === reminderTime.minute() &&
      notificationSettings.reminder
    ) {
      addNotification({
        type: 'reminder',
        title: '⏰ 学习时间到了',
        message: '该开始今天的英语学习了，坚持就是胜利！',
        actionUrl: '/games'
      })
    }
  }, 60000) // 每分钟检查一次
  
  return timer
}

// 暴露方法给父组件使用
defineExpose({
  addNotification,
  showToast
})

// 生命周期
let notificationTimer: NodeJS.Timeout | null = null

onMounted(() => {
  notificationTimer = setupNotificationTimer()
  
  // 模拟一些通知
  setTimeout(() => {
    addNotification({
      type: 'achievement',
      title: '🎉 欢迎回来！',
      message: '继续您的英语学习之旅吧！',
      achievementName: '回归学习',
      points: 50,
      actionUrl: '/games'
    })
  }, 2000)
})

onUnmounted(() => {
  if (notificationTimer) {
    clearInterval(notificationTimer)
  }
})

// 点击外部关闭指令
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<style lang="less" scoped>
.notification-center {
  position: relative;

  .notification-active {
    background: #e6f7ff !important;
    color: #1890ff !important;
  }

  .notification-panel {
    position: absolute;
    top: 100%;
    right: 0;
    width: 400px;
    max-height: 600px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
    border: 1px solid #f0f0f0;
    z-index: 1000;
    overflow: hidden;

    .panel-header {
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .panel-title {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    .notification-filters {
      padding: 12px 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;

      .notification-item {
        display: flex;
        align-items: flex-start;
        padding: 16px 20px;
        border-bottom: 1px solid #f5f5f5;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: #fafafa;
        }

        &.unread {
          background: #f6ffed;
          border-left: 3px solid #52c41a;
        }

        .notification-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;

          .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 4px;

            .notification-title {
              font-size: 14px;
              font-weight: 500;
              color: #262626;
              margin: 0;
              line-height: 1.4;
            }

            .notification-time {
              font-size: 12px;
              color: #8c8c8c;
              flex-shrink: 0;
              margin-left: 8px;
            }
          }

          .notification-message {
            font-size: 13px;
            color: #595959;
            line-height: 1.4;
            margin: 0 0 8px 0;
          }

          .achievement-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 8px;

            .achievement-badge {
              display: flex;
              align-items: center;
              background: #fff7e6;
              color: #fa8c16;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
            }

            .achievement-points {
              font-size: 12px;
              font-weight: 600;
              color: #52c41a;
            }
          }

          .reminder-actions {
            display: flex;
            gap: 8px;
            margin-top: 8px;
          }
        }

        .notification-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-left: 8px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        &:hover .notification-actions {
          opacity: 1;
        }
      }

      .empty-notifications {
        padding: 40px 20px;
        text-align: center;

        .empty-icon {
          color: #d9d9d9;
          margin-bottom: 12px;
        }

        .empty-text {
          font-size: 14px;
          color: #8c8c8c;
          margin: 0;
        }
      }
    }

    .panel-footer {
      padding: 12px 20px;
      border-top: 1px solid #f0f0f0;
      text-align: center;
    }
  }

  .notification-settings {
    .setting-group {
      margin-bottom: 24px;

      .group-title {
        font-size: 14px;
        font-weight: 500;
        color: #262626;
        margin-bottom: 12px;
      }

      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f5f5f5;

        &:last-child {
          border-bottom: none;
        }

        .setting-info {
          flex: 1;

          .setting-name {
            display: block;
            font-size: 14px;
            color: #262626;
            margin-bottom: 2px;
          }

          .setting-description {
            font-size: 12px;
            color: #8c8c8c;
          }
        }
      }
    }
  }

  .toast-container {
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 2000;
    pointer-events: none;

    .toast-notification {
      display: flex;
      align-items: flex-start;
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      border-left: 4px solid #1890ff;
      max-width: 350px;
      pointer-events: auto;

      &.toast-achievement {
        border-left-color: #fa8c16;
      }

      &.toast-reminder {
        border-left-color: #1890ff;
      }

      &.toast-progress {
        border-left-color: #52c41a;
      }

      &.toast-system {
        border-left-color: #595959;
      }

      .toast-icon {
        margin-right: 12px;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .toast-content {
        flex: 1;
        min-width: 0;

        .toast-title {
          font-size: 14px;
          font-weight: 500;
          color: #262626;
          margin: 0 0 4px 0;
        }

        .toast-message {
          font-size: 13px;
          color: #595959;
          line-height: 1.4;
          margin: 0;
        }
      }

      .toast-close {
        margin-left: 8px;
        flex-shrink: 0;
      }
    }
  }
}

// 动画效果
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .notification-center {
    .notification-panel {
      width: 320px;
      right: -20px;
    }

    .toast-container {
      right: 10px;
      left: 10px;

      .toast-notification {
        max-width: none;
      }
    }
  }
}
</style>