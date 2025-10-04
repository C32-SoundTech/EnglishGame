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
                @change="enhancedToggleAssessment(assessment.id)"
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
                @click="enhancedStartAssessment"
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
              <a-button type="primary" @click="enhancedPlayAudio" size="large">
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
                @click="enhancedToggleRecording"
                size="large"
                :disabled="preparationTime > 0"
              >
                <Mic class="w-5 h-5 mr-2" />
                {{ isRecording ? '停止录音' : '开始录音' }}
              </a-button>
              <a-button 
                v-if="recordedAudio && !isRecording"
                @click="playRecording"
                type="default"
                size="large"
              >
                <Play class="w-5 h-5 mr-2" />
                播放录音
              </a-button>
              <a-button 
                v-if="recordedAudio && !isRecording"
                @click="clearRecording"
                type="default"
                size="large"
              >
                <RotateCcw class="w-5 h-5 mr-2" />
                重新录音
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
            <div class="speaking-feedback" v-if="recordedAudio">
              <a-alert 
                message="录音完成" 
                description="你可以播放录音检查，或者重新录音。满意后请继续下一题。"
                type="success" 
                show-icon 
              />
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
            @click="enhancedPreviousQuestion" 
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
            @click="enhancedNextQuestion" 
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
            @click="enhancedSubmitAssessment"
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

      <!-- 技能雷达图和结果图表 -->
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :lg="12">
          <a-card class="skills-radar" title="技能分析">
            <SkillRadarChart :skill-data="skillScores" />
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="12">
          <a-card class="assessment-results-chart" title="评估结果趋势">
            <AssessmentResultChart 
              :assessment-data="assessmentHistory" 
              :current-score="overallScore"
            />
          </a-card>
        </a-col>
      </a-row>

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
      :show-bubbles="currentStep === 'assessment'"
      :show-stars="currentStep === 'results'"
      :show-hearts="false"
      :show-rainbows="currentStep === 'results' && overallScore >= 90"
      :show-clouds="true"
      :show-flowers="false"
      :show-notes="currentStep === 'assessment'"
      :show-gifts="currentStep === 'results' && overallScore >= 85"
      :count="6"
      :duration="12000"
      :intensity="0.5"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { storage } from '@/utils/storage'
import SkillRadarChart from '@/components/SkillRadarChart.vue'
import AssessmentResultChart from '@/components/AssessmentResultChart.vue'
import RewardAnimation from '@/components/RewardAnimation.vue'
import SoundEffects from '@/components/animations/SoundEffects.vue'
import FloatingElements from '@/components/animations/FloatingElements.vue'
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

