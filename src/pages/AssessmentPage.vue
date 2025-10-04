<template>
  <div class="assessment-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <a-card class="header-card">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">
              <ClipboardCheck class="w-8 h-8 mr-3" />
              英语能力评估
            </h1>
            <p class="page-description">
              全面评估你的听说读写能力，为你制定个性化学习计划
            </p>
          </div>
          <div class="header-stats">
            <div class="stat-item">
              <div class="stat-value">{{ completedAssessments }}</div>
              <div class="stat-label">已完成评估</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ averageScore }}%</div>
              <div class="stat-label">平均得分</div>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 评估选择界面 -->
    <div v-if="currentStep === 'selection'" class="assessment-selection">
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :sm="12" :lg="6" v-for="assessment in assessmentTypes" :key="assessment.id">
          <a-card 
            class="assessment-card"
            :class="{ selected: selectedAssessments.includes(assessment.id) }"
            @click="toggleAssessment(assessment.id)"
            hoverable
          >
            <div class="assessment-cover">
              <component :is="assessment.icon" class="w-12 h-12" />
              <div class="assessment-emoji">{{ assessment.emoji }}</div>
            </div>
            <a-card-meta 
              :title="assessment.title" 
              :description="assessment.description"
            />
            <div class="assessment-info">
              <div class="info-item">
                <Clock class="w-4 h-4 mr-1" />
                {{ assessment.duration }}分钟
              </div>
              <div class="info-item">
                <Target class="w-4 h-4 mr-1" />
                {{ assessment.questionCount }}题
              </div>
              <div class="info-item">
                <BarChart3 class="w-4 h-4 mr-1" />
                {{ assessment.difficulty }}
              </div>
            </div>
            <div class="assessment-actions">
              <a-checkbox 
                :checked="selectedAssessments.includes(assessment.id)"
                @change="toggleAssessment(assessment.id)"
              >
                选择此项评估
              </a-checkbox>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <div class="selection-actions">
        <a-card class="action-card">
          <div class="action-content">
            <div class="selected-info">
              <h3>已选择 {{ selectedAssessments.length }} 项评估</h3>
              <p>预计用时: {{ totalDuration }} 分钟</p>
            </div>
            <div class="action-buttons">
              <a-button 
                type="primary" 
                size="large"
                @click="startAssessment"
                :disabled="selectedAssessments.length === 0"
              >
                <Play class="w-4 h-4 mr-1" />
                开始评估
              </a-button>
              <a-button size="large" @click="viewHistory">
                <History class="w-4 h-4 mr-1" />
                查看历史
              </a-button>
            </div>
          </div>
        </a-card>
      </div>
    </div>

    <!-- 评估进行界面 -->
    <div v-else-if="currentStep === 'assessment'" class="assessment-progress">
      <!-- 进度条 -->
      <a-card class="progress-card">
        <div class="progress-header">
          <div class="current-assessment">
            <component :is="getCurrentAssessmentIcon()" class="w-6 h-6 mr-2" />
            {{ getCurrentAssessmentTitle() }}
          </div>
          <div class="progress-info">
            <span>{{ currentQuestionIndex + 1 }} / {{ currentAssessmentQuestions.length }}</span>
            <a-button type="text" @click="pauseAssessment">
              <Pause class="w-4 h-4" />
            </a-button>
          </div>
        </div>
        <a-progress 
          :percent="assessmentProgress" 
          :stroke-color="{ '0%': '#1890ff', '100%': '#52c41a' }"
        />
        <div class="time-remaining">
          <Clock class="w-4 h-4 mr-1" />
          剩余时间: {{ formatTime(timeRemaining) }}
        </div>
      </a-card>

      <!-- 题目内容 -->
      <a-card class="question-card">
        <!-- 听力评估 -->
        <div v-if="currentAssessmentType === 'listening'" class="listening-assessment">
          <div class="question-header">
            <h3>听力理解</h3>
            <div class="audio-controls">
              <a-button type="primary" @click="playAudio" size="large">
                <Headphones class="w-5 h-5 mr-2" />
                播放音频
              </a-button>
              <div class="play-info">
                <span>可播放 {{ remainingPlays }} 次</span>
              </div>
            </div>
          </div>
          
          <div class="question-content">
            <div class="question-text">{{ currentQuestion.question }}</div>
            <a-radio-group v-model:value="currentAnswer" class="answer-options">
              <div 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                class="option-item"
              >
                <a-radio :value="option.value">
                  <div class="option-content">
                    <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                    <span class="option-text">{{ option.text }}</span>
                  </div>
                </a-radio>
              </div>
            </a-radio-group>
          </div>
        </div>

        <!-- 口语评估 -->
        <div v-else-if="currentAssessmentType === 'speaking'" class="speaking-assessment">
          <div class="question-header">
            <h3>口语表达</h3>
            <div class="speaking-controls">
              <a-button 
                :type="isRecording ? 'danger' : 'primary'" 
                @click="toggleRecording"
                size="large"
              >
                <Mic class="w-5 h-5 mr-2" />
                {{ isRecording ? '停止录音' : '开始录音' }}
              </a-button>
              <div class="recording-info" v-if="isRecording">
                <div class="recording-indicator">
                  <div class="pulse"></div>
                  录音中... {{ recordingTime }}s
                </div>
              </div>
            </div>
          </div>
          
          <div class="question-content">
            <div class="question-text">{{ currentQuestion.question }}</div>
            <div class="speaking-prompt">
              <a-alert 
                :message="currentQuestion.prompt" 
                type="info" 
                show-icon 
                class="prompt-alert"
              />
            </div>
            <div class="preparation-time" v-if="preparationTime > 0">
              <Clock class="w-4 h-4 mr-1" />
              准备时间: {{ preparationTime }}s
            </div>
          </div>
        </div>

        <!-- 阅读评估 -->
        <div v-else-if="currentAssessmentType === 'reading'" class="reading-assessment">
          <div class="question-header">
            <h3>阅读理解</h3>
            <div class="reading-tools">
              <a-button @click="toggleHighlight" size="small" type="dashed">
                <Highlighter class="w-4 h-4 mr-1" />
                标记重点
              </a-button>
              <a-button @click="adjustFontSize" size="small" type="dashed">
                <Type class="w-4 h-4 mr-1" />
                调整字体
              </a-button>
            </div>
          </div>
          
          <div class="reading-content">
            <div class="passage-section">
              <div class="passage-text" :style="{ fontSize: fontSize + 'px' }">
                {{ currentQuestion.passage }}
              </div>
            </div>
            <div class="questions-section">
              <div class="question-item" v-for="(q, index) in currentQuestion.questions" :key="index">
                <div class="question-title">{{ index + 1 }}. {{ q.question }}</div>
                <a-radio-group v-model:value="readingAnswers[index]" class="question-options">
                  <div 
                    v-for="(option, optIndex) in q.options" 
                    :key="optIndex"
                    class="option-item"
                  >
                    <a-radio :value="option.value">
                      <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                      <span class="option-text">{{ option.text }}</span>
                    </a-radio>
                  </div>
                </a-radio-group>
              </div>
            </div>
          </div>
        </div>

        <!-- 写作评估 -->
        <div v-else-if="currentAssessmentType === 'writing'" class="writing-assessment">
          <div class="question-header">
            <h3>写作表达</h3>
            <div class="writing-tools">
              <a-button @click="showWritingTips = !showWritingTips" size="small" type="dashed">
                <Lightbulb class="w-4 h-4 mr-1" />
                写作提示
              </a-button>
              <div class="word-count">
                字数: {{ writingAnswer.length }} / {{ currentQuestion.minWords }}
              </div>
            </div>
          </div>
          
          <div class="question-content">
            <div class="question-text">{{ currentQuestion.question }}</div>
            <div v-if="showWritingTips" class="writing-tips">
              <a-alert 
                :message="currentQuestion.tips" 
                type="info" 
                show-icon 
                closable
                @close="showWritingTips = false"
              />
            </div>
            <div class="writing-area">
              <a-textarea
                v-model:value="writingAnswer"
                :placeholder="currentQuestion.placeholder"
                :rows="12"
                :maxlength="currentQuestion.maxWords"
                show-count
                class="writing-input"
              />
            </div>
          </div>
        </div>

        <!-- 题目导航 -->
        <div class="question-actions">
          <a-button 
            @click="previousQuestion" 
            :disabled="currentQuestionIndex === 0"
          >
            <ArrowLeft class="w-4 h-4 mr-1" />
            上一题
          </a-button>
          
          <div class="question-navigation">
            <a-button 
              v-for="(_, index) in currentAssessmentQuestions" 
              :key="index"
              :type="index === currentQuestionIndex ? 'primary' : 'default'"
              :class="{ 
                answered: isQuestionAnswered(index),
                current: index === currentQuestionIndex 
              }"
              @click="goToQuestion(index)"
              size="small"
            >
              {{ index + 1 }}
            </a-button>
          </div>

          <a-button 
            @click="nextQuestion" 
            :disabled="currentQuestionIndex === currentAssessmentQuestions.length - 1"
            type="primary"
          >
            下一题
            <ArrowRight class="w-4 h-4 ml-1" />
          </a-button>
        </div>

        <div class="submit-section" v-if="currentQuestionIndex === currentAssessmentQuestions.length - 1">
          <a-button 
            type="primary" 
            size="large"
            @click="submitAssessment"
            :loading="submitting"
          >
            <Check class="w-4 h-4 mr-1" />
            提交评估
          </a-button>
        </div>
      </a-card>
    </div>

    <!-- 评估结果界面 -->
    <div v-else-if="currentStep === 'results'" class="assessment-results">
      <a-card class="results-header">
        <div class="results-title">
          <Trophy class="w-8 h-8 mr-3 text-yellow-500" />
          <h2>评估完成！</h2>
        </div>
        <div class="overall-score">
          <div class="score-circle">
            <a-progress 
              type="circle" 
              :percent="overallScore" 
              :size="120"
              :stroke-color="getScoreColor(overallScore)"
            />
          </div>
          <div class="score-info">
            <div class="score-label">综合得分</div>
            <div class="score-level">{{ getScoreLevel(overallScore) }}</div>
          </div>
        </div>
      </a-card>

      <!-- 技能雷达图 -->
      <a-card class="skills-radar" title="技能分析">
        <div class="radar-container">
          <div ref="radarChart" class="radar-chart"></div>
        </div>
        <div class="skills-breakdown">
          <div 
            v-for="skill in skillScores" 
            :key="skill.name"
            class="skill-item"
          >
            <div class="skill-info">
              <component :is="skill.icon" class="w-5 h-5 mr-2" />
              <span class="skill-name">{{ skill.name }}</span>
            </div>
            <div class="skill-score">
              <a-progress 
                :percent="skill.score" 
                :stroke-color="getScoreColor(skill.score)"
                :show-info="false"
              />
              <span class="score-text">{{ skill.score }}%</span>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 详细分析 -->
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :lg="12">
          <a-card title="强项分析" class="strengths-card">
            <div class="analysis-content">
              <div v-for="strength in strengths" :key="strength.skill" class="analysis-item">
                <div class="item-header">
                  <CheckCircle class="w-5 h-5 text-green-500 mr-2" />
                  <span class="item-title">{{ strength.skill }}</span>
                  <a-tag color="green">{{ strength.score }}%</a-tag>
                </div>
                <div class="item-description">{{ strength.description }}</div>
              </div>
            </div>
          </a-card>
        </a-col>
        
        <a-col :xs="24" :lg="12">
          <a-card title="改进建议" class="improvements-card">
            <div class="analysis-content">
              <div v-for="improvement in improvements" :key="improvement.skill" class="analysis-item">
                <div class="item-header">
                  <AlertCircle class="w-5 h-5 text-orange-500 mr-2" />
                  <span class="item-title">{{ improvement.skill }}</span>
                  <a-tag color="orange">{{ improvement.score }}%</a-tag>
                </div>
                <div class="item-description">{{ improvement.suggestion }}</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 学习推荐 -->
      <a-card title="个性化学习推荐" class="recommendations-card">
        <div class="recommendations-content">
          <a-row :gutter="[16, 16]">
            <a-col :xs="24" :sm="12" :lg="8" v-for="recommendation in recommendations" :key="recommendation.id">
              <div class="recommendation-item">
                <div class="recommendation-header">
                  <component :is="recommendation.icon" class="w-6 h-6 mr-2" />
                  <span class="recommendation-title">{{ recommendation.title }}</span>
                </div>
                <div class="recommendation-description">{{ recommendation.description }}</div>
                <div class="recommendation-actions">
                  <a-button type="primary" size="small" @click="startRecommendedLearning(recommendation.id)">
                    开始学习
                  </a-button>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
      </a-card>

      <!-- 结果操作 -->
      <div class="results-actions">
        <a-card class="actions-card">
          <div class="actions-content">
            <a-button type="primary" size="large" @click="saveResults">
              <Save class="w-4 h-4 mr-1" />
              保存结果
            </a-button>
            <a-button size="large" @click="shareResults">
              <Share2 class="w-4 h-4 mr-1" />
              分享成绩
            </a-button>
            <a-button size="large" @click="downloadReport">
              <Download class="w-4 h-4 mr-1" />
              下载报告
            </a-button>
            <a-button size="large" @click="retakeAssessment">
              <RotateCcw class="w-4 h-4 mr-1" />
              重新评估
            </a-button>
          </div>
        </a-card>
      </div>
    </div>

    <!-- 暂停对话框 -->
    <a-modal
      v-model:open="showPauseModal"
      title="暂停评估"
      :footer="null"
      class="pause-modal"
    >
      <div class="pause-content">
        <Pause class="w-12 h-12 text-gray-400 mb-4" />
        <h3>评估已暂停</h3>
        <p>你可以稍后继续完成评估，进度将会保存。</p>
        <div class="pause-actions">
          <a-button type="primary" @click="resumeAssessment" size="large">
            <Play class="w-4 h-4 mr-1" />
            继续评估
          </a-button>
          <a-button @click="exitAssessment" size="large">
            <X class="w-4 h-4 mr-1" />
            退出评估
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { storage } from '@/utils/storage'
import * as echarts from 'echarts'
import {
  ClipboardCheck,
  Headphones,
  Mic,
  BookOpen,
  PenTool,
  Clock,
  Target,
  BarChart3,
  Play,
  History,
  Pause,
  ArrowLeft,
  ArrowRight,
  Check,
  Trophy,
  CheckCircle,
  AlertCircle,
  Save,
  Share2,
  Download,
  RotateCcw,
  X,
  Highlighter,
  Type,
  Lightbulb,
  Volume2
} from 'lucide-vue-next'

