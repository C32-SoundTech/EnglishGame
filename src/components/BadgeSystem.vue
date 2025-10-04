<template>
  <div class="badge-system">
    <!-- 徽章展示区域 -->
    <div class="badges-container">
      <h3 class="badges-title">
        <Trophy class="w-5 h-5 mr-2 text-yellow-500" />
        学习徽章
      </h3>
      
      <div class="badges-grid">
        <div
          v-for="badge in badges"
          :key="badge.id"
          class="badge-card"
          :class="{
            earned: badge.earned,
            locked: !badge.earned,
            'animate-pulse': badge.justEarned
          }"
          @click="showBadgeDetail(badge)"
        >
          <div class="badge-icon">
            <component 
              :is="getBadgeIcon(badge.type)" 
              class="w-8 h-8"
              :class="badge.earned ? badge.color : 'text-gray-400'"
            />
          </div>
          <div class="badge-info">
            <h4 class="badge-name">{{ badge.name }}</h4>
            <p class="badge-description">{{ badge.description }}</p>
            <div class="badge-progress" v-if="!badge.earned">
              <a-progress
                :percent="(badge.progress / badge.requirement) * 100"
                :show-info="false"
                :stroke-width="4"
                stroke-color="#1890ff"
              />
              <span class="progress-text">
                {{ badge.progress }}/{{ badge.requirement }}
              </span>
            </div>
            <div v-else class="earned-date">
              <Calendar class="w-3 h-3 mr-1" />
              {{ formatDate(badge.earnedDate) }}
            </div>
          </div>
          <div v-if="badge.earned" class="earned-indicator">
            <CheckCircle class="w-5 h-5 text-green-500" />
          </div>
        </div>
      </div>
    </div>

    <!-- 最近获得的徽章 -->
    <div v-if="recentBadges.length > 0" class="recent-badges">
      <h4 class="recent-title">最近获得</h4>
      <div class="recent-list">
        <div
          v-for="badge in recentBadges"
          :key="badge.id"
          class="recent-badge"
        >
          <component 
            :is="getBadgeIcon(badge.type)" 
            class="w-6 h-6"
            :class="badge.color"
          />
          <span class="recent-name">{{ badge.name }}</span>
          <span class="recent-date">{{ formatRelativeTime(badge.earnedDate) }}</span>
        </div>
      </div>
    </div>

    <!-- 徽章详情弹窗 -->
    <a-modal
      v-model:open="showDetailModal"
      :title="selectedBadge?.name"
      :footer="null"
      width="400px"
    >
      <div v-if="selectedBadge" class="badge-detail">
        <div class="detail-icon">
          <component 
            :is="getBadgeIcon(selectedBadge.type)" 
            class="w-16 h-16"
            :class="selectedBadge.earned ? selectedBadge.color : 'text-gray-400'"
          />
        </div>
        <div class="detail-info">
          <h3 class="detail-name">{{ selectedBadge.name }}</h3>
          <p class="detail-description">{{ selectedBadge.description }}</p>
          <div class="detail-requirement">
            <Target class="w-4 h-4 mr-2 text-blue-500" />
            <span>要求：{{ selectedBadge.requirementText }}</span>
          </div>
          <div v-if="selectedBadge.earned" class="detail-earned">
            <CheckCircle class="w-4 h-4 mr-2 text-green-500" />
            <span>获得时间：{{ formatDate(selectedBadge.earnedDate) }}</span>
          </div>
          <div v-else class="detail-progress">
            <div class="progress-info">
              <span>进度：{{ selectedBadge.progress }}/{{ selectedBadge.requirement }}</span>
              <span class="progress-percent">
                {{ Math.round((selectedBadge.progress / selectedBadge.requirement) * 100) }}%
              </span>
            </div>
            <a-progress
              :percent="(selectedBadge.progress / selectedBadge.requirement) * 100"
              :stroke-width="8"
              stroke-color="#1890ff"
            />
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 徽章获得动画 -->
    <div v-if="showEarnedAnimation" class="earned-animation">
      <div class="earned-popup">
        <div class="earned-icon">
          <Trophy class="w-12 h-12 text-yellow-400" />
        </div>
        <h3 class="earned-title">恭喜获得新徽章！</h3>
        <div class="earned-badge">
          <component 
            :is="getBadgeIcon(earnedBadge?.type)" 
            class="w-10 h-10"
            :class="earnedBadge?.color"
          />
          <span class="earned-name">{{ earnedBadge?.name }}</span>
        </div>
        <p class="earned-message">{{ earnedBadge?.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  Trophy, CheckCircle, Calendar, Target, Star, Zap, 
  BookOpen, Headphones, PenTool, Eye, Award, Crown,
  Flame, Heart, Shield, Gem
} from 'lucide-vue-next'

interface Badge {
  id: string
  name: string
  description: string
  type: string
  color: string
  requirement: number
  progress: number
  earned: boolean
  earnedDate?: Date
  requirementText: string
  justEarned?: boolean
}

interface Props {
  userStats?: {
    totalScore: number
    correctAnswers: number
    streak: number
    daysActive: number
    lessonsCompleted: number
    vocabularyLearned: number
    listeningHours: number
    writingExercises: number
    readingPassages: number
  }
}

const props = defineProps<Props>()

// 响应式数据
const badges = ref<Badge[]>([])
const showDetailModal = ref(false)
const selectedBadge = ref<Badge | null>(null)
const showEarnedAnimation = ref(false)
const earnedBadge = ref<Badge | null>(null)

// 计算属性
const recentBadges = computed(() => {
  return badges.value
    .filter(badge => badge.earned && badge.earnedDate)
    .sort((a, b) => (b.earnedDate?.getTime() || 0) - (a.earnedDate?.getTime() || 0))
    .slice(0, 3)
})

// 初始化徽章数据
const initializeBadges = () => {
  badges.value = [
    {
      id: 'first-lesson',
      name: '初学者',
      description: '完成第一个学习课程',
      type: 'lesson',
      color: 'text-blue-500',
      requirement: 1,
      progress: props.userStats?.lessonsCompleted || 0,
      earned: false,
      requirementText: '完成1个课程'
    },
    {
      id: 'vocabulary-master',
      name: '词汇大师',
      description: '学会100个新单词',
      type: 'vocabulary',
      color: 'text-green-500',
      requirement: 100,
      progress: props.userStats?.vocabularyLearned || 0,
      earned: false,
      requirementText: '学会100个单词'
    },
    {
      id: 'listening-expert',
      name: '听力专家',
      description: '完成10小时听力练习',
      type: 'listening',
      color: 'text-purple-500',
      requirement: 10,
      progress: props.userStats?.listeningHours || 0,
      earned: false,
      requirementText: '完成10小时听力练习'
    },
    {
      id: 'writing-champion',
      name: '写作冠军',
      description: '完成50个写作练习',
      type: 'writing',
      color: 'text-orange-500',
      requirement: 50,
      progress: props.userStats?.writingExercises || 0,
      earned: false,
      requirementText: '完成50个写作练习'
    },
    {
      id: 'reading-enthusiast',
      name: '阅读爱好者',
      description: '阅读20篇文章',
      type: 'reading',
      color: 'text-indigo-500',
      requirement: 20,
      progress: props.userStats?.readingPassages || 0,
      earned: false,
      requirementText: '阅读20篇文章'
    },
    {
      id: 'streak-warrior',
      name: '连击战士',
      description: '达到10连击',
      type: 'streak',
      color: 'text-red-500',
      requirement: 10,
      progress: props.userStats?.streak || 0,
      earned: false,
      requirementText: '达到10连击'
    },
    {
      id: 'daily-learner',
      name: '每日学习者',
      description: '连续学习7天',
      type: 'daily',
      color: 'text-yellow-500',
      requirement: 7,
      progress: props.userStats?.daysActive || 0,
      earned: false,
      requirementText: '连续学习7天'
    },
    {
      id: 'high-scorer',
      name: '高分达人',
      description: '总分达到1000分',
      type: 'score',
      color: 'text-pink-500',
      requirement: 1000,
      progress: props.userStats?.totalScore || 0,
      earned: false,
      requirementText: '总分达到1000分'
    },
    {
      id: 'perfectionist',
      name: '完美主义者',
      description: '连续答对20题',
      type: 'perfect',
      color: 'text-cyan-500',
      requirement: 20,
      progress: props.userStats?.correctAnswers || 0,
      earned: false,
      requirementText: '连续答对20题'
    },
    {
      id: 'legend',
      name: '传奇学者',
      description: '获得所有其他徽章',
      type: 'legend',
      color: 'text-amber-500',
      requirement: 8,
      progress: 0,
      earned: false,
      requirementText: '获得所有其他徽章'
    }
  ]
  
  checkBadgeProgress()
}

// 获取徽章图标
const getBadgeIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    lesson: BookOpen,
    vocabulary: Star,
    listening: Headphones,
    writing: PenTool,
    reading: Eye,
    streak: Flame,
    daily: Heart,
    score: Award,
    perfect: Crown,
    legend: Gem
  }
  return iconMap[type] || Trophy
}