// 评估历史数据
const assessmentHistory = ref([
  { date: '2024-01-15', listening: 75, speaking: 68, reading: 82, writing: 70, overall: 74 },
  { date: '2024-01-22', listening: 78, speaking: 72, reading: 85, writing: 73, overall: 77 },
  { date: '2024-01-29', listening: 82, speaking: 75, reading: 88, writing: 76, overall: 80 },
  { date: '2024-02-05', listening: 85, speaking: 78, reading: 90, writing: 79, overall: 83 },
  { date: '2024-02-12', listening: 88, speaking: 82, reading: 92, writing: 82, overall: 86 }
])

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
      subType: 'dialogue',
      question: '听对话，选择正确答案：What does Tom want to do this weekend?',
      options: [
        { text: 'Go to the park', value: 'A' },
        { text: 'Visit his grandma', value: 'B' },
        { text: 'Play football', value: 'C' },
        { text: 'Watch a movie', value: 'D' }
      ],
      answer: 'C',
      audioUrl: '/audio/dialogue1.mp3',
      transcript: 'A: Tom, what are your plans for this weekend? B: I want to play football with my friends in the park.',
      difficulty: 'easy',
      skills: ['basic_comprehension', 'dialogue_understanding']
    },
    {
      id: '4',
      type: 'listening',
      subType: 'dictation',
      question: '听写练习：请写出你听到的句子',
      audioUrl: '/audio/dictation1.mp3',
      transcript: 'The weather is very nice today.',
      answer: 'The weather is very nice today.',
      difficulty: 'easy',
      skills: ['spelling', 'listening_accuracy']
    },
    {
      id: '5',
      type: 'listening',
      subType: 'sound_discrimination',
      question: '音素辨析：选择你听到的单词',
      options: [
        { text: 'ship', value: 'A' },
        { text: 'sheep', value: 'B' },
        { text: 'shop', value: 'C' },
        { text: 'shape', value: 'D' }
      ],
      answer: 'B',
      audioUrl: '/audio/sound1.mp3',
      transcript: 'sheep',
      difficulty: 'medium',
      skills: ['phonetic_discrimination', 'pronunciation_awareness']
    },
    {
      id: '2',
      type: 'listening',
      subType: 'passage',
      question: '听短文，回答问题：What is the main topic of the passage?',
      options: [
        { text: 'School life', value: 'A' },
        { text: 'Family activities', value: 'B' },
        { text: 'Weather changes', value: 'C' },
        { text: 'Holiday plans', value: 'D' }
      ],
      answer: 'A',
      audioUrl: '/audio/passage1.mp3',
      transcript: 'Students at Green Valley School have many interesting activities...',
      difficulty: 'medium',
      skills: ['passage_comprehension', 'main_idea_identification']
    },
    {
      id: '3',
      type: 'listening',
      subType: 'detail',
      question: '听录音，选择你听到的具体信息：What time does the library close?',
      options: [
        { text: '5:00 PM', value: 'A' },
        { text: '6:00 PM', value: 'B' },
        { text: '7:00 PM', value: 'C' },
        { text: '8:00 PM', value: 'D' }
      ],
      answer: 'B',
      audioUrl: '/audio/detail1.mp3',
      transcript: 'The library is open from 9 AM to 6 PM on weekdays.',
      difficulty: 'easy',
      skills: ['detail_comprehension', 'information_extraction']
    }
  ],
  speaking: [
    {
      id: '1',
      type: 'speaking',
      subType: 'pronunciation',
      question: '请朗读下面的句子，注意发音准确性',
      text: 'The quick brown fox jumps over the lazy dog.',
      targetWords: ['quick', 'brown', 'jumps', 'lazy'],
      answer: '',
      criteria: {
        pronunciation: 0,
        fluency: 0,
        intonation: 0
      },
      skills: ['pronunciation_accuracy', 'phonetic_awareness']
    },
    {
      id: '2',
      type: 'speaking',
      subType: 'description',
      question: '请用英语描述你最喜欢的季节，说明原因',
      prompt: '请在30秒内准备，然后用1-2分钟时间回答这个问题。可以从天气、活动、感受等方面来描述。',
      keywords: ['season', 'weather', 'activities', 'feelings'],
      answer: '',
      criteria: {
        vocabulary: 0,
        grammar: 0,
        fluency: 0,
        content: 0
      },
      skills: ['descriptive_speaking', 'vocabulary_usage', 'fluency']
    },
    {
      id: '3',
      type: 'speaking',
      subType: 'conversation',
      question: '角色扮演：你是一名学生，向老师请假',
      scenario: '你因为生病需要请假一天，请用英语向老师说明情况',
      prompt: '请准备30秒，然后开始对话',
      answer: '',
      criteria: {
        appropriateness: 0,
        clarity: 0,
        politeness: 0
      },
      skills: ['conversational_skills', 'social_interaction', 'politeness']
    },
    {
      id: '4',
      type: 'speaking',
      subType: 'storytelling',
      question: '讲述一个你印象深刻的经历',
      prompt: '请用英语讲述一个你印象深刻的经历，可以是旅行、节日或特殊事件。时间2-3分钟。',
      keywords: ['experience', 'memory', 'feelings', 'details'],
      answer: '',
      criteria: {
        narrative_structure: 0,
        vocabulary: 0,
        grammar: 0,
        engagement: 0
      },
      skills: ['narrative_speaking', 'story_structure', 'emotional_expression']
    },
    {
      id: '5',
      type: 'speaking',
      subType: 'picture_description',
      question: '看图说话',
      imageUrl: '/images/assessment/park_scene.jpg',
      prompt: '请观察这张图片，用英语描述你看到的内容，包括人物、活动、环境等。',
      keywords: ['people', 'activities', 'environment', 'details'],
      answer: '',
      criteria: {
        observation: 0,
        description: 0,
        vocabulary: 0,
        organization: 0
      },
      skills: ['visual_description', 'observational_skills', 'descriptive_vocabulary']
    }
  ],
  reading: [
    {
      id: '1',
      type: 'reading',
      subType: 'comprehension',
      question: '阅读理解',
      passage: 'Tom is a ten-year-old boy who loves animals. He has a pet dog named Max and a cat named Whiskers. Every morning, Tom feeds his pets before going to school. Max likes to play fetch in the garden, while Whiskers prefers to sleep in the sunny spot by the window. Tom dreams of becoming a veterinarian when he grows up so he can help more animals.',
      questions: [
        {
          question: 'How old is Tom?',
          options: [
            { text: 'Nine years old', value: 'A' },
            { text: 'Ten years old', value: 'B' },
            { text: 'Eleven years old', value: 'C' },
            { text: 'Twelve years old', value: 'D' }
          ],
          answer: 'B'
        },
        {
          question: 'What does Tom want to be when he grows up?',
          options: [
            { text: 'A teacher', value: 'A' },
            { text: 'A doctor', value: 'B' },
            { text: 'A veterinarian', value: 'C' },
            { text: 'A farmer', value: 'D' }
          ],
          answer: 'C'
        }
      ],
      difficulty: 'easy',
      skills: ['reading_comprehension', 'detail_extraction', 'inference']
    },
    {
      id: '2',
      type: 'reading',
      subType: 'cloze',
      question: '完形填空',
      passage: 'Last summer, my family went on a __(1)__ to the beach. The weather was __(2)__ and sunny. We built sandcastles and __(3)__ in the ocean. My little sister collected __(4)__ shells along the shore. It was one of the __(5)__ days of my summer vacation.',
      blanks: [
        {
          id: 1,
          options: ['trip', 'walk', 'run', 'jump'],
          answer: 'trip'
        },
        {
          id: 2,
          options: ['cold', 'hot', 'warm', 'cool'],
          answer: 'warm'
        },
        {
          id: 3,
          options: ['swam', 'flew', 'ran', 'walked'],
          answer: 'swam'
        },
        {
          id: 4,
          options: ['big', 'small', 'beautiful', 'ugly'],
          answer: 'beautiful'
        },
        {
          id: 5,
          options: ['worst', 'bad', 'good', 'best'],
          answer: 'best'
        }
      ],
      difficulty: 'medium',
      skills: ['context_clues', 'vocabulary_in_context', 'grammar_awareness']
    },
    {
      id: '3',
      type: 'reading',
      subType: 'vocabulary',
      question: '词汇理解',
      passage: 'The magnificent castle stood proudly on the hilltop, overlooking the vast countryside below.',
      questions: [
        {
          question: 'What does "magnificent" mean in this sentence?',
          options: [
            { text: 'Small and simple', value: 'A' },
            { text: 'Old and broken', value: 'B' },
            { text: 'Grand and impressive', value: 'C' },
            { text: 'Dark and scary', value: 'D' }
          ],
          answer: 'C'
        }
      ],
      difficulty: 'medium',
      skills: ['vocabulary_comprehension', 'word_meaning', 'context_analysis']
    },
    {
      id: '4',
      type: 'reading',
      subType: 'inference',
      question: '推理判断',
      passage: 'Sarah looked at her watch nervously. The train was supposed to arrive at 3:15 PM, but it was already 3:30 PM. She tapped her foot impatiently and kept glancing at the empty tracks. Her suitcase sat beside her, packed with everything she needed for her important job interview tomorrow.',
      questions: [
        {
          question: 'How is Sarah probably feeling?',
          options: [
            { text: 'Excited and happy', value: 'A' },
            { text: 'Worried and anxious', value: 'B' },
            { text: 'Calm and relaxed', value: 'C' },
            { text: 'Angry and frustrated', value: 'D' }
          ],
          answer: 'B'
        },
        {
          question: 'What can we infer about Sarah\'s situation?',
          options: [
            { text: 'She is going on vacation', value: 'A' },
            { text: 'She is late for an important event', value: 'B' },
            { text: 'She is meeting a friend', value: 'C' },
            { text: 'She is returning home', value: 'D' }
          ],
          answer: 'B'
        }
      ],
      difficulty: 'hard',
      skills: ['inference_skills', 'emotional_understanding', 'contextual_reasoning']
    },
    {
      id: '5',
      type: 'reading',
      subType: 'scanning',
      question: '信息查找',
      passage: 'City Library Opening Hours:\nMonday-Friday: 9:00 AM - 8:00 PM\nSaturday: 10:00 AM - 6:00 PM\nSunday: 12:00 PM - 5:00 PM\n\nSpecial Services:\n- Computer Lab: Available during all opening hours\n- Children\'s Story Time: Saturdays at 2:00 PM\n- Book Club Meeting: First Thursday of each month at 7:00 PM\n- Study Rooms: Reservation required, available 9:00 AM - 7:00 PM',
      questions: [
        {
          question: 'What time does the library close on Saturday?',
          options: [
            { text: '5:00 PM', value: 'A' },
            { text: '6:00 PM', value: 'B' },
            { text: '7:00 PM', value: 'C' },
            { text: '8:00 PM', value: 'D' }
          ],
          answer: 'B'
        },
        {
          question: 'When is the Children\'s Story Time?',
          options: [
            { text: 'Sundays at 2:00 PM', value: 'A' },
            { text: 'Saturdays at 2:00 PM', value: 'B' },
            { text: 'Fridays at 2:00 PM', value: 'C' },
            { text: 'Thursdays at 2:00 PM', value: 'D' }
          ],
          answer: 'B'
        }
      ],
      difficulty: 'easy',
      skills: ['scanning_skills', 'information_location', 'detail_recognition']
    }
  ],
  writing: [
    {
      id: '1',
      type: 'writing',
      subType: 'narrative',
      question: '写一篇关于"我的学校生活"的短文',
      tips: '可以从学校环境、老师同学、课程活动、个人感受等方面来描述',
      placeholder: '请在这里写下你的作文...',
      minWords: 80,
      maxWords: 150,
      answer: '',
      criteria: {
        grammar: 0,
        vocabulary: 0,
        structure: 0,
        content: 0
      },
      keyWords: ['school', 'teachers', 'classmates', 'subjects', 'activities'],
      skills: ['narrative_writing', 'descriptive_language', 'personal_expression']
    },
    {
      id: '2',
      type: 'writing',
      subType: 'descriptive',
      question: '描述你最喜欢的动物',
      tips: '可以描述动物的外观、习性、为什么喜欢它等',
      placeholder: '请描述你最喜欢的动物...',
      minWords: 60,
      maxWords: 120,
      answer: '',
      criteria: {
        grammar: 0,
        vocabulary: 0,
        structure: 0,
        content: 0
      },
      keyWords: ['animal', 'appearance', 'behavior', 'habitat', 'characteristics'],
      skills: ['descriptive_writing', 'adjective_usage', 'organization']
    },
    {
      id: '3',
      type: 'writing',
      subType: 'letter',
      question: '给你的朋友写一封邀请信',
      tips: '邀请朋友参加你的生日聚会，包括时间、地点、活动安排等',
      placeholder: 'Dear friend,\n\n',
      minWords: 70,
      maxWords: 130,
      answer: '',
      criteria: {
        grammar: 0,
        vocabulary: 0,
        structure: 0,
        content: 0,
        format: 0
      },
      keyWords: ['invitation', 'birthday', 'party', 'time', 'place', 'activities'],
      skills: ['formal_writing', 'letter_format', 'social_communication']
    },
    {
      id: '4',
      type: 'writing',
      subType: 'argumentative',
      question: '你认为学生应该穿校服吗？请说明你的观点',
      tips: '可以从实用性、平等性、个性表达等角度来论述你的观点',
      placeholder: '请写下你的观点和理由...',
      minWords: 100,
      maxWords: 180,
      answer: '',
      criteria: {
        argument_clarity: 0,
        evidence_support: 0,
        grammar: 0,
        vocabulary: 0,
        organization: 0
      },
      keyWords: ['opinion', 'reasons', 'advantages', 'disadvantages', 'conclusion'],
      skills: ['argumentative_writing', 'logical_reasoning', 'opinion_expression']
    },
    {
      id: '5',
      type: 'writing',
      subType: 'creative',
      question: '续写故事：小明在森林里迷路了...',
      tips: '请发挥想象力，续写这个故事。可以描述小明遇到的困难、解决方法和最终结果',
      placeholder: '小明在森林里迷路了，他环顾四周...',
      minWords: 90,
      maxWords: 160,
      answer: '',
      criteria: {
        creativity: 0,
        plot_development: 0,
        character_development: 0,
        grammar: 0,
        vocabulary: 0
      },
      keyWords: ['adventure', 'problem', 'solution', 'characters', 'ending'],
      skills: ['creative_writing', 'storytelling', 'imagination']
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

// 录音相关
const recordedAudio = ref<Blob | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)
const recordingTimer = ref<number | null>(null)

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

const toggleRecording = async () => {
  if (isRecording.value) {
    // 停止录音
    if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
      mediaRecorder.value.stop()
    }
    if (recordingTimer.value) {
      clearInterval(recordingTimer.value)
      recordingTimer.value = null
    }
    isRecording.value = false
    recordingTime.value = 0
    message.success('录音已停止')
  } else {
    // 开始录音
    if (preparationTime.value > 0) {
      message.warning(`请先完成${preparationTime.value}秒的准备时间`)
      return
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.value = new MediaRecorder(stream)
      
      const audioChunks: Blob[] = []
      
      mediaRecorder.value.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }
      
      mediaRecorder.value.onstop = () => {
        recordedAudio.value = new Blob(audioChunks, { type: 'audio/wav' })
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.value.start()
      isRecording.value = true
      recordingTime.value = 0
      
      // 开始计时
      recordingTimer.value = setInterval(() => {
        recordingTime.value++
        if (recordingTime.value >= 120) { // 最多录音2分钟
          toggleRecording()
        }
      }, 1000)
      
      message.success('开始录音')
    } catch (error) {
      message.error('无法访问麦克风，请检查权限设置')
    }
  }
}

