<template>
  <div class="reminder-system">
    <!-- 提醒系统头部 -->
    <div class="reminder-header">
      <div class="header-left">
        <Bell class="w-5 h-5" />
        <h3>学习提醒</h3>
      </div>
      <div class="header-right">
        <a-space>
          <a-button @click="showSettings = true">
            <Settings class="w-4 h-4" />
            设置
          </a-button>
          <a-button type="primary" @click="showCreateModal = true">
            <Plus class="w-4 h-4" />
            新建提醒
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 快速设置 -->
    <div class="quick-settings">
      <a-card title="快速设置" size="small">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-card class="quick-card" @click="createQuickReminder('daily')">
              <div class="quick-content">
                <Calendar class="w-6 h-6 text-blue-500" />
                <div class="quick-text">
                  <div class="quick-title">每日学习</div>
                  <div class="quick-desc">每天固定时间提醒</div>
                </div>
              </div>
            </a-card>
          </a-col>
          
          <a-col :span="8">
            <a-card class="quick-card" @click="createQuickReminder('break')">
              <div class="quick-content">
                <Coffee class="w-6 h-6 text-orange-500" />
                <div class="quick-text">
                  <div class="quick-title">休息提醒</div>
                  <div class="quick-desc">学习间隔休息提醒</div>
                </div>
              </div>
            </a-card>
          </a-col>
          
          <a-col :span="8">
            <a-card class="quick-card" @click="createQuickReminder('goal')">
              <div class="quick-content">
                <Target class="w-6 h-6 text-green-500" />
                <div class="quick-text">
                  <div class="quick-title">目标提醒</div>
                  <div class="quick-desc">学习目标进度提醒</div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 活跃提醒列表 -->
    <div class="active-reminders">
      <a-card title="活跃提醒" size="small">
        <template #extra>
          <a-switch 
            v-model:checked="globalEnabled" 
            checked-children="开启"
            un-checked-children="关闭"
            @change="toggleGlobalReminders"
          />
        </template>
        
        <div class="reminder-list">
          <a-empty v-if="activeReminders.length === 0" description="暂无活跃提醒" />
          
          <div 
            v-for="reminder in activeReminders" 
            :key="reminder.id"
            class="reminder-item"
          >
            <div class="reminder-icon">
              <component 
                :is="getReminderIcon(reminder.type)" 
                class="w-5 h-5"
                :class="getReminderIconColor(reminder.type)"
              />
            </div>
            
            <div class="reminder-content">
              <div class="reminder-title">{{ reminder.title }}</div>
              <div class="reminder-desc">{{ reminder.description }}</div>
              <div class="reminder-schedule">
                <Clock class="w-3 h-3" />
                {{ formatSchedule(reminder) }}
              </div>
            </div>
            
            <div class="reminder-status">
              <a-tag :color="reminder.enabled ? 'success' : 'default'">
                {{ reminder.enabled ? '已启用' : '已禁用' }}
              </a-tag>
            </div>
            
            <div class="reminder-actions">
              <a-space>
                <a-switch 
                  v-model:checked="reminder.enabled" 
                  size="small"
                  @change="toggleReminder(reminder.id)"
                />
                <a-dropdown>
                  <template #overlay>
                    <a-menu @click="(e) => handleReminderAction(e, reminder)">
                      <a-menu-item key="edit">编辑</a-menu-item>
                      <a-menu-item key="test">测试提醒</a-menu-item>
                      <a-menu-item key="duplicate">复制</a-menu-item>
                      <a-menu-item key="delete" class="text-red-500">删除</a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="text" size="small">
                    <MoreVertical class="w-4 h-4" />
                  </a-button>
                </a-dropdown>
              </a-space>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 提醒历史 -->
    <div class="reminder-history">
      <a-card title="最近提醒" size="small">
        <template #extra>
          <a-button size="small" @click="clearHistory">清空历史</a-button>
        </template>
        
        <div class="history-list">
          <div 
            v-for="history in recentHistory" 
            :key="history.id"
            class="history-item"
          >
            <div class="history-time">{{ formatTime(history.timestamp) }}</div>
            <div class="history-content">
              <div class="history-title">{{ history.title }}</div>
              <div class="history-action">{{ history.action }}</div>
            </div>
            <div class="history-status">
              <a-tag :color="getHistoryStatusColor(history.status)">
                {{ getHistoryStatusText(history.status) }}
              </a-tag>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 创建/编辑提醒模态框 -->
    <a-modal
      v-model:open="showCreateModal"
      :title="editingReminder ? '编辑提醒' : '创建提醒'"
      @ok="handleSubmit"
      @cancel="handleCancel"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item label="提醒标题" name="title">
          <a-input v-model:value="formData.title" placeholder="请输入提醒标题" />
        </a-form-item>
        
        <a-form-item label="提醒描述" name="description">
          <a-textarea 
            v-model:value="formData.description" 
            placeholder="请输入提醒描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="提醒类型" name="type">
              <a-select v-model:value="formData.type" placeholder="选择提醒类型">
                <a-select-option value="daily">每日学习</a-select-option>
                <a-select-option value="break">休息提醒</a-select-option>
                <a-select-option value="goal">目标提醒</a-select-option>
                <a-select-option value="review">复习提醒</a-select-option>
                <a-select-option value="custom">自定义</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item label="提醒方式" name="method">
              <a-select v-model:value="formData.method" placeholder="选择提醒方式">
                <a-select-option value="notification">浏览器通知</a-select-option>
                <a-select-option value="sound">声音提醒</a-select-option>
                <a-select-option value="popup">弹窗提醒</a-select-option>
                <a-select-option value="all">全部方式</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="重复设置" name="repeat">
          <a-radio-group v-model:value="formData.repeat">
            <a-radio value="once">仅一次</a-radio>
            <a-radio value="daily">每天</a-radio>
            <a-radio value="weekly">每周</a-radio>
            <a-radio value="custom">自定义</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="提醒时间" name="time">
          <a-time-picker 
            v-model:value="formData.time" 
            format="HH:mm"
            style="width: 100%"
            placeholder="选择提醒时间"
          />
        </a-form-item>
        
        <a-form-item label="星期设置" name="weekdays" v-if="formData.repeat === 'weekly'">
          <a-checkbox-group v-model:value="formData.weekdays">
            <a-checkbox value="1">周一</a-checkbox>
            <a-checkbox value="2">周二</a-checkbox>
            <a-checkbox value="3">周三</a-checkbox>
            <a-checkbox value="4">周四</a-checkbox>
            <a-checkbox value="5">周五</a-checkbox>
            <a-checkbox value="6">周六</a-checkbox>
            <a-checkbox value="0">周日</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        
        <a-form-item label="提醒音效">
          <a-select v-model:value="formData.sound" placeholder="选择提醒音效">
            <a-select-option value="default">默认</a-select-option>
            <a-select-option value="bell">铃声</a-select-option>
            <a-select-option value="chime">钟声</a-select-option>
            <a-select-option value="ding">叮声</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 提醒设置模态框 -->
    <a-modal
      v-model:open="showSettings"
      title="提醒设置"
      @ok="saveSettings"
      width="500px"
    >
      <a-form layout="vertical">
        <a-form-item label="全局设置">
          <a-space direction="vertical" style="width: 100%">
            <a-checkbox v-model:checked="settings.browserNotification">
              启用浏览器通知
            </a-checkbox>
            <a-checkbox v-model:checked="settings.soundEnabled">
              启用声音提醒
            </a-checkbox>
            <a-checkbox v-model:checked="settings.popupEnabled">
              启用弹窗提醒
            </a-checkbox>
          </a-space>
        </a-form-item>
        
        <a-form-item label="免打扰时间">
          <a-time-range-picker 
            v-model:value="settings.quietHours" 
            format="HH:mm"
            placeholder="['开始时间', '结束时间']"
          />
        </a-form-item>
        
        <a-form-item label="提醒音量">
          <a-slider 
            v-model:value="settings.volume" 
            :min="0" 
            :max="100"
            :tooltip-formatter="(value) => `${value}%`"
          />
        </a-form-item>
        
        <a-form-item label="提醒间隔（分钟）">
          <a-input-number 
            v-model:value="settings.snoozeInterval" 
            :min="1" 
            :max="60"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import {
  Bell,
  Settings,
  Plus,
  Calendar,
  Coffee,
  Target,
  Clock,
  MoreVertical,
  BookOpen,
  Award,
  RefreshCw
} from 'lucide-vue-next'

