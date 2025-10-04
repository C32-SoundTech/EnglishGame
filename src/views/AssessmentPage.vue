<template>
  <div class="assessment-page min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <button @click="$router.go(-1)" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft class="w-5 h-5 text-gray-600" />
            </button>
            <h1 class="text-xl font-semibold text-gray-900">能力评估</h1>
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
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Assessment Selection -->
      <div v-if="currentView === 'selection'" class="space-y-8">
        <!-- Header -->
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Target class="w-8 h-8 text-purple-600" />
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">英语能力评估</h2>
          <p class="text-lg text-gray-600">选择评估类型，了解你的英语水平</p>
        </div>

        <!-- Assessment Types -->
        <div class="grid md:grid-cols-2 gap-6">
          <div 
            v-for="assessment in assessmentTypes" 
            :key="assessment.id"
            @click="startAssessment(assessment)"
            class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border hover:border-purple-200"
          >
            <div class="flex items-start space-x-4">
              <div :class="`w-12 h-12 rounded-lg flex items-center justify-center ${assessment.color}`">
                <component :is="assessment.icon" class="w-6 h-6 text-white" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ assessment.title }}</h3>
                <p class="text-gray-600 mb-3">{{ assessment.description }}</p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <span class="flex items-center">
                      <Clock class="w-4 h-4 mr-1" />
                      {{ assessment.duration }}
                    </span>
                    <span class="flex items-center">
                      <FileText class="w-4 h-4 mr-1" />
                      {{ assessment.questions }}题
                    </span>
                  </div>
                  <ChevronRight class="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Results -->
        <div v-if="recentResults.length > 0" class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">最近的评估结果</h3>
          <div class="space-y-3">
            <div 
              v-for="result in recentResults" 
              :key="result.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div :class="`w-8 h-8 rounded-full flex items-center justify-center ${getScoreColor(result.score)}`">
                  <span class="text-xs font-semibold text-white">{{ result.score }}</span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ result.type }}</div>
                  <div class="text-sm text-gray-500">{{ result.date }}</div>
                </div>
              </div>
              <button 
                @click="viewResult(result)"
                class="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Test -->
      <div v-else-if="currentView === 'test'" class="space-y-6">
        <!-- Progress Bar -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">进度</span>
            <span class="text-sm text-gray-500">{{ currentQuestion + 1 }} / {{ totalQuestions }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-purple-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="bg-white rounded-xl p-8 shadow-sm">
          <div class="mb-6">
            <div class="flex items-center space-x-2 mb-4">
              <span class="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                {{ currentAssessment?.title }}
              </span>
              <span class="text-sm text-gray-500">第 {{ currentQuestion + 1 }} 题</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">
              {{ questions[currentQuestion]?.question }}
            </h3>
            
            <!-- Audio for listening questions -->
            <div v-if="questions[currentQuestion]?.audio" class="mb-6">
              <button 
                @click="playAudio"
                class="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
              >
                <Volume2 class="w-5 h-5 text-blue-600" />
                <span class="text-blue-600 font-medium">播放音频</span>
              </button>
            </div>
          </div>

          <!-- Answer Options -->
          <div class="space-y-3">
            <button
              v-for="(option, index) in questions[currentQuestion]?.options"
              :key="index"
              @click="selectAnswer(index)"
              :class="`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedAnswer === index 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`"
            >
              <div class="flex items-center space-x-3">
                <div :class="`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === index 
                    ? 'border-purple-500 bg-purple-500' 
                    : 'border-gray-300'
                }`">
                  <div v-if="selectedAnswer === index" class="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span class="text-gray-900">{{ option }}</span>
              </div>
            </button>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between mt-8">
            <button
              @click="previousQuestion"
              :disabled="currentQuestion === 0"
              class="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft class="w-4 h-4" />
              <span>上一题</span>
            </button>
            
            <button
              @click="nextQuestion"
              :disabled="selectedAnswer === null"
              class="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>{{ currentQuestion === totalQuestions - 1 ? '完成评估' : '下一题' }}</span>
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="currentView === 'results'" class="space-y-6">
        <!-- Score Card -->
        <div class="bg-white rounded-xl p-8 shadow-sm text-center">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Trophy class="w-10 h-10 text-green-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">评估完成！</h2>
          <div class="text-4xl font-bold text-green-600 mb-2">{{ finalScore }}分</div>
          <p class="text-lg text-gray-600 mb-6">{{ getScoreLevel(finalScore) }}</p>
          
          <!-- Score Breakdown -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ correctAnswers }}</div>
              <div class="text-sm text-gray-500">正确答案</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">{{ wrongAnswers }}</div>
              <div class="text-sm text-gray-500">错误答案</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ Math.round((correctAnswers / totalQuestions) * 100) }}%</div>
              <div class="text-sm text-gray-500">正确率</div>
            </div>
          </div>
        </div>

        <!-- Detailed Analysis -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">详细分析</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span class="text-gray-700">词汇理解</span>
              <div class="flex items-center space-x-2">
                <div class="w-24 bg-gray-200 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full" style="width: 85%"></div>
                </div>
                <span class="text-sm font-medium text-gray-900">85%</span>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span class="text-gray-700">语法掌握</span>
              <div class="flex items-center space-x-2">
                <div class="w-24 bg-gray-200 rounded-full h-2">
                  <div class="bg-yellow-500 h-2 rounded-full" style="width: 70%"></div>
                </div>
                <span class="text-sm font-medium text-gray-900">70%</span>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span class="text-gray-700">听力理解</span>
              <div class="flex items-center space-x-2">
                <div class="w-24 bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-500 h-2 rounded-full" style="width: 90%"></div>
                </div>
                <span class="text-sm font-medium text-gray-900">90%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-4">
          <button
            @click="retakeAssessment"
            class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            重新评估
          </button>
          <button
            @click="goToHome"
            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium transition-colors"
          >
            返回主页
          </button>
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
  Target, 
  Clock, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  Volume2,
  Trophy,
  BookOpen,
  Headphones,
  PenTool,
  MessageCircle
} from 'lucide-vue-next'

const router = useRouter()

// Current user info
const currentUser = ref(JSON.parse(localStorage.getItem('user_info') || '{}'))

// View state
const currentView = ref<'selection' | 'test' | 'results'>('selection')

// Assessment types
const assessmentTypes = ref([
  {
    id: 'vocabulary',
    title: '词汇测试',
    description: '测试你的英语词汇量和理解能力',
    duration: '15分钟',
    questions: 20,
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  {
    id: 'listening',
    title: '听力测试',
    description: '评估你的英语听力理解水平',
    duration: '20分钟',
    questions: 15,
    icon: Headphones,
    color: 'bg-green-500'
  },
  {
    id: 'grammar',
    title: '语法测试',
    description: '检验你的英语语法掌握程度',
    duration: '25分钟',
    questions: 25,
    icon: PenTool,
    color: 'bg-purple-500'
  },
  {
    id: 'speaking',
    title: '口语测试',
    description: '评估你的英语口语表达能力',
    duration: '10分钟',
    questions: 10,
    icon: MessageCircle,
    color: 'bg-orange-500'
  }
])

// Recent results
const recentResults = ref([
  {
    id: 1,
    type: '词汇测试',
    score: 85,
    date: '2024-01-15'
  },
  {
    id: 2,
    type: '听力测试',
    score: 78,
    date: '2024-01-10'
  }
])

// Current assessment
const currentAssessment = ref(null)
const currentQuestion = ref(0)
const selectedAnswer = ref<number | null>(null)
const userAnswers = ref<number[]>([])

// Sample questions
const questions = ref([
  {
    question: 'What does "apple" mean in Chinese?',
    options: ['苹果', '香蕉', '橙子', '葡萄'],
    correct: 0,
    audio: null
  },
  {
    question: 'Choose the correct sentence:',
    options: [
      'I am go to school.',
      'I go to school.',
      'I going to school.',
      'I goes to school.'
    ],
    correct: 1,
    audio: null
  },
  {
    question: 'Listen and choose the correct word:',
    options: ['cat', 'bat', 'hat', 'rat'],
    correct: 0,
    audio: 'cat.mp3'
  }
])

// Computed properties
const totalQuestions = computed(() => questions.value.length)
const correctAnswers = computed(() => {
  return userAnswers.value.filter((answer, index) => 
    answer === questions.value[index]?.correct
  ).length
})
const wrongAnswers = computed(() => totalQuestions.value - correctAnswers.value)
const finalScore = computed(() => Math.round((correctAnswers.value / totalQuestions.value) * 100))

// Methods
const startAssessment = (assessment: any) => {
  currentAssessment.value = assessment
  currentView.value = 'test'
  currentQuestion.value = 0
  selectedAnswer.value = null
  userAnswers.value = []
  
  // Generate questions based on assessment type
  generateQuestions(assessment.id)
}

const generateQuestions = (type: string) => {
  // This would typically fetch questions from an API
  // For now, we'll use sample questions
  console.log(`Generating questions for ${type}`)
}

const selectAnswer = (index: number) => {
  selectedAnswer.value = index
}

const nextQuestion = () => {
  if (selectedAnswer.value !== null) {
    userAnswers.value[currentQuestion.value] = selectedAnswer.value
    
    if (currentQuestion.value < totalQuestions.value - 1) {
      currentQuestion.value++
      selectedAnswer.value = userAnswers.value[currentQuestion.value] ?? null
    } else {
      // Assessment completed
      finishAssessment()
    }
  }
}

const previousQuestion = () => {
  if (currentQuestion.value > 0) {
    userAnswers.value[currentQuestion.value] = selectedAnswer.value
    currentQuestion.value--
    selectedAnswer.value = userAnswers.value[currentQuestion.value] ?? null
  }
}

const finishAssessment = () => {
  // Save result to recent results
  const result = {
    id: Date.now(),
    type: currentAssessment.value?.title || '测试',
    score: finalScore.value,
    date: new Date().toISOString().split('T')[0]
  }
  
  recentResults.value.unshift(result)
  if (recentResults.value.length > 5) {
    recentResults.value.pop()
  }
  
  // Save to localStorage
  localStorage.setItem('assessment_results', JSON.stringify(recentResults.value))
  
  currentView.value = 'results'
}

const playAudio = () => {
  // This would play the audio file
  console.log('Playing audio...')
}

const retakeAssessment = () => {
  currentView.value = 'selection'
}

const goToHome = () => {
  router.push('/')
}

const viewResult = (result: any) => {
  console.log('Viewing result:', result)
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'bg-green-500'
  if (score >= 80) return 'bg-blue-500'
  if (score >= 70) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getScoreLevel = (score: number) => {
  if (score >= 90) return '优秀 - 你的英语水平很棒！'
  if (score >= 80) return '良好 - 继续保持努力！'
  if (score >= 70) return '及格 - 还有提升空间'
  return '需要加强 - 多多练习哦！'
}

// Load saved results on mount
onMounted(() => {
  const savedResults = localStorage.getItem('assessment_results')
  if (savedResults) {
    recentResults.value = JSON.parse(savedResults)
  }
})
</script>

<style scoped>
.assessment-page {
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

.assessment-page > * {
  animation: fadeIn 0.6s ease-out;
}

/* Hover effects */
.hover\:shadow-md:hover {
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Progress bar animation */
.bg-purple-600 {
  transition: width 0.3s ease-in-out;
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}
</style>