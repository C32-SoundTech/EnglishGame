<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <button
              @click="goBack"
              class="mr-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft class="w-5 h-5" />
            </button>
            <Gamepad2 class="w-8 h-8 text-blue-600 mr-3" />
            <h1 class="text-xl font-bold text-gray-900">游戏学习</h1>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
              <Star class="w-4 h-4 text-yellow-600" />
              <span class="text-sm font-medium text-yellow-800">{{ userStats.totalStars }}</span>
            </div>
            <div class="flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full">
              <Trophy class="w-4 h-4 text-blue-600" />
              <span class="text-sm font-medium text-blue-800">等级 {{ userStats.level }}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 游戏类型选择 -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">选择游戏类型</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="gameType in gameTypes"
            :key="gameType.id"
            @click="selectGameType(gameType)"
            :class="[
              'bg-white rounded-xl p-6 shadow-sm border cursor-pointer transition-all duration-300',
              selectedGameType?.id === gameType.id
                ? 'border-blue-500 shadow-md ring-2 ring-blue-200'
                : 'hover:shadow-md hover:border-gray-300'
            ]"
          >
            <div class="text-center">
              <div
                :class="[
                  'inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-transform',
                  gameType.color,
                  selectedGameType?.id === gameType.id ? 'scale-110' : 'group-hover:scale-105'
                ]"
              >
                <component :is="gameType.icon" class="w-8 h-8 text-white" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ gameType.name }}</h3>
              <p class="text-sm text-gray-600 mb-4">{{ gameType.description }}</p>
              <div class="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div class="flex items-center">
                  <Clock class="w-4 h-4 mr-1" />
                  {{ gameType.duration }}分钟
                </div>
                <div class="flex items-center">
                  <Star class="w-4 h-4 mr-1" />
                  {{ gameType.maxStars }}星
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 关卡选择 -->
      <div v-if="selectedGameType" class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">{{ selectedGameType.name }} - 选择关卡</h2>
          <div class="text-sm text-gray-600">
            已完成 {{ completedLevels }}/{{ totalLevels }} 关
          </div>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div
            v-for="level in levels"
            :key="level.id"
            @click="selectLevel(level)"
            :class="[
              'relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
              level.status === 'completed'
                ? 'bg-green-50 border-green-200 hover:bg-green-100'
                : level.status === 'unlocked'
                ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                : 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-60'
            ]"
          >
            <!-- 关卡状态图标 -->
            <div class="absolute -top-2 -right-2">
              <div
                v-if="level.status === 'completed'"
                class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Check class="w-4 h-4 text-white" />
              </div>
              <div
                v-else-if="level.status === 'locked'"
                class="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center"
              >
                <Lock class="w-4 h-4 text-white" />
              </div>
            </div>

            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900 mb-2">{{ level.number }}</div>
              <div class="text-sm text-gray-600 mb-2">{{ level.name }}</div>
              
              <!-- 星星评级 -->
              <div class="flex justify-center space-x-1 mb-2">
                <Star
                  v-for="i in 3"
                  :key="i"
                  :class="[
                    'w-4 h-4',
                    i <= (level.stars || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  ]"
                />
              </div>
              
              <div class="text-xs text-gray-500">{{ level.difficulty }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 游戏界面 -->
      <div v-if="currentGame" class="bg-white rounded-xl shadow-lg border overflow-hidden">
        <!-- 游戏头部 -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold">{{ currentGame.title }}</h3>
              <p class="text-blue-100">关卡 {{ currentGame.level }} - {{ currentGame.difficulty }}</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-center">
                <div class="text-2xl font-bold">{{ gameState.score }}</div>
                <div class="text-xs text-blue-100">得分</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold">{{ gameState.timeLeft }}</div>
                <div class="text-xs text-blue-100">剩余时间</div>
              </div>
              <div class="text-center">
                <div class="flex space-x-1">
                  <Heart
                    v-for="i in gameState.lives"
                    :key="i"
                    class="w-5 h-5 text-red-400 fill-current"
                  />
                </div>
                <div class="text-xs text-blue-100">生命</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 游戏内容区域 -->
        <div class="p-8">
          <!-- 单词匹配游戏 -->
          <div v-if="currentGame.type === 'word-match'" class="space-y-6">
            <div class="text-center">
              <h4 class="text-lg font-semibold text-gray-900 mb-2">选择正确的中文意思</h4>
              <div class="text-3xl font-bold text-blue-600 mb-6">{{ currentQuestion.word }}</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <button
                v-for="option in currentQuestion.options"
                :key="option.id"
                @click="selectAnswer(option)"
                :class="[
                  'p-4 rounded-lg border-2 text-lg font-medium transition-all duration-300',
                  selectedAnswer?.id === option.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ option.text }}
              </button>
            </div>
          </div>

          <!-- 听力游戏 -->
          <div v-else-if="currentGame.type === 'listening'" class="space-y-6">
            <div class="text-center">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">听音选词</h4>
              <button
                @click="playAudio"
                class="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors mb-6"
              >
                <Volume2 class="w-8 h-8" />
              </button>
              <p class="text-sm text-gray-600">点击播放按钮听发音</p>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                v-for="option in currentQuestion.options"
                :key="option.id"
                @click="selectAnswer(option)"
                :class="[
                  'p-4 rounded-lg border-2 text-lg font-medium transition-all duration-300',
                  selectedAnswer?.id === option.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ option.text }}
              </button>
            </div>
          </div>

          <!-- 拼写游戏 -->
          <div v-else-if="currentGame.type === 'spelling'" class="space-y-6">
            <div class="text-center">
              <h4 class="text-lg font-semibold text-gray-900 mb-2">根据图片拼写单词</h4>
              <div class="w-48 h-48 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <img
                  :src="currentQuestion.image"
                  :alt="currentQuestion.word"
                  class="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
            
            <div class="max-w-md mx-auto">
              <input
                v-model="spellingAnswer"
                type="text"
                placeholder="请输入单词..."
                class="w-full p-4 text-center text-xl border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                @keyup.enter="checkSpelling"
              />
            </div>
          </div>

          <!-- 游戏控制按钮 -->
          <div class="flex justify-center space-x-4 mt-8">
            <button
              v-if="selectedAnswer || spellingAnswer"
              @click="submitAnswer"
              class="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              提交答案
            </button>
            <button
              @click="skipQuestion"
              class="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              跳过
            </button>
          </div>
        </div>
      </div>

      <!-- 游戏结果弹窗 -->
      <div
        v-if="showResult"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div class="text-center">
            <div
              :class="[
                'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
                gameResult.success ? 'bg-green-100' : 'bg-red-100'
              ]"
            >
              <CheckCircle
                v-if="gameResult.success"
                class="w-8 h-8 text-green-600"
              />
              <XCircle
                v-else
                class="w-8 h-8 text-red-600"
              />
            </div>
            
            <h3
              :class="[
                'text-xl font-bold mb-2',
                gameResult.success ? 'text-green-600' : 'text-red-600'
              ]"
            >
              {{ gameResult.success ? '回答正确！' : '回答错误' }}
            </h3>
            
            <p class="text-gray-600 mb-4">{{ gameResult.message }}</p>
            
            <div class="flex justify-center space-x-4">
              <button
                @click="nextQuestion"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                下一题
              </button>
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
  ArrowLeft,
  Gamepad2,
  Star,
  Trophy,
  Clock,
  Check,
  Lock,
  Heart,
  Volume2,
  CheckCircle,
  XCircle,
  BookOpen,
  Headphones,
  PenTool
} from 'lucide-vue-next'

