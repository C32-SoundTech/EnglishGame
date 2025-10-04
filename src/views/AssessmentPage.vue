<template>
  <MainLayout>
    <div class="assessment-page">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <ClipboardCheck class="w-6 h-6 mr-3" />
          能力评估
        </h1>
        <p class="page-subtitle">测试你的英语水平，获得个性化学习建议</p>
      </div>

      <!-- 评估类型选择 -->
      <div class="assessment-types" v-if="!currentAssessment">
        <a-row :gutter="[24, 24]">
          <a-col :xs="24" :md="12" :lg="8" v-for="type in assessmentTypes" :key="type.id">
            <div class="assessment-card" @click="startAssessment(type)">
              <div class="card-icon">
                <component :is="type.icon" class="w-12 h-12" />
              </div>
              <div class="card-content">
                <h3 class="card-title">{{ type.title }}</h3>
                <p class="card-desc">{{ type.description }}</p>
                <div class="card-meta">
                  <span class="duration">
                    <Clock class="w-4 h-4 mr-1" />
                    {{ type.duration }}
                  </span>
                  <span class="questions">
                    <FileText class="w-4 h-4 mr-1" />
                    {{ type.questionCount }} 题
                  </span>
                </div>
              </div>
              <div class="card-action">
                <a-button type="primary" size="large">
                  开始测试
                  <ArrowRight class="w-4 h-4 ml-1" />
                </a-button>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 评估进行中 -->
      <div class="assessment-content" v-if="currentAssessment && !showResult">
        <div class="assessment-header">
          <div class="progress-info">
            <h2 class="assessment-title">{{ currentAssessment.title }}</h2>
            <div class="question-progress">
              第 {{ currentQuestionIndex + 1 }} 题 / 共 {{ currentAssessment.questions.length }} 题
            </div>
          </div>
          <div class="progress-bar">
            <a-progress
              :percent="Math.round(((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100)"
              :show-info="false"
              stroke-color="#1890ff"
            />
          </div>
          <div class="timer" v-if="timeRemaining > 0">
            <Clock class="w-4 h-4 mr-1" />
            {{ formatTime(timeRemaining) }}
          </div>
        </div>

        <div class="question-container">
          <div class="question-card">
            <!-- 听力测试特殊界面 -->
            <div v-if="currentAssessment.id === 'listening'" class="listening-question">
              <div class="audio-player-section">
                <div class="audio-visual">
                  <div class="audio-waves" :class="{ active: isPlaying }">
                    <div v-for="i in 5" :key="i" class="wave-bar" :style="{ animationDelay: `${i * 0.1}s` }"></div>
                  </div>
                </div>
                <div class="audio-controls">
                  <a-button 
                    type="primary" 
                    size="large" 
                    @click="playAudio" 
                    :loading="audioLoading"
                    class="play-btn"
                  >
                    <Volume2 class="w-5 h-5 mr-2" />
                    {{ audioPlayed ? '重新播放' : '播放音频' }}
                  </a-button>
                  <a-button @click="playAudioSlow" size="small" type="text">
                    <RotateCcw class="w-4 h-4 mr-1" />
                    慢速播放
                  </a-button>
                  <div class="play-count">已播放 {{ playCount }}/3 次</div>
                </div>
              </div>
              <div class="question-text">
                <h3>{{ currentQuestion.question }}</h3>
                <p class="instruction">请仔细听音频，然后选择正确答案</p>
              </div>
            </div>

            <!-- 口语测试特殊界面 -->
            <div v-else-if="currentAssessment.id === 'speaking'" class="speaking-question">
              <div class="speaking-prompt">
                <h3>{{ currentQuestion.question }}</h3>
                <div class="prompt-details">
                  <p>{{ currentQuestion.prompt }}</p>
                  <div class="time-limit">
                    <Clock class="w-4 h-4 mr-1" />
                    准备时间: {{ currentQuestion.prepTime }}s | 回答时间: {{ currentQuestion.speakTime }}s
                  </div>
                </div>
              </div>
              
              <div class="recording-section">
                <div class="recording-visual">
                  <div class="mic-icon" :class="{ recording: isRecording, preparing: isPreparing }">
                    <Mic class="w-8 h-8" />
                  </div>
                  <div class="recording-status">
                    <span v-if="isPreparing">准备中... {{ prepTimeLeft }}s</span>
                    <span v-else-if="isRecording">录音中... {{ recordTimeLeft }}s</span>
                    <span v-else>点击开始录音</span>
                  </div>
                </div>
                
                <div class="recording-controls">
                  <a-button 
                    v-if="!isRecording && !isPreparing"
                    type="primary" 
                    size="large" 
                    @click="startRecording"
                  >
                    <Mic class="w-4 h-4 mr-2" />
                    开始录音
                  </a-button>
                  <a-button 
                    v-if="isRecording"
                    danger 
                    size="large" 
                    @click="stopRecording"
                  >
                    <Square class="w-4 h-4 mr-2" />
                    停止录音
                  </a-button>
                  <a-button 
                    v-if="recordedAudio && !isRecording"
                    @click="playRecording"
                    size="large"
                  >
                    <Play class="w-4 h-4 mr-2" />
                    播放录音
                  </a-button>
                </div>
              </div>
            </div>

            <!-- 阅读测试特殊界面 -->
            <div v-else-if="currentAssessment.id === 'reading'" class="reading-question">
              <div class="reading-passage">
                <div class="passage-header">
                  <h3>{{ currentQuestion.title }}</h3>
                  <div class="reading-tools">
                    <a-button size="small" @click="toggleHighlight" :type="highlightMode ? 'primary' : 'default'">
                      <Highlighter class="w-4 h-4 mr-1" />
                      高亮模式
                    </a-button>
                    <a-button size="small" @click="adjustFontSize">
                      <Type class="w-4 h-4 mr-1" />
                      字体大小
                    </a-button>
                  </div>
                </div>
                <div class="passage-content" :class="{ 'highlight-mode': highlightMode }" :style="{ fontSize: fontSize + 'px' }">
                  <p v-for="(paragraph, index) in currentQuestion.passage" :key="index">
                    {{ paragraph }}
                  </p>
                </div>
              </div>
              <div class="reading-question-text">
                <h4>{{ currentQuestion.question }}</h4>
              </div>
            </div>

            <!-- 写作测试特殊界面 -->
            <div v-else-if="currentAssessment.id === 'writing'" class="writing-question">
              <div class="writing-prompt">
                <h3>{{ currentQuestion.title }}</h3>
                <div class="prompt-content">
                  <p>{{ currentQuestion.prompt }}</p>
                  <div class="requirements">
                    <h4>要求：</h4>
                    <ul>
                      <li v-for="req in currentQuestion.requirements" :key="req">{{ req }}</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div class="writing-area">
                <a-textarea
                  v-model:value="writingAnswer"
                  :rows="12"
                  placeholder="请在此处写下你的答案..."
                  :maxlength="currentQuestion.maxLength"
                  show-count
                  class="writing-textarea"
                />
                <div class="writing-tools">
                  <div class="word-count">
                    字数: {{ writingAnswer.length }} / {{ currentQuestion.maxLength }}
                  </div>
                  <div class="writing-actions">
                    <a-button size="small" @click="saveAsDraft">
                      <Save class="w-4 h-4 mr-1" />
                      保存草稿
                    </a-button>
                    <a-button size="small" @click="clearWriting">
                      <Trash2 class="w-4 h-4 mr-1" />
                      清空
                    </a-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 通用选择题界面 -->
            <div v-else class="general-question">
              <div class="question-content">
                <h3 class="question-title">{{ currentQuestion.question }}</h3>
                <div class="question-audio" v-if="currentQuestion.audio">
                  <a-button @click="playAudio" :loading="audioLoading">
                    <Volume2 class="w-4 h-4 mr-1" />
                    播放音频
                  </a-button>
                </div>
                <div class="question-image" v-if="currentQuestion.image">
                  <img :src="currentQuestion.image" :alt="currentQuestion.question" />
                </div>
              </div>
            </div>

            <!-- 选择题选项 (除写作外都有) -->
            <div v-if="currentAssessment.id !== 'writing'" class="answer-options">
              <div
                v-for="(option, index) in currentQuestion.options"
                :key="index"
                class="option-item"
                :class="{ 
                  selected: selectedAnswer === index,
                  'option-audio': currentQuestion.optionAudios && currentQuestion.optionAudios[index]
                }"
                @click="selectAnswer(index)"
              >
                <div class="option-label">{{ String.fromCharCode(65 + index) }}</div>
                <div class="option-content">{{ option }}</div>
                <a-button 
                  v-if="currentQuestion.optionAudios && currentQuestion.optionAudios[index]"
                  type="text" 
                  size="small"
                  @click.stop="playOptionAudio(index)"
                  class="option-audio-btn"
                >
                  <Volume2 class="w-4 h-4" />
                </a-button>
              </div>
            </div>

            <div class="question-actions">
              <a-button
                v-if="currentQuestionIndex > 0"
                @click="previousQuestion"
                size="large"
              >
                <ArrowLeft class="w-4 h-4 mr-1" />
                上一题
              </a-button>
              <a-button
                type="primary"
                @click="nextQuestion"
                size="large"
                :disabled="!canProceed"
              >
                {{ currentQuestionIndex === currentAssessment.questions.length - 1 ? '完成测试' : '下一题' }}
                <ArrowRight class="w-4 h-4 ml-1" />
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 评估结果 -->
      <div class="assessment-result" v-if="showResult">
        <div class="result-header">
          <div class="result-score">
            <div class="score-circle">
              <a-progress
                type="circle"
                :percent="result.score"
                :width="120"
                :stroke-color="{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }"
              >
                <template #format="percent">
                  <span class="score-text">{{ percent }}分</span>
                </template>
              </a-progress>
            </div>
            <div class="score-info">
              <h2 class="level-title">{{ result.level }}</h2>
              <p class="level-desc">{{ result.levelDescription }}</p>
            </div>
          </div>
        </div>

        <div class="result-content">
          <a-row :gutter="[24, 24]">
            <!-- 技能雷达图 -->
            <a-col :xs="24" :lg="14">
              <a-card class="chart-card">
                <SkillRadarChart :skill-data="detailedSkillData" />
              </a-card>
            </a-col>

            <!-- 学习建议 -->
            <a-col :xs="24" :lg="10">
              <div class="suggestions">
                <h3 class="section-title">
                  <Lightbulb class="w-5 h-5 mr-2" />
                  个性化建议
                </h3>
                <div class="suggestion-list">
                  <div v-for="suggestion in enhancedSuggestions" :key="suggestion.id" class="suggestion-item" :class="suggestion.priority">
                    <div class="suggestion-icon">
                      <component :is="suggestion.icon" class="w-5 h-5" />
                    </div>
                    <div class="suggestion-content">
                      <div class="suggestion-header">
                        <h4 class="suggestion-title">{{ suggestion.title }}</h4>
                        <span class="priority-badge" :class="suggestion.priority">
                          {{ suggestion.priority === 'high' ? '重要' : '一般' }}
                        </span>
                      </div>
                      <p class="suggestion-desc">{{ suggestion.description }}</p>
                      <div class="suggestion-actions">
                        <a-button size="small" type="primary" @click="startPractice(suggestion.type)">
                          立即练习
                        </a-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a-col>
          </a-row>

          <!-- 进度趋势图 -->
          <a-row :gutter="[24, 24]" style="margin-top: 24px;">
            <a-col :span="24">
              <a-card class="chart-card">
                <ProgressTrendChart :trend-data="historyData" />
              </a-card>
            </a-col>
          </a-row>

          <!-- 详细统计 -->
          <a-row :gutter="[24, 24]" style="margin-top: 24px;">
            <a-col :xs="24" :md="6" v-for="stat in detailedStats" :key="stat.name">
              <a-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
                    <component :is="stat.icon" class="w-6 h-6" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ stat.value }}</div>
                    <div class="stat-label">{{ stat.name }}</div>
                    <div class="stat-change" :class="stat.change > 0 ? 'positive' : 'negative'">
                      <component :is="stat.change > 0 ? TrendingUp : TrendingDown" class="w-3 h-3 mr-1" />
                      {{ Math.abs(stat.change) }}%
                    </div>
                  </div>
                </div>
              </a-card>
            </a-col>
          </a-row>
        </div>

        <div class="result-actions">
          <a-button type="primary" size="large" @click="retakeAssessment">
            <RotateCcw class="w-4 h-4 mr-2" />
            重新测试
          </a-button>
          <a-button size="large" @click="viewDetailedReport">
            <FileText class="w-4 h-4 mr-2" />
            查看详细报告
          </a-button>
          <a-button size="large" @click="startLearning">
            <Play class="w-4 h-4 mr-2" />
            开始学习
          </a-button>
          <a-button size="large" @click="exportReport">
            <Download class="w-4 h-4 mr-2" />
            导出报告
          </a-button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import SkillRadarChart from '@/components/SkillRadarChart.vue'
