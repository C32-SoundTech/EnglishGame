<template>
  <div class="reminder-system">
    <!-- 提醒设置卡片 -->
    <a-card title="学习提醒设置" class="reminder-card">
      <template #extra>
        <a-switch 
          v-model:checked="reminderEnabled" 
          @change="toggleReminder"
          checked-children="开启"
          un-checked-children="关闭"
        />
      </template>

      <div class="reminder-content" :class="{ disabled: !reminderEnabled }">
        <!-- 每日提醒 -->
        <div class="reminder-section">
          <div class="section-header">
            <Clock class="w-5 h-5 text-blue-500" />
            <h3 class="section-title">每日学习提醒</h3>
          </div>
          
          <div class="reminder-options">
            <div class="option-item">
              <span class="option-label">提醒时间</span>
              <a-time-picker 
                v-model:value="dailyReminderTime"
                format="HH:mm"
                placeholder="选择时间"
                :disabled="!reminderEnabled"
                @change="updateDailyReminder"
              />
            </div>
            
            <div class="option-item">
              <span class="option-label">重复周期</span>
              <a-checkbox-group 
                v-model:value="reminderDays" 
                :disabled="!reminderEnabled"
                @change="updateReminderDays"
              >
                <a-checkbox 
                  v-for="day in weekDays" 
                  :key="day.value" 
                  :value="day.value"
                  class="day-checkbox"
                >
                  {{ day.label }}
                </a-checkbox>
              </a-checkbox-group>
            </div>
            
            <div class="option-item">
              <span class="option-label">提醒内容</span>
              <a-select 
                v-model:value="reminderMessage" 
                style="width: 100%"
                :disabled="!reminderEnabled"
                @change="updateReminderMessage"
              >
                <a-select-option 
                  v-for="msg in reminderMessages" 
                  :key="msg.value" 
                  :value="msg.value"
                >
                  {{ msg.label }}
                </a-select-option>
              </a-select>
            </div>
          </div>
        </div>

        <!-- 目标提醒 -->
        <div class="reminder-section">
          <div class="section-header">
            <Target class="w-5 h-5 text-green-500" />
            <h3 class="section-title">目标提醒</h3>
          </div>
          
          <div class="reminder-options">
            <div class="option-item">
              <div class="option-info">
                <span class="option-label">目标截止提醒</span>
                <span class="option-description">在目标截止前提醒</span>
              </div>
              <a-switch 
                v-model:checked="goalReminderEnabled" 
                :disabled="!reminderEnabled"
                @change="updateGoalReminder"
              />
            </div>
            
            <div class="option-item" v-if="goalReminderEnabled">
              <span class="option-label">提前时间</span>
              <a-select 
                v-model:value="goalReminderAdvance" 
                style="width: 120px"
                :disabled="!reminderEnabled"
              >
                <a-select-option value="1">1天前</a-select-option>
                <a-select-option value="3">3天前</a-select-option>
                <a-select-option value="7">7天前</a-select-option>
              </a-select>
            </div>
            
            <div class="option-item">
              <div class="option-info">
                <span class="option-label">进度提醒</span>
                <span class="option-description">学习进度更新时提醒</span>
              </div>
              <a-switch 
                v-model:checked="progressReminderEnabled" 
                :disabled="!reminderEnabled"
                @change="updateProgressReminder"
              />
            </div>
          </div>
        </div>

        <!-- 成就提醒 -->
        <div class="reminder-section">
          <div class="section-header">
            <Trophy class="w-5 h-5 text-yellow-500" />
            <h3 class="section-title">成就提醒</h3>
          </div>
          
          <div class="reminder-options">
            <div class="option-item">
              <div class="option-info">
                <span class="option-label">新成就通知</span>
                <span class="option-description">获得新成就时立即通知</span>
              </div>
              <a-switch 
                v-model:checked="achievementReminderEnabled" 
                :disabled="!reminderEnabled"
                @change="updateAchievementReminder"
              />
            </div>
            
            <div class="option-item">
              <div class="option-info">
                <span class="option-label">连续学习提醒</span>
                <span class="option-description">连续学习天数里程碑提醒</span>
              </div>
              <a-switch 
                v-model:checked="streakReminderEnabled" 
                :disabled="!reminderEnabled"
                @change="updateStreakReminder"
              />
            </div>
          </div>
        </div>

        <!-- 智能提醒 -->
        <div class="reminder-section">
          <div class="section-header">
            <Brain class="w-5 h-5 text-purple-500" />
            <h3 class="section-title">智能提醒</h3>
          </div>
          
          <div class="reminder-options">
            <div class="option-item">
              <div class="option-info">
                <span class="option-label">复习提醒</span>
                <span class="option-description">根据遗忘曲线智能提醒复习</span>
              </div>
              <a-switch 
                v-model:checked="reviewReminderEnabled" 
                :disabled="!reminderEnabled"
                @change="updateReviewReminder"
              />
            </div>
            
            <div class="option-item">
              <div class="option-info">
                <span class="option-label">薄弱环节提醒</span>
                <span class="option-description">针对薄弱知识点的练习提醒</span>
              </div>
              <a-switch 
                v-model:checked="weaknessReminderEnabled" 
                :disabled="!reminderEnabled"
                @change="updateWeaknessReminder"
              />
            </div>
            
            <div class="option-item">
              <div class="option-info">
                <span class="option-label">最佳学习时间</span>
                <span class="option-description">根据学习效果推荐最佳时间</span>
              </div>
              <a-switch 
                v-model:checked="optimalTimeReminderEnabled" 
                :disabled="!reminderEnabled"
                @change="updateOptimalTimeReminder"
              />
            </div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 即将到来的提醒 -->
    <a-card title="即将到来的提醒" class="upcoming-reminders-card">
      <template #extra>
        <a-button type="link" @click="refreshUpcomingReminders">
          <RotateCcw class="w-4 h-4 mr-1" />
          刷新
        </a-button>
      </template>

      <div class="upcoming-reminders">
        <div 
          v-for="reminder in upcomingReminders" 
          :key="reminder.id"
          class="reminder-item"
          :class="`reminder-${reminder.type}`"
        >
          <div class="reminder-icon">
            <component :is="getReminderIcon(reminder.type)" class="w-4 h-4" />
          </div>
          
          <div class="reminder-info">
            <h4 class="reminder-title">{{ reminder.title }}</h4>
            <p class="reminder-description">{{ reminder.description }}</p>
            <div class="reminder-time">
              <Clock class="w-3 h-3 mr-1" />
              {{ formatReminderTime(reminder.scheduledTime) }}
            </div>
          </div>
          
          <div class="reminder-actions">
            <a-button 
              size="small" 
              @click="snoozeReminder(reminder.id)"
              title="延迟提醒"
            >
              <Clock class="w-3 h-3" />
            </a-button>
            <a-button 
              size="small" 
              @click="cancelReminder(reminder.id)"
              title="取消提醒"
            >
              <X class="w-3 h-3" />
            </a-button>
          </div>
        </div>
        
        <div v-if="upcomingReminders.length === 0" class="no-reminders">
          <div class="no-reminders-icon">
            <Bell class="w-12 h-12" />
          </div>
          <p class="no-reminders-text">暂无即将到来的提醒</p>
        </div>
      </div>
    </a-card>

    <!-- 提醒历史 -->
    <a-card title="提醒历史" class="reminder-history-card">
      <template #extra>
        <a-button type="link" @click="clearReminderHistory">
          清空历史
        </a-button>
      </template>

      <div class="reminder-history">
        <a-timeline>
          <a-timeline-item 
            v-for="history in reminderHistory" 
            :key="history.id"
            :color="getHistoryColor(history.status)"
          >
            <template #dot>
              <component :is="getHistoryIcon(history.status)" class="w-4 h-4" />
            </template>
            
            <div class="history-content">
              <div class="history-header">
                <span class="history-title">{{ history.title }}</span>
                <span class="history-time">{{ formatHistoryTime(history.time) }}</span>
              </div>
              <p class="history-description">{{ history.description }}</p>
              <div class="history-status" :class="`status-${history.status}`">
                {{ getStatusText(history.status) }}
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>
        
        <div v-if="reminderHistory.length === 0" class="no-history">
          <p class="no-history-text">暂无提醒历史</p>
        </div>
      </div>
    </a-card>

    <!-- 测试提醒按钮 -->
    <div class="test-reminder" v-if="reminderEnabled">
      <a-button type="dashed" @click="testReminder" :loading="testingReminder">
        <Bell class="w-4 h-4 mr-2" />
        测试提醒
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import {
  Clock,
  Target,
  Trophy,
  Brain,
  Bell,
  RotateCcw,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  BookOpen,
  Calendar
} from 'lucide-vue-next'