const router = useRouter()

// 用户统计
const userStats = reactive({
  totalStars: 124,
  level: 5
})

// 游戏类型
const gameTypes = ref([
  {
    id: 'word-match',
    name: '单词匹配',
    description: '将英文单词与中文意思匹配',
    icon: BookOpen,
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    duration: 5,
    maxStars: 3
  },
  {
    id: 'listening',
    name: '听力练习',
    description: '听发音选择正确的单词',
    icon: Headphones,
    color: 'bg-gradient-to-r from-green-500 to-green-600',
    duration: 8,
    maxStars: 3
  },
  {
    id: 'spelling',
    name: '拼写练习',
    description: '根据图片拼写正确的单词',
    icon: PenTool,
    color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    duration: 10,
    maxStars: 3
  }
])

// 选中的游戏类型
const selectedGameType = ref(null)

// 关卡数据
const levels = ref([
  { id: 1, number: 1, name: '基础词汇', difficulty: '简单', status: 'completed', stars: 3 },
  { id: 2, number: 2, name: '动物单词', difficulty: '简单', status: 'completed', stars: 2 },
  { id: 3, number: 3, name: '颜色词汇', difficulty: '简单', status: 'completed', stars: 3 },
  { id: 4, number: 4, name: '数字学习', difficulty: '中等', status: 'unlocked', stars: 0 },
  { id: 5, number: 5, name: '家庭成员', difficulty: '中等', status: 'unlocked', stars: 0 },
  { id: 6, number: 6, name: '食物词汇', difficulty: '中等', status: 'locked', stars: 0 },
  { id: 7, number: 7, name: '交通工具', difficulty: '困难', status: 'locked', stars: 0 },
  { id: 8, number: 8, name: '职业词汇', difficulty: '困难', status: 'locked', stars: 0 }
])

