<template>
  <div class="game-interface">
    <!-- 游戏头部信息 -->
    <div class="game-header">
      <a-card class="game-info-card">
        <div class="game-info">
          <div class="game-title">
            <component :is="getGameIcon(currentGame.type)" class="w-6 h-6 mr-2" />
            {{ currentGame.title }}
          </div>
          <div class="game-meta">
            <a-tag color="blue">{{ currentGame.difficulty }}</a-tag>
            <a-tag color="green">{{ currentGame.category }}</a-tag>
          </div>
        </div>
        <div class="game-progress">
          <div class="progress-info">
            <span>进度: {{ currentQuestionIndex + 1 }} / {{ currentGame.questions.length }}</span>
            <span class="score">得分: {{ gameScore }}</span>
          </div>
          <a-progress 
            :percent="progressPercent" 
            :stroke-color="{ '0%': '#108ee9', '100%': '#87d068' }"
            :show-info="false"
          />
        </div>
      </a-card>

      <!-- 游戏控制 -->
      <div class="game-controls">
        <a-button @click="pauseGame" :disabled="gameState !== 'playing'">
          <Pause class="w-4 h-4 mr-1" />
          暂停
        </a-button>
        <a-button @click="exitGame" type="text" danger>
          <X class="w-4 h-4 mr-1" />
          退出
        </a-button>
      </div>
    </div>

    <!-- 游戏内容区域 -->
    <div class="game-content">
      <a-card class="question-card" v-if="gameState === 'playing'">
        <!-- 单词拼写游戏 -->
        <div v-if="currentGame.type === 'spelling'" class="spelling-game">
          <div class="question-section">
            <h3>听音拼词</h3>
            <div class="audio-section">
              <a-button 
                type="primary" 
                size="large" 
                @click="playAudio"
                class="play-button"
              >
                <Volume2 class="w-5 h-5 mr-2" />
                播放单词
              </a-button>
              <div class="play-count">已播放 {{ playCount }} 次</div>
            </div>
            <div class="word-hint" v-if="showHint">
              <span>提示: {{ currentQuestion.hint }}</span>
            </div>
          </div>
          
          <div class="answer-section">
            <div class="letter-boxes">
              <div 
                v-for="(letter, index) in userAnswer" 
                :key="index"
                class="letter-box"
                :class="{ 
                  correct: letter && letter === currentQuestion.answer[index],
                  incorrect: letter && letter !== currentQuestion.answer[index]
                }"
              >
                {{ letter }}
              </div>
            </div>
            <div class="letter-keyboard">
              <div 
                v-for="letter in alphabet" 
                :key="letter"
                class="letter-key"
                :class="{ 
                  used: usedLetters.includes(letter),
                  disabled: usedLetters.includes(letter)
                }"
                @click="selectLetter(letter)"
              >
                {{ letter }}
              </div>
            </div>
            <div class="game-actions">
              <a-button @click="clearAnswer" :disabled="userAnswer.length === 0">
                <RotateCcw class="w-4 h-4 mr-1" />
                清空
              </a-button>
              <a-button @click="showHint = true" :disabled="showHint" type="dashed">
                <Lightbulb class="w-4 h-4 mr-1" />
                提示
              </a-button>
              <a-button 
                type="primary" 
                @click="submitAnswer"
                :disabled="userAnswer.join('').length !== currentQuestion.answer.length"
              >
                <Check class="w-4 h-4 mr-1" />
                提交
              </a-button>
            </div>
          </div>
        </div>

        <!-- 听力练习游戏 -->
        <div v-else-if="currentGame.type === 'listening'" class="listening-game">
          <div class="question-section">
            <h3>听力理解</h3>
            <div class="audio-section">
              <a-button 
                type="primary" 
                size="large" 
                @click="playAudio"
                class="play-button"
              >
                <Headphones class="w-5 h-5 mr-2" />
                播放音频
              </a-button>
              <div class="audio-controls">
                <a-slider 
                  v-model:value="playbackSpeed" 
                  :min="0.5" 
                  :max="2" 
                  :step="0.1"
                  class="speed-slider"
                />
                <span class="speed-label">{{ playbackSpeed }}x</span>
              </div>
            </div>
          </div>
          
          <div class="answer-section">
            <div class="question-text">{{ currentQuestion.question }}</div>
            <a-radio-group v-model:value="selectedAnswer" class="answer-options">
              <div 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                class="option-item"
              >
                <a-radio :value="option.value" class="option-radio">
                  <div class="option-content">
                    <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                    <span class="option-text">{{ option.text }}</span>
                  </div>
                </a-radio>
              </div>
            </a-radio-group>
            <div class="game-actions">
              <a-button @click="playAudio" type="dashed">
                <Volume2 class="w-4 h-4 mr-1" />
                重播
              </a-button>
              <a-button 
                type="primary" 
                @click="submitAnswer"
                :disabled="!selectedAnswer"
              >
                <Check class="w-4 h-4 mr-1" />
                提交答案
              </a-button>
            </div>
          </div>
        </div>

        <!-- 语法选择游戏 -->
        <div v-else-if="currentGame.type === 'grammar'" class="grammar-game">
          <div class="question-section">
            <h3>语法练习</h3>
            <div class="sentence-container">
              <div class="sentence">
                <span v-for="(part, index) in sentenceParts" :key="index" class="sentence-part">
                  <span v-if="part.type === 'text'">{{ part.content }}</span>
                  <span v-else-if="part.type === 'blank'" class="blank-space">
                    <a-select 
                      v-model:value="part.selected"
                      placeholder="选择"
                      class="blank-select"
                      @change="updateSentence"
                    >
                      <a-select-option 
                        v-for="option in part.options" 
                        :key="option"
                        :value="option"
                      >
                        {{ option }}
                      </a-select-option>
                    </a-select>
                  </span>
                </span>
              </div>
            </div>
            <div class="grammar-explanation" v-if="showExplanation">
              <a-alert 
                :message="currentQuestion.explanation" 
                type="info" 
                show-icon 
                class="explanation-alert"
              />
            </div>
          </div>
          
          <div class="answer-section">
            <div class="game-actions">
              <a-button @click="showExplanation = !showExplanation" type="dashed">
                <BookOpen class="w-4 h-4 mr-1" />
                {{ showExplanation ? '隐藏' : '显示' }}解释
              </a-button>
              <a-button 
                type="primary" 
                @click="submitAnswer"
                :disabled="!isGrammarComplete"
              >
                <Check class="w-4 h-4 mr-1" />
                提交答案
              </a-button>
            </div>
          </div>
        </div>

        <!-- 阅读理解游戏 -->
        <div v-else-if="currentGame.type === 'reading'" class="reading-game">
          <div class="reading-content">
            <div class="passage-section">
              <h3>阅读理解</h3>
              <div class="passage-container">
                <div class="passage-text">{{ currentQuestion.passage }}</div>
                <div class="reading-tools">
                  <a-button @click="toggleHighlight" size="small" type="dashed">
                    <Highlighter class="w-4 h-4 mr-1" />
                    标记重点
                  </a-button>
                  <a-button @click="showTranslation = !showTranslation" size="small" type="dashed">
                    <Languages class="w-4 h-4 mr-1" />
                    {{ showTranslation ? '隐藏' : '显示' }}翻译
                  </a-button>
                </div>
                <div v-if="showTranslation" class="translation">
                  {{ currentQuestion.translation }}
                </div>
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
              
              <div class="game-actions">
                <a-button 
                  type="primary" 
                  @click="submitAnswer"
                  :disabled="!isReadingComplete"
                >
                  <Check class="w-4 h-4 mr-1" />
                  提交答案
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 单词配对游戏 -->
        <div v-else-if="currentGame.type === 'vocabulary'" class="vocabulary-game">
          <div class="question-section">
            <h3>{{ currentQuestion.question }}</h3>
            <div class="game-mode-tabs">
              <a-tabs v-model:activeKey="vocabularyMode" centered>
                <a-tab-pane key="image" tab="图片匹配">
                  <div class="image-matching">
                    <div class="target-word">
                      <div class="word-card">
                        <h4>{{ currentQuestion.word }}</h4>
                        <div class="word-pronunciation" v-if="currentQuestion.pronunciation">
                          [{{ currentQuestion.pronunciation }}]
                        </div>
                      </div>
                    </div>
                    <div class="image-options">
                      <div 
                        v-for="(option, index) in currentQuestion.imageOptions" 
                        :key="index"
                        class="image-option"
                        :class="{ 
                          selected: selectedImageIndex === index,
                          correct: showImageFeedback && option.correct,
                          incorrect: showImageFeedback && selectedImageIndex === index && !option.correct
                        }"
                        @click="selectImage(index)"
                      >
                        <div class="image-container">
                          <img :src="option.image" :alt="option.alt" />
                        </div>
                        <div class="image-label">{{ option.label }}</div>
                      </div>
                    </div>
                  </div>
                </a-tab-pane>
                <a-tab-pane key="meaning" tab="词义匹配">
                  <div class="meaning-matching">
                    <div class="words-column">
                      <h4>单词</h4>
                      <div class="word-list">
                        <div 
                          v-for="(word, index) in currentQuestion.words" 
                          :key="index"
                          class="word-item"
                          :class="{ 
                            selected: selectedWordIndex === index,
                            matched: wordMatches[index] !== undefined
                          }"
                          @click="selectWord(index)"
                        >
                          {{ word }}
                        </div>
                      </div>
                    </div>
                    <div class="meanings-column">
                      <h4>词义</h4>
                      <div class="meaning-list">
                        <div 
                          v-for="(meaning, index) in currentQuestion.meanings" 
                          :key="index"
                          class="meaning-item"
                          :class="{ 
                            selected: selectedMeaningIndex === index,
                            matched: meaningMatches[index] !== undefined,
                            correct: showMeaningFeedback && meaning.correct,
                            incorrect: showMeaningFeedback && meaningMatches[index] !== undefined && !meaning.correct
                          }"
                          @click="selectMeaning(index)"
                        >
                          {{ meaning.text }}
                        </div>
                      </div>
                    </div>
                  </div>
                </a-tab-pane>
              </a-tabs>
            </div>
          </div>
          
          <div class="answer-section">
            <div class="vocabulary-actions">
              <a-button 
                v-if="vocabularyMode === 'image'"
                type="primary" 
                size="large" 
                :disabled="selectedImageIndex === null"
                @click="submitImageAnswer"
              >
                <CheckCircle class="w-4 h-4" />
                确认选择
              </a-button>
              <div v-else class="matching-actions">
                <a-button 
                  type="default" 
                  size="large" 
                  @click="clearMatches"
                  :disabled="Object.keys(wordMatches).length === 0"
                >
                  <RotateCcw class="w-4 h-4" />
                  重新匹配
                </a-button>
                <a-button 
                  type="primary" 
                  size="large" 
                  :disabled="Object.keys(wordMatches).length !== currentQuestion.words.length"
                  @click="submitMeaningAnswer"
                >
                  <CheckCircle class="w-4 h-4" />
                  提交答案
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 游戏暂停界面 -->
      <div v-else-if="gameState === 'paused'" class="game-paused">
        <a-card class="pause-card">
          <div class="pause-content">
            <Pause class="w-16 h-16 text-gray-400 mb-4" />
            <h3>游戏已暂停</h3>
            <p>休息一下，准备好了再继续吧！</p>
            <div class="pause-actions">
              <a-button type="primary" @click="resumeGame" size="large">
                <Play class="w-4 h-4 mr-1" />
                继续游戏
              </a-button>
              <a-button @click="exitGame" size="large">
                <X class="w-4 h-4 mr-1" />
                退出游戏
              </a-button>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 游戏结束界面 -->
      <div v-else-if="gameState === 'finished'" class="game-finished">
        <a-card class="finish-card">
          <div class="finish-content">
            <div class="finish-header">
              <Trophy class="w-16 h-16 text-yellow-500 mb-4" />
              <h2>游戏完成！</h2>
              <div class="final-score">
                <div class="score-circle">
                  <a-progress 
                    type="circle" 
                    :percent="Math.round((gameScore / (currentGame.questions.length * 100)) * 100)" 
                    :size="120"
                    :stroke-color="getScoreColor(gameScore)"
                  />
                </div>
                <div class="score-details">
                  <div class="score-label">总得分</div>
                  <div class="score-value">{{ gameScore }}</div>
                  <div class="score-rating">{{ getScoreRating(gameScore) }}</div>
                </div>
              </div>

              <!-- 游戏统计 -->
              <div class="game-stats">
                <a-row :gutter="16">
                  <a-col :span="6">
                    <div class="stat-item">
                      <Target class="w-6 h-6 mb-2 text-blue-500" />
                      <div class="stat-value">{{ correctAnswers }}</div>
                      <div class="stat-label">正确答案</div>
                    </div>
                  </a-col>
                  <a-col :span="6">
                    <div class="stat-item">
                      <Clock class="w-6 h-6 mb-2 text-green-500" />
                      <div class="stat-value">{{ formatTime(gameTime) }}</div>
                      <div class="stat-label">用时</div>
                    </div>
                  </a-col>
                  <a-col :span="6">
                    <div class="stat-item">
                      <Zap class="w-6 h-6 mb-2 text-orange-500" />
                      <div class="stat-value">{{ streak }}</div>
                      <div class="stat-label">连击</div>
                    </div>
                  </a-col>
                  <a-col :span="6">
                    <div class="stat-item">
                      <Star class="w-6 h-6 mb-2 text-purple-500" />
                      <div class="stat-value">{{ earnedStars }}</div>
                      <div class="stat-label">获得星星</div>
                    </div>
                  </a-col>
                </a-row>
              </div>

              <!-- 获得徽章 -->
              <div v-if="earnedBadges.length > 0" class="earned-badges">
                <h4>🎉 获得新徽章！</h4>
                <div class="badge-list">
                  <div 
                    v-for="badge in earnedBadges" 
                    :key="badge.id"
                    class="badge-item"
                  >
                    <div class="badge-icon">{{ badge.emoji }}</div>
                    <div class="badge-info">
                      <div class="badge-name">{{ badge.name }}</div>
                      <div class="badge-description">{{ badge.description }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 学习建议 -->
              <div class="learning-suggestions">
                <h4>💡 学习建议</h4>
                <div class="suggestion-list">
                  <div 
                    v-for="suggestion in suggestions" 
                    :key="suggestion.id"
                    class="suggestion-item"
                  >
                    <component :is="suggestion.icon" class="w-5 h-5 mr-2" />
                    <span>{{ suggestion.text }}</span>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="finish-actions">
                <a-button type="primary" @click="playAgain" size="large">
                  <RotateCcw class="w-4 h-4 mr-1" />
                  再玩一次
                </a-button>
                <a-button @click="nextLevel" size="large" :disabled="!canAdvance">
                  <ArrowRight class="w-4 h-4 mr-1" />
                  下一关
                </a-button>
                <a-button @click="backToMenu" size="large">
                  <Home class="w-4 h-4 mr-1" />
                  返回主页
                </a-button>
              </div>
            </div>
          </a-card>
        </div>
      </div>

      <!-- 答题反馈模态框 -->
      <a-modal
        v-model:open="showFeedback"
        :title="null"
        :footer="null"
        :closable="false"
        class="feedback-modal"
        :width="400"
      >
        <div class="feedback-content">
          <div class="feedback-icon">
            <CheckCircle v-if="isCorrect" class="w-16 h-16 text-green-500" />
            <XCircle v-else class="w-16 h-16 text-red-500" />
          </div>
          <div class="feedback-message">
            <h3>{{ isCorrect ? '回答正确！' : '回答错误' }}</h3>
            <p v-if="!isCorrect">正确答案是: {{ correctAnswer }}</p>
            <p v-if="explanation">{{ explanation }}</p>
          </div>
          <div class="feedback-score" v-if="isCorrect">
            <div class="score-animation">+{{ lastScore }}</div>
          </div>
        </div>
      </a-modal>

      <!-- 积分动画 -->
      <div class="points-animation" v-if="showPointsAnimation">
        <div 
          v-for="point in animatedPoints" 
          :key="point.id"
          class="point-item"
          :style="{ 
            left: point.x + 'px', 
            top: point.y + 'px',
            animationDelay: point.delay + 'ms'
          }"
        >
          +{{ point.value }}
        </div>
      </div>

      <!-- 连击效果 -->
      <div class="streak-effect" v-if="showStreakEffect">
        <div class="streak-text">
          {{ streak }}连击！
          <div class="streak-multiplier">x{{ streakMultiplier }}</div>
        </div>
      </div>
    </div>

    <!-- 动画组件 -->
    <RewardAnimation 
      ref="rewardAnimationRef"
      :type="rewardType"
      :points="rewardPoints"
      :star-count="rewardStars"
      :badge-name="rewardBadgeName"
      :level="currentLevel"
      :combo="streak"
      :multiplier="streakMultiplier"
      :exp="rewardExp"
      :exp-percentage="expPercentage"
      @complete="onRewardAnimationComplete"
    />

    <!-- 音效组件 -->
    <SoundEffects 
      ref="soundEffectsRef"
      :enabled="soundEnabled"
      :volume="soundVolume"
    />

    <!-- 浮动元素 -->
    <FloatingElements 
      :show-bubbles="true"
      :show-stars="true"
      :show-hearts="false"
      :show-rainbows="false"
      :show-clouds="true"
      :show-flowers="false"
      :show-notes="true"
      :show-gifts="false"
      :count="8"
      :duration="15000"
      :intensity="0.6"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { storage } from '@/utils/storage'