const playRecording = () => {
  if (recordedAudio.value) {
    const audio = new Audio(URL.createObjectURL(recordedAudio.value))
    audio.play()
    message.info('播放录音')
  }
}

const clearRecording = () => {
  recordedAudio.value = null
  message.info('录音已清除')
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
  recordedAudio.value = null
  isRecording.value = false
  recordingTime.value = 0
  
  // 清理录音相关资源
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value)
    recordingTimer.value = null
  }
  
  // 重置阅读答案数组
  if (currentAssessmentType.value === 'reading' && currentQuestion.value?.questions) {
    readingAnswers.value = new Array(currentQuestion.value.questions.length).fill('')
  }
}

const isQuestionAnswered = (index: number): boolean => {
  const type = currentAssessmentType.value
  const question = currentAssessmentQuestions.value[index]
  
  if (!question) return false
  
  switch (type) {
    case 'listening':
      return currentAnswer.value !== ''
    case 'speaking':
      return recordedAudio.value !== null
    case 'reading':
      return readingAnswers.value.every(answer => answer !== '')
    case 'writing':
      return writingAnswer.value.length >= (question.minWords || 0)
    default:
      return false
  }
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
  
  // 执行智能分析
  analyzePerformance()
  
  // 生成强项和改进建议
  const highScores = skillScores.value.filter(s => s.score >= 80)
  const lowScores = skillScores.value.filter(s => s.score < 75)
  
  strengths.value = highScores.map(skill => ({
    skill: skill.name,
    score: skill.score,
    description: getStrengthDescription(skill.name, skill.score)
  }))
  
  improvements.value = lowScores.map(skill => ({
    skill: skill.name,
    score: skill.score,
    suggestion: getImprovementSuggestion(skill.name, skill.score)
  }))
  
  // 生成个性化学习推荐
  generatePersonalizedRecommendations()
}

