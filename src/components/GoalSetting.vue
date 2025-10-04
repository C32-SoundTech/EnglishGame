<template>
  <div class="goal-setting">
    <!-- 目标设置头部 -->
    <div class="goal-header">
      <div class="header-left">
        <Target class="w-5 h-5" />
        <h3>学习目标</h3>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="showCreateModal">
          <Plus class="w-4 h-4" />
          新建目标
        </a-button>
      </div>
    </div>

    <!-- 目标统计 -->
    <div class="goal-stats">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总目标</div>
              <div class="stat-icon">
                <Target class="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ stats.active }}</div>
              <div class="stat-label">进行中</div>
              <div class="stat-icon">
                <Clock class="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ stats.completed }}</div>
              <div class="stat-label">已完成</div>
              <div class="stat-icon">
                <CheckCircle class="w-6 h-6 text-green-500" />
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :span="6">
          <a-card class="stat-card">
            <div class="stat-item">
              <div class="stat-value">{{ stats.completionRate }}%</div>
              <div class="stat-label">完成率</div>
              <div class="stat-icon">
                <TrendingUp class="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 目标筛选 -->
    <div class="goal-filters">
      <a-space>
        <a-select v-model:value="currentFilter" style="width: 120px" @change="filterGoals">
          <a-select-option value="all">全部目标</a-select-option>
          <a-select-option value="active">进行中</a-select-option>
          <a-select-option value="completed">已完成</a-select-option>
          <a-select-option value="overdue">已逾期</a-select-option>
        </a-select>
        
        <a-select v-model:value="currentCategory" style="width: 120px" @change="filterGoals">
          <a-select-option value="all">全部类型</a-select-option>
          <a-select-option value="daily">每日目标</a-select-option>
          <a-select-option value="weekly">每周目标</a-select-option>
          <a-select-option value="monthly">每月目标</a-select-option>
          <a-select-option value="custom">自定义</a-select-option>
        </a-select>
        
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索目标..."
          style="width: 200px"
          @search="filterGoals"
        />
      </a-space>
    </div>

    <!-- 目标列表 -->
    <div class="goal-list">
      <a-empty v-if="filteredGoals.length === 0" description="暂无目标" />
      
      <div v-for="goal in filteredGoals" :key="goal.id" class="goal-item">
        <div class="goal-card">
          <div class="goal-header-section">
            <div class="goal-info">
              <div class="goal-title">
                {{ goal.title }}
                <a-tag :color="getCategoryColor(goal.category)" size="small">
                  {{ getCategoryLabel(goal.category) }}
                </a-tag>
                <a-tag :color="getStatusColor(goal.status)" size="small">
                  {{ getStatusLabel(goal.status) }}
                </a-tag>
              </div>
              <div class="goal-description">{{ goal.description }}</div>
            </div>
            
            <div class="goal-actions">
              <a-dropdown>
                <template #overlay>
                  <a-menu @click="(e) => handleGoalAction(e, goal)">
                    <a-menu-item key="edit">编辑</a-menu-item>
                    <a-menu-item key="complete" v-if="goal.status !== 'completed'">标记完成</a-menu-item>
                    <a-menu-item key="pause" v-if="goal.status === 'active'">暂停</a-menu-item>
                    <a-menu-item key="resume" v-if="goal.status === 'paused'">恢复</a-menu-item>
                    <a-menu-item key="delete" class="text-red-500">删除</a-menu-item>
                  </a-menu>
                </template>
                <a-button type="text" size="small">
                  <MoreVertical class="w-4 h-4" />
                </a-button>
              </a-dropdown>
            </div>
          </div>
          
          <div class="goal-progress">
            <div class="progress-info">
              <span>进度: {{ goal.currentValue }}/{{ goal.targetValue }} {{ goal.unit }}</span>
              <span class="progress-percentage">{{ Math.round((goal.currentValue / goal.targetValue) * 100) }}%</span>
            </div>
            <a-progress 
              :percent="Math.round((goal.currentValue / goal.targetValue) * 100)"
              :status="getProgressStatus(goal)"
              :stroke-color="getProgressColor(goal)"
            />
          </div>
          
          <div class="goal-timeline">
            <div class="timeline-item">
              <Calendar class="w-4 h-4" />
              <span>开始: {{ formatDate(goal.startDate) }}</span>
            </div>
            <div class="timeline-item">
              <Clock class="w-4 h-4" />
              <span>截止: {{ formatDate(goal.endDate) }}</span>
            </div>
            <div class="timeline-item" v-if="goal.status === 'completed'">
              <CheckCircle class="w-4 h-4 text-green-500" />
              <span>完成: {{ formatDate(goal.completedDate!) }}</span>
            </div>
          </div>
          
          <div class="goal-rewards" v-if="goal.rewards && goal.rewards.length > 0">
            <div class="rewards-label">奖励:</div>
            <div class="rewards-list">
              <a-tag v-for="reward in goal.rewards" :key="reward" color="gold" size="small">
                <Award class="w-3 h-3" />
                {{ reward }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑目标模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingGoal ? '编辑目标' : '创建目标'"
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
        <a-form-item label="目标标题" name="title">
          <a-input v-model:value="formData.title" placeholder="请输入目标标题" />
        </a-form-item>
        
        <a-form-item label="目标描述" name="description">
          <a-textarea 
            v-model:value="formData.description" 
            placeholder="请输入目标描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="目标类型" name="category">
              <a-select v-model:value="formData.category" placeholder="选择目标类型">
                <a-select-option value="daily">每日目标</a-select-option>
                <a-select-option value="weekly">每周目标</a-select-option>
                <a-select-option value="monthly">每月目标</a-select-option>
                <a-select-option value="custom">自定义</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item label="目标单位" name="unit">
              <a-select v-model:value="formData.unit" placeholder="选择单位">
                <a-select-option value="个">个</a-select-option>
                <a-select-option value="分钟">分钟</a-select-option>
                <a-select-option value="小时">小时</a-select-option>
                <a-select-option value="天">天</a-select-option>
                <a-select-option value="次">次</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="目标数值" name="targetValue">
              <a-input-number 
                v-model:value="formData.targetValue" 
                :min="1"
                style="width: 100%"
                placeholder="请输入目标数值"
              />
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item label="当前进度" name="currentValue">
              <a-input-number 
                v-model:value="formData.currentValue" 
                :min="0"
                :max="formData.targetValue"
                style="width: 100%"
                placeholder="请输入当前进度"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始日期" name="startDate">
              <a-date-picker 
                v-model:value="formData.startDate" 
                style="width: 100%"
                placeholder="选择开始日期"
              />
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item label="截止日期" name="endDate">
              <a-date-picker 
                v-model:value="formData.endDate" 
                style="width: 100%"
                placeholder="选择截止日期"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="奖励设置">
          <a-select
            v-model:value="formData.rewards"
            mode="tags"
            style="width: 100%"
            placeholder="添加完成目标后的奖励"
            :token-separators="[',']"
          >
            <a-select-option value="经验值+10">经验值+10</a-select-option>
            <a-select-option value="金币+50">金币+50</a-select-option>
            <a-select-option value="新徽章">新徽章</a-select-option>
            <a-select-option value="称号">称号</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import {
  Target,
  Plus,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Award,
  MoreVertical
} from 'lucide-vue-next'

interface Goal {
  id: string
  title: string
  description: string
  category: 'daily' | 'weekly' | 'monthly' | 'custom'
  targetValue: number
  currentValue: number
  unit: string
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'paused' | 'overdue'
  rewards?: string[]
  completedDate?: string
  createdAt: string
  updatedAt: string
}

interface GoalFormData {
  title: string
  description: string
  category: string
  targetValue: number
  currentValue: number
  unit: string
  startDate: Dayjs | null
  endDate: Dayjs | null
  rewards: string[]
}

// 响应式数据
const formRef = ref<FormInstance>()
const modalVisible = ref(false)
const editingGoal = ref<Goal | null>(null)
const currentFilter = ref('all')
const currentCategory = ref('all')
const searchKeyword = ref('')

// 目标数据
const goals = ref<Goal[]>([
  {
    id: '1',
    title: '每日单词学习',
    description: '每天学习20个新单词，提高词汇量',
    category: 'daily',
    targetValue: 20,
    currentValue: 15,
    unit: '个',
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    status: 'active',
    rewards: ['经验值+10', '金币+20'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: '每周听力练习',
    description: '每周完成5小时的听力练习',
    category: 'weekly',
    targetValue: 5,
    currentValue: 3,
    unit: '小时',
    startDate: dayjs().startOf('week').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('week').format('YYYY-MM-DD'),
    status: 'active',
    rewards: ['听力徽章', '经验值+50'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: '月度阅读挑战',
    description: '本月阅读10篇英语文章',
    category: 'monthly',
    targetValue: 10,
    currentValue: 10,
    unit: '篇',
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    status: 'completed',
    rewards: ['阅读达人', '金币+100'],
    completedDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
])

// 表单数据
const formData = reactive<GoalFormData>({
  title: '',
  description: '',
  category: 'daily',
  targetValue: 1,
  currentValue: 0,
  unit: '个',
  startDate: null,
  endDate: null,
  rewards: []
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入目标标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入目标描述', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择目标类型', trigger: 'change' }
  ],
  targetValue: [
    { required: true, message: '请输入目标数值', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请选择目标单位', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择截止日期', trigger: 'change' }
  ]
}

// 计算属性
const stats = computed(() => {
  const total = goals.value.length
  const active = goals.value.filter(g => g.status === 'active').length
  const completed = goals.value.filter(g => g.status === 'completed').length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  
  return { total, active, completed, completionRate }
})

const filteredGoals = computed(() => {
  let filtered = goals.value

  // 按状态筛选
  if (currentFilter.value !== 'all') {
    filtered = filtered.filter(goal => {
      if (currentFilter.value === 'overdue') {
        return dayjs().isAfter(dayjs(goal.endDate)) && goal.status !== 'completed'
      }
      return goal.status === currentFilter.value
    })
  }

  // 按类型筛选
  if (currentCategory.value !== 'all') {
    filtered = filtered.filter(goal => goal.category === currentCategory.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(goal => 
      goal.title.toLowerCase().includes(keyword) ||
      goal.description.toLowerCase().includes(keyword)
    )
  }

  return filtered.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
})

// 方法
const showCreateModal = () => {
  editingGoal.value = null
  resetForm()
  modalVisible.value = true
}

const resetForm = () => {
  Object.assign(formData, {
    title: '',
    description: '',
    category: 'daily',
    targetValue: 1,
    currentValue: 0,
    unit: '个',
    startDate: dayjs(),
    endDate: dayjs().add(7, 'day'),
    rewards: []
  })
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    const goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title,
      description: formData.description,
      category: formData.category as Goal['category'],
      targetValue: formData.targetValue,
      currentValue: formData.currentValue,
      unit: formData.unit,
      startDate: formData.startDate!.format('YYYY-MM-DD'),
      endDate: formData.endDate!.format('YYYY-MM-DD'),
      status: 'active',
      rewards: formData.rewards
    }
    
    if (editingGoal.value) {
      // 编辑目标
      const index = goals.value.findIndex(g => g.id === editingGoal.value!.id)
      if (index !== -1) {
        goals.value[index] = {
          ...goals.value[index],
          ...goalData,
          updatedAt: new Date().toISOString()
        }
        message.success('目标更新成功')
      }
    } else {
      // 创建新目标
      const newGoal: Goal = {
        ...goalData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      goals.value.unshift(newGoal)
      message.success('目标创建成功')
    }
    
    modalVisible.value = false
    saveGoalsToStorage()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

const handleGoalAction = ({ key }: { key: string }, goal: Goal) => {
  switch (key) {
    case 'edit':
      editGoal(goal)
      break
    case 'complete':
      completeGoal(goal.id)
      break
    case 'pause':
      updateGoalStatus(goal.id, 'paused')
      break
    case 'resume':
      updateGoalStatus(goal.id, 'active')
      break
    case 'delete':
      deleteGoal(goal.id)
      break
  }
}

const editGoal = (goal: Goal) => {
  editingGoal.value = goal
  Object.assign(formData, {
    title: goal.title,
    description: goal.description,
    category: goal.category,
    targetValue: goal.targetValue,
    currentValue: goal.currentValue,
    unit: goal.unit,
    startDate: dayjs(goal.startDate),
    endDate: dayjs(goal.endDate),
    rewards: goal.rewards || []
  })
  modalVisible.value = true
}

const completeGoal = (id: string) => {
  const goal = goals.value.find(g => g.id === id)
  if (goal) {
    goal.status = 'completed'
    goal.currentValue = goal.targetValue
    goal.completedDate = dayjs().format('YYYY-MM-DD')
    goal.updatedAt = new Date().toISOString()
    message.success('目标已完成！')
    saveGoalsToStorage()
  }
}

const updateGoalStatus = (id: string, status: Goal['status']) => {
  const goal = goals.value.find(g => g.id === id)
  if (goal) {
    goal.status = status
    goal.updatedAt = new Date().toISOString()
    message.success(`目标已${status === 'paused' ? '暂停' : '恢复'}`)
    saveGoalsToStorage()
  }
}

const deleteGoal = (id: string) => {
  const index = goals.value.findIndex(g => g.id === id)
  if (index !== -1) {
    goals.value.splice(index, 1)
    message.success('目标已删除')
    saveGoalsToStorage()
  }
}

const filterGoals = () => {
  // 触发计算属性重新计算
}

const saveGoalsToStorage = () => {
  localStorage.setItem('learningGoals', JSON.stringify(goals.value))
}

const loadGoalsFromStorage = () => {
  const saved = localStorage.getItem('learningGoals')
  if (saved) {
    goals.value = JSON.parse(saved)
  }
}

// 工具函数
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    daily: 'blue',
    weekly: 'green',
    monthly: 'purple',
    custom: 'orange'
  }
  return colors[category] || 'default'
}

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
    custom: '自定义'
  }
  return labels[category] || '未知'
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'processing',
    completed: 'success',
    paused: 'warning',
    overdue: 'error'
  }
  return colors[status] || 'default'
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: '进行中',
    completed: '已完成',
    paused: '已暂停',
    overdue: '已逾期'
  }
  return labels[status] || '未知'
}