import RewardAnimation from '@/components/animations/RewardAnimation.vue'
import SoundEffects from '@/components/animations/SoundEffects.vue'
import FloatingElements from '@/components/animations/FloatingElements.vue'
import {
  Volume2,
  Headphones,
  BookOpen,
  PenTool,
  Pause,
  Play,
  X,
  Check,
  RotateCcw,
  Lightbulb,
  Highlighter,
  Languages,
  Trophy,
  Target,
  Clock,
  Zap,
  Star,
  ArrowRight,
  Home,
  CheckCircle,
  XCircle
} from 'lucide-vue-next'

interface GameQuestion {
  id: string
  type: string
  question?: string
  answer: string | string[]
  options?: Array<{ text: string; value: string }>
  hint?: string
  explanation?: string
  passage?: string
  translation?: string
  questions?: Array<{
    question: string
    options: Array<{ text: string; value: string }>
    answer: string
  }>
  audioUrl?: string
  difficulty: number
  points: number
}

interface Game {
  id: string
  title: string
  type: string
  difficulty: string
  category: string
  questions: GameQuestion[]
  timeLimit?: number
}

interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  condition: (stats: any) => boolean
}

const router = useRouter()

// 响应式数据
const gameState = ref<'playing' | 'paused' | 'finished'>('playing')
const currentQuestionIndex = ref(0)
const gameScore = ref(0)
const correctAnswers = ref(0)
const gameTime = ref(0)
const streak = ref(0)
const maxStreak = ref(0)
const earnedStars = ref(0)
const earnedBadges = ref<Badge[]>([])