import ProgressTrendChart from '@/components/ProgressTrendChart.vue'
import {
  ClipboardCheck,
  Clock,
  FileText,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Trophy,
  Lightbulb,
  RotateCcw,
  Gamepad2,
  BookOpen,
  Headphones,
  PenTool,
  MessageSquare,
  Target,
  Zap,
  Mic,
  Square,
  Play,
  Pause,
  Highlighter,
  Type,
  Save,
  Trash2,
  TrendingUp,
  TrendingDown,
  Download
} from 'lucide-vue-next'

const router = useRouter()

// 响应式数据
const currentAssessment = ref(null)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const answers = ref([])
const showResult = ref(false)
const timeRemaining = ref(0)
const timer = ref(null)
const audioLoading = ref(false)

// 听力测试相关
const isPlaying = ref(false)
const audioPlayed = ref(false)
const playCount = ref(0)

// 口语测试相关
const isRecording = ref(false)
const isPreparing = ref(false)
const prepTimeLeft = ref(0)
const recordTimeLeft = ref(0)
const recordedAudio = ref(null)
const mediaRecorder = ref(null)

// 阅读测试相关
const highlightMode = ref(false)
const fontSize = ref(16)

// 写作测试相关
const writingAnswer = ref('')

// 评估类型
const assessmentTypes = ref([
  {
    id: 'vocabulary',
    title: '词汇测试',
    description: '测试你的词汇量和理解能力',
    icon: BookOpen,
    duration: '15分钟',
    questionCount: 20,
    questions: [
      {
        question: 'What does "happy" mean?',
        options: ['快乐的', '悲伤的', '生气的', '害怕的'],
        correct: 0,
        type: 'vocabulary'
      },
      {
        question: 'Choose the correct word: I am very _____ today.',
        options: ['happy', 'sad', 'angry', 'tired'],
        correct: 0,
        type: 'vocabulary'
      }
      // 更多题目...
    ]
  },
  {
    id: 'listening',
    title: '听力测试',
    description: '测试你的听力理解能力',
    icon: Headphones,
    duration: '20分钟',
    questionCount: 15,
    questions: [
      {
        question: '听音频，选择正确的答案',
        options: ['Apple', 'Orange', 'Banana', 'Grape'],
        correct: 0,
        type: 'listening',
        audio: 'audio-url-1'
      },
      {
        question: '根据听到的对话，选择正确答案',
        options: ['在图书馆', '在公园', '在学校', '在家里'],
        correct: 2,
        type: 'listening',
        audio: 'audio-url-2'
      }
    ]
  },
  {
    id: 'speaking',
    title: '口语测试',
    description: '测试你的口语表达能力',
    icon: MessageSquare,
    duration: '15分钟',
    questionCount: 5,
    questions: [
      {
        question: '自我介绍',
        prompt: '请用英语简单介绍一下你自己，包括姓名、年龄和爱好。',
        prepTime: 30,
        speakTime: 60,
        type: 'speaking'
      },
      {
        question: '描述图片',
        prompt: '请描述你看到的图片内容，包括人物、物品和场景。',
        prepTime: 45,
        speakTime: 90,
        type: 'speaking',
        image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=children%20playing%20in%20a%20colorful%20playground%20with%20swings%20and%20slides&image_size=landscape_4_3'
      }
    ]
  },
  {
    id: 'reading',
    title: '阅读测试',
    description: '测试你的阅读理解能力',
    icon: BookOpen,
    duration: '25分钟',
    questionCount: 10,
    questions: [
      {
        title: '阅读理解：我的学校生活',
        passage: [
          'My name is Tom. I am a student at Green Valley Elementary School. I wake up at 7:00 every morning and have breakfast with my family.',
          'At school, I have many friends. We play together during recess. My favorite subject is English because our teacher, Miss Smith, makes it very interesting.',
          'After school, I usually do my homework and then play with my dog in the garden. I go to bed at 9:00 PM.'
        ],
        question: 'What time does Tom wake up?',
        options: ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM'],
        correct: 1,
        type: 'reading'
      }
    ]
  },
  {
    id: 'writing',
    title: '写作测试',
    description: '测试你的英语写作能力',
    icon: PenTool,
    duration: '30分钟',
    questionCount: 3,
    questions: [
      {
        title: '我的家庭',
        prompt: '请写一篇短文介绍你的家庭成员，包括他们的职业和爱好。',
        requirements: [
          '至少写5句话',
          '使用正确的语法',
          '包含家庭成员的基本信息'
        ],
        maxLength: 200,
        type: 'writing'
      },
      {
        title: '我最喜欢的季节',
        prompt: '请写一篇短文描述你最喜欢的季节，说明原因。',
        requirements: [
          '至少写6句话',
          '说明喜欢的原因',
          '描述这个季节的特点'
        ],
        maxLength: 250,
        type: 'writing'
      }
    ]
  },
  {
    id: 'grammar',
    title: '语法测试',
    description: '测试你的语法知识和运用能力',
    icon: PenTool,
    duration: '25分钟',
    questionCount: 25,
    questions: [
      {
        question: 'Choose the correct form: She _____ to school every day.',
        options: ['go', 'goes', 'going', 'gone'],
        correct: 1,
        type: 'grammar'
      }
      // 更多题目...
    ]
  },
  {
    id: 'comprehensive',
    title: '综合测试',
    description: '全面测试你的英语综合能力',
    icon: Target,
    duration: '45分钟',
    questionCount: 50,
    questions: []
  }
])