// 检查徽章进度
const checkBadgeProgress = () => {
  badges.value.forEach(badge => {
    if (!badge.earned && badge.progress >= badge.requirement) {
      earnBadge(badge)
    }
  })
  
  // 检查传奇学者徽章
  const legendBadge = badges.value.find(b => b.id === 'legend')
  if (legendBadge && !legendBadge.earned) {
    const otherEarnedBadges = badges.value.filter(b => b.id !== 'legend' && b.earned).length
    legendBadge.progress = otherEarnedBadges
    if (otherEarnedBadges >= legendBadge.requirement) {
      earnBadge(legendBadge)
    }
  }
}

// 获得徽章
const earnBadge = (badge: Badge) => {
  badge.earned = true
  badge.earnedDate = new Date()
  badge.justEarned = true
  
  // 显示获得动画
  earnedBadge.value = badge
  showEarnedAnimation.value = true
  
  setTimeout(() => {
    showEarnedAnimation.value = false
    badge.justEarned = false
  }, 3000)
}

// 显示徽章详情
const showBadgeDetail = (badge: Badge) => {
  selectedBadge.value = badge
  showDetailModal.value = true
}

// 格式化日期
const formatDate = (date?: Date) => {
  if (!date) return ''
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 格式化相对时间
const formatRelativeTime = (date?: Date) => {
  if (!date) return ''
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return formatDate(date)
}

// 监听用户统计数据变化
watch(() => props.userStats, (newStats) => {
  if (newStats) {
    badges.value.forEach(badge => {
      switch (badge.id) {
        case 'first-lesson':
          badge.progress = newStats.lessonsCompleted || 0
          break
        case 'vocabulary-master':
          badge.progress = newStats.vocabularyLearned || 0
          break
        case 'listening-expert':
          badge.progress = newStats.listeningHours || 0
          break
        case 'writing-champion':
          badge.progress = newStats.writingExercises || 0
          break
        case 'reading-enthusiast':
          badge.progress = newStats.readingPassages || 0
          break
        case 'streak-warrior':
          badge.progress = newStats.streak || 0
          break
        case 'daily-learner':
          badge.progress = newStats.daysActive || 0
          break
        case 'high-scorer':
          badge.progress = newStats.totalScore || 0
          break
        case 'perfectionist':
          badge.progress = newStats.correctAnswers || 0
          break
      }
    })
    checkBadgeProgress()
  }
}, { deep: true })

onMounted(() => {
  initializeBadges()
})
</script>

<style scoped>
.badge-system {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
}

.badges-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.badge-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.badge-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.badge-card.earned {
  border: 2px solid #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
}

.badge-card.locked {
  opacity: 0.6;
}

.badge-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 12px;
  margin-right: 16px;
}