// 答题相关
const userAnswer = ref<string[]>([])
const selectedAnswer = ref('')
const readingAnswers = ref<string[]>([])
const usedLetters = ref<string[]>([])
const showHint = ref(false)
const showExplanation = ref(false)
const showTranslation = ref(false)

// 单词配对游戏相关
const vocabularyMode = ref('image')
const selectedImageIndex = ref<number | null>(null)
const showImageFeedback = ref(false)
const selectedWordIndex = ref<number | null>(null)
const selectedMeaningIndex = ref<number | null>(null)
const wordMatches = ref<Record<number, number>>({})
const meaningMatches = ref<Record<number, number>>({})
const showMeaningFeedback = ref(false)

// 音频控制
const playCount = ref(0)
const playbackSpeed = ref(1)

// 语法游戏
const sentenceParts = ref([])

// 反馈系统
const showFeedback = ref(false)
const isCorrect = ref(false)
const correctAnswer = ref('')
const explanation = ref('')
const lastScore = ref(0)

// 动画效果
const showPointsAnimation = ref(false)
const showStreakEffect = ref(false)
const animatedPoints = ref([])
const streakMultiplier = ref(1)

// 新增动画相关状态
const rewardAnimationRef = ref()
const soundEffectsRef = ref()
const rewardType = ref<'points' | 'stars' | 'badge' | 'level' | 'combo' | 'perfect' | 'exp'>('points')
const rewardPoints = ref(0)
const rewardStars = ref(0)
const rewardBadgeName = ref('')
const currentLevel = ref(1)
const rewardExp = ref(0)
const expPercentage = ref(0)
const soundEnabled = ref(true)
const soundVolume = ref(0.7)