// 智能分析方法
const analyzePerformance = () => {
  // 基础分析，为推荐系统提供数据
  const weakestSkill = skillScores.value.reduce((min, skill) => 
    skill.score < min.score ? skill : min
  )
  
  const strongestSkill = skillScores.value.reduce((max, skill) => 
    skill.score > max.score ? skill : max
  )
  
  // 存储分析结果供推荐系统使用
  window.assessmentAnalysis = {
    weakestSkill,
    strongestSkill,
    overallScore: overallScore.value,
    skillScores: skillScores.value
  }
}

// 生成个性化学习推荐
const generatePersonalizedRecommendations = () => {
  const weakestSkills = skillScores.value
    .filter(s => s.score < 80)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
  
  const recommendationMap = {
    '听力理解': [
      {
        id: 'listening-basic',
        title: '基础听力训练',
        description: '从简单对话开始，提升听力理解能力',
        icon: Headphones,
        difficulty: '简单',
        estimatedTime: '15分钟/天',
        gameTypes: ['listening-comprehension', 'sound-discrimination'],
        priority: 'high'
      },
      {
        id: 'listening-advanced',
        title: '高级听力挑战',
        description: '挑战更复杂的听力材料，提高理解速度',
        icon: Target,
        difficulty: '困难',
        estimatedTime: '20分钟/天',
        gameTypes: ['listening-comprehension', 'dictation'],
        priority: 'medium'
      }
    ],
    '口语表达': [
      {
        id: 'speaking-pronunciation',
        title: '发音练习',
        description: '跟读练习，改善发音准确性',
        icon: Mic,
        difficulty: '中等',
        estimatedTime: '10分钟/天',
        gameTypes: ['pronunciation', 'conversation'],
        priority: 'high'
      },
      {
        id: 'speaking-conversation',
        title: '对话练习',
        description: '模拟真实对话场景，提升口语流利度',
        icon: Volume2,
        difficulty: '中等',
        estimatedTime: '15分钟/天',
        gameTypes: ['conversation', 'storytelling'],
        priority: 'medium'
      }
    ],
    '阅读理解': [
      {
        id: 'reading-comprehension',
        title: '阅读理解训练',
        description: '通过精读练习提升理解能力',
        icon: BookOpen,
        difficulty: '中等',
        estimatedTime: '20分钟/天',
        gameTypes: ['reading-comprehension', 'inference'],
        priority: 'high'
      },
      {
        id: 'reading-speed',
        title: '快速阅读',
        description: '提高阅读速度，增强信息捕捉能力',
        icon: Clock,
        difficulty: '困难',
        estimatedTime: '25分钟/天',
        gameTypes: ['scanning', 'cloze'],
        priority: 'medium'
      }
    ],
    '写作表达': [
      {
        id: 'writing-grammar',
        title: '语法强化',
        description: '系统学习语法规则，提升写作准确性',
        icon: PenTool,
        difficulty: '中等',
        estimatedTime: '15分钟/天',
        gameTypes: ['grammar', 'sentence-building'],
        priority: 'high'
      },
      {
        id: 'writing-creative',
        title: '创意写作',
        description: '培养写作思维，丰富表达方式',
        icon: Lightbulb,
        difficulty: '困难',
        estimatedTime: '30分钟/天',
        gameTypes: ['creative-writing', 'storytelling'],
        priority: 'medium'
      }
    ]
  }
  
  // 根据最弱技能推荐相应的学习内容
  let skillRecommendations = []
  weakestSkills.forEach(skill => {
    const skillRecs = recommendationMap[skill.name] || []
    skillRecommendations.push(...skillRecs.map(rec => ({
      ...rec,
      targetSkill: skill.name,
      currentScore: skill.score,
      improvementPotential: Math.min(100 - skill.score, 25)
    })))
  })
  
  // 添加综合性推荐
  const comprehensiveRecommendations = [
    {
      id: 'daily-practice',
      title: '每日英语练习',
      description: '坚持每天练习，养成良好的学习习惯',
      icon: Target,
      difficulty: '简单',
      estimatedTime: '30分钟/天',
      gameTypes: ['vocabulary', 'grammar', 'listening'],
      priority: 'medium',
      targetSkill: '综合能力',
      improvementPotential: 15
    },
    {
      id: 'vocabulary-building',
      title: '词汇扩展训练',
      description: '系统性扩展词汇量，提升语言表达能力',
      icon: BookOpen,
      difficulty: '中等',
      estimatedTime: '20分钟/天',
      gameTypes: ['vocabulary', 'word-matching'],
      priority: 'high',
      targetSkill: '词汇掌握',
      improvementPotential: 20
    }
  ]
  
  // 根据整体表现添加特殊推荐
  if (overallScore.value < 70) {
    comprehensiveRecommendations.push({
      id: 'foundation-building',
      title: '基础能力强化',
      description: '从基础开始，系统性提升英语能力',
      icon: BookOpen,
      difficulty: '简单',
      estimatedTime: '45分钟/天',
      gameTypes: ['spelling', 'grammar', 'vocabulary'],
      priority: 'high',
      targetSkill: '基础能力',
      improvementPotential: 30
    })
  } else if (overallScore.value >= 85) {
    comprehensiveRecommendations.push({
      id: 'advanced-challenge',
      title: '高级挑战训练',
      description: '挑战更高难度，追求卓越表现',
      icon: Trophy,
      difficulty: '困难',
      estimatedTime: '35分钟/天',
      gameTypes: ['advanced-reading', 'debate', 'creative-writing'],
      priority: 'medium',
      targetSkill: '高级能力',
      improvementPotential: 15
    })
  }
  
  recommendations.value = [...skillRecommendations, ...comprehensiveRecommendations]
    .sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
    .slice(0, 6) // 限制推荐数量
}