interface AssessmentType {
  id: string
  title: string
  description: string
  icon: any
  emoji: string
  duration: number
  questionCount: number
  difficulty: string
}

interface Question {
  id: string
  type: string
  question: string
  options?: Array<{ text: string; value: string }>
  answer: string | string[]
  audioUrl?: string
  passage?: string
  questions?: Array<{
    question: string
    options: Array<{ text: string; value: string }>
    answer: string
  }>
  prompt?: string
  tips?: string
  placeholder?: string
  minWords?: number
  maxWords?: number
}

const router = useRouter()

// 响应式数据
const currentStep = ref<'selection' | 'assessment' | 'results'>('selection')
const selectedAssessments = ref<string[]>([])
const currentAssessmentIndex = ref(0)
const currentQuestionIndex = ref(0)
const currentAnswer = ref('')
const readingAnswers = ref<string[]>([])
const writingAnswer = ref('')
const isRecording = ref(false)
const recordingTime = ref(0)
const preparationTime = ref(30)
const remainingPlays = ref(3)
const timeRemaining = ref(0)
const submitting = ref(false)
const showPauseModal = ref(false)
const showWritingTips = ref(false)
const fontSize = ref(16)

// 评估结果数据
const overallScore = ref(0)
const skillScores = ref([
  { name: '听力', icon: Headphones, score: 0 },
  { name: '口语', icon: Mic, score: 0 },
  { name: '阅读', icon: BookOpen, score: 0 },
  { name: '写作', icon: PenTool, score: 0 }
])