// 当前题目
const currentQuestion = computed(() => {
  if (!currentAssessment.value) return null
  return currentAssessment.value.questions[currentQuestionIndex.value]
})

// 是否可以继续下一题
const canProceed = computed(() => {
  if (!currentQuestion.value) return false
  
  switch (currentAssessment.value.id) {
    case 'writing':
      return writingAnswer.value.trim().length > 0
    case 'speaking':
      return recordedAudio.value !== null
    default:
      return selectedAnswer.value !== null
  }
})

// 测试结果
const result = ref({
  score: 85,
  level: '中级',
  levelDescription: '你的英语水平处于中级阶段，可以进行日常交流',
  skillBreakdown: [
    { name: '词汇', score: 88 },
    { name: '语法', score: 82 },
    { name: '听力', score: 85 },
    { name: '阅读', score: 87 }
  ],
  suggestions: [
    {
      id: 1,
      title: '加强语法练习',
      description: '建议多做语法相关的练习题，提高语法运用能力',
      icon: PenTool
    },
    {
      id: 2,
      title: '增加听力训练',
      description: '每天坚持听英语材料，提高听力理解能力',
      icon: Headphones
    },
    {
      id: 3,
      title: '扩大词汇量',
      description: '学习更多高频词汇，提升表达能力',
      icon: BookOpen
    }
  ]
})

