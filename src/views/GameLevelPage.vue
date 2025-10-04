<template>
  <MainLayout>
    <div class="game-level-page">
      <!-- 返回按钮 -->
      <div class="back-button">
        <a-button @click="goBack" size="large">
          <ArrowLeft class="w-4 h-4 mr-2" />
          返回游戏列表
        </a-button>
      </div>

      <!-- 关卡信息 -->
      <div class="level-info" v-if="currentLevel">
        <div class="level-header">
          <div class="level-icon">
            <component :is="getLevelIcon(currentLevel.category)" class="w-8 h-8" />
          </div>
          <div class="level-details">
            <h1 class="level-title">{{ currentLevel.title }}</h1>
            <p class="level-description">{{ currentLevel.description }}</p>
            <div class="level-meta">
              <a-tag :color="getDifficultyColor(currentLevel.difficulty)">
                {{ getDifficultyText(currentLevel.difficulty) }}
              </a-tag>
              <span class="level-points">
                <Zap class="w-4 h-4 mr-1" />
                {{ currentLevel.points }}分
              </span>
            </div>
          </div>
        </div>

        <!-- 关卡进度 -->
        <div class="level-progress" v-if="levelProgress">
          <div class="progress-info">
            <span class="progress-label">完成进度</span>
            <span class="progress-value">{{ levelProgress.score }}/{{ currentLevel.maxScore }}</span>
          </div>
          <a-progress
            :percent="(levelProgress.score / currentLevel.maxScore) * 100"
            :stroke-color="getProgressColor(levelProgress.score / currentLevel.maxScore)"
            size="small"
          />
          <div class="stars-display">
            <Star
              v-for="i in 3"
              :key="i"
              class="w-5 h-5"
              :class="i <= (levelProgress.stars || 0) ? 'star-filled' : 'star-empty'"
            />
          </div>
        </div>
      </div>

      <!-- 游戏界面 -->
      <div class="game-container" v-if="gameStarted">
        <GameInterface
          :level="currentLevel"
          @game-complete="handleGameComplete"
          @game-exit="handleGameExit"
        />
      </div>

      <!-- 开始游戏按钮 -->
      <div class="start-section" v-else>
        <div class="start-card">
          <div class="start-content">
            <div class="start-icon">
              <Play class="w-12 h-12" />
            </div>
            <h2 class="start-title">准备开始学习</h2>
            <p class="start-description">
              这个关卡包含 {{ currentLevel?.totalQuestions || 10 }} 道题目，
              预计需要 {{ currentLevel?.estimatedTime || 15 }} 分钟完成。
            </p>
            <div class="start-tips">
              <h3 class="tips-title">
                <Lightbulb class="w-4 h-4 mr-2" />
                学习提示
              </h3>
              <ul class="tips-list">
                <li v-for="tip in levelTips" :key="tip">{{ tip }}</li>
              </ul>
            </div>
            <div class="start-actions">
              <a-button
                type="primary"
                size="large"
                @click="startGame"
                :loading="loading"
              >
                <Play class="w-4 h-4 mr-2" />
                开始游戏
              </a-button>
              <a-button size="large" @click="showPreview">
                <Eye class="w-4 h-4 mr-2" />
                预览题目
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 完成结果弹窗 -->
      <a-modal
        v-model:open="resultModalVisible"
        title="关卡完成"
        :footer="null"
        width="500px"
        :closable="false"
      >
        <div class="result-content" v-if="gameResult">
          <div class="result-header">
            <div class="result-icon" :class="getResultClass(gameResult.score)">
              <component :is="getResultIcon(gameResult.score)" class="w-12 h-12" />
            </div>
            <h3 class="result-title">{{ getResultTitle(gameResult.score) }}</h3>
            <div class="result-score">{{ gameResult.score }}/{{ gameResult.totalScore }}</div>
          </div>

          <div class="result-stats">
            <div class="stat-item">
              <div class="stat-label">正确率</div>
              <div class="stat-value">{{ Math.round((gameResult.correctAnswers / gameResult.totalQuestions) * 100) }}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">用时</div>
              <div class="stat-value">{{ formatTime(gameResult.timeSpent) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">获得星星</div>
              <div class="stat-value">
                <div class="stars-earned">
                  <Star
                    v-for="i in 3"
                    :key="i"
                    class="w-4 h-4"
                    :class="i <= gameResult.stars ? 'star-filled' : 'star-empty'"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="result-rewards" v-if="gameResult.rewards && gameResult.rewards.length > 0">
            <h4 class="rewards-title">
              <Gift class="w-4 h-4 mr-2" />
              获得奖励
            </h4>
            <div class="rewards-list">
              <div
                v-for="reward in gameResult.rewards"
                :key="reward.type"
                class="reward-item"
              >
                <component :is="getRewardIcon(reward.type)" class="w-4 h-4" />
                <span>{{ reward.description }}</span>
              </div>
            </div>
          </div>

          <div class="result-actions">
            <a-button @click="playAgain" size="large">
              <RotateCcw class="w-4 h-4 mr-2" />
              再玩一次
            </a-button>
            <a-button type="primary" @click="continueToNext" size="large">
              <ArrowRight class="w-4 h-4 mr-2" />
              继续下一关
            </a-button>
          </div>
        </div>
      </a-modal>

      <!-- 预览弹窗 -->
      <a-modal
        v-model:open="previewModalVisible"
        title="题目预览"
        :footer="null"
        width="600px"
      >
        <div class="preview-content">
          <div class="preview-info">
            <p>本关卡包含以下类型的题目：</p>
          </div>
          <div class="question-types">
            <div
              v-for="type in questionTypes"
              :key="type.type"
              class="type-item"
            >
              <div class="type-icon">
                <component :is="type.icon" class="w-5 h-5" />
              </div>
              <div class="type-info">
                <div class="type-name">{{ type.name }}</div>
                <div class="type-desc">{{ type.description }}</div>
                <div class="type-count">{{ type.count }} 道题</div>
              </div>
            </div>
          </div>
          <div class="preview-actions">
            <a-button @click="previewModalVisible = false">关闭</a-button>
            <a-button type="primary" @click="startGameFromPreview">
              <Play class="w-4 h-4 mr-2" />
              开始游戏
            </a-button>
          </div>
        </div>
      </a-modal>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import MainLayout from '@/layouts/MainLayout.vue'
import GameInterface from '@/components/GameInterface.vue'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Eye,
  Lightbulb,
  Star,
  Zap,
  Gift,
  RotateCcw,
  Trophy,
  CheckCircle,
  XCircle,
  BookOpen,
  Headphones,
  PenTool,
  MessageSquare,
  Target,
  Clock,
  Award
} from 'lucide-vue-next'

// 路由和状态管理
const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const authStore = useAuthStore()

// 响应式数据
const gameStarted = ref(false)
const loading = ref(false)
const resultModalVisible = ref(false)
const previewModalVisible = ref(false)
const gameResult = ref(null)

// 计算属性
const levelId = computed(() => route.params.levelId as string)
const currentLevel = computed(() => {
  return gameStore.levels.find(level => level.id === levelId.value)
})
const levelProgress = computed(() => {
  return gameStore.progress.find(p => p.levelId === levelId.value)
})

// 关卡提示
const levelTips = computed(() => {
  if (!currentLevel.value) return []
  
  const tips = {
    vocabulary: [
      '仔细看图片，选择正确的单词',
      '注意单词的拼写和发音',
      '可以点击音频按钮听发音'
    ],
    listening: [
      '戴上耳机，仔细听音频',
      '可以重复播放音频',
      '注意语音的语调和重音'
    ],
    grammar: [
      '仔细阅读句子，注意语法结构',
      '选择最合适的语法形式',
      '注意时态和语态的变化'
    ],
    writing: [
      '按照提示完成单词拼写',
      '注意字母的大小写',
      '可以使用提示功能'
    ]
  }
  
  return tips[currentLevel.value.category as keyof typeof tips] || []
})

// 题目类型预览
const questionTypes = computed(() => {
  if (!currentLevel.value) return []
  
  const types = {
    vocabulary: [
      { type: 'word-image', name: '看图选词', description: '根据图片选择正确的单词', count: 5, icon: Target },
      { type: 'word-audio', name: '听音选词', description: '听发音选择正确的单词', count: 3, icon: Headphones },
      { type: 'word-meaning', name: '词义匹配', description: '将单词与其含义匹配', count: 2, icon: BookOpen }
    ],
    listening: [
      { type: 'audio-choice', name: '听音选择', description: '听音频选择正确答案', count: 4, icon: Headphones },
      { type: 'audio-fill', name: '听音填空', description: '听音频填写缺失的单词', count: 3, icon: PenTool },
      { type: 'audio-order', name: '听音排序', description: '根据音频排列句子顺序', count: 3, icon: Target }
    ],
    grammar: [
      { type: 'grammar-choice', name: '语法选择', description: '选择正确的语法形式', count: 5, icon: BookOpen },
      { type: 'sentence-order', name: '句子排序', description: '将单词排列成正确的句子', count: 3, icon: Target },
      { type: 'grammar-fill', name: '语法填空', description: '填写正确的语法形式', count: 2, icon: PenTool }
    ],
    writing: [
      { type: 'word-spell', name: '单词拼写', description: '根据提示拼写单词', count: 4, icon: PenTool },
      { type: 'sentence-write', name: '句子书写', description: '根据提示写出完整句子', count: 3, icon: MessageSquare },
      { type: 'story-complete', name: '故事续写', description: '完成故事的结尾', count: 3, icon: BookOpen }
    ]
  }
  
  return types[currentLevel.value.category as keyof typeof types] || []
})

// 生命周期
onMounted(async () => {
  if (!currentLevel.value) {
    message.error('关卡不存在')
    router.push('/games')
    return
  }
  
  // 检查关卡是否解锁
  if (currentLevel.value.locked) {
    message.warning('请先完成前面的关卡')
    router.push('/games')
    return
  }
})

// 方法
const goBack = () => {
  router.push('/games')
}

const startGame = async () => {
  if (!currentLevel.value) return
  
  loading.value = true
  try {
    await gameStore.startGameSession(currentLevel.value.id)
    gameStarted.value = true
  } catch (error) {
    message.error('游戏启动失败')
  } finally {
    loading.value = false
  }
}

const startGameFromPreview = () => {
  previewModalVisible.value = false
  startGame()
}

const showPreview = () => {
  previewModalVisible.value = true
}

const handleGameComplete = (result: any) => {
  gameResult.value = result
  resultModalVisible.value = true
  gameStarted.value = false
}

const handleGameExit = () => {
  gameStarted.value = false
}

const playAgain = () => {
  resultModalVisible.value = false
  startGame()
}

const continueToNext = () => {
  resultModalVisible.value = false
  // 找到下一个关卡
  const currentIndex = gameStore.levels.findIndex(level => level.id === levelId.value)
  const nextLevel = gameStore.levels[currentIndex + 1]
  
  if (nextLevel && !nextLevel.locked) {
    router.push(`/games/${nextLevel.id}`)
  } else {
    router.push('/games')
  }
}

// 工具函数
const getLevelIcon = (category: string) => {
  const icons = {
    vocabulary: BookOpen,
    listening: Headphones,
    grammar: PenTool,
    writing: MessageSquare
  }
  return icons[category as keyof typeof icons] || BookOpen
}

const getDifficultyColor = (difficulty: string) => {
  const colors = {
    easy: 'green',
    medium: 'orange',
    hard: 'red'
  }
  return colors[difficulty as keyof typeof colors] || 'default'
}

const getDifficultyText = (difficulty: string) => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty as keyof typeof texts] || difficulty
}