const strengths = ref([])
const improvements = ref([])
const recommendations = ref([])

// 统计数据
const completedAssessments = ref(5)
const averageScore = ref(78)

// 评估类型配置
const assessmentTypes: AssessmentType[] = [
  {
    id: 'listening',
    title: '听力理解',
    description: '测试英语听力水平和理解能力',
    icon: Headphones,
    emoji: '👂',
    duration: 20,
    questionCount: 15,
    difficulty: '中等'
  },
  {
    id: 'speaking',
    title: '口语表达',
    description: '评估英语口语发音和表达能力',
    icon: Mic,
    emoji: '🗣️',
    duration: 15,
    questionCount: 8,
    difficulty: '中等'
  },
  {
    id: 'reading',
    title: '阅读理解',
    description: '检测英语阅读速度和理解深度',
    icon: BookOpen,
    emoji: '📖',
    duration: 25,
    questionCount: 20,
    difficulty: '中等'
  },
  {
    id: 'writing',
    title: '写作表达',
    description: '测试英语写作技巧和语法运用',
    icon: PenTool,
    emoji: '✍️',
    duration: 30,
    questionCount: 5,
    difficulty: '较难'
  }
]

// 模拟题目数据
const mockQuestions = {
  listening: [
    {
      id: '1',
      type: 'listening',
      question: '听录音，选择正确答案：What is the weather like today?',
      options: [
        { text: 'Sunny', value: 'A' },
        { text: 'Rainy', value: 'B' },
        { text: 'Cloudy', value: 'C' },
        { text: 'Snowy', value: 'D' }
      ],
      answer: 'A',
      audioUrl: '/audio/weather.mp3'
    }
  ],
  speaking: [
    {
      id: '1',
      type: 'speaking',
      question: '请用英语描述你最喜欢的季节',
      prompt: '请在30秒内准备，然后用1-2分钟时间回答这个问题。',
      answer: ''
    }
  ],
  reading: [
    {
      id: '1',
      type: 'reading',
      question: '阅读下面的短文，回答问题',
      passage: 'Tom is a student. He likes reading books and playing football. Every morning, he goes to school by bus. His favorite subject is English.',
      questions: [
        {
          question: 'What does Tom like to do?',
          options: [
            { text: 'Reading and swimming', value: 'A' },
            { text: 'Reading and playing football', value: 'B' },
            { text: 'Playing games', value: 'C' },
            { text: 'Watching TV', value: 'D' }
          ],
          answer: 'B'
        }
      ]
    }
  ],
  writing: [
    {
      id: '1',
      type: 'writing',
      question: '请写一篇关于"我的学校"的短文',
      tips: '可以从学校的位置、建筑、老师、同学等方面来描述',
      placeholder: '请在这里写下你的作文...',
      minWords: 50,
      maxWords: 200,
      answer: ''
    }
  ]
}