interface Reminder {
  id: string
  title: string
  description: string
  type: 'daily' | 'break' | 'goal' | 'review' | 'custom'
  method: 'notification' | 'sound' | 'popup' | 'all'
  repeat: 'once' | 'daily' | 'weekly' | 'custom'
  time: string
  weekdays?: string[]
  sound: string
  enabled: boolean
  createdAt: string
  lastTriggered?: string
}

interface ReminderHistory {
  id: string
  reminderId: string
  title: string
  action: string
  status: 'triggered' | 'dismissed' | 'snoozed'
  timestamp: string
}

interface ReminderSettings {
  browserNotification: boolean
  soundEnabled: boolean
  popupEnabled: boolean
  quietHours: [Dayjs, Dayjs] | null
  volume: number
  snoozeInterval: number
}

interface ReminderFormData {
  title: string
  description: string
  type: string
  method: string
  repeat: string
  time: Dayjs | null
  weekdays: string[]
  sound: string
}

// 响应式数据
const formRef = ref<FormInstance>()
const showCreateModal = ref(false)
const showSettings = ref(false)
const editingReminder = ref<Reminder | null>(null)
const globalEnabled = ref(true)

// 提醒数据
const reminders = ref<Reminder[]>([
  {
    id: '1',
    title: '每日英语学习',
    description: '每天早上9点开始英语学习',
    type: 'daily',
    method: 'all',
    repeat: 'daily',
    time: '09:00',
    sound: 'bell',
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: '学习休息提醒',
    description: '学习30分钟后休息10分钟',
    type: 'break',
    method: 'notification',
    repeat: 'custom',
    time: '10:30',
    sound: 'chime',
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: '周末复习提醒',
    description: '周末复习本周学习内容',
    type: 'review',
    method: 'popup',
    repeat: 'weekly',
    time: '14:00',
    weekdays: ['6', '0'],
    sound: 'ding',
    enabled: false,
    createdAt: new Date().toISOString()
  }
])