// 辅助方法
const getSkillDisplayName = (skillId: string): string => {
  const skillMap = {
    listening: '听力理解',
    speaking: '口语表达',
    reading: '阅读理解',
    writing: '写作表达',
    vocabulary: '词汇掌握',
    grammar: '语法运用'
  }
  return skillMap[skillId] || skillId
}

const getImprovementSuggestion = (skillName: string, score: number): string => {
  const suggestions = {
    '听力理解': score < 60 ? '建议从基础听力材料开始，每天练习15-20分钟' : '可以尝试更复杂的听力材料，提高理解速度',
    '口语表达': score < 60 ? '多进行跟读练习，注重发音准确性' : '增加口语表达的流利度和自然度练习',
    '阅读理解': score < 60 ? '从简单文章开始，培养阅读习惯' : '提高阅读速度，增强推理能力',
    '写作表达': score < 60 ? '从基础句型开始，注重语法正确性' : '丰富词汇使用，提高文章结构性'
  }
  return suggestions[skillName] || '继续加强练习，保持学习热情'
}

const getStrengthDescription = (skillName: string, score: number): string => {
  const descriptions = {
    '听力理解': '你的听力理解能力很强，能够准确捕捉关键信息',
    '口语表达': '你的口语表达流利自然，发音清晰准确',
    '阅读理解': '你具有良好的阅读理解能力，能够快速理解文章内容',
    '写作表达': '你的写作表达能力出色，语法运用准确，词汇丰富'
  }
  return descriptions[skillName] || '在这个方面表现优秀，继续保持！'
}

const calculateSkillBalance = (): string => {
  const scores = skillScores.value.map(s => s.score)
  const max = Math.max(...scores)
  const min = Math.min(...scores)
  const diff = max - min
  
  if (diff <= 10) return '均衡发展'
  if (diff <= 20) return '略有差异'
  return '发展不均'
}

const getImprovementPriority = (): string[] => {
  return skillScores.value
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map(s => s.name)
}

const analyzeLearningStyle = (): string => {
  const styles = ['视觉型', '听觉型', '动手型', '综合型']
  return styles[Math.floor(Math.random() * styles.length)]
}

const generateTimeAllocation = () => {
  const total = 100
  const weak = skillScores.value.filter(s => s.score < 75)
  const allocation = {}
  
  weak.forEach(skill => {
    allocation[skill.name] = Math.floor(total / weak.length)
  })
  
  return allocation
}

const getSkillIssues = (skillName: string, score: number): string[] => {
  const issues = {
    '听力理解': ['语速跟不上', '词汇量不足', '注意力不集中'],
    '口语表达': ['发音不准确', '语法错误', '词汇贫乏', '缺乏流利度'],
    '阅读理解': ['阅读速度慢', '理解深度不够', '词汇障碍'],
    '写作表达': ['语法错误多', '词汇使用单一', '结构不清晰']
  }
  return issues[skillName]?.slice(0, score < 60 ? 3 : 2) || []
}

const getSkillSolutions = (skillName: string): string[] => {
  const solutions = {
    '听力理解': ['每日听力练习', '跟读训练', '词汇积累'],
    '口语表达': ['发音练习', '对话练习', '录音自评'],
    '阅读理解': ['精读训练', '速读练习', '词汇扩展'],
    '写作表达': ['语法复习', '范文学习', '写作练习']
  }
  return solutions[skillName] || []
}

const getSkillAdvantages = (skillName: string, score: number): string[] => {
  const advantages = {
    '听力理解': ['理解准确', '反应迅速', '注意力集中'],
    '口语表达': ['发音清晰', '表达流利', '词汇丰富'],
    '阅读理解': ['理解深入', '速度较快', '推理能力强'],
    '写作表达': ['语法准确', '结构清晰', '表达生动']
  }
  return advantages[skillName] || []
}

const getMaintainStrategies = (skillName: string): string[] => {
  const strategies = {
    '听力理解': ['保持每日练习', '挑战更难材料'],
    '口语表达': ['多参与对话', '录制练习视频'],
    '阅读理解': ['阅读多样化材料', '提高阅读量'],
    '写作表达': ['定期写作练习', '学习高级表达']
  }
  return strategies[skillName] || []
}

const getNextLevelGoals = (skillName: string, score: number): string[] => {
  const goals = {
    '听力理解': ['理解更复杂对话', '掌握不同口音'],
    '口语表达': ['提高表达自然度', '增强辩论能力'],
    '阅读理解': ['提高阅读速度', '增强批判性思维'],
    '写作表达': ['掌握高级语法', '提高文学表达']
  }
  return goals[skillName] || []
}

const calculateLearningTime = (score: number): string => {
  if (score < 60) return '3-4个月'
  if (score < 75) return '2-3个月'
  return '1-2个月'
}

const generateMilestones = (skillName: string): string[] => {
  const milestones = {
    '听力理解': ['基础对话理解', '短文理解', '复杂材料理解'],
    '口语表达': ['基础对话', '流利表达', '高级交流'],
    '阅读理解': ['基础阅读', '快速理解', '深度分析'],
    '写作表达': ['基础写作', '结构化写作', '创意表达']
  }
  return milestones[skillName] || []
}

const getRecommendedResources = (skillName: string): string[] => {
  const resources = {
    '听力理解': ['英语听力APP', '英文播客', '英语电影'],
    '口语表达': ['口语练习APP', '语言交换', '英语角'],
    '阅读理解': ['英文小说', '新闻网站', '学术文章'],
    '写作表达': ['写作指南', '范文集', '语法书']
  }
  return resources[skillName] || []
}

const generatePersonalizedRecommendations = () => {
  const weakestSkills = skillScores.value
    .filter(s => s.score < 75)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
  
  return weakestSkills.map(skill => ({
    id: skill.name.toLowerCase(),
    title: `${skill.name}强化训练`,
    description: `针对性提升${skill.name}能力`,
    icon: getSkillIcon(skill.name),
    priority: skill.score < 60 ? 'high' : 'medium',
    estimatedTime: calculateLearningTime(skill.score)
  }))
}

const getSkillIcon = (skillName: string) => {
  const icons = {
    '听力理解': Headphones,
    '口语表达': Mic,
    '阅读理解': BookOpen,
    '写作表达': PenTool
  }
  return icons[skillName] || BookOpen
}

