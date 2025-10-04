<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <button @click="goBack" class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft class="w-5 h-5" />
            </button>
            <h1 class="text-xl font-semibold text-gray-900">个人资料</h1>
          </div>
          <div class="flex items-center space-x-3">
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">{{ userInfo.name }}</p>
              <p class="text-xs text-gray-500">{{ userInfo.email }}</p>
            </div>
            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">{{ userInfo.name.charAt(0) }}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Profile Header -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center space-x-6">
          <div class="relative">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span class="text-white text-2xl font-bold">{{ userInfo.name.charAt(0) }}</span>
            </div>
            <button class="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <Camera class="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900">{{ userInfo.name }}</h2>
            <p class="text-gray-600 mt-1">{{ userInfo.email }}</p>
            <div class="flex items-center space-x-4 mt-3">
              <div class="flex items-center space-x-2">
                <Trophy class="w-4 h-4 text-yellow-500" />
                <span class="text-sm text-gray-600">等级 {{ userInfo.level }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <Calendar class="w-4 h-4 text-blue-500" />
                <span class="text-sm text-gray-600">学习 {{ userInfo.studyDays }} 天</span>
              </div>
              <div class="flex items-center space-x-2">
                <Star class="w-4 h-4 text-yellow-500" />
                <span class="text-sm text-gray-600">{{ userInfo.totalStars }} 星</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Personal Information -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">个人信息</h3>
              <button 
                @click="toggleEdit"
                class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {{ isEditing ? '保存' : '编辑' }}
              </button>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                <input 
                  v-if="isEditing"
                  v-model="editForm.name"
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p v-else class="text-gray-900">{{ userInfo.name }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                <input 
                  v-if="isEditing"
                  v-model="editForm.email"
                  type="email" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p v-else class="text-gray-900">{{ userInfo.email }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">年龄</label>
                <input 
                  v-if="isEditing"
                  v-model="editForm.age"
                  type="number" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p v-else class="text-gray-900">{{ userInfo.age || '未设置' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">学校</label>
                <input 
                  v-if="isEditing"
                  v-model="editForm.school"
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p v-else class="text-gray-900">{{ userInfo.school || '未设置' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">年级</label>
                <select 
                  v-if="isEditing"
                  v-model="editForm.grade"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">请选择年级</option>
                  <option value="1">一年级</option>
                  <option value="2">二年级</option>
                  <option value="3">三年级</option>
                  <option value="4">四年级</option>
                  <option value="5">五年级</option>
                  <option value="6">六年级</option>
                </select>
                <p v-else class="text-gray-900">{{ userInfo.grade ? `${userInfo.grade}年级` : '未设置' }}</p>
              </div>
            </div>
          </div>

          <!-- Learning Preferences -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">学习偏好</h3>
            
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">学习目标</label>
                <div class="grid grid-cols-2 gap-3">
                  <label v-for="goal in learningGoals" :key="goal.id" class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      :value="goal.id"
                      v-model="selectedGoals"
                      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">{{ goal.name }}</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">学习时间偏好</label>
                <div class="grid grid-cols-2 gap-3">
                  <label v-for="time in studyTimes" :key="time.id" class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="radio" 
                      :value="time.id"
                      v-model="selectedStudyTime"
                      name="studyTime"
                      class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">{{ time.name }}</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">难度偏好</label>
                <div class="flex space-x-3">
                  <button 
                    v-for="level in difficultyLevels" 
                    :key="level.id"
                    @click="selectedDifficulty = level.id"
                    :class="[
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      selectedDifficulty === level.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    {{ level.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics & Settings -->
        <div class="space-y-6">
          <!-- Learning Statistics -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">学习统计</h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen class="w-4 h-4 text-blue-600" />
                  </div>
                  <span class="text-sm text-gray-600">总学习时长</span>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ userStats.totalStudyTime }}小时</span>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target class="w-4 h-4 text-green-600" />
                  </div>
                  <span class="text-sm text-gray-600">完成关卡</span>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ userStats.completedLevels }}</span>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award class="w-4 h-4 text-yellow-600" />
                  </div>
                  <span class="text-sm text-gray-600">获得徽章</span>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ userStats.badges }}</span>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Zap class="w-4 h-4 text-purple-600" />
                  </div>
                  <span class="text-sm text-gray-600">连续学习</span>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ userStats.streak }}天</span>
              </div>
            </div>
          </div>

          <!-- Account Settings -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">账户设置</h3>
            
            <div class="space-y-3">
              <button class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <div class="flex items-center space-x-3">
                  <Bell class="w-4 h-4 text-gray-600" />
                  <span class="text-sm text-gray-700">通知设置</span>
                </div>
                <ChevronRight class="w-4 h-4 text-gray-400" />
              </button>
              
              <button class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <div class="flex items-center space-x-3">
                  <Shield class="w-4 h-4 text-gray-600" />
                  <span class="text-sm text-gray-700">隐私设置</span>
                </div>
                <ChevronRight class="w-4 h-4 text-gray-400" />
              </button>
              
              <button class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <div class="flex items-center space-x-3">
                  <Lock class="w-4 h-4 text-gray-600" />
                  <span class="text-sm text-gray-700">修改密码</span>
                </div>
                <ChevronRight class="w-4 h-4 text-gray-400" />
              </button>
              
              <button class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <div class="flex items-center space-x-3">
                  <Download class="w-4 h-4 text-gray-600" />
                  <span class="text-sm text-gray-700">导出数据</span>
                </div>
                <ChevronRight class="w-4 h-4 text-gray-400" />
              </button>
              
              <hr class="my-3" />
              
              <button 
                @click="logout"
                class="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
              >
                <LogOut class="w-4 h-4" />
                <span class="text-sm">退出登录</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, Camera, Trophy, Calendar, Star, BookOpen, Target, Award, Zap,
  Bell, Shield, Lock, Download, LogOut, ChevronRight
} from 'lucide-vue-next'