// 字母表
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// 模拟游戏数据
const currentGame = ref<Game>({
  id: '1',
  title: '单词拼写挑战',
  type: 'spelling',
  difficulty: '简单',
  category: '词汇',
  questions: [
    {
      id: '1',
      type: 'spelling',
      answer: 'APPLE',
      hint: '一种红色的水果',
      explanation: 'Apple是苹果的意思',
      audioUrl: '/audio/apple.mp3',
      difficulty: 1,
      points: 100
    },
    {
      id: '2',
      type: 'spelling',
      answer: 'BOOK',
      hint: '用来阅读的物品',
      explanation: 'Book是书的意思',
      audioUrl: '/audio/book.mp3',
      difficulty: 1,
      points: 100
    }
  ]
})

// 徽章系统
const badges: Badge[] = [
  {
    id: 'first_correct',
    name: '初次成功',
    description: '第一次答对题目',
    emoji: '🎯',
    condition: (stats) => stats.correctAnswers >= 1
  },
  {
    id: 'streak_master',
    name: '连击大师',
    description: '连续答对5题',
    emoji: '🔥',
    condition: (stats) => stats.maxStreak >= 5
  },
  {
    id: 'perfect_score',
    name: '完美得分',
    description: '获得满分',
    emoji: '⭐',
    condition: (stats) => stats.score === stats.maxScore
  }
]

// 学习建议
const suggestions = ref([
  {
    id: '1',
    icon: BookOpen,
    text: '多练习单词拼写，提高词汇量'
  },
  {
    id: '2',
    icon: Headphones,
    text: '加强听力训练，提高语音识别能力'
  }
])

// 计算属性
const progressPercent = computed(() => {
  if (currentGame.value.questions.length === 0) return 0
  return Math.round(((currentQuestionIndex.value + 1) / currentGame.value.questions.length) * 100)
})

const currentQuestion = computed(() => {
  return currentGame.value.questions[currentQuestionIndex.value]
})

const isGrammarComplete = computed(() => {
  return sentenceParts.value.every(part => 
    part.type === 'text' || (part.type === 'blank' && part.selected)
  )
})

const isReadingComplete = computed(() => {
  if (!currentQuestion.value?.questions) return false
  return currentQuestion.value.questions.every((_, index) => readingAnswers.value[index])
})

const canAdvance = computed(() => {
  const scorePercent = (gameScore.value / (currentGame.value.questions.length * 100)) * 100
  return scorePercent >= 60 // 60%以上可以进入下一关
})

// 方法
const getGameIcon = (type: string) => {
  const icons = {
    spelling: PenTool,
    listening: Headphones,
    grammar: BookOpen,
    reading: BookOpen
  }
  return icons[type] || BookOpen
}

const playAudio = () => {
  playCount.value++
  soundEffectsRef.value?.playSound('click')
  message.info('播放音频...')
  // 这里实现音频播放逻辑
}