// 提醒历史
const reminderHistory = ref<ReminderHistory[]>([
  {
    id: '1',
    reminderId: '1',
    title: '每日英语学习',
    action: '开始学习',
    status: 'triggered',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    reminderId: '2',
    title: '学习休息提醒',
    action: '休息一下',
    status: 'dismissed',
    timestamp: new Date(Date.now() - 7200000).toISOString()
  }
])

// 提醒设置
const settings = ref<ReminderSettings>({
  browserNotification: true,
  soundEnabled: true,
  popupEnabled: false,
  quietHours: null,
  volume: 70,
  snoozeInterval: 5
})

// 表单数据
const formData = reactive<ReminderFormData>({
  title: '',
  description: '',
  type: 'daily',
  method: 'notification',
  repeat: 'daily',
  time: null,
  weekdays: [],
  sound: 'default'
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入提醒标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入提醒描述', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择提醒类型', trigger: 'change' }
  ],
  method: [
    { required: true, message: '请选择提醒方式', trigger: 'change' }
  ],
  time: [
    { required: true, message: '请选择提醒时间', trigger: 'change' }
  ]
}

// 计算属性
const activeReminders = computed(() => 
  reminders.value.filter(r => r.enabled)
)

const recentHistory = computed(() => 
  reminderHistory.value
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
)

// 定时器
let reminderInterval: NodeJS.Timeout | null = null