// Props
interface Props {
  notificationCenter?: any
}

const props = withDefaults(defineProps<Props>(), {})

// 响应式数据
const reminderEnabled = ref(true)
const testingReminder = ref(false)

// 每日提醒设置
const dailyReminderTime = ref(dayjs('18:00', 'HH:mm'))
const reminderDays = ref(['1', '2', '3', '4', '5', '6', '0']) // 周一到周日
const reminderMessage = ref('default')

// 各类提醒开关
const goalReminderEnabled = ref(true)
const goalReminderAdvance = ref('3')
const progressReminderEnabled = ref(true)
const achievementReminderEnabled = ref(true)
const streakReminderEnabled = ref(true)
const reviewReminderEnabled = ref(true)
const weaknessReminderEnabled = ref(true)
const optimalTimeReminderEnabled = ref(false)

// 周几选项
const weekDays = [
  { label: '周一', value: '1' },
  { label: '周二', value: '2' },
  { label: '周三', value: '3' },
  { label: '周四', value: '4' },
  { label: '周五', value: '5' },
  { label: '周六', value: '6' },
  { label: '周日', value: '0' }
]

// 提醒消息选项
const reminderMessages = [
  { label: '该开始今天的英语学习了！', value: 'default' },
  { label: '坚持学习，成就更好的自己！', value: 'motivational' },
  { label: '每天进步一点点，英语水平大提升！', value: 'progress' },
  { label: '学习时间到了，一起来挑战新知识吧！', value: 'challenge' },
  { label: '温馨提醒：该复习今天的学习内容了！', value: 'review' }
]