const selectLetter = (letter: string) => {
  if (usedLetters.value.includes(letter)) return
  
  soundEffectsRef.value?.playSound('pop')
  
  const answerLength = currentQuestion.value.answer.length
  if (userAnswer.value.length < answerLength) {
    userAnswer.value.push(letter)
    usedLetters.value.push(letter)
  }
}

const clearAnswer = () => {
  soundEffectsRef.value?.playSound('whoosh')
  userAnswer.value = []
  usedLetters.value = []
}

const pauseGame = () => {
  soundEffectsRef.value?.playSound('click')
  gameState.value = 'paused'
}

const resumeGame = () => {
  soundEffectsRef.value?.playSound('click')
  soundEffectsRef.value?.soundCombos.gameStart()
  gameState.value = 'playing'
}

const exitGame = () => {
  soundEffectsRef.value?.playSound('click')
  router.push('/games')
}

const playAgain = () => {
  // 重置游戏状态
  gameState.value = 'playing'
  currentQuestionIndex.value = 0
  gameScore.value = 0
  correctAnswers.value = 0
  gameTime.value = 0
  streak.value = 0
  maxStreak.value = 0
  earnedStars.value = 0
  earnedBadges.value = []
  resetQuestionState()
}

const nextLevel = () => {
  message.info('下一关功能开发中...')
}

const backToMenu = () => {
  router.push('/')
}

const getScoreColor = (score: number): string => {
  const percent = (score / (currentGame.value.questions.length * 100)) * 100
  if (percent >= 90) return '#52c41a'
  if (percent >= 70) return '#1890ff'
  if (percent >= 50) return '#faad14'
  return '#ff4d4f'
}

