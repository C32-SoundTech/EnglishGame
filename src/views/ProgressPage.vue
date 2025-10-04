<template>
  <div class="progress-page min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <button @click="$router.go(-1)" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft class="w-5 h-5 text-gray-600" />
            </button>
            <h1 class="text-xl font-semibold text-gray-900">学习进度</h1>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-600">
              {{ currentUser?.name || '学生' }}
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div 
          v-for="stat in overallStats" 
          :key="stat.label"
          class="bg-white rounded-xl p-6 shadow-sm"
        >
          <div class="flex items-center">
            <div :class="`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`">
              <component :is="stat.icon" class="w-6 h-6 text-white" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">{{ stat.label }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
              <p :class="`text-sm ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`">
                {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Overall Progress Chart -->
        <div class="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">学习进度趋势</h2>
            <div class="flex space-x-2">
              <button
                v-for="period in timePeriods"
                :key="period.value"
                @click="selectedPeriod = period.value"
                :class="`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
          
          <!-- Chart Placeholder -->
          <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <TrendingUp class="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500">学习进度图表</p>
              <p class="text-sm text-gray-400">显示{{ selectedPeriod }}的学习数据</p>
            </div>
          </div>
        </div>

        <!-- Level Progress -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">当前等级</h3>
          <div class="text-center mb-6">
            <div class="relative w-24 h-24 mx-auto mb-4">
              <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  stroke-width="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#3b82f6"
                  stroke-width="8"
                  fill="none"
                  :stroke-dasharray="`${currentLevel.progress * 2.51} 251`"
                  stroke-linecap="round"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xl font-bold text-gray-900">{{ currentLevel.level }}</span>
              </div>
            </div>
            <h4 class="text-lg font-semibold text-gray-900">{{ currentLevel.title }}</h4>
            <p class="text-sm text-gray-600 mb-2">{{ currentLevel.description }}</p>
            <div class="text-sm text-blue-600">
              {{ currentLevel.currentXP }} / {{ currentLevel.nextLevelXP }} XP
            </div>
          </div>
          
          <!-- Next Level Preview -->
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-center space-x-3">
              <Star class="w-5 h-5 text-blue-600" />
              <div>
                <p class="text-sm font-medium text-blue-900">下一等级</p>
                <p class="text-xs text-blue-700">{{ currentLevel.nextTitle }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Skills Progress -->
      <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">技能掌握度</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            v-for="skill in skillsProgress" 
            :key="skill.name"
            class="space-y-3"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div :class="`w-8 h-8 rounded-lg flex items-center justify-center ${skill.color}`">
                  <component :is="skill.icon" class="w-4 h-4 text-white" />
                </div>
                <span class="font-medium text-gray-900">{{ skill.name }}</span>
              </div>
              <span class="text-sm font-medium text-gray-600">{{ skill.progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                :class="`h-2 rounded-full transition-all duration-500 ${skill.color.replace('bg-', 'bg-')}`"
                :style="{ width: `${skill.progress}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>{{ skill.completed }} / {{ skill.total }} 完成</span>
              <span>{{ skill.timeSpent }}h 学习时间</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Learning Activities -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">最近活动</h3>
            <button class="text-blue-600 hover:text-blue-700 text-sm font-medium">
              查看全部
            </button>
          </div>
          <div class="space-y-4">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id"
              class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div :class="`w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`">
                <component :is="activity.icon" class="w-4 h-4 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                <p class="text-xs text-gray-500">{{ activity.description }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
              </div>
              <div v-if="activity.score" class="text-right">
                <span class="text-sm font-medium text-green-600">+{{ activity.score }}</span>
                <p class="text-xs text-gray-500">XP</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Achievements -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">成就徽章</h3>
            <button class="text-blue-600 hover:text-blue-700 text-sm font-medium">
              查看全部
            </button>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div 
              v-for="achievement in achievements" 
              :key="achievement.id"
              :class="`text-center p-3 rounded-lg border-2 transition-all ${
                achievement.unlocked 
                  ? 'border-yellow-200 bg-yellow-50' 
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`"
            >
              <div :class="`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                achievement.unlocked ? achievement.color : 'bg-gray-300'
              }`">
                <component :is="achievement.icon" class="w-6 h-6 text-white" />
              </div>
              <h4 class="text-xs font-medium text-gray-900 mb-1">{{ achievement.title }}</h4>
              <p class="text-xs text-gray-500">{{ achievement.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Study Calendar -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">学习日历</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>已完成</span>
            </div>
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>今天</span>
            </div>
          </div>
        </div>
        
        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-2">
          <!-- Week Headers -->
          <div 
            v-for="day in weekDays" 
            :key="day"
            class="text-center text-sm font-medium text-gray-500 py-2"
          >
            {{ day }}
          </div>
          
          <!-- Calendar Days -->
          <div 
            v-for="date in calendarDays" 
            :key="date.date"
            :class="`aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors ${
              date.isToday 
                ? 'bg-blue-500 text-white' 
                : date.hasActivity 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'hover:bg-gray-100'
            }`"
          >
            {{ date.day }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft,
  TrendingUp,
  Star,
  Trophy,
  Target,
  Clock,
  BookOpen,
  Headphones,
  PenTool,
  MessageCircle,
  Award,
  Zap,
  Calendar,
  CheckCircle
} from 'lucide-vue-next'

const router = useRouter()

// Current user info
const currentUser = ref(JSON.parse(localStorage.getItem('user_info') || '{}'))

// Time period selection
const selectedPeriod = ref('week')
const timePeriods = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' }
]

// Overall statistics
const overallStats = ref([
  {
    label: '学习天数',
    value: '45',
    change: 12,
    icon: Calendar,
    color: 'bg-blue-500'
  },
  {
    label: '完成课程',
    value: '28',
    change: 8,
    icon: CheckCircle,
    color: 'bg-green-500'
  },
  {
    label: '获得经验',
    value: '2,450',
    change: 15,
    icon: Star,
    color: 'bg-yellow-500'
  },
  {
    label: '学习时长',
    value: '68h',
    change: 5,
    icon: Clock,
    color: 'bg-purple-500'
  }
])

// Current level information
const currentLevel = ref({
  level: 5,
  title: '英语探索者',
  description: '你已经掌握了基础英语技能',
  currentXP: 2450,
  nextLevelXP: 3000,
  progress: 82,
  nextTitle: '英语学者'
})

// Skills progress
const skillsProgress = ref([
  {
    name: '词汇掌握',
    progress: 85,
    completed: 340,
    total: 400,
    timeSpent: 15,
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  {
    name: '听力理解',
    progress: 72,
    completed: 144,
    total: 200,
    timeSpent: 12,
    icon: Headphones,
    color: 'bg-green-500'
  },
  {
    name: '语法运用',
    progress: 68,
    completed: 102,
    total: 150,
    timeSpent: 18,
    icon: PenTool,
    color: 'bg-purple-500'
  },
  {
    name: '口语表达',
    progress: 60,
    completed: 60,
    total: 100,
    timeSpent: 8,
    icon: MessageCircle,
    color: 'bg-orange-500'
  }
])

// Recent activities
const recentActivities = ref([
  {
    id: 1,
    title: '完成词汇测试',
    description: '动物单词测试 - 获得满分',
    time: '2小时前',
    score: 50,
    icon: Trophy,
    color: 'bg-yellow-500'
  },
  {
    id: 2,
    title: '听力练习',
    description: '日常对话听力训练',
    time: '4小时前',
    score: 30,
    icon: Headphones,
    color: 'bg-green-500'
  },
  {
    id: 3,
    title: '语法练习',
    description: '现在进行时练习',
    time: '昨天',
    score: 25,
    icon: PenTool,
    color: 'bg-purple-500'
  },
  {
    id: 4,
    title: '单词学习',
    description: '学习了20个新单词',
    time: '昨天',
    score: 40,
    icon: BookOpen,
    color: 'bg-blue-500'
  }
])

// Achievements
const achievements = ref([
  {
    id: 1,
    title: '初学者',
    description: '完成第一课',
    unlocked: true,
    icon: Star,
    color: 'bg-yellow-500'
  },
  {
    id: 2,
    title: '词汇达人',
    description: '学会100个单词',
    unlocked: true,
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  {
    id: 3,
    title: '连续学习',
    description: '连续学习7天',
    unlocked: true,
    icon: Zap,
    color: 'bg-orange-500'
  },
  {
    id: 4,
    title: '听力高手',
    description: '完成50次听力练习',
    unlocked: false,
    icon: Headphones,
    color: 'bg-green-500'
  },
  {
    id: 5,
    title: '语法专家',
    description: '语法测试满分',
    unlocked: false,
    icon: Award,
    color: 'bg-purple-500'
  },
  {
    id: 6,
    title: '口语之星',
    description: '完成口语评估',
    unlocked: false,
    icon: MessageCircle,
    color: 'bg-red-500'
  }
])

// Calendar data
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// Generate calendar days for current month
const calendarDays = computed(() => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const studyDays = [5, 8, 12, 15, 18, 22, 25, 28] // Mock study days
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === currentMonth
    const isToday = date.toDateString() === today.toDateString()
    const hasActivity = isCurrentMonth && studyDays.includes(date.getDate())
    
    if (isCurrentMonth) {
      days.push({
        date: date.toISOString(),
        day: date.getDate(),
        isToday,
        hasActivity
      })
    }
  }
  
  return days
})

onMounted(() => {
  // Load user progress data
  console.log('Loading progress data...')
})
</script>

<style scoped>
.progress-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.progress-page > * {
  animation: fadeIn 0.6s ease-out;
}

/* Progress bar animations */
.bg-blue-500,
.bg-green-500,
.bg-purple-500,
.bg-orange-500 {
  transition: width 0.8s ease-in-out;
}

/* Hover effects */
.hover\:shadow-md:hover {
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Calendar hover effects */
.aspect-square {
  aspect-ratio: 1;
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* Achievement card effects */
.border-yellow-200 {
  box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.3);
}
</style>