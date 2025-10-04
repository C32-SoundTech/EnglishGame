<template>
  <div class="goals-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <Target class="w-6 h-6 mr-3" />
          学习目标
        </h1>
        <p class="page-description">设定并追踪您的学习目标，让学习更有方向</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" size="large" @click="showAddGoal = true">
          <Plus class="w-4 h-4 mr-2" />
          添加目标
        </a-button>
      </div>
    </div>

    <!-- 目标概览 -->
    <div class="goals-overview">
      <a-row :gutter="24">
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="overview-card">
            <div class="card-icon" style="background: #e6f7ff; color: #1890ff;">
              <Target class="w-6 h-6" />
            </div>
            <div class="card-content">
              <div class="card-value">{{ totalGoals }}</div>
              <div class="card-label">总目标数</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="overview-card">
            <div class="card-icon" style="background: #f6ffed; color: #52c41a;">
              <CheckCircle class="w-6 h-6" />
            </div>
            <div class="card-content">
              <div class="card-value">{{ completedGoals }}</div>
              <div class="card-label">已完成</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="overview-card">
            <div class="card-icon" style="background: #fff7e6; color: #fa8c16;">
              <Clock class="w-6 h-6" />
            </div>
            <div class="card-content">
              <div class="card-value">{{ inProgressGoals }}</div>
              <div class="card-label">进行中</div>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="overview-card">
            <div class="card-icon" style="background: #fff1f0; color: #f5222d;">
              <AlertCircle class="w-6 h-6" />
            </div>
            <div class="card-content">
              <div class="card-value">{{ overdueGoals }}</div>
              <div class="card-label">已逾期</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 目标筛选和排序 -->
    <div class="goals-filters">
      <div class="filter-section">
        <a-space wrap>
          <a-select 
            v-model:value="filterType" 
            placeholder="目标类型" 
            style="width: 120px"
            @change="filterGoals"
          >
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option value="daily">每日目标</a-select-option>
            <a-select-option value="weekly">每周目标</a-select-option>
            <a-select-option value="monthly">每月目标</a-select-option>
          </a-select>
          
          <a-select 
            v-model:value="filterStatus" 
            placeholder="目标状态" 
            style="width: 120px"
            @change="filterGoals"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="active">进行中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
            <a-select-option value="overdue">已逾期</a-select-option>
          </a-select>
          
          <a-select 
            v-model:value="sortBy" 
            placeholder="排序方式" 
            style="width: 120px"
            @change="sortGoals"
          >
            <a-select-option value="deadline">截止日期</a-select-option>
            <a-select-option value="progress">完成进度</a-select-option>
            <a-select-option value="created">创建时间</a-select-option>
          </a-select>
        </a-space>
      </div>
      
      <div class="view-toggle">
        <a-radio-group v-model:value="viewMode" button-style="solid">
          <a-radio-button value="grid">
            <Grid class="w-4 h-4" />
          </a-radio-button>
          <a-radio-button value="list">
            <List class="w-4 h-4" />
          </a-radio-button>
        </a-radio-group>
      </div>
    </div>

    <!-- 目标列表 -->
    <div class="goals-container">
      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="goals-grid">
        <a-row :gutter="[24, 24]">
          <a-col 
            :xs="24" 
            :sm="12" 
            :lg="8" 
            v-for="goal in filteredGoals" 
            :key="goal.id"
          >
            <div class="goal-card" :class="getGoalCardClass(goal)">
              <div class="goal-header">
                <div class="goal-type-badge" :style="getGoalTypeBadgeStyle(goal.type)">
                  {{ getGoalTypeText(goal.type) }}
                </div>
                <a-dropdown>
                  <a-button type="text" size="small">
                    <MoreVertical class="w-4 h-4" />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="editGoal(goal)">
                        <Edit class="w-4 h-4 mr-2" />
                        编辑
                      </a-menu-item>
                      <a-menu-item @click="duplicateGoal(goal)">
                        <Copy class="w-4 h-4 mr-2" />
                        复制
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item @click="deleteGoal(goal.id)" danger>
                        <Trash2 class="w-4 h-4 mr-2" />
                        删除
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
              
              <div class="goal-content">
                <h3 class="goal-title">{{ goal.title }}</h3>
                <p class="goal-description">{{ goal.description }}</p>
                
                <div class="goal-progress">
                  <div class="progress-info">
                    <span class="progress-text">
                      {{ goal.current }} / {{ goal.target }} {{ goal.unit }}
                    </span>
                    <span class="progress-percentage">
                      {{ Math.round(goal.current / goal.target * 100) }}%
                    </span>
                  </div>
                  <a-progress 
                    :percent="Math.round(goal.current / goal.target * 100)" 
                    :stroke-color="getProgressColor(goal.current / goal.target)"
                    :show-info="false"
                    size="small"
                  />
                </div>
                
                <div class="goal-meta">
                  <div class="goal-deadline">
                    <Calendar class="w-4 h-4 mr-1" />
                    {{ formatDate(goal.deadline) }}
                  </div>
                  <div class="goal-status" :class="getGoalStatusClass(goal)">
                    {{ getGoalStatusText(goal) }}
                  </div>
                </div>
              </div>
              
              <div class="goal-actions">
                <a-button 
                  type="primary" 
                  size="small" 
                  @click="updateProgress(goal)"
                  :disabled="goal.current >= goal.target"
                >
                  <Plus class="w-3 h-3 mr-1" />
                  更新进度
                </a-button>
                <a-button 
                  size="small" 
                  @click="viewGoalDetails(goal)"
                >
                  <Eye class="w-3 h-3 mr-1" />
                  详情
                </a-button>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 列表视图 -->
      <div v-else class="goals-list">
        <div class="goal-list-item" v-for="goal in filteredGoals" :key="goal.id">
          <div class="goal-list-content">
            <div class="goal-list-header">
              <div class="goal-list-title">
                <h3>{{ goal.title }}</h3>
                <div class="goal-type-badge small" :style="getGoalTypeBadgeStyle(goal.type)">
                  {{ getGoalTypeText(goal.type) }}
                </div>
              </div>
              <div class="goal-list-actions">
                <a-button size="small" @click="updateProgress(goal)">
                  <Plus class="w-3 h-3" />
                </a-button>
                <a-button size="small" @click="editGoal(goal)">
                  <Edit class="w-3 h-3" />
                </a-button>
                <a-button size="small" danger @click="deleteGoal(goal.id)">
                  <Trash2 class="w-3 h-3" />
                </a-button>
              </div>
            </div>
            
            <p class="goal-list-description">{{ goal.description }}</p>
            
            <div class="goal-list-progress">
              <div class="progress-info">
                <span class="progress-text">
                  {{ goal.current }} / {{ goal.target }} {{ goal.unit }}
                </span>
                <span class="progress-percentage">
                  {{ Math.round(goal.current / goal.target * 100) }}%
                </span>
              </div>
              <a-progress 
                :percent="Math.round(goal.current / goal.target * 100)" 
                :stroke-color="getProgressColor(goal.current / goal.target)"
                :show-info="false"
                size="small"
              />
            </div>
            
            <div class="goal-list-meta">
              <div class="goal-deadline">
                <Calendar class="w-4 h-4 mr-1" />
                截止: {{ formatDate(goal.deadline) }}
              </div>
              <div class="goal-status" :class="getGoalStatusClass(goal)">
                {{ getGoalStatusText(goal) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredGoals.length === 0" class="empty-state">
      <div class="empty-icon">
        <Target class="w-16 h-16" />
      </div>
      <h3 class="empty-title">暂无学习目标</h3>
      <p class="empty-description">
        {{ filterType || filterStatus ? '没有符合条件的目标' : '开始设定您的第一个学习目标吧！' }}
      </p>
      <a-button type="primary" @click="showAddGoal = true" v-if="!filterType && !filterStatus">
        <Plus class="w-4 h-4 mr-2" />
        添加目标
      </a-button>
    </div>

    <!-- 添加/编辑目标弹窗 -->
    <a-modal 
      v-model:open="showAddGoal" 
      :title="editingGoal ? '编辑目标' : '添加学习目标'" 
      @ok="saveGoal"
      @cancel="resetGoalForm"
      width="600px"
    >
      <a-form :model="goalForm" layout="vertical" :rules="goalFormRules">
        <a-form-item label="目标标题" name="title" required>
          <a-input 
            v-model:value="goalForm.title" 
            placeholder="请输入目标标题"
            :maxlength="50"
            show-count
          />
        </a-form-item>
        
        <a-form-item label="目标描述" name="description">
          <a-textarea 
            v-model:value="goalForm.description" 
            placeholder="描述您的学习目标"
            :rows="3"
            :maxlength="200"
            show-count
          />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="目标类型" name="type" required>
              <a-select v-model:value="goalForm.type" placeholder="选择目标类型">
                <a-select-option value="daily">每日目标</a-select-option>
                <a-select-option value="weekly">每周目标</a-select-option>
                <a-select-option value="monthly">每月目标</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="截止日期" name="deadline" required>
              <a-date-picker 
                v-model:value="goalForm.deadline" 
                style="width: 100%"
                :disabled-date="disabledDate"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="目标数值" name="target" required>
              <a-input-number 
                v-model:value="goalForm.target" 
                :min="1" 
                :max="10000"
                style="width: 100%" 
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="单位" name="unit" required>
              <a-select v-model:value="goalForm.unit" placeholder="选择单位">
                <a-select-option value="分钟">分钟</a-select-option>
                <a-select-option value="小时">小时</a-select-option>
                <a-select-option value="天">天</a-select-option>
                <a-select-option value="次">次</a-select-option>
                <a-select-option value="个">个</a-select-option>
                <a-select-option value="页">页</a-select-option>
                <a-select-option value="章">章</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="当前进度" name="current">
              <a-input-number 
                v-model:value="goalForm.current" 
                :min="0" 
                :max="goalForm.target || 1000"
                style="width: 100%" 
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="目标优先级" name="priority">
          <a-radio-group v-model:value="goalForm.priority">
            <a-radio value="high">
              <AlertTriangle class="w-4 h-4 mr-1 text-red-500" />
              高优先级
            </a-radio>
            <a-radio value="medium">
              <Clock class="w-4 h-4 mr-1 text-orange-500" />
              中优先级
            </a-radio>
            <a-radio value="low">
              <Minus class="w-4 h-4 mr-1 text-green-500" />
              低优先级
            </a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 更新进度弹窗 -->
    <a-modal 
      v-model:open="showUpdateProgress" 
      title="更新进度" 
      @ok="confirmUpdateProgress"
      @cancel="resetProgressForm"
    >
      <div v-if="selectedGoal" class="progress-update-form">
        <div class="current-progress">
          <h4>当前进度</h4>
          <div class="progress-display">
            <span class="current-value">{{ selectedGoal.current }}</span>
            <span class="separator">/</span>
            <span class="target-value">{{ selectedGoal.target }}</span>
            <span class="unit">{{ selectedGoal.unit }}</span>
          </div>
          <a-progress 
            :percent="Math.round(selectedGoal.current / selectedGoal.target * 100)" 
            :stroke-color="getProgressColor(selectedGoal.current / selectedGoal.target)"
          />
        </div>
        
        <a-form layout="vertical">
          <a-form-item label="增加进度">
            <a-input-number 
              v-model:value="progressForm.increment" 
              :min="1" 
              :max="selectedGoal.target - selectedGoal.current"
              style="width: 100%"
              placeholder="请输入要增加的数值"
            />
          </a-form-item>
          
          <a-form-item label="备注（可选）">
            <a-textarea 
              v-model:value="progressForm.note" 
              placeholder="记录这次进度更新的详情..."
              :rows="3"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 目标详情弹窗 -->
    <a-modal 
      v-model:open="showGoalDetails" 
      title="目标详情" 
      :footer="null"
      width="800px"
    >
      <div v-if="selectedGoal" class="goal-details">
        <div class="details-header">
          <h2>{{ selectedGoal.title }}</h2>
          <div class="goal-type-badge" :style="getGoalTypeBadgeStyle(selectedGoal.type)">
            {{ getGoalTypeText(selectedGoal.type) }}
          </div>
        </div>
        
        <p class="details-description">{{ selectedGoal.description }}</p>
        
        <div class="details-progress">
          <h3>进度概览</h3>
          <div class="progress-chart">
            <div class="progress-circle">
              <a-progress 
                type="circle" 
                :percent="Math.round(selectedGoal.current / selectedGoal.target * 100)"
                :stroke-color="getProgressColor(selectedGoal.current / selectedGoal.target)"
                :width="120"
              />
            </div>
            <div class="progress-stats">
              <div class="stat-item">
                <span class="stat-label">当前进度</span>
                <span class="stat-value">{{ selectedGoal.current }} {{ selectedGoal.unit }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">目标数值</span>
                <span class="stat-value">{{ selectedGoal.target }} {{ selectedGoal.unit }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">剩余数量</span>
                <span class="stat-value">{{ selectedGoal.target - selectedGoal.current }} {{ selectedGoal.unit }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">截止日期</span>
                <span class="stat-value">{{ formatDate(selectedGoal.deadline) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="details-timeline" v-if="selectedGoal.progressHistory">
          <h3>进度历史</h3>
          <a-timeline>
            <a-timeline-item 
              v-for="record in selectedGoal.progressHistory" 
              :key="record.id"
              :color="record.type === 'milestone' ? 'green' : 'blue'"
            >
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-date">{{ formatDateTime(record.date) }}</span>
                  <span class="timeline-value">+{{ record.increment }} {{ selectedGoal.unit }}</span>
                </div>
                <p class="timeline-note" v-if="record.note">{{ record.note }}</p>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import {
  Target,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Grid,
  List,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Calendar,
  Eye,
  AlertTriangle,
  Minus
} from 'lucide-vue-next'

// 响应式数据
const showAddGoal = ref(false)
const showUpdateProgress = ref(false)
const showGoalDetails = ref(false)
const editingGoal = ref<any>(null)
const selectedGoal = ref<any>(null)
const viewMode = ref('grid')
const filterType = ref('')
const filterStatus = ref('')
const sortBy = ref('deadline')

// 目标表单
const goalForm = reactive({
  title: '',
  description: '',
  type: '',
  target: 1,
  unit: '',
  current: 0,
  deadline: null as Dayjs | null,
  priority: 'medium'
})

// 进度更新表单
const progressForm = reactive({
  increment: 1,
  note: ''
})

// 表单验证规则
const goalFormRules = {
  title: [{ required: true, message: '请输入目标标题' }],
  type: [{ required: true, message: '请选择目标类型' }],
  target: [{ required: true, message: '请输入目标数值' }],
  unit: [{ required: true, message: '请选择单位' }],
  deadline: [{ required: true, message: '请选择截止日期' }]
}

// 学习目标数据
const learningGoals = ref([
  {
    id: 1,
    title: '每日学习30分钟',
    description: '坚持每天学习英语30分钟，培养良好的学习习惯',
    type: 'daily',
    current: 25,
    target: 30,
    unit: '分钟',
    deadline: '2024-01-31',
    priority: 'high',
    createdAt: '2024-01-01',
    progressHistory: [
      { id: 1, date: '2024-01-20', increment: 5, note: '完成单词学习' },
      { id: 2, date: '2024-01-19', increment: 10, note: '听力练习' },
      { id: 3, date: '2024-01-18', increment: 10, note: '语法学习' }
    ]
  },
  {
    id: 2,
    title: '本月完成100个单词',
    description: '学习并掌握100个新单词，扩大词汇量',
    type: 'monthly',
    current: 68,
    target: 100,
    unit: '个',
    deadline: '2024-01-31',
    priority: 'medium',
    createdAt: '2024-01-01',
    progressHistory: [
      { id: 1, date: '2024-01-20', increment: 8, note: '学习动物类单词' },
      { id: 2, date: '2024-01-18', increment: 12, note: '学习颜色类单词' }
    ]
  },
  {
    id: 3,
    title: '每周练习口语5次',
    description: '每周至少进行5次口语练习，提高口语表达能力',
    type: 'weekly',
    current: 3,
    target: 5,
    unit: '次',
    deadline: '2024-01-28',
    priority: 'high',
    createdAt: '2024-01-22',
    progressHistory: [
      { id: 1, date: '2024-01-25', increment: 1, note: '跟读练习' },
      { id: 2, date: '2024-01-24', increment: 1, note: '对话练习' },
      { id: 3, date: '2024-01-23', increment: 1, note: '发音练习' }
    ]
  },
  {
    id: 4,
    title: '完成阅读理解20篇',
    description: '通过阅读理解练习提高英语阅读能力',
    type: 'monthly',
    current: 20,
    target: 20,
    unit: '篇',
    deadline: '2024-01-25',
    priority: 'low',
    createdAt: '2024-01-01',
    progressHistory: [
      { id: 1, date: '2024-01-25', increment: 2, note: '完成最后两篇阅读', type: 'milestone' }
    ]
  },
  {
    id: 5,
    title: '学习语法规则15个',
    description: '系统学习英语语法规则，打好语法基础',
    type: 'monthly',
    current: 8,
    target: 15,
    unit: '个',
    deadline: '2024-01-20',
    priority: 'medium',
    createdAt: '2024-01-01',
    progressHistory: []
  }
])

// 计算属性
const totalGoals = computed(() => learningGoals.value.length)

const completedGoals = computed(() => 
  learningGoals.value.filter(goal => goal.current >= goal.target).length
)

const inProgressGoals = computed(() => 
  learningGoals.value.filter(goal => 
    goal.current < goal.target && !isOverdue(goal)
  ).length
)

const overdueGoals = computed(() => 
  learningGoals.value.filter(goal => 
    goal.current < goal.target && isOverdue(goal)
  ).length
)

const filteredGoals = computed(() => {
  let filtered = [...learningGoals.value]
  
  // 类型筛选
  if (filterType.value) {
    filtered = filtered.filter(goal => goal.type === filterType.value)
  }
  
  // 状态筛选
  if (filterStatus.value) {
    filtered = filtered.filter(goal => {
      switch (filterStatus.value) {
        case 'active':
          return goal.current < goal.target && !isOverdue(goal)
        case 'completed':
          return goal.current >= goal.target
        case 'overdue':
          return goal.current < goal.target && isOverdue(goal)
        default:
          return true
      }
    })
  }
  
  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      case 'progress':
        return (b.current / b.target) - (a.current / a.target)
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })
  
  return filtered
})

// 方法
const isOverdue = (goal: any) => {
  return dayjs().isAfter(dayjs(goal.deadline)) && goal.current < goal.target
}

const getGoalCardClass = (goal: any) => {
  if (goal.current >= goal.target) return 'completed'
  if (isOverdue(goal)) return 'overdue'
  return 'active'
}

const getGoalTypeBadgeStyle = (type: string) => {
  const styles = {
    daily: { background: '#e6f7ff', color: '#1890ff' },
    weekly: { background: '#f6ffed', color: '#52c41a' },
    monthly: { background: '#fff7e6', color: '#fa8c16' }
  }
  return styles[type as keyof typeof styles] || styles.daily
}

const getGoalTypeText = (type: string) => {
  const texts = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月'
  }
  return texts[type as keyof typeof texts] || '未知'
}

const getProgressColor = (ratio: number) => {
  if (ratio >= 1) return '#52c41a'
  if (ratio >= 0.8) return '#1890ff'
  if (ratio >= 0.6) return '#fa8c16'
  return '#f5222d'
}

const getGoalStatusClass = (goal: any) => {
  if (goal.current >= goal.target) return 'status-completed'
  if (isOverdue(goal)) return 'status-overdue'
  return 'status-active'
}

const getGoalStatusText = (goal: any) => {
  if (goal.current >= goal.target) return '已完成'
  if (isOverdue(goal)) return '已逾期'
  return '进行中'
}

const formatDate = (date: string) => {
  return dayjs(date).format('MM月DD日')
}

const formatDateTime = (date: string) => {
  return dayjs(date).format('MM月DD日 HH:mm')
}

const disabledDate = (current: Dayjs) => {
  return current && current < dayjs().startOf('day')
}

const filterGoals = () => {
  // 筛选逻辑已在计算属性中实现
}

const sortGoals = () => {
  // 排序逻辑已在计算属性中实现
}

const saveGoal = () => {
  if (!goalForm.title || !goalForm.type || !goalForm.target || !goalForm.unit || !goalForm.deadline) {
    message.error('请填写完整的目标信息')
    return
  }

  if (editingGoal.value) {
    // 编辑现有目标
    const index = learningGoals.value.findIndex(goal => goal.id === editingGoal.value.id)
    if (index > -1) {
      learningGoals.value[index] = {
        ...learningGoals.value[index],
        title: goalForm.title,
        description: goalForm.description,
        type: goalForm.type,
        target: goalForm.target,
        unit: goalForm.unit,
        current: goalForm.current,
        deadline: goalForm.deadline.format('YYYY-MM-DD'),
        priority: goalForm.priority
      }
      message.success('目标更新成功!')
    }
  } else {
    // 添加新目标
    const newGoal = {
      id: Date.now(),
      title: goalForm.title,
      description: goalForm.description,
      type: goalForm.type,
      current: goalForm.current,
      target: goalForm.target,
      unit: goalForm.unit,
      deadline: goalForm.deadline.format('YYYY-MM-DD'),
      priority: goalForm.priority,
      createdAt: dayjs().format('YYYY-MM-DD'),
      progressHistory: []
    }
    learningGoals.value.push(newGoal)
    message.success('学习目标添加成功!')
  }

  showAddGoal.value = false
  resetGoalForm()
}

const editGoal = (goal: any) => {
  editingGoal.value = goal
  Object.assign(goalForm, {
    title: goal.title,
    description: goal.description,
    type: goal.type,
    target: goal.target,
    unit: goal.unit,
    current: goal.current,
    deadline: dayjs(goal.deadline),
    priority: goal.priority
  })
  showAddGoal.value = true
}

const duplicateGoal = (goal: any) => {
  const newGoal = {
    ...goal,
    id: Date.now(),
    title: goal.title + ' (副本)',
    current: 0,
    createdAt: dayjs().format('YYYY-MM-DD'),
    progressHistory: []
  }
  learningGoals.value.push(newGoal)
  message.success('目标复制成功!')
}

const deleteGoal = (goalId: number) => {
  const index = learningGoals.value.findIndex(goal => goal.id === goalId)
  if (index > -1) {
    learningGoals.value.splice(index, 1)
    message.success('目标删除成功!')
  }
}

const updateProgress = (goal: any) => {
  selectedGoal.value = goal
  progressForm.increment = 1
  progressForm.note = ''
  showUpdateProgress.value = true
}

const confirmUpdateProgress = () => {
  if (!selectedGoal.value || !progressForm.increment) {
    message.error('请输入有效的进度数值')
    return
  }

  const goal = selectedGoal.value
  const newCurrent = Math.min(goal.current + progressForm.increment, goal.target)
  
  // 更新目标进度
  goal.current = newCurrent
  
  // 添加进度历史记录
  if (!goal.progressHistory) {
    goal.progressHistory = []
  }
  
  goal.progressHistory.unshift({
    id: Date.now(),
    date: dayjs().format('YYYY-MM-DD HH:mm'),
    increment: progressForm.increment,
    note: progressForm.note,
    type: newCurrent >= goal.target ? 'milestone' : 'normal'
  })

  showUpdateProgress.value = false
  resetProgressForm()
  
  if (newCurrent >= goal.target) {
    message.success('🎉 恭喜！目标已完成！')
  } else {
    message.success('进度更新成功!')
  }
}

const viewGoalDetails = (goal: any) => {
  selectedGoal.value = goal
  showGoalDetails.value = true
}

const resetGoalForm = () => {
  editingGoal.value = null
  Object.assign(goalForm, {
    title: '',
    description: '',
    type: '',
    target: 1,
    unit: '',
    current: 0,
    deadline: null,
    priority: 'medium'
  })
}

const resetProgressForm = () => {
  progressForm.increment = 1
  progressForm.note = ''
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="less" scoped>
.goals-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;

  .page-header {
    background: white;
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-content {
      .page-title {
        display: flex;
        align-items: center;
        font-size: 28px;
        font-weight: 600;
        color: #262626;
        margin-bottom: 8px;
      }

      .page-description {
        font-size: 16px;
        color: #8c8c8c;
        margin: 0;
      }
    }

    .header-actions {
      flex-shrink: 0;
    }
  }

  .goals-overview {
    margin-bottom: 24px;

    .overview-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;

      .card-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
      }

      .card-content {
        .card-value {
          font-size: 24px;
          font-weight: 600;
          color: #262626;
          margin-bottom: 4px;
        }

        .card-label {
          font-size: 14px;
          color: #8c8c8c;
        }
      }
    }
  }

  .goals-filters {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .filter-section {
      flex: 1;
    }

    .view-toggle {
      flex-shrink: 0;
    }
  }

  .goals-container {
    .goals-grid {
      .goal-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        border-left: 4px solid #d9d9d9;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        &.active {
          border-left-color: #1890ff;
        }

        &.completed {
          border-left-color: #52c41a;
        }

        &.overdue {
          border-left-color: #f5222d;
        }

        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .goal-type-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;

            &.small {
              padding: 2px 6px;
              font-size: 10px;
            }
          }
        }

        .goal-content {
          margin-bottom: 20px;

          .goal-title {
            font-size: 16px;
            font-weight: 600;
            color: #262626;
            margin-bottom: 8px;
          }

          .goal-description {
            font-size: 14px;
            color: #8c8c8c;
            margin-bottom: 16px;
            line-height: 1.5;
          }

          .goal-progress {
            margin-bottom: 16px;

            .progress-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              .progress-text {
                font-size: 14px;
                color: #595959;
              }

              .progress-percentage {
                font-size: 14px;
                font-weight: 600;
                color: #1890ff;
              }
            }
          }

          .goal-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;

            .goal-deadline {
              display: flex;
              align-items: center;
              color: #8c8c8c;
            }

            .goal-status {
              padding: 2px 8px;
              border-radius: 4px;
              font-weight: 500;

              &.status-active {
                background: #e6f7ff;
                color: #1890ff;
              }

              &.status-completed {
                background: #f6ffed;
                color: #52c41a;
              }

              &.status-overdue {
                background: #fff1f0;
                color: #f5222d;
              }
            }
          }
        }

        .goal-actions {
          display: flex;
          gap: 8px;
        }
      }
    }

    .goals-list {
      .goal-list-item {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

        .goal-list-content {
          .goal-list-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;

            .goal-list-title {
              display: flex;
              align-items: center;
              gap: 12px;

              h3 {
                font-size: 16px;
                font-weight: 600;
                color: #262626;
                margin: 0;
              }
            }

            .goal-list-actions {
              display: flex;
              gap: 8px;
            }
          }

          .goal-list-description {
            font-size: 14px;
            color: #8c8c8c;
            margin-bottom: 16px;
            line-height: 1.5;
          }

          .goal-list-progress {
            margin-bottom: 12px;

            .progress-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              .progress-text {
                font-size: 14px;
                color: #595959;
              }

              .progress-percentage {
                font-size: 14px;
                font-weight: 600;
                color: #1890ff;
              }
            }
          }

          .goal-list-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;

            .goal-deadline {
              display: flex;
              align-items: center;
              color: #8c8c8c;
            }

            .goal-status {
              padding: 2px 8px;
              border-radius: 4px;
              font-weight: 500;

              &.status-active {
                background: #e6f7ff;
                color: #1890ff;
              }

              &.status-completed {
                background: #f6ffed;
                color: #52c41a;
              }

              &.status-overdue {
                background: #fff1f0;
                color: #f5222d;
              }
            }
          }
        }
      }
    }
  }

  .empty-state {
    background: white;
    border-radius: 12px;
    padding: 60px 40px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    .empty-icon {
      color: #d9d9d9;
      margin-bottom: 16px;
    }

    .empty-title {
      font-size: 18px;
      font-weight: 500;
      color: #595959;
      margin-bottom: 8px;
    }

    .empty-description {
      font-size: 14px;
      color: #8c8c8c;
      margin-bottom: 24px;
    }
  }

  .progress-update-form {
    .current-progress {
      margin-bottom: 24px;

      h4 {
        font-size: 14px;
        font-weight: 500;
        color: #262626;
        margin-bottom: 12px;
      }

      .progress-display {
        display: flex;
        align-items: baseline;
        justify-content: center;
        margin-bottom: 16px;
        font-size: 24px;

        .current-value {
          font-weight: 600;
          color: #1890ff;
        }

        .separator {
          margin: 0 8px;
          color: #d9d9d9;
        }

        .target-value {
          font-weight: 600;
          color: #262626;
        }

        .unit {
          font-size: 16px;
          color: #8c8c8c;
          margin-left: 4px;
        }
      }
    }
  }

  .goal-details {
    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h2 {
        font-size: 20px;
        font-weight: 600;
        color: #262626;
        margin: 0;
      }
    }

    .details-description {
      font-size: 14px;
      color: #8c8c8c;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .details-progress {
      margin-bottom: 32px;

      h3 {
        font-size: 16px;
        font-weight: 500;
        color: #262626;
        margin-bottom: 16px;
      }

      .progress-chart {
        display: flex;
        align-items: center;
        gap: 32px;

        .progress-circle {
          flex-shrink: 0;
        }

        .progress-stats {
          flex: 1;

          .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
              border-bottom: none;
            }

            .stat-label {
              font-size: 14px;
              color: #8c8c8c;
            }

            .stat-value {
              font-size: 14px;
              font-weight: 500;
              color: #262626;
            }
          }
        }
      }
    }

    .details-timeline {
      h3 {
        font-size: 16px;
        font-weight: 500;
        color: #262626;
        margin-bottom: 16px;
      }

      .timeline-content {
        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;

          .timeline-date {
            font-size: 12px;
            color: #8c8c8c;
          }

          .timeline-value {
            font-size: 12px;
            font-weight: 500;
            color: #1890ff;
          }
        }

        .timeline-note {
          font-size: 14px;
          color: #595959;
          margin: 0;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .goals-page {
    padding: 16px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      padding: 24px 16px;
    }

    .goals-filters {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
    }

    .goal-details {
      .progress-chart {
        flex-direction: column;
        gap: 16px;
      }
    }
  }
}
</style>