// 即将到来的提醒
const upcomingReminders = ref([
  {
    id: 1,
    type: 'daily',
    title: '每日学习提醒',
    description: '该开始今天的英语学习了！',
    scheduledTime: dayjs().add(2, 'hour').toISOString()
  },
  {
    id: 2,
    type: 'goal',
    title: '目标截止提醒',
    description: '您的"每周练习口语5次"目标将在2天后到期',
    scheduledTime: dayjs().add(2, 'day').toISOString()
  },
  {
    id: 3,
    type: 'review',
    title: '复习提醒',
    description: '该复习昨天学习的20个单词了',
    scheduledTime: dayjs().add(30, 'minute').toISOString()
  },
  {
    id: 4,
    type: 'weakness',
    title: '薄弱环节练习',
    description: '建议加强语法练习，提升准确率',
    scheduledTime: dayjs().add(1, 'day').toISOString()
  }
])

// 提醒历史
const reminderHistory = ref([
  {
    id: 1,
    title: '每日学习提醒',
    description: '该开始今天的英语学习了！',
    time: dayjs().subtract(1, 'hour').toISOString(),
    status: 'completed'
  },
  {
    id: 2,
    title: '成就通知',
    description: '恭喜获得"连续学习7天"成就！',
    time: dayjs().subtract(2, 'hour').toISOString(),
    status: 'completed'
  },
  {
    id: 3,
    title: '复习提醒',
    description: '该复习昨天学习的单词了',
    time: dayjs().subtract(1, 'day').toISOString(),
    status: 'snoozed'
  },
  {
    id: 4,
    title: '目标提醒',
    description: '本周学习目标即将到期',
    time: dayjs().subtract(2, 'day').toISOString(),
    status: 'cancelled'
  }
])

// 方法
const toggleReminder = (enabled: boolean) => {
  if (enabled) {
    message.success('学习提醒已开启')
    setupReminders()
  } else {
    message.info('学习提醒已关闭')
    clearAllReminders()
  }
}

const updateDailyReminder = () => {
  if (reminderEnabled.value) {
    setupDailyReminder()
    message.success('每日提醒时间已更新')
  }
}

const updateReminderDays = () => {
  if (reminderEnabled.value) {
    setupDailyReminder()
    message.success('提醒周期已更新')
  }
}

const updateReminderMessage = () => {
  message.success('提醒内容已更新')
}

const updateGoalReminder = () => {
  message.success('目标提醒设置已更新')
}

const updateProgressReminder = () => {
  message.success('进度提醒设置已更新')
}

const updateAchievementReminder = () => {
  message.success('成就提醒设置已更新')
}