// 计算属性
const totalDuration = computed(() => {
  return selectedAssessments.value.reduce((total, id) => {
    const assessment = assessmentTypes.find(a => a.id === id)
    return total + (assessment?.duration || 0)
  }, 0)
})

const currentAssessmentType = computed(() => {
  return selectedAssessments.value[currentAssessmentIndex.value]
})

const currentAssessmentQuestions = computed(() => {
  const type = currentAssessmentType.value
  return mockQuestions[type] || []
})

const currentQuestion = computed(() => {
  return currentAssessmentQuestions.value[currentQuestionIndex.value]
})

const assessmentProgress = computed(() => {
  if (currentAssessmentQuestions.value.length === 0) return 0
  return Math.round(((currentQuestionIndex.value + 1) / currentAssessmentQuestions.value.length) * 100)
})

// 方法
const toggleAssessment = (id: string) => {
  const index = selectedAssessments.value.indexOf(id)
  if (index > -1) {
    selectedAssessments.value.splice(index, 1)
  } else {
    selectedAssessments.value.push(id)
  }
}

const startAssessment = () => {
  if (selectedAssessments.value.length === 0) {
    message.warning('请至少选择一项评估')
    return
  }
  
  currentStep.value = 'assessment'
  currentAssessmentIndex.value = 0
  currentQuestionIndex.value = 0
  
  // 设置计时器
  const assessment = assessmentTypes.find(a => a.id === currentAssessmentType.value)
  if (assessment) {
    timeRemaining.value = assessment.duration * 60 // 转换为秒
    startTimer()
  }
}