// 方法
const createQuickReminder = (type: string) => {
  const templates = {
    daily: {
      title: '每日学习提醒',
      description: '每天固定时间提醒开始学习',
      type: 'daily',
      method: 'all',
      repeat: 'daily',
      time: dayjs().hour(9).minute(0),
      sound: 'bell'
    },
    break: {
      title: '休息提醒',
      description: '学习间隔提醒休息',
      type: 'break',
      method: 'notification',
      repeat: 'custom',
      time: dayjs().add(30, 'minute'),
      sound: 'chime'
    },
    goal: {
      title: '目标检查提醒',
      description: '定期检查学习目标进度',
      type: 'goal',
      method: 'popup',
      repeat: 'weekly',
      time: dayjs().hour(20).minute(0),
      weekdays: ['1', '3', '5'],
      sound: 'ding'
    }
  }

  const template = templates[type as keyof typeof templates]
  if (template) {
    Object.assign(formData, template)
    editingReminder.value = null
    showCreateModal.value = true
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    const reminderData: Omit<Reminder, 'id' | 'createdAt'> = {
      title: formData.title,
      description: formData.description,
      type: formData.type as Reminder['type'],
      method: formData.method as Reminder['method'],
      repeat: formData.repeat as Reminder['repeat'],
      time: formData.time!.format('HH:mm'),
      weekdays: formData.weekdays,
      sound: formData.sound,
      enabled: true
    }
    
    if (editingReminder.value) {
      // 编辑提醒
      const index = reminders.value.findIndex(r => r.id === editingReminder.value!.id)
      if (index !== -1) {
        reminders.value[index] = {
          ...reminders.value[index],
          ...reminderData
        }
        message.success('提醒更新成功')
      }
    } else {
      // 创建新提醒
      const newReminder: Reminder = {
        ...reminderData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      reminders.value.unshift(newReminder)
      message.success('提醒创建成功')
    }
    
    showCreateModal.value = false
    saveRemindersToStorage()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleCancel = () => {
  showCreateModal.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    title: '',
    description: '',
    type: 'daily',
    method: 'notification',
    repeat: 'daily',
    time: null,
    weekdays: [],
    sound: 'default'
  })
}

const handleReminderAction = ({ key }: { key: string }, reminder: Reminder) => {
  switch (key) {
    case 'edit':
      editReminder(reminder)
      break
    case 'test':
      testReminder(reminder)
      break
    case 'duplicate':
      duplicateReminder(reminder)
      break
    case 'delete':
      deleteReminder(reminder.id)
      break
  }
}

const editReminder = (reminder: Reminder) => {
  editingReminder.value = reminder
  Object.assign(formData, {
    title: reminder.title,
    description: reminder.description,
    type: reminder.type,
    method: reminder.method,
    repeat: reminder.repeat,
    time: dayjs(reminder.time, 'HH:mm'),
    weekdays: reminder.weekdays || [],
    sound: reminder.sound
  })
  showCreateModal.value = true
}

const testReminder = (reminder: Reminder) => {
  triggerReminder(reminder)
  message.success('测试提醒已发送')
}

const duplicateReminder = (reminder: Reminder) => {
  const newReminder: Reminder = {
    ...reminder,
    id: Date.now().toString(),
    title: `${reminder.title} (副本)`,
    createdAt: new Date().toISOString()
  }
  reminders.value.unshift(newReminder)
  message.success('提醒已复制')
  saveRemindersToStorage()
}

const deleteReminder = (id: string) => {
  const index = reminders.value.findIndex(r => r.id === id)
  if (index !== -1) {
    reminders.value.splice(index, 1)
    message.success('提醒已删除')
    saveRemindersToStorage()
  }
}

const toggleReminder = (id: string) => {
  const reminder = reminders.value.find(r => r.id === id)
  if (reminder) {
    message.success(`提醒已${reminder.enabled ? '启用' : '禁用'}`)
    saveRemindersToStorage()
  }
}

const toggleGlobalReminders = (enabled: boolean) => {
  if (enabled) {
    startReminderService()
    message.success('提醒系统已启用')
  } else {
    stopReminderService()
    message.success('提醒系统已禁用')
  }
}

const triggerReminder = (reminder: Reminder) => {
  // 检查免打扰时间
  if (settings.value.quietHours) {
    const now = dayjs()
    const [start, end] = settings.value.quietHours
    if (now.isAfter(start) && now.isBefore(end)) {
      return
    }
  }

  // 浏览器通知
  if (settings.value.browserNotification && 
      (reminder.method === 'notification' || reminder.method === 'all')) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(reminder.title, {
        body: reminder.description,
        icon: '/favicon.ico'
      })
    }
  }

  // 声音提醒
  if (settings.value.soundEnabled && 
      (reminder.method === 'sound' || reminder.method === 'all')) {
    playReminderSound(reminder.sound)
  }

  // 弹窗提醒
  if (settings.value.popupEnabled && 
      (reminder.method === 'popup' || reminder.method === 'all')) {
    message.info({
      content: `${reminder.title}: ${reminder.description}`,
      duration: 10
    })
  }

  // 记录历史
  addToHistory(reminder, 'triggered')
}