const getProgressStatus = (goal: Goal): 'success' | 'exception' | 'normal' => {
  if (goal.status === 'completed') return 'success'
  if (dayjs().isAfter(dayjs(goal.endDate)) && goal.status !== 'completed') return 'exception'
  return 'normal'
}

const getProgressColor = (goal: Goal): string => {
  const progress = (goal.currentValue / goal.targetValue) * 100
  if (goal.status === 'completed') return '#52c41a'
  if (progress >= 80) return '#52c41a'
  if (progress >= 50) return '#faad14'
  return '#1890ff'
}

const formatDate = (date: string): string => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 生命周期
onMounted(() => {
  loadGoalsFromStorage()
})

// 暴露给父组件的方法
defineExpose({
  updateGoalProgress: (goalId: string, progress: number) => {
    const goal = goals.value.find(g => g.id === goalId)
    if (goal) {
      goal.currentValue = Math.min(progress, goal.targetValue)
      goal.updatedAt = new Date().toISOString()
      
      if (goal.currentValue >= goal.targetValue && goal.status !== 'completed') {
        completeGoal(goalId)
      }
      
      saveGoalsToStorage()
    }
  },
  
  getActiveGoals: () => goals.value.filter(g => g.status === 'active'),
  
  addGoalProgress: (goalId: string, increment: number) => {
    const goal = goals.value.find(g => g.id === goalId)
    if (goal) {
      goal.currentValue = Math.min(goal.currentValue + increment, goal.targetValue)
      goal.updatedAt = new Date().toISOString()
      
      if (goal.currentValue >= goal.targetValue && goal.status !== 'completed') {
        completeGoal(goalId)
      }
      
      saveGoalsToStorage()
    }
  }
})
</script>