const updateStreakReminder = () => {
  message.success('连续学习提醒设置已更新')
}

const updateReviewReminder = () => {
  message.success('复习提醒设置已更新')
}

const updateWeaknessReminder = () => {
  message.success('薄弱环节提醒设置已更新')
}

const updateOptimalTimeReminder = () => {
  message.success('最佳学习时间提醒设置已更新')
}

const getReminderIcon = (type: string) => {
  const icons = {
    daily: Clock,
    goal: Target,
    achievement: Trophy,
    review: BookOpen,
    weakness: Brain,
    optimal: Calendar
  }
  return icons[type as keyof typeof icons] || Bell
}

const formatReminderTime = (time: string) => {
  const reminderTime = dayjs(time)
  const now = dayjs()
  
  if (reminderTime.isSame(now, 'day')) {
    return `今天 ${reminderTime.format('HH:mm')}`
  } else if (reminderTime.isSame(now.add(1, 'day'), 'day')) {
    return `明天 ${reminderTime.format('HH:mm')}`
  } else {
    return reminderTime.format('MM-DD HH:mm')
  }
}

const snoozeReminder = (id: number) => {
  const reminder = upcomingReminders.value.find(r => r.id === id)
  if (reminder) {
    // 延迟30分钟
    reminder.scheduledTime = dayjs(reminder.scheduledTime).add(30, 'minute').toISOString()
    message.info('提醒已延迟30分钟')
  }
}

const cancelReminder = (id: number) => {
  const index = upcomingReminders.value.findIndex(r => r.id === id)
  if (index > -1) {
    upcomingReminders.value.splice(index, 1)
    message.success('提醒已取消')
  }
}

const refreshUpcomingReminders = () => {
  // 刷新即将到来的提醒
  message.success('提醒列表已刷新')
}

const getHistoryColor = (status: string) => {
  const colors = {
    completed: 'green',
    snoozed: 'orange',
    cancelled: 'red'
  }
  return colors[status as keyof typeof colors] || 'blue'
}

const getHistoryIcon = (status: string) => {
  const icons = {
    completed: CheckCircle,
    snoozed: AlertCircle,
    cancelled: XCircle
  }
  return icons[status as keyof typeof icons] || Bell
}

const formatHistoryTime = (time: string) => {
  return dayjs(time).format('MM-DD HH:mm')
}

const getStatusText = (status: string) => {
  const texts = {
    completed: '已完成',
    snoozed: '已延迟',
    cancelled: '已取消'
  }
  return texts[status as keyof typeof texts] || '未知'
}

const clearReminderHistory = () => {
  reminderHistory.value = []
  message.success('提醒历史已清空')
}

const testReminder = async () => {
  testingReminder.value = true
  
  try {
    // 模拟发送测试提醒
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 如果有通知中心组件，发送测试通知
    if (props.notificationCenter) {
      props.notificationCenter.addNotification({
        type: 'reminder',
        title: '🔔 测试提醒',
        message: '这是一条测试提醒消息，提醒功能正常工作！',
        actionUrl: '/games'
      })
    }
    
    message.success('测试提醒已发送')
  } catch (error) {
    message.error('测试提醒发送失败')
  } finally {
    testingReminder.value = false
  }
}

// 设置提醒
const setupReminders = () => {
  setupDailyReminder()
  setupGoalReminders()
  setupReviewReminders()
}

const setupDailyReminder = () => {
  // 设置每日提醒逻辑
  console.log('设置每日提醒:', {
    time: dailyReminderTime.value.format('HH:mm'),
    days: reminderDays.value,
    message: reminderMessage.value
  })
}

const setupGoalReminders = () => {
  // 设置目标提醒逻辑
  if (goalReminderEnabled.value) {
    console.log('设置目标提醒:', {
      advance: goalReminderAdvance.value,
      progress: progressReminderEnabled.value
    })
  }
}

const setupReviewReminders = () => {
  // 设置复习提醒逻辑
  if (reviewReminderEnabled.value) {
    console.log('设置复习提醒')
  }
}

const clearAllReminders = () => {
  // 清除所有提醒
  console.log('清除所有提醒')
}