const getScoreRating = (score: number): string => {
  const percent = (score / (currentGame.value.questions.length * 100)) * 100
  if (percent >= 90) return '优秀'
  if (percent >= 70) return '良好'
  if (percent >= 50) return '及格'
  return '需要努力'
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 生命周期
onMounted(() => {
  // 开始计时
  const timer = setInterval(() => {
    if (gameState.value === 'playing') {
      gameTime.value++
    }
  }, 1000)
  
  // 初始化题目状态
  resetQuestionState()
  
  // 清理定时器
  onUnmounted(() => {
    clearInterval(timer)
  })
})
</script>

<style scoped lang="less">
.game-interface {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;

  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 16px;

    .game-info-card {
      flex: 1;
      
      .game-info {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;

        .game-title {
          display: flex;
          align-items: center;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .game-meta {
          display: flex;
          gap: 8px;
        }
      }

      .game-progress {
        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          color: #6b7280;

          .score {
            font-weight: 600;
            color: #059669;
          }
        }
      }
    }

    .game-controls {
      display: flex;
      gap: 8px;
    }
  }

  .game-content {
    .question-card {
      min-height: 500px;
      
      .spelling-game,
      .listening-game,
      .grammar-game,
      .reading-game,
      .vocabulary-game {
        .question-section {
          margin-bottom: 32px;

          h3 {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
          }

          .audio-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            margin-bottom: 20px;

            .play-button {
              height: 60px;
              font-size: 16px;
              border-radius: 30px;
              padding: 0 32px;
            }

            .play-count {
              color: #6b7280;
              font-size: 14px;
            }

            .audio-controls {
              display: flex;
              align-items: center;
              gap: 12px;

              .speed-slider {
                width: 120px;
              }

              .speed-label {
                font-size: 14px;
                color: #6b7280;
                min-width: 40px;
              }
            }
          }

          .word-hint {
            text-align: center;
            padding: 12px;
            background: #f3f4f6;
            border-radius: 8px;
            color: #374151;
          }
        }

        .answer-section {
          .letter-boxes {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-bottom: 24px;

            .letter-box {
              width: 50px;
              height: 50px;
              border: 2px solid #d1d5db;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: 600;
              background: white;
              transition: all 0.3s;

              &.correct {
                border-color: #10b981;
                background: #ecfdf5;
                color: #065f46;
              }

              &.incorrect {
                border-color: #ef4444;
                background: #fef2f2;
                color: #991b1b;
              }
            }
          }

          .letter-keyboard {
            display: grid;
            grid-template-columns: repeat(13, 1fr);
            gap: 8px;
            margin-bottom: 24px;
            max-width: 650px;
            margin-left: auto;
            margin-right: auto;

            .letter-key {
              width: 40px;
              height: 40px;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              cursor: pointer;
              background: white;
              transition: all 0.3s;

              &:hover:not(.disabled) {
                border-color: #3b82f6;
                background: #eff6ff;
              }

              &.used,
              &.disabled {
                background: #f3f4f6;
                color: #9ca3af;
                cursor: not-allowed;
              }
            }
          }

          .answer-options {
            width: 100%;

            .option-item {
              margin-bottom: 12px;
              padding: 12px;
              border-radius: 8px;
              transition: all 0.3s;

              &:hover {
                background: #f9fafb;
              }

              .option-radio {
                width: 100%;

                .option-content {
                  display: flex;
                  align-items: center;
                  gap: 8px;

                  .option-label {
                    font-weight: 600;
                    color: #374151;
                    min-width: 24px;
                  }

                  .option-text {
                    flex: 1;
                  }
                }
              }
            }
          }

          .sentence-container {
            margin-bottom: 24px;

            .sentence {
              font-size: 18px;
              line-height: 1.6;
              text-align: center;
              padding: 20px;
              background: #f9fafb;
              border-radius: 12px;

              .sentence-part {
                .blank-space {
                  display: inline-block;
                  margin: 0 4px;

                  .blank-select {
                    min-width: 100px;
                  }
                }
              }
            }
          }

          .grammar-explanation {
            margin-top: 16px;

            .explanation-alert {
              border-radius: 8px;
            }
          }

          .game-actions {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .vocabulary-actions {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-top: 24px;

            .matching-actions {
              display: flex;
              gap: 12px;
            }
          }
        }
      }

      // 单词配对游戏样式
      .vocabulary-game {
        .game-mode-tabs {
          margin-bottom: 32px;

          .ant-tabs-tab {
            font-size: 16px;
            font-weight: 600;
          }
        }

        .image-matching {
          .target-word {
            text-align: center;
            margin-bottom: 32px;

            .word-card {
              display: inline-block;
              padding: 20px 32px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 16px;
              color: white;
              box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);

              h4 {
                font-size: 32px;
                font-weight: 700;
                margin: 0 0 8px 0;
                letter-spacing: 2px;
              }

              .word-pronunciation {
                font-size: 16px;
                opacity: 0.9;
                font-style: italic;
              }
            }
          }

          .image-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            max-width: 800px;
            margin: 0 auto;

            .image-option {
              background: white;
              border: 3px solid #e5e7eb;
              border-radius: 16px;
              padding: 16px;
              cursor: pointer;
              transition: all 0.3s ease;
              text-align: center;

              &:hover {
                border-color: #3b82f6;
                transform: translateY(-4px);
                box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
              }

              &.selected {
                border-color: #3b82f6;
                background: #eff6ff;
                transform: translateY(-2px);
              }

              &.correct {
                border-color: #10b981;
                background: #ecfdf5;
                animation: correctPulse 0.6s ease-in-out;
              }

              &.incorrect {
                border-color: #ef4444;
                background: #fef2f2;
                animation: incorrectShake 0.6s ease-in-out;
              }

              .image-container {
                width: 100%;
                height: 120px;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 12px;
                background: #f3f4f6;
                display: flex;
                align-items: center;
                justify-content: center;

                img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }
              }

              .image-label {
                font-size: 16px;
                font-weight: 600;
                color: #374151;
              }
            }
          }
        }

        .meaning-matching {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          max-width: 800px;
          margin: 0 auto;

          .words-column,
          .meanings-column {
            h4 {
              text-align: center;
              font-size: 20px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
              padding-bottom: 12px;
              border-bottom: 2px solid #e5e7eb;
            }

            .word-list,
            .meaning-list {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            .word-item,
            .meaning-item {
              padding: 16px 20px;
              background: white;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              cursor: pointer;
              transition: all 0.3s ease;
              font-size: 16px;
              font-weight: 500;
              text-align: center;

              &:hover:not(.matched) {
                border-color: #3b82f6;
                background: #eff6ff;
                transform: translateX(4px);
              }

              &.selected {
                border-color: #3b82f6;
                background: #3b82f6;
                color: white;
                transform: scale(1.05);
              }

              &.matched {
                border-color: #10b981;
                background: #ecfdf5;
                color: #065f46;
                cursor: not-allowed;
              }

              &.correct {
                border-color: #10b981;
                background: #10b981;
                color: white;
                animation: correctPulse 0.6s ease-in-out;
              }

              &.incorrect {
                border-color: #ef4444;
                background: #ef4444;
                color: white;
                animation: incorrectShake 0.6s ease-in-out;
              }
            }
          }
        }

        @keyframes correctPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes incorrectShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      }

      .reading-game {
        .reading-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;

          .passage-section {
            .passage-container {
              .passage-text {
                background: #f9fafb;
                padding: 20px;
                border-radius: 12px;
                line-height: 1.8;
                font-size: 16px;
                margin-bottom: 16px;
              }

              .reading-tools {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
              }

              .translation {
                background: #eff6ff;
                padding: 16px;
                border-radius: 8px;
                font-size: 14px;
                color: #1e40af;
                border-left: 4px solid #3b82f6;
              }
            }
          }

          .questions-section {
            .question-item {
              margin-bottom: 24px;
              padding: 16px;
              background: #f9fafb;
              border-radius: 12px;

              .question-title {
                font-weight: 600;
                margin-bottom: 12px;
                color: #1f2937;
              }

              .question-options {
                .option-item {
                  margin-bottom: 8px;
                }
              }
            }
          }
        }
      }
    }

    .game-paused {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 500px;

      .pause-card {
        max-width: 600px;
        width: 100%;

        .pause-content {
          text-align: center;

          h3 {
            margin: 16px 0;
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
            flex-wrap: wrap;
          }
        }
      }
    }

    .game-finished {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 500px;

      .finish-card {
        max-width: 800px;
        width: 100%;

        .finish-content {
          text-align: center;

          .finish-header {
            margin-bottom: 32px;

            h2 {
              margin: 16px 0;
              color: #1f2937;
              font-size: 28px;
            }

            .final-score {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 32px;
              margin: 24px 0;

              .score-circle {
                position: relative;
              }

              .score-details {
                text-align: left;

                .score-label {
                  font-size: 14px;
                  color: #6b7280;
                  margin-bottom: 4px;
                }

                .score-value {
                  font-size: 36px;
                  font-weight: 700;
                  color: #1f2937;
                  margin-bottom: 4px;
                }

                .score-rating {
                  font-size: 16px;
                  font-weight: 600;
                  color: #059669;
                }
              }
            }
          }

          .game-stats {
            margin-bottom: 32px;

            .stat-item {
              text-align: center;
              padding: 20px;
              background: #f9fafb;
              border-radius: 12px;
              transition: all 0.3s;

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              }

              .stat-value {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin-top: 8px;
                margin-bottom: 4px;
              }

              .stat-label {
                font-size: 14px;
                color: #6b7280;
              }
            }
          }

          .earned-badges {
            margin-bottom: 32px;
            padding: 24px;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 16px;
            border: 2px solid #f59e0b;

            h4 {
              margin-bottom: 16px;
              color: #92400e;
              font-size: 18px;
              font-weight: 600;
            }

            .badge-list {
              display: flex;
              flex-direction: column;
              gap: 12px;

              .badge-item {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 12px;
                animation: badgeAppear 0.6s ease-out;

                .badge-icon {
                  font-size: 32px;
                  animation: bounce 1s infinite;
                }

                .badge-info {
                  flex: 1;
                  text-align: left;

                  .badge-name {
                    font-weight: 600;
                    color: #92400e;
                    font-size: 16px;
                    margin-bottom: 4px;
                  }

                  .badge-description {
                    font-size: 14px;
                    color: #a16207;
                  }
                }
              }
            }
          }

          .learning-suggestions {
            margin-bottom: 32px;
            text-align: left;

            h4 {
              margin-bottom: 16px;
              color: #1f2937;
              font-size: 18px;
              font-weight: 600;
              text-align: center;
            }

            .suggestion-list {
              display: flex;
              flex-direction: column;
              gap: 12px;

              .suggestion-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                background: #eff6ff;
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
                color: #1e40af;
                font-size: 14px;
              }
            }
          }

          .finish-actions {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }
        }
      }
    }
  }

  // 反馈模态框
  .feedback-modal {
    :deep(.ant-modal-content) {
      border-radius: 16px;
      overflow: hidden;
    }

    .feedback-content {
      text-align: center;
      padding: 32px 20px;

      .feedback-icon {
        margin-bottom: 20px;
        animation: iconPulse 0.6s ease-out;
      }

      .feedback-message {
        margin-bottom: 24px;

        h3 {
          margin-bottom: 12px;
          color: #1f2937;
          font-size: 24px;
          font-weight: 600;
        }

        p {
          color: #6b7280;
          margin-bottom: 8px;
          font-size: 16px;
        }
      }

      .feedback-score {
        .score-animation {
          font-size: 32px;
          font-weight: 700;
          color: #059669;
          animation: scoreUp 0.8s ease-out;
        }
      }
    }
  }

  // 积分动画
  .points-animation {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;

    .point-item {
      position: absolute;
      font-size: 24px;
      font-weight: 700;
      color: #10b981;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      animation: pointFloat 2s ease-out forwards;
    }
  }

  <!-- 连击效果 -->
  <div class="streak-effect" v-if="showStreakEffect">
    <div class="streak-text">
      {{ streak }}连击！
      <div class="streak-multiplier">x{{ streakMultiplier }}</div>
    </div>
  </div>