const getNextLevel = (score: number): string => {
  if (score < 60) return '初级'
  if (score < 75) return '中级'
  if (score < 90) return '高级'
  return '专家级'
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
  playSound('success')
  message.info(`开始${recommendationId}学习...`)
  router.push('/games')
}

const viewHistory = () => {
  message.info('查看历史功能开发中...')
}

// 音效和动画相关方法
const playSound = (soundType: string) => {
  if (soundEffectsRef.value && soundEnabled.value) {
    soundEffectsRef.value.playSound(soundType)
  }
}

const showRewardAnimation = (type: string, data: any = {}) => {
  if (rewardAnimationRef.value) {
    switch (type) {
      case 'score':
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
        newLevel.value = data.newLevel || 2
        rewardAnimationRef.value.showLevelUp()
        break
      case 'perfect':
        isPerfect.value = true
        rewardAnimationRef.value.showPerfectCompletion()
        break
    }
  }
}

const onRewardAnimationComplete = () => {
  // 动画完成后的回调
  rewardPoints.value = 0
  bonusPoints.value = 0
  streakCount.value = 0
  earnedBadge.value = null
  isPerfect.value = false
}

// 增强现有方法，添加音效和动画
const enhancedNextQuestion = () => {
  playSound('pop')
  nextQuestion()
}

const enhancedPreviousQuestion = () => {
  playSound('pop')
  previousQuestion()
}

const enhancedSubmitAssessment = () => {
  playSound('success')
  submitAssessment()
  
  // 根据成绩显示不同的奖励动画
  setTimeout(() => {
    if (overallScore.value >= 95) {
      showRewardAnimation('perfect')
    } else if (overallScore.value >= 85) {
      showRewardAnimation('score', { points: Math.floor(overallScore.value) })
    }
    
    // 检查是否获得徽章
    if (overallScore.value >= 90) {
      setTimeout(() => {
        showRewardAnimation('badge', { 
          badge: { 
            name: '优秀学习者', 
            icon: Trophy, 
            color: '#ffd700' 
          } 
        })
      }, 1000)
    }
  }, 500)
}

const enhancedToggleAssessment = (assessmentId: string) => {
  playSound('click')
  toggleAssessment(assessmentId)
}

const enhancedStartAssessment = () => {
  playSound('start')
  startAssessment()
}

const enhancedPlayAudio = () => {
  playSound('audio')
  playAudio()
}

const enhancedToggleRecording = () => {
  if (isRecording.value) {
    playSound('stop')
  } else {
    playSound('record')
  }
  toggleRecording()
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
/* 响应式设计 - 平板设备 */
@media (max-width: 1024px) {
  .assessment-page {
    .assessment-selection {
      :deep(.ant-row) {
        .ant-col {
          margin-bottom: 16px;
        }
      }
    }

    .assessment-results {
      .skill-analysis {
        :deep(.ant-row) {
          .ant-col {
            margin-bottom: 16px;
          }
        }
      }
    }
  }
}

/* 响应式设计 - 手机设备 */
@media (max-width: 768px) {
  .assessment-page {
    padding: 12px;

    .page-header {
      margin-bottom: 16px;

      .header-card {
        .header-content {
          flex-direction: column;
          gap: 16px;
          text-align: center;

          .header-info {
            .page-title {
              font-size: 24px;
              justify-content: center;
            }

            .page-description {
              font-size: 14px;
            }
          }

          .header-stats {
            gap: 16px;
            justify-content: center;

            .stat-item {
              .stat-value {
                font-size: 20px;
              }

              .stat-label {
                font-size: 12px;
              }
            }
          }
        }
      }
    }

    .assessment-selection {
      .assessment-card {
        margin-bottom: 16px;

        .assessment-cover {
          height: 60px;

          .assessment-emoji {
            font-size: 16px;
          }
        }

        .assessment-info {
          .info-item {
            font-size: 12px;
          }
        }
      }

      .selection-actions {
        margin-top: 24px;

        .action-card {
          .action-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;

            .selected-info {
              h3 {
                font-size: 16px;
              }

              p {
                font-size: 14px;
              }
            }

            .action-buttons {
              justify-content: center;
              flex-wrap: wrap;
            }
          }
        }
      }
    }

    .assessment-progress {
      .progress-card {
        margin-bottom: 16px;

        .progress-header {
          flex-direction: column;
          gap: 12px;
          text-align: center;

          .current-assessment {
            font-size: 16px;
          }

          .progress-info {
            justify-content: center;
            font-size: 14px;
          }
        }

        .time-remaining {
          font-size: 16px;
        }
      }

      .question-card {
        min-height: auto;

        .listening-assessment,
        .speaking-assessment,
        .reading-assessment,
        .writing-assessment {
          .question-header {
            flex-direction: column;
            gap: 12px;
            text-align: center;

            h3 {
              font-size: 18px;
            }

            .audio-controls,
            .speaking-controls,
            .reading-tools {
              justify-content: center;
              flex-wrap: wrap;
            }
          }

          .question-content {
            font-size: 14px;
          }
        }

        .reading-assessment {
          .reading-content {
            grid-template-columns: 1fr;
            gap: 16px;

            .reading-passage {
              font-size: 14px;
              line-height: 1.6;
            }

            .reading-questions {
              .question-item {
                margin-bottom: 16px;

                .question-text {
                  font-size: 14px;
                }

                .question-options {
                  :deep(.ant-radio-group) {
                    .ant-radio-wrapper {
                      display: block;
                      margin-bottom: 8px;
                      font-size: 14px;
                    }
                  }
                }
              }
            }
          }
        }

        .writing-assessment {
          .writing-area {
            .writing-input {
              font-size: 14px;
              min-height: 200px;
            }
          }
        }

        .question-actions {
          flex-direction: column;
          gap: 16px;

          .question-navigation {
            order: -1;

            .nav-buttons {
              justify-content: center;
              flex-wrap: wrap;
              gap: 8px;

              .question-btn {
                min-width: 40px;
                height: 40px;
              }
            }
          }

          .action-buttons {
            justify-content: center;
            flex-wrap: wrap;
          }
        }
      }
    }

    .assessment-results {
      .overall-score {
        flex-direction: column;
        gap: 16px;
        text-align: center;

        .score-circle {
          align-self: center;
        }

        .score-info {
          text-align: center;

          .score-value {
            font-size: 36px;
          }

          .score-level {
            font-size: 16px;
          }
        }
      }

      .skill-scores {
        .skill-item {
          margin-bottom: 16px;

          .skill-info {
            .skill-name {
              font-size: 14px;
            }

            .skill-score {
              font-size: 16px;
            }
          }
        }
      }

      .learning-recommendations {
        .recommendation-item {
          margin-bottom: 12px;

          .recommendation-header {
            .recommendation-title {
              font-size: 14px;
            }

            .recommendation-meta {
              font-size: 12px;
            }
          }

          .recommendation-description {
            font-size: 13px;
          }
        }
      }

      .results-actions {
        .actions-content {
          flex-direction: column;
          gap: 12px;

          .action-buttons {
            justify-content: center;
            flex-wrap: wrap;
          }
        }
      }
    }
  }
}

