<template>
  <div class="profile-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <User class="w-6 h-6 mr-3" />
          个人资料
        </h1>
        <p class="page-description">管理您的个人信息和学习偏好设置</p>
      </div>
    </div>

    <div class="profile-content">
      <a-row :gutter="24">
        <!-- 左侧个人信息 -->
        <a-col :xs="24" :lg="8">
          <div class="profile-card">
            <div class="profile-header">
              <div class="avatar-section">
                <a-avatar 
                  :size="120" 
                  :src="userProfile.avatar" 
                  class="profile-avatar"
                >
                  <template #icon>
                    <User class="w-12 h-12" />
                  </template>
                </a-avatar>
                <a-upload
                  :show-upload-list="false"
                  :before-upload="beforeAvatarUpload"
                  @change="handleAvatarChange"
                  accept="image/*"
                >
                  <a-button type="link" class="avatar-upload-btn">
                    <Camera class="w-4 h-4 mr-1" />
                    更换头像
                  </a-button>
                </a-upload>
              </div>
              
              <div class="profile-info">
                <h2 class="username">{{ userProfile.username }}</h2>
                <p class="user-level">
                  <Crown class="w-4 h-4 mr-1" />
                  {{ userProfile.level }} 级学员
                </p>
                <div class="user-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ userProfile.totalStudyDays }}</span>
                    <span class="stat-label">学习天数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ userProfile.totalPoints }}</span>
                    <span class="stat-label">总积分</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ userProfile.achievements }}</span>
                    <span class="stat-label">成就数</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 学习进度概览 -->
            <div class="progress-overview">
              <h3 class="section-title">
                <TrendingUp class="w-4 h-4 mr-2" />
                学习进度
              </h3>
              <div class="progress-items">
                <div class="progress-item" v-for="skill in skillProgress" :key="skill.name">
                  <div class="progress-header">
                    <span class="skill-name">{{ skill.name }}</span>
                    <span class="skill-percentage">{{ skill.progress }}%</span>
                  </div>
                  <a-progress 
                    :percent="skill.progress" 
                    :stroke-color="getSkillColor(skill.progress)"
                    :show-info="false"
                    size="small"
                  />
                </div>
              </div>
            </div>

            <!-- 最近成就 -->
            <div class="recent-achievements">
              <h3 class="section-title">
                <Trophy class="w-4 h-4 mr-2" />
                最近成就
              </h3>
              <div class="achievement-list">
                <div 
                  class="achievement-item" 
                  v-for="achievement in recentAchievements" 
                  :key="achievement.id"
                >
                  <div class="achievement-icon" :style="{ backgroundColor: achievement.color + '20', color: achievement.color }">
                    <component :is="achievement.icon" class="w-4 h-4" />
                  </div>
                  <div class="achievement-content">
                    <div class="achievement-title">{{ achievement.title }}</div>
                    <div class="achievement-date">{{ achievement.date }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-col>

        <!-- 右侧设置区域 -->
        <a-col :xs="24" :lg="16">
          <div class="settings-container">
            <a-tabs v-model:activeKey="activeTab" type="card">
              <!-- 基本信息 -->
              <a-tab-pane key="basic" tab="基本信息">
                <div class="settings-section">
                  <a-form 
                    :model="basicForm" 
                    layout="vertical"
                    @finish="updateBasicInfo"
                  >
                    <a-row :gutter="16">
                      <a-col :span="12">
                        <a-form-item label="用户名" name="username">
                          <a-input 
                            v-model:value="basicForm.username" 
                            placeholder="请输入用户名"
                            :prefix="User"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="昵称" name="nickname">
                          <a-input 
                            v-model:value="basicForm.nickname" 
                            placeholder="请输入昵称"
                          />
                        </a-form-item>
                      </a-col>
                    </a-row>

                    <a-row :gutter="16">
                      <a-col :span="12">
                        <a-form-item label="年龄" name="age">
                          <a-input-number 
                            v-model:value="basicForm.age" 
                            :min="6" 
                            :max="18" 
                            placeholder="请输入年龄"
                            style="width: 100%"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="年级" name="grade">
                          <a-select v-model:value="basicForm.grade" placeholder="请选择年级">
                            <a-select-option value="1">一年级</a-select-option>
                            <a-select-option value="2">二年级</a-select-option>
                            <a-select-option value="3">三年级</a-select-option>
                            <a-select-option value="4">四年级</a-select-option>
                            <a-select-option value="5">五年级</a-select-option>
                            <a-select-option value="6">六年级</a-select-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                    </a-row>

                    <a-form-item label="学校" name="school">
                      <a-input 
                        v-model:value="basicForm.school" 
                        placeholder="请输入学校名称"
                        :prefix="GraduationCap"
                      />
                    </a-form-item>

                    <a-form-item label="个人简介" name="bio">
                      <a-textarea 
                        v-model:value="basicForm.bio" 
                        placeholder="介绍一下自己吧..."
                        :rows="4"
                        :maxlength="200"
                        show-count
                      />
                    </a-form-item>

                    <a-form-item>
                      <a-button type="primary" html-type="submit" :loading="saving">
                        <Save class="w-4 h-4 mr-1" />
                        保存信息
                      </a-button>
                    </a-form-item>
                  </a-form>
                </div>
              </a-tab-pane>

              <!-- 学习偏好 -->
              <a-tab-pane key="preferences" tab="学习偏好">
                <div class="settings-section">
                  <h3 class="section-title">
                    <Settings class="w-4 h-4 mr-2" />
                    学习设置
                  </h3>
                  
                  <div class="preference-group">
                    <h4 class="group-title">学习目标</h4>
                    <a-form layout="vertical">
                      <a-row :gutter="16">
                        <a-col :span="12">
                          <a-form-item label="每日学习时长目标（分钟）">
                            <a-slider 
                              v-model:value="preferences.dailyTimeGoal" 
                              :min="10" 
                              :max="120" 
                              :marks="{ 10: '10分钟', 30: '30分钟', 60: '1小时', 120: '2小时' }"
                            />
                          </a-form-item>
                        </a-col>
                        <a-col :span="12">
                          <a-form-item label="每周学习天数目标">
                            <a-slider 
                              v-model:value="preferences.weeklyDaysGoal" 
                              :min="1" 
                              :max="7" 
                              :marks="{ 1: '1天', 3: '3天', 5: '5天', 7: '每天' }"
                            />
                          </a-form-item>
                        </a-col>
                      </a-row>
                    </a-form>
                  </div>

                  <div class="preference-group">
                    <h4 class="group-title">学习重点</h4>
                    <div class="skill-preferences">
                      <div 
                        class="skill-preference-item" 
                        v-for="skill in skillPreferences" 
                        :key="skill.name"
                      >
                        <div class="skill-info">
                          <span class="skill-name">{{ skill.name }}</span>
                          <span class="skill-description">{{ skill.description }}</span>
                        </div>
                        <a-switch 
                          v-model:checked="skill.enabled" 
                          :checked-children="skill.name" 
                          :un-checked-children="skill.name"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="preference-group">
                    <h4 class="group-title">难度设置</h4>
                    <a-radio-group v-model:value="preferences.difficulty" button-style="solid">
                      <a-radio-button value="easy">
                        <Smile class="w-4 h-4 mr-1" />
                        简单
                      </a-radio-button>
                      <a-radio-button value="medium">
                        <Meh class="w-4 h-4 mr-1" />
                        中等
                      </a-radio-button>
                      <a-radio-button value="hard">
                        <Frown class="w-4 h-4 mr-1" />
                        困难
                      </a-radio-button>
                    </a-radio-group>
                  </div>

                  <div class="preference-group">
                    <h4 class="group-title">学习提醒</h4>
                    <div class="reminder-settings">
                      <div class="reminder-item">
                        <div class="reminder-info">
                          <span class="reminder-title">每日学习提醒</span>
                          <span class="reminder-description">在设定时间提醒您开始学习</span>
                        </div>
                        <a-switch v-model:checked="preferences.dailyReminder" />
                      </div>
                      
                      <div class="reminder-item" v-if="preferences.dailyReminder">
                        <div class="reminder-info">
                          <span class="reminder-title">提醒时间</span>
                        </div>
                        <a-time-picker 
                          v-model:value="preferences.reminderTime" 
                          format="HH:mm"
                          placeholder="选择时间"
                        />
                      </div>

                      <div class="reminder-item">
                        <div class="reminder-info">
                          <span class="reminder-title">成就通知</span>
                          <span class="reminder-description">获得新成就时通知您</span>
                        </div>
                        <a-switch v-model:checked="preferences.achievementNotification" />
                      </div>

                      <div class="reminder-item">
                        <div class="reminder-info">
                          <span class="reminder-title">进度报告</span>
                          <span class="reminder-description">每周发送学习进度报告</span>
                        </div>
                        <a-switch v-model:checked="preferences.weeklyReport" />
                      </div>
                    </div>
                  </div>

                  <div class="preference-actions">
                    <a-button type="primary" @click="savePreferences" :loading="saving">
                      <Save class="w-4 h-4 mr-1" />
                      保存设置
                    </a-button>
                    <a-button @click="resetPreferences">
                      <RotateCcw class="w-4 h-4 mr-1" />
                      重置默认
                    </a-button>
                  </div>
                </div>
              </a-tab-pane>

              <!-- 学习目标 -->
              <a-tab-pane key="goals" tab="学习目标">
                <div class="settings-section">
                  <div class="goals-header">
                    <h3 class="section-title">
                      <Target class="w-4 h-4 mr-2" />
                      我的学习目标
                    </h3>
                    <a-button type="primary" @click="showAddGoal = true">
                      <Plus class="w-4 h-4 mr-1" />
                      添加目标
                    </a-button>
                  </div>

                  <div class="goals-list">
                    <div class="goal-item" v-for="goal in learningGoals" :key="goal.id">
                      <div class="goal-header">
                        <div class="goal-info">
                          <h4 class="goal-title">{{ goal.title }}</h4>
                          <p class="goal-description">{{ goal.description }}</p>
                        </div>
                        <div class="goal-actions">
                          <a-button size="small" @click="editGoal(goal)">
                            <Edit class="w-3 h-3" />
                          </a-button>
                          <a-button size="small" danger @click="deleteGoal(goal.id)">
                            <Trash2 class="w-3 h-3" />
                          </a-button>
                        </div>
                      </div>
                      
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
                          :stroke-color="getGoalColor(goal.current / goal.target)"
                          :show-info="false"
                        />
                      </div>
                      
                      <div class="goal-meta">
                        <span class="goal-type">{{ getGoalTypeText(goal.type) }}</span>
                        <span class="goal-deadline">截止: {{ goal.deadline }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>

              <!-- 隐私设置 -->
              <a-tab-pane key="privacy" tab="隐私设置">
                <div class="settings-section">
                  <h3 class="section-title">
                    <Shield class="w-4 h-4 mr-2" />
                    隐私与安全
                  </h3>
                  
                  <div class="privacy-group">
                    <h4 class="group-title">个人信息可见性</h4>
                    <div class="privacy-item">
                      <div class="privacy-info">
                        <span class="privacy-title">显示真实姓名</span>
                        <span class="privacy-description">其他用户可以看到您的真实姓名</span>
                      </div>
                      <a-switch v-model:checked="privacy.showRealName" />
                    </div>
                    
                    <div class="privacy-item">
                      <div class="privacy-info">
                        <span class="privacy-title">显示学习进度</span>
                        <span class="privacy-description">其他用户可以看到您的学习进度</span>
                      </div>
                      <a-switch v-model:checked="privacy.showProgress" />
                    </div>
                    
                    <div class="privacy-item">
                      <div class="privacy-info">
                        <span class="privacy-title">显示成就徽章</span>
                        <span class="privacy-description">在个人资料中显示获得的成就</span>
                      </div>
                      <a-switch v-model:checked="privacy.showAchievements" />
                    </div>
                  </div>

                  <div class="privacy-group">
                    <h4 class="group-title">数据管理</h4>
                    <div class="data-actions">
                      <a-button @click="exportData">
                        <Download class="w-4 h-4 mr-1" />
                        导出我的数据
                      </a-button>
                      <a-button danger @click="showDeleteAccount = true">
                        <AlertTriangle class="w-4 h-4 mr-1" />
                        删除账户
                      </a-button>
                    </div>
                  </div>

                  <div class="privacy-actions">
                    <a-button type="primary" @click="savePrivacySettings" :loading="saving">
                      <Save class="w-4 h-4 mr-1" />
                      保存设置
                    </a-button>
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 添加目标弹窗 -->
    <a-modal 
      v-model:open="showAddGoal" 
      title="添加学习目标" 
      @ok="addGoal"
      @cancel="resetGoalForm"
    >
      <a-form :model="goalForm" layout="vertical">
        <a-form-item label="目标标题" required>
          <a-input v-model:value="goalForm.title" placeholder="请输入目标标题" />
        </a-form-item>
        
        <a-form-item label="目标描述">
          <a-textarea v-model:value="goalForm.description" placeholder="描述您的学习目标" :rows="3" />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="目标类型" required>
              <a-select v-model:value="goalForm.type" placeholder="选择目标类型">
                <a-select-option value="daily">每日目标</a-select-option>
                <a-select-option value="weekly">每周目标</a-select-option>
                <a-select-option value="monthly">每月目标</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="截止日期" required>
              <a-date-picker v-model:value="goalForm.deadline" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="目标数值" required>
              <a-input-number v-model:value="goalForm.target" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="单位" required>
              <a-select v-model:value="goalForm.unit" placeholder="选择单位">
                <a-select-option value="分钟">分钟</a-select-option>
                <a-select-option value="小时">小时</a-select-option>
                <a-select-option value="天">天</a-select-option>
                <a-select-option value="次">次</a-select-option>
                <a-select-option value="个">个</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 删除账户确认弹窗 -->
    <a-modal 
      v-model:open="showDeleteAccount" 
      title="删除账户" 
      @ok="deleteAccount"
      ok-text="确认删除"
      ok-type="danger"
    >
      <div class="delete-warning">
        <AlertTriangle class="w-6 h-6 text-red-500 mb-4" />
        <p class="warning-text">
          <strong>警告：</strong>删除账户将永久删除您的所有学习数据，包括：
        </p>
        <ul class="warning-list">
          <li>学习进度和成绩记录</li>
          <li>获得的成就和徽章</li>
          <li>个人设置和偏好</li>
          <li>学习目标和计划</li>
        </ul>
        <p class="warning-text">此操作不可撤销，请谨慎操作。</p>
      </div>
    </a-modal>

    <!-- 奖励动画组件 -->
    <RewardAnimation
      ref="rewardAnimationRef"
      :score-gain="rewardPoints"
      :bonus="bonusPoints"
      :streak-count="streakCount"
      :earned-badge="earnedBadge"
      :old-level="oldLevel"
      :new-level="newLevel"
      :is-perfect="isPerfect"
      @animation-complete="onRewardAnimationComplete"
    />

    <!-- 音效组件 -->
    <SoundEffects
      ref="soundEffectsRef"
      :enabled="soundEnabled"
      :volume="soundVolume"
    />

    <!-- 浮动元素 -->
    <FloatingElements
      :show-bubbles="false"
      :show-stars="true"
      :show-hearts="false"
      :show-rainbows="false"
      :show-clouds="false"
      :show-flowers="false"
      :show-notes="false"
      :show-gifts="true"
      :count="5"
      :duration="20000"
      :intensity="0.2"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import dayjs, { Dayjs } from 'dayjs'
import { storage } from '@/utils/storage'
import RewardAnimation from '@/components/RewardAnimation.vue'
import SoundEffects from '@/components/animations/SoundEffects.vue'
import FloatingElements from '@/components/animations/FloatingElements.vue'
import {
  User,
  Camera,
  Crown,
  TrendingUp,
  Trophy,
  Settings,
  Save,
  RotateCcw,
  Target,
  Plus,
  Edit,
  Trash2,
  Shield,
  Download,
  AlertTriangle,
  GraduationCap,
  Smile,
  Meh,
  Frown
} from 'lucide-vue-next'

const router = useRouter()

// 响应式数据
const activeTab = ref('basic')
const saving = ref(false)
const showAddGoal = ref(false)
const showDeleteAccount = ref(false)

// 动画和音效相关数据
const rewardAnimationRef = ref()
const soundEffectsRef = ref()
const rewardPoints = ref(0)
const bonusPoints = ref(0)
const streakCount = ref(0)
const earnedBadge = ref(null)
const oldLevel = ref(1)
const newLevel = ref(1)
const isPerfect = ref(false)
const soundEnabled = ref(true)
const soundVolume = ref(0.7)

// 用户资料数据
const userProfile = reactive({
  username: '小明同学',
  avatar: '',
  level: 5,
  totalStudyDays: 128,
  totalPoints: 2580,
  achievements: 15
})

// 基本信息表单
const basicForm = reactive({
  username: '小明同学',
  nickname: '爱学习的小明',
  age: 10,
  grade: '4',
  school: '阳光小学',
  bio: '我是一个爱学习英语的小学生，希望能够说一口流利的英语！'
})

// 学习偏好设置
const preferences = reactive({
  dailyTimeGoal: 30,
  weeklyDaysGoal: 5,
  difficulty: 'medium',
  dailyReminder: true,
  reminderTime: dayjs('18:00', 'HH:mm'),
  achievementNotification: true,
  weeklyReport: true
})

// 隐私设置
const privacy = reactive({
  showRealName: false,
  showProgress: true,
  showAchievements: true
})

// 技能进度
const skillProgress = ref([
  { name: '听力', progress: 75 },
  { name: '口语', progress: 68 },
  { name: '阅读', progress: 82 },
  { name: '写作', progress: 71 },
  { name: '词汇', progress: 88 },
  { name: '语法', progress: 79 }
])

// 技能偏好设置
const skillPreferences = ref([
  { name: '听力', description: '提高英语听力理解能力', enabled: true },
  { name: '口语', description: '练习英语口语表达', enabled: true },
  { name: '阅读', description: '增强英语阅读理解', enabled: true },
  { name: '写作', description: '提升英语写作水平', enabled: false },
  { name: '词汇', description: '扩大英语词汇量', enabled: true },
  { name: '语法', description: '掌握英语语法规则', enabled: false }
])

// 最近成就
const recentAchievements = ref([
  {
    id: 1,
    title: '连续学习7天',
    date: '2024-01-20',
    icon: Trophy,
    color: '#52c41a'
  },
  {
    id: 2,
    title: '词汇大师',
    date: '2024-01-18',
    icon: Crown,
    color: '#1890ff'
  },
  {
    id: 3,
    title: '听力达人',
    date: '2024-01-15',
    icon: TrendingUp,
    color: '#fa8c16'
  }
])

// 学习目标
const learningGoals = ref([
  {
    id: 1,
    title: '每日学习30分钟',
    description: '坚持每天学习英语30分钟',
    type: 'daily',
    current: 25,
    target: 30,
    unit: '分钟',
    deadline: '2024-01-31'
  },
  {
    id: 2,
    title: '本月完成100个单词',
    description: '学习并掌握100个新单词',
    type: 'monthly',
    current: 68,
    target: 100,
    unit: '个',
    deadline: '2024-01-31'
  },
  {
    id: 3,
    title: '每周练习口语5次',
    description: '每周至少进行5次口语练习',
    type: 'weekly',
    current: 3,
    target: 5,
    unit: '次',
    deadline: '2024-01-28'
  }
])

// 目标表单
const goalForm = reactive({
  title: '',
  description: '',
  type: '',
  target: 1,
  unit: '',
  deadline: null as Dayjs | null
})

// 计算属性
const getSkillColor = (progress: number) => {
  if (progress >= 80) return '#52c41a'
  if (progress >= 60) return '#1890ff'
  if (progress >= 40) return '#fa8c16'
  return '#f5222d'
}

const getGoalColor = (ratio: number) => {
  if (ratio >= 0.8) return '#52c41a'
  if (ratio >= 0.6) return '#1890ff'
  if (ratio >= 0.4) return '#fa8c16'
  return '#f5222d'
}

const getGoalTypeText = (type: string) => {
  switch (type) {
    case 'daily': return '每日目标'
    case 'weekly': return '每周目标'
    case 'monthly': return '每月目标'
    default: return '未知类型'
  }
}

// 动画和音效方法
const playSound = (soundType: string) => {
  if (soundEffectsRef.value && soundEnabled.value) {
    soundEffectsRef.value.playSound(soundType)
  }
}

const showRewardAnimation = (type: string, data: any = {}) => {
  if (rewardAnimationRef.value) {
    switch (type) {
      case 'points':
        rewardPoints.value = data.points || 0
        rewardAnimationRef.value.showScorePopup()
        break
      case 'streak':
        streakCount.value = data.count || 0
        rewardAnimationRef.value.showStreakPopup()
        break
      case 'badge':
        earnedBadge.value = data.badge || null
        rewardAnimationRef.value.showBadgeEarned()
        break
      case 'levelup':
        oldLevel.value = data.oldLevel || 1
        newLevel.value = data.newLevel || 1
        rewardAnimationRef.value.showLevelUp()
        break
    }
  }
}

const onRewardAnimationComplete = () => {
  rewardPoints.value = 0
  bonusPoints.value = 0
  streakCount.value = 0
  earnedBadge.value = null
  isPerfect.value = false
}

// 方法
const beforeAvatarUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarChange = (info: any) => {
  if (info.file.status === 'done') {
    // 这里应该处理上传成功后的逻辑
    userProfile.avatar = URL.createObjectURL(info.file.originFileObj)
    message.success('头像上传成功!')
  } else if (info.file.status === 'error') {
    message.error('头像上传失败!')
  }
}

const updateBasicInfo = () => {
  saving.value = true
  playSound('click')
  
  // 模拟API调用
  setTimeout(() => {
    Object.assign(userProfile, {
      username: basicForm.username
    })
    saving.value = false
    playSound('success')
    showRewardAnimation('points', { points: 10 })
    message.success('基本信息更新成功!')
  }, 1000)
}

const savePreferences = () => {
  saving.value = true
  // 模拟API调用
  setTimeout(() => {
    saving.value = false
    message.success('学习偏好保存成功!')
  }, 1000)
}

const resetPreferences = () => {
  Object.assign(preferences, {
    dailyTimeGoal: 30,
    weeklyDaysGoal: 5,
    difficulty: 'medium',
    dailyReminder: true,
    reminderTime: dayjs('18:00', 'HH:mm'),
    achievementNotification: true,
    weeklyReport: true
  })
  message.success('已重置为默认设置')
}

const addGoal = () => {
  if (!goalForm.title || !goalForm.type || !goalForm.target || !goalForm.unit || !goalForm.deadline) {
    playSound('error')
    message.error('请填写完整的目标信息')
    return
  }

  playSound('click')
  
  const newGoal = {
    id: Date.now(),
    title: goalForm.title,
    description: goalForm.description,
    type: goalForm.type,
    current: 0,
    target: goalForm.target,
    unit: goalForm.unit,
    deadline: goalForm.deadline.format('YYYY-MM-DD')
  }

  learningGoals.value.push(newGoal)
  showAddGoal.value = false
  resetGoalForm()
  
  playSound('success')
  showRewardAnimation('badge', { badge: { name: '目标设定者', icon: 'Target' } })
  message.success('学习目标添加成功!')
}

const editGoal = (goal: any) => {
  // 这里可以实现编辑目标的逻辑
  message.info('编辑功能开发中...')
}

const deleteGoal = (goalId: number) => {
  const index = learningGoals.value.findIndex(goal => goal.id === goalId)
  if (index > -1) {
    learningGoals.value.splice(index, 1)
    message.success('目标删除成功!')
  }
}

const resetGoalForm = () => {
  Object.assign(goalForm, {
    title: '',
    description: '',
    type: '',
    target: 1,
    unit: '',
    deadline: null
  })
}

const savePrivacySettings = () => {
  saving.value = true
  // 模拟API调用
  setTimeout(() => {
    saving.value = false
    message.success('隐私设置保存成功!')
  }, 1000)
}

const exportData = () => {
  // 模拟数据导出
  const data = {
    profile: userProfile,
    preferences: preferences,
    goals: learningGoals.value,
    exportTime: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `学习数据_${dayjs().format('YYYY-MM-DD')}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  message.success('数据导出成功!')
}

const deleteAccount = () => {
  // 这里应该实现删除账户的逻辑
  message.error('账户删除功能暂未开放')
  showDeleteAccount.value = false
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="less" scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;

  .page-header {
    background: white;
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    .header-content {
      text-align: center;

      .page-title {
        display: flex;
        align-items: center;
        justify-content: center;
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
  }

  .profile-content {
    .profile-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      margin-bottom: 24px;

      .profile-header {
        text-align: center;
        margin-bottom: 32px;

        .avatar-section {
          margin-bottom: 16px;

          .profile-avatar {
            border: 4px solid #f0f0f0;
            margin-bottom: 12px;
          }

          .avatar-upload-btn {
            padding: 0;
            height: auto;
            font-size: 14px;
          }
        }

        .profile-info {
          .username {
            font-size: 24px;
            font-weight: 600;
            color: #262626;
            margin-bottom: 8px;
          }

          .user-level {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: #1890ff;
            margin-bottom: 20px;
          }

          .user-stats {
            display: flex;
            justify-content: space-around;

            .stat-item {
              text-align: center;

              .stat-value {
                display: block;
                font-size: 20px;
                font-weight: 600;
                color: #262626;
                margin-bottom: 4px;
              }

              .stat-label {
                font-size: 12px;
                color: #8c8c8c;
              }
            }
          }
        }
      }

      .progress-overview,
      .recent-achievements {
        margin-bottom: 24px;

        .section-title {
          display: flex;
          align-items: center;
          font-size: 16px;
          font-weight: 600;
          color: #262626;
          margin-bottom: 16px;
        }
      }

      .progress-items {
        .progress-item {
          margin-bottom: 16px;

          .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .skill-name {
              font-size: 14px;
              color: #595959;
            }

            .skill-percentage {
              font-size: 12px;
              color: #8c8c8c;
            }
          }
        }
      }

      .achievement-list {
        .achievement-item {
          display: flex;
          align-items: center;
          padding: 12px;
          background: #fafafa;
          border-radius: 8px;
          margin-bottom: 8px;

          .achievement-icon {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
          }

          .achievement-content {
            .achievement-title {
              font-size: 14px;
              font-weight: 500;
              color: #262626;
              margin-bottom: 4px;
            }

            .achievement-date {
              font-size: 12px;
              color: #8c8c8c;
            }
          }
        }
      }
    }

    .settings-container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

      .settings-section {
        .section-title {
          display: flex;
          align-items: center;
          font-size: 18px;
          font-weight: 600;
          color: #262626;
          margin-bottom: 24px;
        }

        .preference-group {
          margin-bottom: 32px;

          .group-title {
            font-size: 16px;
            font-weight: 500;
            color: #262626;
            margin-bottom: 16px;
          }

          .skill-preferences {
            .skill-preference-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 16px;
              background: #fafafa;
              border-radius: 8px;
              margin-bottom: 8px;

              .skill-info {
                .skill-name {
                  display: block;
                  font-size: 14px;
                  font-weight: 500;
                  color: #262626;
                  margin-bottom: 4px;
                }

                .skill-description {
                  font-size: 12px;
                  color: #8c8c8c;
                }
              }
            }
          }

          .reminder-settings {
            .reminder-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 16px;
              background: #fafafa;
              border-radius: 8px;
              margin-bottom: 8px;

              .reminder-info {
                .reminder-title {
                  display: block;
                  font-size: 14px;
                  font-weight: 500;
                  color: #262626;
                  margin-bottom: 4px;
                }

                .reminder-description {
                  font-size: 12px;
                  color: #8c8c8c;
                }
              }
            }
          }
        }

        .preference-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .goals-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .goals-list {
          .goal-item {
            background: #fafafa;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;

            .goal-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 16px;

              .goal-info {
                .goal-title {
                  font-size: 16px;
                  font-weight: 600;
                  color: #262626;
                  margin-bottom: 4px;
                }

                .goal-description {
                  font-size: 14px;
                  color: #8c8c8c;
                  margin: 0;
                }
              }

              .goal-actions {
                display: flex;
                gap: 8px;
              }
            }

            .goal-progress {
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

            .goal-meta {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #8c8c8c;

              .goal-type {
                background: #e6f7ff;
                color: #1890ff;
                padding: 2px 8px;
                border-radius: 4px;
              }
            }
          }
        }

        .privacy-group {
          margin-bottom: 32px;

          .privacy-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: #fafafa;
            border-radius: 8px;
            margin-bottom: 8px;

            .privacy-info {
              .privacy-title {
                display: block;
                font-size: 14px;
                font-weight: 500;
                color: #262626;
                margin-bottom: 4px;
              }

              .privacy-description {
                font-size: 12px;
                color: #8c8c8c;
              }
            }
          }

          .data-actions {
            display: flex;
            gap: 12px;
          }
        }

        .privacy-actions {
          margin-top: 24px;
        }
      }
    }
  }

  .delete-warning {
    text-align: center;

    .warning-text {
      font-size: 14px;
      color: #595959;
      margin-bottom: 12px;
    }

    .warning-list {
      text-align: left;
      margin: 16px 0;
      padding-left: 20px;

      li {
        margin-bottom: 8px;
        color: #8c8c8c;
      }
    }
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 16px;

    .page-header {
      padding: 24px 16px;
    }

    .profile-content {
      .profile-card,
      .settings-container {
        padding: 16px;
      }

      .settings-section {
        .goals-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .preference-actions,
        .data-actions {
          flex-direction: column;
        }
      }
    }
  }
}
</style>