<style scoped lang="less">
.goal-setting {
  .goal-header {
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

  .goal-stats {
    margin-bottom: 24px;

    .stat-card {
      .stat-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1890ff;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
        }

        .stat-icon {
          position: absolute;
          top: 0;
          right: 0;
          opacity: 0.1;
        }
      }
    }
  }

  .goal-filters {
    margin-bottom: 24px;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
  }

  .goal-list {
    .goal-item {
      margin-bottom: 16px;

      .goal-card {
        padding: 20px;
        border: 1px solid #e8e8e8;
        border-radius: 12px;
        background: #fff;
        transition: all 0.3s;

        &:hover {
          border-color: #1890ff;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1);
        }

        .goal-header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;

          .goal-info {
            flex: 1;

            .goal-title {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;
              font-size: 16px;
              font-weight: 600;
              color: #333;
            }

            .goal-description {
              font-size: 14px;
              color: #666;
              line-height: 1.5;
            }
          }
        }

        .goal-progress {
          margin-bottom: 16px;

          .progress-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 14px;

            .progress-percentage {
              font-weight: 600;
              color: #1890ff;
            }
          }
        }

        .goal-timeline {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;

          .timeline-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #666;
          }
        }

        .goal-rewards {
          display: flex;
          align-items: center;
          gap: 8px;

          .rewards-label {
            font-size: 14px;
            color: #666;
            font-weight: 500;
          }

          .rewards-list {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;

            :deep(.ant-tag) {
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .goal-setting {
    .goal-stats {
      :deep(.ant-col) {
        margin-bottom: 12px;
      }
    }

    .goal-filters {
      :deep(.ant-space) {
        flex-direction: column;
        width: 100%;

        .ant-space-item {
          width: 100%;

          .ant-select,
          .ant-input-search {
            width: 100% !important;
          }
        }
      }
    }

    .goal-card {
      .goal-header-section {
        flex-direction: column;
        gap: 12px;
      }

      .goal-timeline {
        flex-direction: column;
        gap: 8px;
      }

      .goal-rewards {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  }
}
</style>