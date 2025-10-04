<template>
  <MainLayout>
    <div class="games-page">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <Gamepad2 class="w-6 h-6 mr-3" />
          游戏学习
        </h1>
        <p class="page-subtitle">通过有趣的游戏学习英语，让学习变得更加快乐！</p>
      </div>

      <!-- 学习进度概览 -->
      <div class="progress-overview">
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="8">
            <div class="progress-card">
              <div class="progress-icon">
                <Trophy class="w-6 h-6 text-yellow-500" />
              </div>
              <div class="progress-content">
                <div class="progress-number">{{ completedLevels }}</div>
                <div class="progress-label">已完成关卡</div>
              </div>
            </div>
          </a-col>
          <a-col :xs="24" :sm="8">
            <div class="progress-card">
              <div class="progress-icon">
                <Star class="w-6 h-6 text-blue-500" />
              </div>
              <div class="progress-content">
                <div class="progress-number">{{ totalStars }}</div>
                <div class="progress-label">获得星星</div>
              </div>
            </div>
          </a-col>
          <a-col :xs="24" :sm="8">
            <div class="progress-card">
              <div class="progress-icon">
                <Zap class="w-6 h-6 text-purple-500" />
              </div>
              <div class="progress-content">
                <div class="progress-number">{{ currentStreak }}</div>
                <div class="progress-label">连胜记录</div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 游戏类型选择 -->
      <div class="game-categories">
        <h2 class="section-title">选择游戏类型</h2>
        <a-row :gutter="[24, 24]">
          <a-col :xs="24" :sm="12" :lg="6" v-for="category in gameCategories" :key="category.id">
            <div 
              class="category-card"
              :class="{ active: selectedCategory === category.id }"
              @click="selectCategory(category.id)"
            >
              <div class="category-icon">
                <component :is="category.icon" class="w-8 h-8" />
              </div>
              <h3 class="category-title">{{ category.title }}</h3>
              <p class="category-desc">{{ category.description }}</p>
              <div class="category-progress">
                <a-progress
                  :percent="category.progress"
                  :show-info="false"
                  size="small"
                  :stroke-color="category.color"
                />
                <span class="progress-text">{{ category.progress }}% 完成</span>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 关卡列表 -->
      <div class="levels-section" v-if="selectedCategory">
        <h2 class="section-title">
          {{ getCurrentCategoryTitle() }} - 选择关卡
        </h2>
        <div class="levels-grid">
          <div
            v-for="level in filteredLevels"
            :key="level.id"
            class="level-card"
            :class="{
              locked: !level.unlocked,
              completed: level.completed,
              current: level.id === currentLevel
            }"
            @click="selectLevel(level)"
          >
            <div class="level-header">
              <div class="level-number">{{ level.level }}</div>
              <div class="level-status">
                <Lock v-if="!level.unlocked" class="w-4 h-4 text-gray-400" />
                <CheckCircle v-else-if="level.completed" class="w-4 h-4 text-green-500" />
                <Play v-else class="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <h3 class="level-title">{{ level.title }}</h3>
            <p class="level-desc">{{ level.description }}</p>
            <div class="level-stats">
              <div class="stat-item">
                <Star class="w-3 h-3" />
                <span>{{ level.stars || 0 }}/3</span>
              </div>
              <div class="stat-item">
                <Target class="w-3 h-3" />
                <span>{{ level.score || 0 }}分</span>
              </div>
            </div>
            <div class="level-difficulty">
              <a-tag :color="getDifficultyColor(level.difficulty)">
                {{ getDifficultyText(level.difficulty) }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 游戏界面弹窗 -->
      <a-modal
        v-model:open="gameModalVisible"
        :title="currentGameLevel?.title"
        width="800px"
        :footer="null"
        :closable="false"
        class="game-modal"
      >
        <GameInterface
          v-if="gameModalVisible && currentGameLevel"
          :level="currentGameLevel"
          @complete="handleGameComplete"
          @close="closeGame"
        />
      </a-modal>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/layouts/MainLayout.vue'
import GameInterface from '@/components/GameInterface.vue'
import {
  Gamepad2,
  Trophy,
  Star,
  Zap,
  BookOpen,
  Volume2,
  PenTool,
  Brain,
  Lock,
  CheckCircle,
  Play,
  Target
} from 'lucide-vue-next'

const router = useRouter()
const gameStore = useGameStore()
const authStore = useAuthStore()

const selectedCategory = ref<string>('')
const gameModalVisible = ref(false)
const currentGameLevel = ref<any>(null)
const currentLevel = ref(1)

// 模拟数据
const completedLevels = ref(8)
const totalStars = ref(18)
const currentStreak = ref(5)

const gameCategories = ref([
  {
    id: 'vocabulary',
    title: '单词学习',
    description: '学习新单词，扩展词汇量',
    icon: BookOpen,
    progress: 75,
    color: '#1890ff'
  },
  {
    id: 'listening',
    title: '听力训练',
    description: '提高英语听力理解能力',
    icon: Volume2,
    progress: 60,
    color: '#52c41a'
  },
  {
    id: 'writing',
    title: '拼写练习',
    description: '练习单词和句子拼写',
    icon: PenTool,
    progress: 45,
    color: '#fa8c16'
  },
  {
    id: 'grammar',
    title: '语法游戏',
    description: '通过游戏学习语法规则',
    icon: Brain,
    progress: 30,
    color: '#722ed1'
  }
])

// 计算过滤后的关卡
const filteredLevels = computed(() => {
  if (!selectedCategory.value) return []
  
  return gameStore.gameLevels.filter(level => 
    level.category === selectedCategory.value
  ).map(level => {
    const progress = gameStore.gameProgress.find(p => p.level_id === level.id)
    return {
      ...level,
      completed: progress?.completed || false,
      stars: progress?.stars || 0,
      score: progress?.best_score || 0,
      unlocked: level.level <= currentLevel.value
    }
  })
})

// 获取当前分类标题
const getCurrentCategoryTitle = () => {
  const category = gameCategories.value.find(c => c.id === selectedCategory.value)
  return category?.title || ''
}

// 选择游戏分类
const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId
}