const playReminderSound = (soundType: string) => {
  // 模拟播放提醒音效
  console.log(`播放提醒音效: ${soundType}`)
}

const addToHistory = (reminder: Reminder, status: ReminderHistory['status']) => {
  const history: ReminderHistory = {
    id: Date.now().toString(),
    reminderId: reminder.id,
    title: reminder.title,
    action: getActionText(reminder.type),
    status,
    timestamp: new Date().toISOString()
  }
  reminderHistory.value.unshift(history)
  
  // 保持历史记录在合理数量
  if (reminderHistory.value.length > 50) {
    reminderHistory.value = reminderHistory.value.slice(0, 50)
  }
}

const clearHistory = () => {
  reminderHistory.value = []
  message.success('历史记录已清空')
}

const saveSettings = () => {
  localStorage.setItem('reminderSettings', JSON.stringify(settings.value))
  message.success('设置已保存')
  showSettings.value = false
}

const saveRemindersToStorage = () => {
  localStorage.setItem('reminders', JSON.stringify(reminders.value))
}

const loadRemindersFromStorage = () => {
  const saved = localStorage.getItem('reminders')
  if (saved) {
    reminders.value = JSON.parse(saved)
  }
}

const loadSettingsFromStorage = () => {
  const saved = localStorage.getItem('reminderSettings')
  if (saved) {
    const savedSettings = JSON.parse(saved)
    Object.assign(settings.value, savedSettings)
    
    // 处理时间范围
    if (savedSettings.quietHours) {
      settings.value.quietHours = [
        dayjs(savedSettings.quietHours[0]),
        dayjs(savedSettings.quietHours[1])
      ]
    }
  }
}

const startReminderService = () => {
  if (reminderInterval) return
  
  reminderInterval = setInterval(() => {
    checkReminders()
  }, 60000) // 每分钟检查一次
}

const stopReminderService = () => {
  if (reminderInterval) {
    clearInterval(reminderInterval)
    reminderInterval = null
  }
}

const checkReminders = () => {
  if (!globalEnabled.value) return
  
  const now = dayjs()
  const currentTime = now.format('HH:mm')
  const currentWeekday = now.day().toString()
  
  reminders.value.forEach(reminder => {
    if (!reminder.enabled) return
    
    let shouldTrigger = false
    
    switch (reminder.repeat) {
      case 'daily':
        shouldTrigger = reminder.time === currentTime
        break
      case 'weekly':
        shouldTrigger = reminder.time === currentTime && 
                      reminder.weekdays?.includes(currentWeekday)
        break
      case 'once':
        // 检查是否是设定的日期和时间
        shouldTrigger = reminder.time === currentTime && 
                       !reminder.lastTriggered
        break
    }
    
    if (shouldTrigger) {
      triggerReminder(reminder)
      reminder.lastTriggered = now.toISOString()
    }
  })
}

// 工具函数
const getReminderIcon = (type: string) => {
  const icons: Record<string, any> = {
    daily: Calendar,
    break: Coffee,
    goal: Target,
    review: BookOpen,
    custom: Bell
  }
  return icons[type] || Bell
}

const getReminderIconColor = (type: string): string => {
  const colors: Record<string, string> = {
    daily: 'text-blue-500',
    break: 'text-orange-500',
    goal: 'text-green-500',
    review: 'text-purple-500',
    custom: 'text-gray-500'
  }
  return colors[type] || 'text-gray-500'
}

const formatSchedule = (reminder: Reminder): string => {
  let schedule = `${reminder.time}`
  
  switch (reminder.repeat) {
    case 'daily':
      schedule += ' 每天'
      break
    case 'weekly':
      if (reminder.weekdays && reminder.weekdays.length > 0) {
        const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        const days = reminder.weekdays.map(d => weekdayNames[parseInt(d)]).join('、')
        schedule += ` ${days}`
      }
      break
    case 'once':
      schedule += ' 仅一次'
      break
    case 'custom':
      schedule += ' 自定义'
      break
  }
  
  return schedule
}

