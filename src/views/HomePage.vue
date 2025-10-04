<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <BookOpen class="w-8 h-8 text-blue-600 mr-3" />
            <h1 class="text-xl font-bold text-gray-900">小学英语学习平台</h1>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <img
                :src="userInfo.avatar"
                :alt="userInfo.name"
                class="w-8 h-8 rounded-full"
              />
              <span class="text-sm font-medium text-gray-700">{{ userInfo.name }}</span>
            </div>
            <button
              @click="handleLogout"
              class="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogOut class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 欢迎区域 -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-bold mb-2">欢迎回来，{{ userInfo.name }}！</h2>
            <p class="text-blue-100 text-lg">今天也要努力学习英语哦 🌟</p>
          </div>
          <div class="hidden md:block">
            <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Smile class="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <Trophy class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">学习天数</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.studyDays }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <Target class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">完成关卡</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.completedLevels }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-lg">
              <Star class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">获得星星</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalStars }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速入口 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          @click="goToGames"
          class="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Gamepad2 class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">游戏学习</h3>
            <p class="text-sm text-gray-600">通过有趣的游戏学习英语</p>
          </div>
        </div>

        <div
          @click="goToAssessment"
          class="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <ClipboardCheck class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">能力评估</h3>
            <p class="text-sm text-gray-600">测试你的英语水平</p>
          </div>
        </div>

        <div
          @click="goToProgress"
          class="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">学习进度</h3>
            <p class="text-sm text-gray-600">查看你的学习进展</p>
          </div>
        </div>

        <div
          @click="goToReports"
          class="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <FileText class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">学习报告</h3>
            <p class="text-sm text-gray-600">详细的学习分析报告</p>
          </div>
        </div>
      </div>

      <!-- 今日任务 -->
      <div class="bg-white rounded-xl p-6 shadow-sm border mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-900">今日任务</h3>
          <div class="text-sm text-gray-600">
            {{ completedTasks }}/{{ totalTasks }} 已完成
          </div>
        </div>
        
        <div class="space-y-4">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="flex items-center p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex-shrink-0">
              <div
                :class="[
                  'w-6 h-6 rounded-full flex items-center justify-center',
                  task.completed ? 'bg-green-500' : 'bg-gray-300'
                ]"
              >
                <Check v-if="task.completed" class="w-4 h-4 text-white" />
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p
                :class="[
                  'font-medium',
                  task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                ]"
              >
                {{ task.title }}
              </p>
              <p class="text-sm text-gray-600">{{ task.description }}</p>
            </div>
            <div class="flex items-center text-sm text-gray-500">
              <Star class="w-4 h-4 mr-1" />
              {{ task.reward }}
            </div>
          </div>
        </div>
      </div>

      <!-- 最近成就 -->
      <div class="bg-white rounded-xl p-6 shadow-sm border">
        <h3 class="text-xl font-semibold text-gray-900 mb-6">最近成就</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="achievement in achievements"
            :key="achievement.id"
            class="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
          >
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <Award class="w-6 h-6 text-white" />
              </div>
            </div>
            <div class="ml-4">
              <p class="font-medium text-gray-900">{{ achievement.title }}</p>
              <p class="text-sm text-gray-600">{{ achievement.date }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  BookOpen,
  LogOut,
  Smile,
  Trophy,
  Target,
  Star,
  Gamepad2,
  ClipboardCheck,
  TrendingUp,
  FileText,
  Check,
  Award
} from 'lucide-vue-next'

const router = useRouter()

// 用户信息
const userInfo = reactive({
  name: '小明',
  avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20student%20avatar&image_size=square'
})

// 统计数据
const stats = reactive({
  studyDays: 15,
  completedLevels: 8,
  totalStars: 124
})

// 今日任务
const tasks = ref([
  {
    id: 1,
    title: '完成单词学习',
    description: '学习10个新单词',
    reward: 10,
    completed: true
  },
  {
    id: 2,
    title: '语法练习',
    description: '完成一般现在时练习',
    reward: 15,
    completed: false
  },
  {
    id: 3,
    title: '听力训练',
    description: '完成5分钟听力练习',
    reward: 12,
    completed: false
  }
])

// 最近成就
const achievements = ref([
  {
    id: 1,
    title: '连续学习7天',
    date: '2024-01-15'
  },
  {
    id: 2,
    title: '完成第一关',
    date: '2024-01-14'
  },
  {
    id: 3,
    title: '获得100颗星星',
    date: '2024-01-13'
  }
])

// 计算属性
const completedTasks = computed(() => tasks.value.filter(task => task.completed).length)
const totalTasks = computed(() => tasks.value.length)

// 导航方法
const goToGames = () => {
  router.push('/games')
}

const goToAssessment = () => {
  router.push('/assessment')
}

const goToProgress = () => {
  router.push('/progress')
}

const goToReports = () => {
  router.push('/reports')
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('user_token')
  localStorage.removeItem('user_info')
  router.push('/login')
}

// 初始化
onMounted(() => {
  // 从本地存储获取用户信息
  const savedUserInfo = localStorage.getItem('user_info')
  if (savedUserInfo) {
    const parsed = JSON.parse(savedUserInfo)
    Object.assign(userInfo, parsed)
  }
})
</script>