// 详细技能数据（用于图表组件）
const detailedSkillData = computed(() => [
  {
    name: '听力',
    score: 85,
    accuracy: 85,
    timeUsed: 180,
    suggestion: '多听英语新闻和对话，提高听力理解速度',
    icon: Headphones
  },
  {
    name: '口语',
    score: 78,
    accuracy: 78,
    timeUsed: 240,
    suggestion: '多练习口语表达，增强语音语调的准确性',
    icon: MessageSquare
  },
  {
    name: '阅读',
    score: 87,
    accuracy: 90,
    timeUsed: 300,
    suggestion: '继续保持阅读习惯，可以尝试更复杂的文章',
    icon: BookOpen
  },
  {
    name: '写作',
    score: 80,
    accuracy: 82,
    timeUsed: 420,
    suggestion: '注意语法结构和词汇运用，多练习不同类型的写作',
    icon: PenTool
  }
])

// 增强的学习建议
const enhancedSuggestions = computed(() => [
  {
    id: 1,
    title: '听力强化训练',
    description: '通过听英语歌曲、看英语电影等方式，提高听力理解能力和语感',
    type: 'listening',
    priority: 'high',
    icon: Headphones
  },
  {
    id: 2,
    title: '口语表达练习',
    description: '每天进行口语练习，可以通过跟读、对话练习等方式提高口语水平',
    type: 'speaking',
    priority: 'high',
    icon: MessageSquare
  },
  {
    id: 3,
    title: '语法知识巩固',
    description: '系统学习语法规则，通过练习题加深理解和运用',
    type: 'grammar',
    priority: 'medium',
    icon: PenTool
  },
  {
    id: 4,
    title: '词汇量扩展',
    description: '学习高频词汇和短语，建立词汇笔记，定期复习',
    type: 'vocabulary',
    priority: 'medium',
    icon: BookOpen
  }
])