// 当前游戏
const currentGame = ref(null)

// 游戏状态
const gameState = reactive({
  score: 0,
  timeLeft: 60,
  lives: 3,
  currentQuestionIndex: 0
})

// 当前题目
const currentQuestion = ref({
  word: 'apple',
  options: [
    { id: 1, text: '苹果', correct: true },
    { id: 2, text: '香蕉', correct: false },
    { id: 3, text: '橙子', correct: false },
    { id: 4, text: '葡萄', correct: false }
  ],
  image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=red%20apple%20fruit&image_size=square'
})

// 选中的答案
const selectedAnswer = ref(null)
const spellingAnswer = ref('')

// 游戏结果
const showResult = ref(false)
const gameResult = reactive({
  success: false,
  message: ''
})

// 计算属性
const completedLevels = computed(() => levels.value.filter(level => level.status === 'completed').length)
const totalLevels = computed(() => levels.value.length)

// 方法
const goBack = () => {
  router.push('/')
}

const selectGameType = (gameType) => {
  selectedGameType.value = gameType
}

const selectLevel = (level) => {
  if (level.status === 'locked') return
  
  currentGame.value = {
    type: selectedGameType.value.id,
    title: `${selectedGameType.value.name} - ${level.name}`,
    level: level.number,
    difficulty: level.difficulty
  }
  
  // 重置游戏状态
  gameState.score = 0
  gameState.timeLeft = selectedGameType.value.duration * 60
  gameState.lives = 3
  gameState.currentQuestionIndex = 0
  
  startGame()
}

const startGame = () => {
  // 开始游戏逻辑
  console.log('游戏开始')
}

const selectAnswer = (option) => {
  selectedAnswer.value = option
}

const submitAnswer = () => {
  if (!selectedAnswer.value && !spellingAnswer.value) return
  
  let isCorrect = false
  
  if (currentGame.value.type === 'word-match' || currentGame.value.type === 'listening') {
    isCorrect = selectedAnswer.value?.correct || false
  } else if (currentGame.value.type === 'spelling') {
    isCorrect = spellingAnswer.value.toLowerCase() === currentQuestion.value.word.toLowerCase()
  }
  
  gameResult.success = isCorrect
  gameResult.message = isCorrect ? '太棒了！继续加油！' : `正确答案是：${currentQuestion.value.word}`
  
  if (isCorrect) {
    gameState.score += 10
  } else {
    gameState.lives -= 1
  }
  
  showResult.value = true
}

const checkSpelling = () => {
  submitAnswer()
}

const skipQuestion = () => {
  nextQuestion()
}

const nextQuestion = () => {
  showResult.value = false
  selectedAnswer.value = null
  spellingAnswer.value = ''
  
  // 加载下一题
  gameState.currentQuestionIndex += 1
  
  // 这里可以添加更多题目数据
  console.log('下一题')
}

const playAudio = () => {
  // 播放音频逻辑
  console.log('播放音频:', currentQuestion.value.word)
}

onMounted(() => {
  // 初始化游戏数据
})
</script>