.badge-info {
  flex: 1;
}

.badge-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.badge-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.badge-progress {
  margin-top: 8px;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  display: block;
}

.earned-date {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #10b981;
  margin-top: 4px;
}

.earned-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
}

.recent-badges {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.recent-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-badge {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.recent-name {
  flex: 1;
  margin-left: 12px;
  font-weight: 500;
  color: #1f2937;
}

.recent-date {
  font-size: 12px;
  color: #6b7280;
}

.badge-detail {
  text-align: center;
  padding: 20px 0;
}

.detail-icon {
  margin-bottom: 16px;
}

.detail-name {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.detail-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}

.detail-requirement,
.detail-earned {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.detail-progress {
  margin-top: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #6b7280;
}

.progress-percent {
  font-weight: 600;
  color: #1890ff;
}

.earned-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.earned-popup {
  background: white;
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  max-width: 400px;
  animation: slideUp 0.5s ease-out;
}

.earned-icon {
  margin-bottom: 16px;
}

.earned-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.earned-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.earned-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.earned-message {
  font-size: 14px;
  color: #6b7280;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .badges-grid {
    grid-template-columns: 1fr;
  }
  
  .badge-card {
    padding: 12px;
  }
  
  .badge-icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }
  
  .earned-popup {
    margin: 20px;
    padding: 24px;
  }
}
</style>