// 历史数据（模拟）
const historyData = ref([
  { date: '2024-01-01', listening: 75, speaking: 70, reading: 80, writing: 72 },
  { date: '2024-02-01', listening: 78, speaking: 72, reading: 82, writing: 75 },
  { date: '2024-03-01', listening: 82, speaking: 75, reading: 85, writing: 78 },
  { date: '2024-04-01', listening: 85, speaking: 78, reading: 87, writing: 80 }
])

// 开始评估
const startAssessment = (type) => {
  currentAssessment.value = type
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  answers.value = new Array(type.questions.length).fill(null)
  showResult.value = false
  
  // 重置各种状态
  isPlaying.value = false
  audioPlayed.value = false
  playCount.value = 0
  isRecording.value = false
  isPreparing.value = false
  recordedAudio.value = null
  highlightMode.value = false
  fontSize.value = 16
  writingAnswer.value = ''
  
  // 设置计时器
  const duration = parseInt(type.duration) * 60 // 转换为秒
  timeRemaining.value = duration
  startTimer()
}

// 选择答案
const selectAnswer = (index) => {
  selectedAnswer.value = index
  answers.value[currentQuestionIndex.value] = index
}

// 下一题
const nextQuestion = () => {
  // 保存当前答案
  if (currentAssessment.value.id === 'writing') {
    answers.value[currentQuestionIndex.value] = writingAnswer.value
  } else if (currentAssessment.value.id === 'speaking') {
    answers.value[currentQuestionIndex.value] = recordedAudio.value
  } else {
    answers.value[currentQuestionIndex.value] = selectedAnswer.value
  }
  
  if (currentQuestionIndex.value < currentAssessment.value.questions.length - 1) {
    currentQuestionIndex.value++
    
    // 重置状态
    selectedAnswer.value = answers.value[currentQuestionIndex.value]
    isPlaying.value = false
    audioPlayed.value = false
    playCount.value = 0
    isRecording.value = false
    isPreparing.value = false
    recordedAudio.value = null
    writingAnswer.value = answers.value[currentQuestionIndex.value] || ''
  } else {
    finishAssessment()
  }
}