/* 响应式设计 - 小屏手机 */
@media (max-width: 480px) {
  .assessment-page {
    padding: 8px;

    .page-header {
      .header-card {
        .header-content {
          .header-stats {
            flex-direction: column;
            gap: 12px;
          }
        }
      }
    }

    .assessment-selection {
      .assessment-card {
        .assessment-actions {
          :deep(.ant-button) {
            width: 100%;
          }
        }
      }

      .selection-actions {
        .action-card {
          .action-content {
            .action-buttons {
              :deep(.ant-button) {
                flex: 1;
                min-width: 120px;
              }
            }
          }
        }
      }
    }

    .assessment-progress {
      .question-card {
        .question-actions {
          .question-navigation {
            .nav-buttons {
              .question-btn {
                min-width: 36px;
                height: 36px;
                font-size: 12px;
              }
            }
          }

          .action-buttons {
            :deep(.ant-button) {
              flex: 1;
              min-width: 100px;
            }
          }
        }
      }
    }

    .assessment-results {
      .overall-score {
        .score-circle {
          :deep(.ant-progress) {
            .ant-progress-inner {
              width: 120px !important;
              height: 120px !important;
            }
          }
        }
      }

      .results-actions {
        .actions-content {
          .action-buttons {
            :deep(.ant-button) {
              width: 100%;
              margin-bottom: 8px;
            }
          }
        }
      }
    }
  }
}
</style>

// 新增智能分析相关数据
const detailedAnalysis = ref({
  listening: {
    dialogueComprehension: 0,
    passageUnderstanding: 0,
    detailRecognition: 0,
    overallAccuracy: 0
  },
  speaking: {
    pronunciation: 0,
    fluency: 0,
    vocabulary: 0,
    grammar: 0,
    confidence: 0
  },
  reading: {
    comprehension: 0,
    vocabulary: 0,
    inference: 0,
    speed: 0
  },
  writing: {
    grammar: 0,
    vocabulary: 0,
    structure: 0,
    creativity: 0,
    accuracy: 0
  }
})

const learningPath = ref([])
const weaknessAnalysis = ref([])
const strengthAnalysis = ref([])

// 新增方法：智能分析
const analyzePerformance = () => {
  // 分析听力表现
  const listeningScores = skillScores.value.find(s => s.name === '听力')?.score || 0
  detailedAnalysis.value.listening = {
    dialogueComprehension: Math.max(0, listeningScores + Math.random() * 10 - 5),
    passageUnderstanding: Math.max(0, listeningScores + Math.random() * 10 - 5),
    detailRecognition: Math.max(0, listeningScores + Math.random() * 10 - 5),
    overallAccuracy: listeningScores
  }

  // 分析口语表现
  const speakingScores = skillScores.value.find(s => s.name === '口语')?.score || 0
  detailedAnalysis.value.speaking = {
    pronunciation: Math.max(0, speakingScores + Math.random() * 10 - 5),
    fluency: Math.max(0, speakingScores + Math.random() * 10 - 5),
    vocabulary: Math.max(0, speakingScores + Math.random() * 10 - 5),
    grammar: Math.max(0, speakingScores + Math.random() * 10 - 5),
    confidence: Math.max(0, speakingScores + Math.random() * 10 - 5)
  }

  // 分析阅读表现
  const readingScores = skillScores.value.find(s => s.name === '阅读')?.score || 0
  detailedAnalysis.value.reading = {
    comprehension: Math.max(0, readingScores + Math.random() * 10 - 5),
    vocabulary: Math.max(0, readingScores + Math.random() * 10 - 5),
    inference: Math.max(0, readingScores + Math.random() * 10 - 5),
    speed: Math.max(0, readingScores + Math.random() * 10 - 5)
  }

  // 分析写作表现
  const writingScores = skillScores.value.find(s => s.name === '写作')?.score || 0
  detailedAnalysis.value.writing = {
    grammar: Math.max(0, writingScores + Math.random() * 10 - 5),
    vocabulary: Math.max(0, writingScores + Math.random() * 10 - 5),
    structure: Math.max(0, writingScores + Math.random() * 10 - 5),
    creativity: Math.max(0, writingScores + Math.random() * 10 - 5),
    accuracy: Math.max(0, writingScores + Math.random() * 10 - 5)
  }

  // 生成弱项分析
  generateWeaknessAnalysis()
  
  // 生成强项分析
  generateStrengthAnalysis()
  
  // 生成个性化学习路径
  generateLearningPath()
}

const generateWeaknessAnalysis = () => {
  const allScores = []
  
  // 收集所有细分技能分数
  Object.entries(detailedAnalysis.value).forEach(([skill, scores]) => {
    Object.entries(scores).forEach(([subSkill, score]) => {
      allScores.push({
        skill,
        subSkill,
        score,
        displayName: getSkillDisplayName(skill, subSkill)
      })
    })
  })
  
  // 找出分数最低的技能
  const weakSkills = allScores
    .filter(item => item.score < 70)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
  
  weaknessAnalysis.value = weakSkills.map(item => ({
    skill: item.displayName,
    score: Math.round(item.score),
    suggestion: getImprovementSuggestion(item.skill, item.subSkill),
    priority: item.score < 50 ? 'high' : item.score < 60 ? 'medium' : 'low'
  }))
}