const getProgressColor = (progress: number) => {
  if (progress >= 0.9) return '#52c41a'
  if (progress >= 0.7) return '#1890ff'
  if (progress >= 0.5) return '#fa8c16'
  return '#f5222d'
}

const getResultClass = (score: number) => {
  const total = gameResult.value?.totalScore || 100
  const percentage = score / total
  
  if (percentage >= 0.9) return 'result-excellent'
  if (percentage >= 0.7) return 'result-good'
  if (percentage >= 0.5) return 'result-average'
  return 'result-poor'
}

const getResultIcon = (score: number) => {
  const total = gameResult.value?.totalScore || 100
  const percentage = score / total
  
  if (percentage >= 0.9) return Trophy
  if (percentage >= 0.7) return CheckCircle
  if (percentage >= 0.5) return Award
  return XCircle
}

const getResultTitle = (score: number) => {
  const total = gameResult.value?.totalScore || 100
  const percentage = score / total
  
  if (percentage >= 0.9) return '太棒了！'
  if (percentage >= 0.7) return '做得很好！'
  if (percentage >= 0.5) return '继续努力！'
  return '需要加油哦！'
}

const getRewardIcon = (type: string) => {
  const icons = {
    points: Zap,
    star: Star,
    badge: Award,
    unlock: Gift
  }
  return icons[type as keyof typeof icons] || Gift
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style scoped lang="less">
.game-level-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.back-button {
  margin-bottom: 24px;
}

.level-info {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
}

.level-header {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
}

.level-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.level-details {
  flex: 1;
}

.level-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.level-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.level-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.level-points {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #fa8c16;
}

.level-progress {
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 14px;
  color: #6b7280;
}

.progress-value {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.stars-display {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.star-filled {
  color: #ffd700;
  fill: currentColor;
}

.star-empty {
  color: #d1d5db;
}

.game-container {
  margin-top: 32px;
}

.start-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.start-card {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.start-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.start-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.start-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.start-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.start-tips {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  text-align: left;
}

.tips-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  color: #6b7280;
  line-height: 1.6;
}

.tips-list li {
  margin-bottom: 8px;
}

.start-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

// 结果弹窗样式
.result-content {
  text-align: center;
  padding: 20px 0;
}

.result-header {
  margin-bottom: 32px;
}

.result-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;

  &.result-excellent {
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #d48806;
  }

  &.result-good {
    background: linear-gradient(135deg, #52c41a, #73d13d);
    color: white;
  }

  &.result-average {
    background: linear-gradient(135deg, #1890ff, #40a9ff);
    color: white;
  }

  &.result-poor {
    background: linear-gradient(135deg, #f5222d, #ff4d4f);
    color: white;
  }
}

.result-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.result-score {
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.stars-earned {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.result-rewards {
  margin-bottom: 32px;
  text-align: left;
}

.rewards-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.rewards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f0f9ff;
  border-radius: 8px;
  color: #1890ff;
  font-weight: 500;
}

.result-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

// 预览弹窗样式
.preview-content {
  padding: 16px 0;
}

.preview-info {
  margin-bottom: 24px;
  color: #6b7280;
}

.question-types {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.type-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-info {
  flex: 1;
}

.type-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.type-desc {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.type-count {
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
}

.preview-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

// 响应式设计
@media (max-width: 768px) {
  .level-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }

  .level-icon {
    width: 60px;
    height: 60px;
  }

  .level-title {
    font-size: 24px;
  }

  .start-card {
    padding: 32px 24px;
  }

  .start-icon {
    width: 60px;
    height: 60px;
  }

  .start-title {
    font-size: 20px;
  }

  .start-actions {
    flex-direction: column;
    width: 100%;
  }

  .result-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .result-actions {
    flex-direction: column;
    width: 100%;
  }

  .type-item {
    padding: 12px;
  }

  .type-icon {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 576px) {
  .game-level-page {
    padding: 0 12px;
  }

  .level-info {
    padding: 24px 20px;
  }

  .start-card {
    padding: 24px 16px;
  }

  .level-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>