// 上一题
const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    selectedAnswer.value = answers.value[currentQuestionIndex.value]
  }
}

// 完成评估
const finishAssessment = () => {
  stopTimer()
  calculateResult()
  showResult.value = true
}

// 计算结果
const calculateResult = () => {
  let correctCount = 0
  answers.value.forEach((answer, index) => {
    if (answer === currentAssessment.value.questions[index].correct) {
      correctCount++
    }
  })
  
  const score = Math.round((correctCount / answers.value.length) * 100)
  result.value.score = score
  
  // 根据分数确定等级
  if (score >= 90) {
    result.value.level = '高级'
    result.value.levelDescription = '你的英语水平很高，可以流利地进行各种交流'
  } else if (score >= 70) {
    result.value.level = '中级'
    result.value.levelDescription = '你的英语水平处于中级阶段，可以进行日常交流'
  } else if (score >= 50) {
    result.value.level = '初级'
    result.value.levelDescription = '你的英语基础不错，需要继续加强练习'
  } else {
    result.value.level = '入门'
    result.value.levelDescription = '建议从基础开始，循序渐进地学习'
  }
}

// 播放音频
const playAudio = () => {
  audioLoading.value = true
  isPlaying.value = true
  audioPlayed.value = true
  playCount.value++
  
  // 模拟音频播放
  setTimeout(() => {
    audioLoading.value = false
    isPlaying.value = false
  }, 3000)
}

// 慢速播放音频
const playAudioSlow = () => {
  audioLoading.value = true
  isPlaying.value = true
  
  setTimeout(() => {
    audioLoading.value = false
    isPlaying.value = false
  }, 4000)
}

// 播放选项音频
const playOptionAudio = (index) => {
  // 播放对应选项的音频
  console.log(`Playing audio for option ${index}`)
}

// 口语测试相关方法
const startRecording = async () => {
  try {
    isPreparing.value = true
    prepTimeLeft.value = currentQuestion.value.prepTime
    
    // 准备时间倒计时
    const prepTimer = setInterval(() => {
      prepTimeLeft.value--
      if (prepTimeLeft.value <= 0) {
        clearInterval(prepTimer)
        isPreparing.value = false
        startActualRecording()
      }
    }, 1000)
  } catch (error) {
    console.error('Failed to start recording:', error)
  }
}

const startActualRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)
    
    const audioChunks = []
    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }
    
    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
      recordedAudio.value = URL.createObjectURL(audioBlob)
      stream.getTracks().forEach(track => track.stop())
    }
    
    mediaRecorder.value.start()
    isRecording.value = true
    recordTimeLeft.value = currentQuestion.value.speakTime
    
    // 录音时间倒计时
    const recordTimer = setInterval(() => {
      recordTimeLeft.value--
      if (recordTimeLeft.value <= 0) {
        clearInterval(recordTimer)
        stopRecording()
      }
    }, 1000)
  } catch (error) {
    console.error('Failed to start actual recording:', error)
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
  }
}