</div>

<!-- 动画组件 -->
<RewardAnimation 
  ref="rewardAnimationRef"
  :type="rewardType"
  :points="rewardPoints"
  :star-count="rewardStars"
  :badge-name="rewardBadgeName"
  :level="currentLevel"
  :combo="streak"
  :multiplier="streakMultiplier"
  :exp="rewardExp"
  :exp-percentage="expPercentage"
  @complete="onRewardAnimationComplete"
/>

<!-- 音效组件 -->
<SoundEffects 
  ref="soundEffectsRef"
  :enabled="soundEnabled"
  :volume="soundVolume"
/>

<!-- 浮动元素 -->
<FloatingElements 
  :show-bubbles="true"
  :show-stars="true"
  :show-hearts="false"
  :show-rainbows="false"
  :show-clouds="true"
  :show-flowers="false"
  :show-notes="true"
  :show-gifts="false"
  :count="8"
  :duration="15000"
  :intensity="0.6"
/>
</template>

@keyframes pointFloat {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateY(-50px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(0.8);
  }
}

@keyframes streakPulse {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  80% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}

@keyframes multiplierBounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes iconPulse {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes scoreUp {
  0% {
    transform: translateY(20px) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: translateY(-10px) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes badgeAppear {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
  60% {
    transform: translateY(-4px);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .game-interface {
    padding: 16px;

    .game-header {
      flex-direction: column;
      gap: 12px;

      .game-controls {
        align-self: stretch;
        justify-content: center;
      }
    }

    .game-content {
      .reading-game .reading-content {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .letter-keyboard {
        grid-template-columns: repeat(8, 1fr) !important;
        
        .letter-key {
          width: 35px !important;
          height: 35px !important;
          font-size: 14px;
        }
      }

      .finish-card {
        .finish-content {
          .final-score {
            flex-direction: column;
            gap: 16px;

            .score-details {
              text-align: center;
            }
          }

          .game-stats {
            :deep(.ant-row) {
              .ant-col {
                margin-bottom: 16px;
              }
            }
          }

          .finish-actions {
            flex-direction: column;
            align-items: center;

            .ant-btn {
              width: 100%;
              max-width: 200px;
            }
          }
        }
      }
    }

    .streak-effect {
      .streak-text {
        font-size: 36px;

        .streak-multiplier {
          font-size: 18px;
        }
      }
    }
  }
}
</style>

// 单词配对游戏
<div v-else-if="currentGame.type === 'vocabulary'" class="vocabulary-game">
  <div class="question-section">
    <h3>{{ currentQuestion.question }}</h3>
    <div class="game-mode-tabs">
      <a-tabs v-model:activeKey="vocabularyMode" centered>
        <a-tab-pane key="image" tab="图片匹配">
          <div class="image-matching">
            <div class="target-word">
              <div class="word-card">
                <h4>{{ currentQuestion.word }}</h4>
                <div class="word-pronunciation" v-if="currentQuestion.pronunciation">
                  [{{ currentQuestion.pronunciation }}]
                </div>
              </div>
            </div>
            <div class="image-options">
              <div 
                v-for="(option, index) in currentQuestion.imageOptions" 
                :key="index"
                class="image-option"
                :class="{ 
                  selected: selectedImageIndex === index,
                  correct: showImageFeedback && option.correct,
                  incorrect: showImageFeedback && selectedImageIndex === index && !option.correct
                }"
                @click="selectImage(index)"
              >
                <div class="image-container">
                  <img :src="option.image" :alt="option.alt" />
                </div>
                <div class="image-label">{{ option.label }}</div>
              </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="meaning" tab="词义匹配">
          <div class="meaning-matching">
            <div class="words-column">
              <h4>单词</h4>
              <div class="word-list">
                <div 
                  v-for="(word, index) in currentQuestion.words" 
                  :key="index"
                  class="word-item"
                  :class="{ 
                    selected: selectedWordIndex === index,
                    matched: wordMatches[index] !== undefined
                  }"
                  @click="selectWord(index)"
                >
                  {{ word }}
                </div>
              </div>
            </div>
            <div class="meanings-column">
              <h4>词义</h4>
              <div class="meaning-list">
                <div 
                  v-for="(meaning, index) in currentQuestion.meanings" 
                  :key="index"
                  class="meaning-item"
                  :class="{ 
                    selected: selectedMeaningIndex === index,
                    matched: meaningMatches[index] !== undefined,
                    correct: showMeaningFeedback && meaning.correct,
                    incorrect: showMeaningFeedback && meaningMatches[index] !== undefined && !meaning.correct
                  }"
                  @click="selectMeaning(index)"
                >
                  {{ meaning.text }}
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
  
  <div class="answer-section">
    <div class="vocabulary-actions">
      <a-button 
        v-if="vocabularyMode === 'image'"
        type="primary" 
        size="large" 
        :disabled="selectedImageIndex === null"
        @click="submitImageAnswer"
      >
        <CheckCircle class="w-4 h-4" />
        确认选择
      </a-button>
      <div v-else class="matching-actions">
        <a-button 
          type="default" 
          size="large" 
          @click="clearMatches"
          :disabled="Object.keys(wordMatches).length === 0"
        >
          <RotateCcw class="w-4 h-4" />
          重新匹配
        </a-button>
        <a-button 
          type="primary" 
          size="large" 
          :disabled="Object.keys(wordMatches).length !== currentQuestion.words.length"
          @click="submitMeaningAnswer"
        >
          <CheckCircle class="w-4 h-4" />
          提交答案
        </a-button>
      </div>
    </div>
  </div>
</div>

// 添加单词配对游戏相关方法
const selectImage = (index: number) => {
  if (showImageFeedback.value) return
  soundEffectsRef.value?.playSound('click')
  selectedImageIndex.value = index
}

const submitImageAnswer = () => {
  if (selectedImageIndex.value === null) return
  
  const selectedOption = currentQuestion.value.imageOptions[selectedImageIndex.value]
  const isCorrect = selectedOption.correct
  
  showImageFeedback.value = true
  
  if (isCorrect) {
    soundEffectsRef.value?.playSound('correct')
    correctAnswers.value++
    streak.value++
    maxStreak.value = Math.max(maxStreak.value, streak.value)
    
    const points = 100 + (streak.value - 1) * 10
    gameScore.value += points
    lastScore.value = points
    
    showRewardAnimation('points', points)
    
    if (streak.value >= 5) {
      showRewardAnimation('combo', streak.value)
      soundEffectsRef.value?.soundCombos.comboStreak()
    }
  } else {
    soundEffectsRef.value?.playSound('incorrect')
    streak.value = 0
  }
  
  setTimeout(() => {
    showImageFeedback.value = false
    selectedImageIndex.value = null
    nextQuestion()
  }, 2000)
}

const selectWord = (index: number) => {
  if (wordMatches.value[index] !== undefined) return
  soundEffectsRef.value?.playSound('click')
  selectedWordIndex.value = index
}

const selectMeaning = (index: number) => {
  if (meaningMatches.value[index] !== undefined) return
  if (selectedWordIndex.value === null) return
  
  soundEffectsRef.value?.playSound('pop')
  
  // 创建匹配
  wordMatches.value[selectedWordIndex.value] = index
  meaningMatches.value[index] = selectedWordIndex.value
  
  selectedWordIndex.value = null
  selectedMeaningIndex.value = null
}

const clearMatches = () => {
  soundEffectsRef.value?.playSound('whoosh')
  wordMatches.value = {}
  meaningMatches.value = {}
  selectedWordIndex.value = null
  selectedMeaningIndex.value = null
}

const submitMeaningAnswer = () => {
  let correctMatches = 0
  const totalMatches = currentQuestion.value.words.length
  
  // 检查每个匹配是否正确
  Object.entries(wordMatches.value).forEach(([wordIndex, meaningIndex]) => {
    const word = currentQuestion.value.words[parseInt(wordIndex)]
    const meaning = currentQuestion.value.meanings[meaningIndex]
    if (meaning.correctWord === word) {
      correctMatches++
    }
  })
  
  showMeaningFeedback.value = true
  
  const accuracy = correctMatches / totalMatches
  const isCorrect = accuracy >= 0.8 // 80%正确率算通过
  
  if (isCorrect) {
    soundEffectsRef.value?.playSound('correct')
    correctAnswers.value++
    streak.value++
    maxStreak.value = Math.max(maxStreak.value, streak.value)
    
    const points = Math.floor(100 * accuracy) + (streak.value - 1) * 10
    gameScore.value += points
    lastScore.value = points
    
    showRewardAnimation('points', points)
    
    if (accuracy === 1) {
      showRewardAnimation('perfect')
      soundEffectsRef.value?.soundCombos.perfectScore()
    }
  } else {
    soundEffectsRef.value?.playSound('incorrect')
    streak.value = 0
  }
  
  setTimeout(() => {
    showMeaningFeedback.value = false
    clearMatches()
    nextQuestion()
  }, 3000)
}

// 在 resetQuestionState 方法中添加单词配对游戏的重置逻辑
const resetQuestionState = () => {
  // 拼写游戏
  userAnswer.value = []
  usedLetters.value = []
  
  // 听力和语法游戏
  selectedOption.value = null
  
  // 语法游戏
  sentenceParts.value = []
  if (currentQuestion.value?.type === 'grammar' && currentQuestion.value.sentence) {
    const parts = currentQuestion.value.sentence.split('___')
    sentenceParts.value = parts.map((part, index) => ({
      text: part,
      isBlank: index < parts.length - 1,
      selectedValue: ''
    }))
  }
  
  // 阅读游戏
  highlightedText.value = ''
  showTranslation.value = false
  
  // 单词配对游戏
  vocabularyMode.value = 'image'
  selectedImageIndex.value = null
  showImageFeedback.value = false
  selectedWordIndex.value = null
  selectedMeaningIndex.value = null
  wordMatches.value = {}
  meaningMatches.value = {}
  showMeaningFeedback.value = false
  
  // 通用状态
  showFeedback.value = false
  feedbackMessage.value = ''
  isCorrectAnswer.value = false
}