const startTimer = () => {
  const timer = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      clearInterval(timer)
      submitAssessment()
    }
  }, 1000)
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getCurrentAssessmentIcon = () => {
  const assessment = assessmentTypes.find(a => a.id === currentAssessmentType.value)
  return assessment?.icon || ClipboardCheck
}

const getCurrentAssessmentTitle = () => {
  const assessment = assessmentTypes.find(a => a.id === currentAssessmentType.value)
  return assessment?.title || '评估'
}

const playAudio = () => {
  if (remainingPlays.value > 0) {
    remainingPlays.value--
    message.info('播放音频...')
    // 这里实现音频播放逻辑
  } else {
    message.warning('播放次数已用完')
  }
}

const toggleRecording = () => {
  if (isRecording.value) {
    // 停止录音
    isRecording.value = false
    recordingTime.value = 0
    message.success('录音已停止')
  } else {
    // 开始录音
    if (preparationTime.value > 0) {
      message.warning(`请先完成${preparationTime.value}秒的准备时间`)
      return
    }
    isRecording.value = true
    // 开始计时
    const timer = setInterval(() => {
      recordingTime.value++
      if (recordingTime.value >= 120) { // 最多录音2分钟
        clearInterval(timer)
        toggleRecording()
      }
    }, 1000)
  }
}