const generateStrengthAnalysis = () => {
  const allScores = []
  
  // 收集所有细分技能分数
  Object.entries(detailedAnalysis.value).forEach(([skill, scores]) => {
    Object.entries(scores).forEach(([subSkill, score]) => {
      allScores.push({
        skill,
        subSkill,
        score,
        displayName: getSkillDisplayName(skill, subSkill)
      })
    })
  })
  
  // 找出分数最高的技能
  const strongSkills = allScores
    .filter(item => item.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  
  strengthAnalysis.value = strongSkills.map(item => ({
    skill: item.displayName,
    score: Math.round(item.score),
    description: getStrengthDescription(item.skill, item.subSkill)
  }))
}

const generateLearningPath = () => {
  const pathItems = []
  
  // 基于弱项生成学习路径
  weaknessAnalysis.value.forEach(weakness => {
    const pathItem = getLearningPathItem(weakness.skill, weakness.score)
    if (pathItem) {
      pathItems.push(pathItem)
    }
  })
  
  // 添加进阶学习建议
  if (overallScore.value >= 80) {
    pathItems.push({
      id: 'advanced',
      title: '进阶挑战',
      description: '尝试更高难度的学习内容',
      icon: Target,
      priority: 'medium',
      estimatedTime: '2-3周'
    })
  }
  
  learningPath.value = pathItems
}

const getSkillDisplayName = (skill: string, subSkill: string): string => {
  const skillNames = {
    listening: {
      dialogueComprehension: '对话理解',
      passageUnderstanding: '短文理解',
      detailRecognition: '细节识别',
      overallAccuracy: '听力准确度'
    },
    speaking: {
      pronunciation: '发音准确度',
      fluency: '流利度',
      vocabulary: '词汇运用',
      grammar: '语法正确性',
      confidence: '表达自信度'
    },
    reading: {
      comprehension: '阅读理解',
      vocabulary: '词汇理解',
      inference: '推理能力',
      speed: '阅读速度'
    },
    writing: {
      grammar: '语法运用',
      vocabulary: '词汇丰富度',
      structure: '文章结构',
      creativity: '创意表达',
      accuracy: '拼写准确度'
    }
  }
  
  return skillNames[skill]?.[subSkill] || `${skill}-${subSkill}`
}

const getImprovementSuggestion = (skill: string, subSkill: string): string => {
  const suggestions = {
    listening: {
      dialogueComprehension: '多听英语对话，注意语调和语境',
      passageUnderstanding: '练习听长篇文章，抓住主要信息',
      detailRecognition: '专注听取具体信息，如时间、地点、数字',
      overallAccuracy: '每天坚持听力练习，逐步提高理解能力'
    },
    speaking: {
      pronunciation: '跟读标准发音，使用语音识别软件练习',
      fluency: '多进行口语练习，提高表达流畅度',
      vocabulary: '学习更多词汇，在口语中积极运用',
      grammar: '注意语法结构，多做口语语法练习',
      confidence: '多参与英语对话，增强表达自信心'
    },
    reading: {
      comprehension: '多读英语文章，练习理解主旨大意',
      vocabulary: '扩大词汇量，学习词汇在语境中的含义',
      inference: '练习推理题，提高逻辑思维能力',
      speed: '进行限时阅读练习，提高阅读速度'
    },
    writing: {
      grammar: '系统学习语法规则，多做语法练习',
      vocabulary: '学习同义词替换，丰富表达方式',
      structure: '学习文章结构，练习段落组织',
      creativity: '多读优秀范文，培养创意思维',
      accuracy: '注意拼写检查，养成仔细检查的习惯'
    }
  }
  
  return suggestions[skill]?.[subSkill] || '建议多加练习，提高相关技能'
}

const getStrengthDescription = (skill: string, subSkill: string): string => {
  const descriptions = {
    listening: {
      dialogueComprehension: '你在理解英语对话方面表现出色',
      passageUnderstanding: '你能很好地理解英语短文的主要内容',
      detailRecognition: '你善于捕捉听力材料中的具体信息',
      overallAccuracy: '你的整体听力理解能力很强'
    },
    speaking: {
      pronunciation: '你的英语发音清晰准确',
      fluency: '你的英语表达流利自然',
      vocabulary: '你能恰当地运用各种词汇',
      grammar: '你的语法运用准确规范',
      confidence: '你在英语表达时很有自信'
    },
    reading: {
      comprehension: '你的阅读理解能力很强',
      vocabulary: '你的词汇理解能力出色',
      inference: '你善于从文章中推理出隐含信息',
      speed: '你的阅读速度很快'
    },
    writing: {
      grammar: '你的语法运用准确无误',
      vocabulary: '你的词汇运用丰富多样',
      structure: '你的文章结构清晰合理',
      creativity: '你的表达富有创意',
      accuracy: '你的拼写准确度很高'
    }
  }
  
  return descriptions[skill]?.[subSkill] || '你在这方面表现很好'
}

const getLearningPathItem = (skillName: string, score: number) => {
  const pathItems = {
    '对话理解': {
      id: 'dialogue-practice',
      title: '对话练习强化',
      description: '通过情景对话练习提高理解能力',
      icon: Headphones,
      priority: score < 50 ? 'high' : 'medium',
      estimatedTime: '1-2周'
    },
    '发音准确度': {
      id: 'pronunciation-training',
      title: '发音训练',
      description: '系统性发音练习和纠正',
      icon: Mic,
      priority: score < 50 ? 'high' : 'medium',
      estimatedTime: '2-3周'
    },
    '阅读理解': {
      id: 'reading-comprehension',
      title: '阅读理解训练',
      description: '提高阅读理解和分析能力',
      icon: BookOpen,
      priority: score < 50 ? 'high' : 'medium',
      estimatedTime: '2-4周'
    },
    '语法运用': {
      id: 'grammar-practice',
      title: '语法专项练习',
      description: '系统学习和练习英语语法',
      icon: PenTool,
      priority: score < 50 ? 'high' : 'medium',
      estimatedTime: '3-4周'
    }
  }
  
  return pathItems[skillName]
}

// 修改generateResults方法
const generateResults = () => {
  // 模拟生成评估结果
  overallScore.value = Math.floor(Math.random() * 30) + 70 // 70-100分
  
  skillScores.value = skillScores.value.map(skill => ({
    ...skill,
    score: Math.floor(Math.random() * 40) + 60 // 60-100分
  }))
  
  // 进行智能分析
  analyzePerformance()
  
  // 生成强项和改进建议（使用新的分析结果）
  strengths.value = strengthAnalysis.value
  improvements.value = weaknessAnalysis.value
  
  // 生成学习推荐（基于学习路径）
  recommendations.value = learningPath.value.slice(0, 6).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    icon: item.icon
  }))
}

const saveResults = () => {
  // 保存评估结果到本地存储
  const results = {
    date: new Date(),
    overallScore: overallScore.value,
    skillScores: skillScores.value,
    assessment