const router = useRouter()

// 用户信息
const userInfo = ref({
  name: '小明',
  email: 'xiaoming@example.com',
  age: 10,
  school: '阳光小学',
  grade: '3',
  level: 5,
  studyDays: 45,
  totalStars: 128
})

// 编辑状态
const isEditing = ref(false)
const editForm = reactive({
  name: '',
  email: '',
  age: '',
  school: '',
  grade: ''
})

// 学习偏好
const learningGoals = ref([
  { id: 'vocabulary', name: '词汇学习' },
  { id: 'grammar', name: '语法练习' },
  { id: 'listening', name: '听力训练' },
  { id: 'speaking', name: '口语练习' },
  { id: 'reading', name: '阅读理解' },
  { id: 'writing', name: '写作练习' }
])

const studyTimes = ref([
  { id: 'morning', name: '早上' },
  { id: 'afternoon', name: '下午' },
  { id: 'evening', name: '晚上' },
  { id: 'flexible', name: '灵活安排' }
])

const difficultyLevels = ref([
  { id: 'easy', name: '简单' },
  { id: 'medium', name: '中等' },
  { id: 'hard', name: '困难' }
])

const selectedGoals = ref(['vocabulary', 'listening'])
const selectedStudyTime = ref('evening')
const selectedDifficulty = ref('medium')

// 用户统计
const userStats = ref({
  totalStudyTime: 32,
  completedLevels: 28,
  badges: 12,
  streak: 7
})

// 方法
const goBack = () => {
  router.push('/home')
}

const toggleEdit = () => {
  if (isEditing.value) {
    // 保存编辑
    userInfo.value = { ...userInfo.value, ...editForm }
    console.log('保存用户信息:', editForm)
  } else {
    // 开始编辑
    Object.assign(editForm, {
      name: userInfo.value.name,
      email: userInfo.value.email,
      age: userInfo.value.age,
      school: userInfo.value.school,
      grade: userInfo.value.grade
    })
  }
  isEditing.value = !isEditing.value
}

const logout = () => {
  localStorage.removeItem('user_token')
  localStorage.removeItem('user_info')
  router.push('/login')
}

onMounted(() => {
  // 从localStorage获取用户信息
  const savedUserInfo = localStorage.getItem('user_info')
  if (savedUserInfo) {
    const parsed = JSON.parse(savedUserInfo)
    Object.assign(userInfo.value, parsed)
  }
})
</script>