const toggleHighlight = () => {
  message.info('标记功能开发中...')
}

const adjustFontSize = () => {
  fontSize.value = fontSize.value === 16 ? 18 : fontSize.value === 18 ? 20 : 16
  message.info(`字体大小调整为 ${fontSize.value}px`)
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    resetQuestionState()
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < currentAssessmentQuestions.value.length - 1) {
    currentQuestionIndex.value++
    resetQuestionState()
  }
}

const goToQuestion = (index: number) => {
  currentQuestionIndex.value = index
  resetQuestionState()
}

const resetQuestionState = () => {
  currentAnswer.value = ''
  writingAnswer.value = ''
  remainingPlays.value = 3
  preparationTime.value = 30
}

const isQuestionAnswered = (index: number): boolean => {
  // 这里应该检查对应题目是否已回答
  return false
}

const pauseAssessment = () => {
  showPauseModal.value = true
}

const resumeAssessment = () => {
  showPauseModal.value = false
}

const exitAssessment = () => {
  router.push('/')
}

const submitAssessment = async () => {
  submitting.value = true
  
  try {
    // 模拟提交评估
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 生成评估结果
    generateResults()
    
    currentStep.value = 'results'
    message.success('评估提交成功！')
  } catch (error) {
    message.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const generateResults = () => {
  // 模拟生成评估结果
  overallScore.value = Math.floor(Math.random() * 30) + 70 // 70-100分
  
  skillScores.value = skillScores.value.map(skill => ({
    ...skill,
    score: Math.floor(Math.random() * 40) + 60 // 60-100分
  }))
  
  // 生成强项和改进建议
  const highScores = skillScores.value.filter(s => s.score >= 80)
  const lowScores = skillScores.value.filter(s => s.score < 75)
  
  strengths.value = highScores.map(skill => ({
    skill: skill.name,
    score: skill.score,
    description: `你在${skill.name}方面表现优秀，继续保持！`
  }))
  
  improvements.value = lowScores.map(skill => ({
    skill: skill.name,
    score: skill.score,
    suggestion: `建议多练习${skill.name}相关内容，提高这方面的能力。`
  }))
  
  // 生成学习推荐
  recommendations.value = [
    {
      id: 'vocabulary',
      title: '词汇强化',
      description: '针对性提升词汇量',
      icon: BookOpen
    },
    {
      id: 'grammar',
      title: '语法练习',
      description: '系统学习语法规则',
      icon: PenTool
    },
    {
      id: 'listening',
      title: '听力训练',
      description: '提高听力理解能力',
      icon: Headphones
    }
  ]
  
  // 绘制雷达图
  nextTick(() => {
    drawRadarChart()
  })
}

const radarChart = ref(null)

const drawRadarChart = () => {
  if (!radarChart.value) return
  
  const chart = echarts.init(radarChart.value)
  
  const option = {
    radar: {
      indicator: skillScores.value.map(skill => ({
        name: skill.name,
        max: 100
      })),
      radius: '60%'
    },
    series: [{
      type: 'radar',
      data: [{
        value: skillScores.value.map(skill => skill.score),
        name: '技能得分',
        areaStyle: {
          color: 'rgba(24, 144, 255, 0.2)'
        },
        lineStyle: {
          color: '#1890ff'
        }
      }]
    }]
  }
  
  chart.setOption(option)
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return '#52c41a'
  if (score >= 80) return '#1890ff'
  if (score >= 70) return '#faad14'
  return '#ff4d4f'
}

const getScoreLevel = (score: number): string => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  return '需要提高'
}

const saveResults = () => {
  // 保存评估结果到本地存储
  const results = {
    date: new Date(),
    overallScore: overallScore.value,
    skillScores: skillScores.value,
    assessmentTypes: selectedAssessments.value
  }
  
  // 这里可以调用storage保存结果
  message.success('评估结果已保存')
}

const shareResults = () => {
  const text = `我在英语能力评估中获得了${overallScore.value}分的成绩！`
  
  if (navigator.share) {
    navigator.share({
      title: '英语评估成绩',
      text,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(text).then(() => {
      message.success('成绩已复制到剪贴板')
    })
  }
}

const downloadReport = () => {
  message.info('报告下载功能开发中...')
}

const retakeAssessment = () => {
  currentStep.value = 'selection'
  selectedAssessments.value = []
  currentAssessmentIndex.value = 0
  currentQuestionIndex.value = 0
}

const startRecommendedLearning = (recommendationId: string) => {
  message.info(`开始${recommendationId}学习...`)
  router.push('/games')
}

const viewHistory = () => {
  message.info('查看历史功能开发中...')
}

// 生命周期
onMounted(() => {
  // 初始化数据
})

onUnmounted(() => {
  // 清理资源
})
</script>

<style scoped lang="less">
.assessment-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 24px;

  .page-header {
    margin-bottom: 24px;

    .header-card {
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-info {
          .page-title {
            display: flex;
            align-items: center;
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }

          .page-description {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
          }
        }

        .header-stats {
          display: flex;
          gap: 32px;

          .stat-item {
            text-align: center;

            .stat-value {
              font-size: 24px;
              font-weight: 600;
              color: #1890ff;
              margin-bottom: 4px;
            }

            .stat-label {
              font-size: 14px;
              color: #6b7280;
            }
          }
        }
      }
    }
  }

  .assessment-selection {
    .assessment-card {
      height: 100%;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      &.selected {
        border-color: #1890ff;
        box-shadow: 0 4px 16px rgba(24, 144, 255, 0.2);
      }

      .assessment-cover {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        margin-bottom: 16px;
        position: relative;
        color: white;

        .assessment-emoji {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 20px;
        }
      }

      .assessment-info {
        margin: 16px 0;

        .info-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
          color: #6b7280;
        }
      }

      .assessment-actions {
        margin-top: 16px;
      }
    }

    .selection-actions {
      margin-top: 32px;

      .action-card {
        .action-content {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .selected-info {
            h3 {
              margin-bottom: 4px;
              color: #1f2937;
            }

            p {
              color: #6b7280;
              margin: 0;
            }
          }

          .action-buttons {
            display: flex;
            gap: 12px;
          }
        }
      }
    }
  }

  .assessment-progress {
    .progress-card {
      margin-bottom: 24px;

      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .current-assessment {
          display: flex;
          align-items: center;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .progress-info {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #6b7280;
        }
      }

      .time-remaining {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 12px;
        color: #f59e0b;
        font-weight: 500;
      }
    }

    .question-card {
      min-height: 600px;

      .listening-assessment,
      .speaking-assessment,
      .reading-assessment,
      .writing-assessment {
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;

          h3 {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
          }

          .audio-controls,
          .speaking-controls,
          .reading-tools,
          .writing-tools {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .play-info,
          .recording-info,
          .word-count {
            font-size: 14px;
            color: #6b7280;
          }

          .recording-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #ef4444;

            .pulse {
              width: 8px;
              height: 8px;
              background: #ef4444;
              border-radius: 50%;
              animation: pulse 1s infinite;
            }
          }
        }

        .question-content {
          .question-text {
            font-size: 18px;
            line-height: 1.6;
            color: #1f2937;
            margin-bottom: 24px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
          }

          .answer-options {
            .option-item {
              margin-bottom: 12px;
              padding: 12px;
              border-radius: 8px;
              transition: all 0.3s;

              &:hover {
                background: #f9fafb;
              }

              .option-content {
                display: flex;
                align-items: center;
                gap: 8px;

                .option-label {
                  font-weight: 600;
                  color: #374151;
                  min-width: 24px;
                }
              }
            }
          }

          .speaking-prompt,
          .writing-tips {
            margin-bottom: 16px;

            .prompt-alert {
              border-radius: 8px;
            }
          }

          .preparation-time {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px;
            background: #fff7ed;
            border-radius: 8px;
            color: #ea580c;
            font-weight: 500;
            margin-bottom: 16px;
          }

          .writing-area {
            .writing-input {
              border-radius: 8px;
              font-size: 16px;
              line-height: 1.6;
            }
          }
        }
      }

      .reading-assessment {
        .reading-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;

          .passage-section {
            .passage-text {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              line-height: 1.8;
              margin-bottom: 16px;
            }
          }

          .questions-section {
            .question-item {
              margin-bottom: 20px;
              padding: 16px;
              background: #f9fafb;
              border-radius: 8px;

              .question-title {
                font-weight: 600;
                margin-bottom: 12px;
                color: #1f2937;
              }
            }
          }
        }
      }

      .question-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #f0f0f0;

        .question-navigation {
          display: flex;
          gap: 8px;

          .ant-btn {
            &.answered {
              background: #f6ffed;
              border-color: #b7eb8f;
            }

            &.current {
              background: #1890ff;
              border-color: #1890ff;
              color: white;
            }
          }
        }
      }

      .submit-section {
        text-align: center;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #f0f0f0;
      }
    }
  }

  .assessment-results {
    .results-header {
      text-align: center;
      margin-bottom: 32px;

      .results-title {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;

        h2 {
          margin: 0;
          color: #1f2937;
        }
      }

      .overall-score {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 32px;

        .score-info {
          text-align: left;

          .score-label {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 8px;
          }

          .score-level {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
          }
        }
      }
    }

    .skills-radar {
      margin-bottom: 24px;

      .radar-container {
        .radar-chart {
          height: 300px;
        }
      }

      .skills-breakdown {
        margin-top: 24px;

        .skill-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;

          .skill-info {
            display: flex;
            align-items: center;

            .skill-name {
              font-weight: 500;
              color: #1f2937;
            }
          }

          .skill-score {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            max-width: 200px;

            .score-text {
              font-weight: 600;
              color: #1f2937;
              min-width: 40px;
            }
          }
        }
      }
    }

    .strengths-card,
    .improvements-card {
      .analysis-content {
        .analysis-item {
          margin-bottom: 16px;

          .item-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;

            .item-title {
              font-weight: 500;
              color: #1f2937;
              margin-right: 8px;
            }
          }

          .item-description {
            color: #6b7280;
            line-height: 1.5;
          }
        }
      }
    }

    .recommendations-card {
      margin-bottom: 24px;

      .recommendations-content {
        .recommendation-item {
          padding: 16px;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          transition: all 0.3s;

          &:hover {
            border-color: #1890ff;
            box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
          }

          .recommendation-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;

            .recommendation-title {
              font-weight: 500;
              color: #1f2937;
            }
          }

          .recommendation-description {
            color: #6b7280;
            margin-bottom: 12px;
            line-height: 1.5;
          }

          .recommendation-actions {
            text-align: right;
          }
        }
      }
    }

    .results-actions {
      .actions-card {
        .actions-content {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
      }
    }
  }

  .pause-modal {
    .pause-content {
      text-align: center;
      padding: 20px;

      h3 {
        margin: 16px 0 8px;
        color: #1f2937;
      }

      p {
        color: #6b7280;
        margin-bottom: 24px;
      }

      .pause-actions {
        display: flex;
        justify-content: center;
        gap: 12px;
      }
    }
  }
}

// 动画效果
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .assessment-page {
    padding: 16px;

    .page-header {
      .header-card .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;

        .header-stats {
          gap: 16px;
        }
      }
    }

    .assessment-selection {
      .selection-actions {
        .action-card .action-content {
          flex-direction: column;
          gap: 16px;
          text-align: center;
        }
      }
    }

    .assessment-progress {
      .progress-card .progress-header {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }

      .question-card {
        .reading-assessment .reading-content {
          grid-template-columns: 1fr;
        }

        .question-actions {
          flex-direction: column;
          gap: 16px;

          .question-navigation {
            order: -1;
          }
        }
      }
    }

    .assessment-results {
      .overall-score {
        flex-direction: column;
        gap: 16px;

        .score-info {
          text-align: center;
        }
      }

      .results-actions .actions-content {
        flex-direction: column;
      }
    }
  }
}
</style>