// 模拟智能提醒
const simulateSmartReminders = () => {
  // 根据学习数据生成智能提醒
  if (weaknessReminderEnabled.value) {
    // 添加薄弱环节提醒
    setTimeout(() => {
      if (props.notificationCenter) {
        props.notificationCenter.addNotification({
          type: 'reminder',
          title: '💡 智能提醒',
          message: '检测到您在语法方面需要加强，建议进行相关练习',
          actionUrl: '/games'
        })
      }
    }, 5000)
  }
}

// 生命周期
onMounted(() => {
  if (reminderEnabled.value) {
    setupReminders()
    simulateSmartReminders()
  }
})

onUnmounted(() => {
  clearAllReminders()
})
</script>

<style lang="less" scoped>
.reminder-system {
  .reminder-card,
  .upcoming-reminders-card,
  .reminder-history-card {
    margin-bottom: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .reminder-content {
    transition: all 0.3s ease;

    &.disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    .reminder-section {
      margin-bottom: 32px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        .section-title {
          font-size: 16px;
          font-weight: 500;
          color: #262626;
          margin: 0 0 0 8px;
        }
      }

      .reminder-options {
        .option-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f5f5f5;

          &:last-child {
            border-bottom: none;
          }

          .option-label {
            font-size: 14px;
            color: #262626;
            font-weight: 500;
          }

          .option-info {
            flex: 1;

            .option-label {
              display: block;
              margin-bottom: 2px;
            }

            .option-description {
              font-size: 12px;
              color: #8c8c8c;
            }
          }

          .day-checkbox {
            margin-right: 8px;
            margin-bottom: 8px;
          }
        }
      }
    }
  }

  .upcoming-reminders {
    .reminder-item {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      margin-bottom: 12px;
      transition: all 0.2s ease;

      &:hover {
        border-color: #d9d9d9;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
      }

      &:last-child {
        margin-bottom: 0;
      }

      &.reminder-daily {
        border-left: 3px solid #1890ff;
      }

      &.reminder-goal {
        border-left: 3px solid #52c41a;
      }

      &.reminder-review {
        border-left: 3px solid #fa8c16;
      }

      &.reminder-weakness {
        border-left: 3px solid #722ed1;
      }

      .reminder-icon {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .reminder-info {
        flex: 1;
        min-width: 0;

        .reminder-title {
          font-size: 14px;
          font-weight: 500;
          color: #262626;
          margin: 0 0 4px 0;
        }

        .reminder-description {
          font-size: 13px;
          color: #595959;
          line-height: 1.4;
          margin: 0 0 8px 0;
        }

        .reminder-time {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: #8c8c8c;
        }
      }

      .reminder-actions {
        display: flex;
        gap: 8px;
        margin-left: 12px;
      }
    }

    .no-reminders {
      text-align: center;
      padding: 40px 20px;

      .no-reminders-icon {
        color: #d9d9d9;
        margin-bottom: 12px;
      }

      .no-reminders-text {
        font-size: 14px;
        color: #8c8c8c;
        margin: 0;
      }
    }
  }

  .reminder-history {
    .history-content {
      .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;

        .history-title {
          font-size: 14px;
          font-weight: 500;
          color: #262626;
        }

        .history-time {
          font-size: 12px;
          color: #8c8c8c;
        }
      }

      .history-description {
        font-size: 13px;
        color: #595959;
        line-height: 1.4;
        margin: 0 0 8px 0;
      }

      .history-status {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;

        &.status-completed {
          background: #f6ffed;
          color: #52c41a;
        }

        &.status-snoozed {
          background: #fff7e6;
          color: #fa8c16;
        }

        &.status-cancelled {
          background: #fff2f0;
          color: #ff4d4f;
        }
      }
    }

    .no-history {
      text-align: center;
      padding: 20px;

      .no-history-text {
        font-size: 14px;
        color: #8c8c8c;
        margin: 0;
      }
    }
  }

  .test-reminder {
    text-align: center;
    margin-top: 24px;
  }
}

@media (max-width: 768px) {
  .reminder-system {
    .reminder-content {
      .reminder-section {
        .reminder-options {
          .option-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;

            .option-info {
              margin-bottom: 8px;
            }
          }
        }
      }
    }

    .upcoming-reminders {
      .reminder-item {
        flex-direction: column;
        align-items: stretch;

        .reminder-icon {
          align-self: flex-start;
          margin-bottom: 12px;
        }

        .reminder-actions {
          margin-left: 0;
          margin-top: 12px;
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>