const formatTime = (timestamp: string): string => {
  const now = dayjs()
  const time = dayjs(timestamp)
  const diff = now.diff(time, 'minute')
  
  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
  return time.format('MM-DD HH:mm')
}

const getActionText = (type: string): string => {
  const actions: Record<string, string> = {
    daily: '开始学习',
    break: '休息一下',
    goal: '检查目标',
    review: '开始复习',
    custom: '执行任务'
  }
  return actions[type] || '执行任务'
}

const getHistoryStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    triggered: 'success',
    dismissed: 'default',
    snoozed: 'warning'
  }
  return colors[status] || 'default'
}

const getHistoryStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    triggered: '已触发',
    dismissed: '已忽略',
    snoozed: '已延迟'
  }
  return texts[status] || '未知'
}

// 生命周期
onMounted(() => {
  loadRemindersFromStorage()
  loadSettingsFromStorage()
  
  // 请求浏览器通知权限
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
  
  if (globalEnabled.value) {
    startReminderService()
  }
})

onUnmounted(() => {
  stopReminderService()
})

// 暴露给父组件的方法
defineExpose({
  createReminder: (reminderData: Partial<Reminder>) => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: reminderData.title || '新提醒',
      description: reminderData.description || '',
      type: reminderData.type || 'custom',
      method: reminderData.method || 'notification',
      repeat: reminderData.repeat || 'once',
      time: reminderData.time || dayjs().format('HH:mm'),
      sound: reminderData.sound || 'default',
      enabled: true,
      createdAt: new Date().toISOString(),
      ...reminderData
    }
    reminders.value.unshift(newReminder)
    saveRemindersToStorage()
    return newReminder.id
  },
  
  triggerReminder: (id: string) => {
    const reminder = reminders.value.find(r => r.id === id)
    if (reminder) {
      triggerReminder(reminder)
    }
  }
})
</script>

<style scoped lang="less">
.reminder-system {
  .reminder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }

  .quick-settings {
    margin-bottom: 24px;

    .quick-card {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #1890ff;
        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
      }

      .quick-content {
        display: flex;
        align-items: center;
        gap: 12px;

        .quick-text {
          .quick-title {
            font-weight: 600;
            margin-bottom: 4px;
          }

          .quick-desc {
            font-size: 12px;
            color: #666;
          }
        }
      }
    }
  }

  .active-reminders {
    margin-bottom: 24px;

    .reminder-list {
      .reminder-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid #e8e8e8;
        border-radius: 8px;
        margin-bottom: 12px;
        transition: all 0.3s;

        &:hover {
          border-color: #1890ff;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
        }

        &:last-child {
          margin-bottom: 0;
        }

        .reminder-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #f5f5f5;
        }

        .reminder-content {
          flex: 1;

          .reminder-title {
            font-weight: 600;
            margin-bottom: 4px;
          }

          .reminder-desc {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
          }

          .reminder-schedule {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #999;
          }
        }

        .reminder-status {
          flex-shrink: 0;
        }

        .reminder-actions {
          flex-shrink: 0;
        }
      }
    }
  }

  .reminder-history {
    .history-list {
      max-height: 300px;
      overflow-y: auto;

      .history-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .history-time {
          flex-shrink: 0;
          font-size: 12px;
          color: #999;
          width: 80px;
        }

        .history-content {
          flex: 1;

          .history-title {
            font-weight: 500;
            margin-bottom: 2px;
          }

          .history-action {
            font-size: 12px;
            color: #666;
          }
        }

        .history-status {
          flex-shrink: 0;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .reminder-system {
    .reminder-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .quick-settings {
      :deep(.ant-col) {
        margin-bottom: 12px;
      }
    }

    .reminder-item {
      flex-direction: column;
      align-items: stretch !important;
      gap: 12px !important;

      .reminder-content {
        text-align: center;
      }

      .reminder-actions {
        align-self: center;
      }
    }

    .history-item {
      flex-direction: column !important;
      align-items: stretch !important;
      text-align: center;

      .history-time {
        width: auto !important;
      }
    }
  }
}
</style>