// 选择关卡
const selectLevel = (level: any) => {
  if (!level.unlocked) {
    message.warning('请先完成前面的关卡！')
    return
  }
  
  currentGameLevel.value = level
  gameModalVisible.value = true
}

// 获取难度颜色
const getDifficultyColor = (difficulty: string) => {
  const colors = {
    easy: 'green',
    medium: 'orange',
    hard: 'red'
  }
  return colors[difficulty as keyof typeof colors] || 'blue'
}

// 获取难度文本
const getDifficultyText = (difficulty: string) => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty as keyof typeof texts] || '未知'
}

// 处理游戏完成
const handleGameComplete = (result: any) => {
  message.success(`恭喜完成！获得 ${result.stars} 颗星星，${result.points} 积分！`)
  
  // 更新游戏进度
  gameStore.completeGame(currentGameLevel.value.id, result)
  
  // 关闭游戏弹窗
  gameModalVisible.value = false
  currentGameLevel.value = null
  
  // 刷新数据
  gameStore.fetchGameProgress()
}

// 关闭游戏
const closeGame = () => {
  gameModalVisible.value = false
  currentGameLevel.value = null
}

onMounted(() => {
  // 加载游戏数据
  gameStore.fetchGameLevels()
  gameStore.fetchGameProgress()
  
  // 默认选择第一个分类
  if (gameCategories.value.length > 0) {
    selectedCategory.value = gameCategories.value[0].id
  }
})
</script>

<style scoped lang="less">
.games-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
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

.progress-overview {
  margin-bottom: 40px;
}

.progress-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.progress-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(24, 144, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-content {
  flex: 1;
}

.progress-number {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.progress-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

.game-categories {
  margin-bottom: 40px;
}

.category-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &.active {
    border-color: #1890ff;
    box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
  }
}

.category-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.category-desc {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.category-progress {
  text-align: left;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.levels-section {
  margin-bottom: 40px;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.level-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;

  &:hover:not(.locked) {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-color: #1890ff;
  }

  &.locked {
    opacity: 0.6;
    cursor: not-allowed;
    background: #f5f5f5;
  }

  &.completed {
    border-color: #52c41a;
    background: linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%);
  }

  &.current {
    border-color: #fa8c16;
    background: linear-gradient(135deg, #fff7e6 0%, #fff2e8 100%);
  }
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.level-number {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.level-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.level-desc {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.level-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.level-difficulty {
  display: flex;
  justify-content: flex-end;
}

:deep(.game-modal .ant-modal-content) {
  padding: 0;
  overflow: hidden;
}

:deep(.game-modal .ant-modal-header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
}

:deep(.game-modal .ant-modal-title) {
  color: white;
  font-weight: 600;
}

// 响应式设计
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .progress-card {
    padding: 16px;
  }

  .progress-number {
    font-size: 24px;
  }

  .category-card {
    padding: 20px;
  }

  .category-icon {
    width: 48px;
    height: 48px;
  }

  .levels-grid {
    grid-template-columns: 1fr;
  }

  .level-card {
    padding: 16px;
  }
}
</style>