const playRecording = () => {
  if (recordedAudio.value) {
    const audio = new Audio(recordedAudio.value)
    audio.play()
  }
}

// 阅读测试相关方法
const toggleHighlight = () => {
  highlightMode.value = !highlightMode.value
}

const adjustFontSize = () => {
  fontSize.value = fontSize.value === 16 ? 18 : fontSize.value === 18 ? 20 : 16
}

// 写作测试相关方法
const saveAsDraft = () => {
  localStorage.setItem(`writing_draft_${currentQuestionIndex.value}`, writingAnswer.value)
  // 显示保存成功提示
}

const clearWriting = () => {
  writingAnswer.value = ''
}

// 计时器相关
const startTimer = () => {
  timer.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      finishAssessment()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 获取分数颜色
const getScoreColor = (score) => {
  if (score >= 90) return '#52c41a'
  if (score >= 70) return '#1890ff'
  if (score >= 50) return '#fa8c16'
  return '#f5222d'
}

const getSkillColor = (score) => {
  if (score >= 85) return '#52c41a'
  if (score >= 70) return '#1890ff'
  if (score >= 60) return '#fa8c16'
  return '#f5222d'
}

// 详细统计数据
const detailedStats = computed(() => [
  {
    name: '总测试次数',
    value: '12',
    change: 8.5,
    color: '#3b82f6',
    icon: Target
  },
  {
    name: '平均分数',
    value: '85',
    change: 5.2,
    color: '#10b981',
    icon: TrendingUp
  },
  {
    name: '学习时长',
    value: '24h',
    change: 12.3,
    color: '#f59e0b',
    icon: Clock
  },
  {
    name: '掌握词汇',
    value: '1,250',
    change: 15.7,
    color: '#ef4444',
    icon: BookOpen
  }
])

// 开始练习
const startPractice = (type: string) => {
  router.push(`/games?type=${type}`)
}

// 导出报告
const exportReport = () => {
  // 生成PDF报告
  const reportData = {
    score: result.value.score,
    level: result.value.level,
    skillBreakdown: detailedSkillData.value,
    suggestions: enhancedSuggestions.value,
    date: new Date().toLocaleDateString()
  }
  
  // 这里可以集成PDF生成库
  console.log('导出报告:', reportData)
  
  // 模拟下载
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `英语能力评估报告_${new Date().toLocaleDateString()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 查看详细报告
const viewDetailedReport = () => {
  router.push('/reports')
}

// 开始学习
const startLearning = () => {
  router.push('/courses')
}

// 操作方法
const retakeAssessment = () => {
  currentAssessment.value = null
  showResult.value = false
}

const goToGames = () => {
  router.push('/games')
}

const viewReport = () => {
  router.push('/reports')
}

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped lang="less">
.assessment-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.assessment-types {
  margin-bottom: 40px;
}

.assessment-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
}

.card-icon {
  text-align: center;
  margin-bottom: 20px;
  color: #1890ff;
}

.card-content {
  flex: 1;
  text-align: center;
  margin-bottom: 24px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.card-desc {
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.card-meta {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;

  span {
    display: flex;
    align-items: center;
  }
}

.card-action {
  text-align: center;
}

.assessment-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.assessment-header {
  margin-bottom: 32px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.assessment-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.question-progress {
  font-size: 16px;
  color: #6b7280;
}

.progress-bar {
  margin-bottom: 16px;
}

.timer {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
  color: #fa8c16;
}

.question-container {
  max-width: 800px;
  margin: 0 auto;
}

.question-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 32px;
}

.question-content {
  margin-bottom: 32px;
}

.question-title {
  font-size: 20px;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.question-audio {
  margin-bottom: 20px;
}

.question-image {
  text-align: center;
  margin-bottom: 20px;

  img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
  }
}

.answer-options {
  margin-bottom: 32px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #bae6fd;
    background: #f0f9ff;
  }

  &.selected {
    border-color: #1890ff;
    background: #e6f7ff;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.option-label {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-right: 16px;
  flex-shrink: 0;
}

.option-content {
  flex: 1;
  font-size: 16px;
  color: #1f2937;
}

.question-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

// 听力测试样式
.listening-question {
  .audio-player-section {
    text-align: center;
    margin-bottom: 32px;
    padding: 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    color: white;
  }

  .audio-visual {
    margin-bottom: 24px;
  }

  .audio-waves {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    height: 60px;
    margin-bottom: 20px;

    .wave-bar {
      width: 4px;
      height: 20px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 2px;
      animation: wave 1.5s ease-in-out infinite;
    }

    &.active .wave-bar {
      background: #fff;
      animation: wave 0.8s ease-in-out infinite;
    }
  }

  .audio-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    .play-btn {
      font-size: 16px;
      height: 48px;
      padding: 0 32px;
    }

    .play-count {
      font-size: 14px;
      opacity: 0.8;
    }
  }

  .question-text {
    text-align: center;

    h3 {
      font-size: 20px;
      margin-bottom: 8px;
    }

    .instruction {
      color: #6b7280;
      font-size: 14px;
    }
  }
}

// 口语测试样式
.speaking-question {
  .speaking-prompt {
    margin-bottom: 32px;
    text-align: center;

    h3 {
      font-size: 20px;
      margin-bottom: 16px;
    }

    .prompt-details p {
      color: #6b7280;
      margin-bottom: 12px;
    }

    .time-limit {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fa8c16;
      font-size: 14px;
    }
  }

  .recording-section {
    text-align: center;
    padding: 40px;
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    border-radius: 16px;
  }

  .recording-visual {
    margin-bottom: 32px;

    .mic-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      transition: all 0.3s;

      &.preparing {
        background: #fa8c16;
        animation: pulse 1s infinite;
      }

      &.recording {
        background: #f5222d;
        animation: pulse 0.5s infinite;
      }
    }

    .recording-status {
      font-size: 16px;
      font-weight: 500;
      color: white;
    }
  }

  .recording-controls {
    display: flex;
    justify-content: center;
    gap: 16px;
  }
}

// 阅读测试样式
.reading-question {
  .reading-passage {
    margin-bottom: 32px;
    padding: 24px;
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }

  .passage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;

    h3 {
      margin: 0;
      font-size: 18px;
    }

    .reading-tools {
      display: flex;
      gap: 8px;
    }
  }

  .passage-content {
    line-height: 1.8;
    color: #374151;

    &.highlight-mode {
      background: #fffbeb;
      padding: 16px;
      border-radius: 8px;
    }

    p {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .reading-question-text {
    padding: 20px;
    background: #f0f9ff;
    border-radius: 8px;
    border-left: 4px solid #1890ff;

    h4 {
      margin: 0;
      color: #1f2937;
    }
  }
}

// 写作测试样式
.writing-question {
  .writing-prompt {
    margin-bottom: 24px;
    padding: 24px;
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;

    h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
    }

    .prompt-content p {
      color: #6b7280;
      margin-bottom: 16px;
    }

    .requirements {
      h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #374151;
      }

      ul {
        margin: 0;
        padding-left: 20px;
        color: #6b7280;
        font-size: 14px;

        li {
          margin-bottom: 4px;
        }
      }
    }
  }

  .writing-area {
    .writing-textarea {
      margin-bottom: 16px;
      font-size: 16px;
      line-height: 1.6;
    }

    .writing-tools {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .word-count {
        font-size: 14px;
        color: #6b7280;
      }

      .writing-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}

// 选项音频按钮样式
.option-audio {
  .option-audio-btn {
    margin-left: 8px;
    opacity: 0.6;
    transition: opacity 0.3s;

    &:hover {
      opacity: 1;
    }
  }
}

// 动画
@keyframes wave {
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(2);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.assessment-result {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.result-header {
  margin-bottom: 40px;
}

.result-icon {
  margin-bottom: 16px;
}

.result-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.result-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.result-content {
  text-align: left;
}

.score-card,
.breakdown-card,
.suggestions-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  height: 100%;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.score-display {
  text-align: center;
}

.score-circle {
  margin-bottom: 20px;
}

.score-text {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.level-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-weight: 500;
  margin-bottom: 8px;
}

.level-desc {
  color: #6b7280;
  margin: 0;
}

.skill-breakdown {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skill-item {
  .skill-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .skill-name {
    font-weight: 500;
    color: #1f2937;
  }

  .skill-score {
    color: #6b7280;
  }
}

.suggestions-card {
  margin-top: 24px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suggestion-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.suggestion-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(24, 144, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.suggestion-desc {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}

.result-actions {
  margin-top: 32px;
  text-align: center;
}

// 响应式设计
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .assessment-card {
    padding: 24px;
  }

  .assessment-content {
    padding: 24px;
  }

  .question-card {
    padding: 24px;
  }

  .assessment-result {
    padding: 24px;
  }

  .progress-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .question-actions {
    flex-direction: column;
  }

  .result-actions {
    :deep(.ant-space) {
      flex-direction: column;
      width: 100%;
    }
  }
}
</style>