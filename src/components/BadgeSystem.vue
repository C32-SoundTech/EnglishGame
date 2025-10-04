<template>
  <div class="badge-system">
    <!-- 徽章概览 -->
    <div class="badge-overview">
      <a-card class="overview-card">
        <div class="overview-header">
          <div class="header-info">
            <h3 class="section-title">
              <Award class="w-6 h-6 mr-2" />
              学习徽章系统
            </h3>
            <p class="section-desc">通过完成学习任务和达成目标来解锁各种徽章奖励</p>
          </div>
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-value">{{ unlockedBadges.length }}</span>
              <span class="stat-label">已获得</span>
            </div>
            <div class="stat-divider">/</div>
            <div class="stat-item">
              <span class="stat-value">{{ totalBadges }}</span>
              <span class="stat-label">总徽章</span>
            </div>
          </div>
        </div>
        
        <div class="progress-overview">
          <a-progress 
            :percent="badgeProgress" 
            :stroke-color="{
              '0%': '#87d068',
              '50%': '#ffe58f',
              '100%': '#ffccc7',
            }"
            size="large"
          />
          <div class="progress-text">
            徽章收集进度：{{ badgeProgress }}%
          </div>
        </div>
      </a-card>
    </div>

    <!-- 徽章分类 -->
    <div class="badge-categories">
      <a-card title="徽章分类" class="categories-card">
        <template #extra>
          <a-select 
            v-model:value="selectedCategory" 
            style="width: 150px"
            @change="handleCategoryChange"
          >
            <a-select-option value="all">全部徽章</a-select-option>
            <a-select-option value="learning">学习成就</a-select-option>
            <a-select-option value="skill">技能掌握</a-select-option>
            <a-select-option value="progress">进度里程碑</a-select-option>
            <a-select-option value="special">特殊奖励</a-select-option>
          </a-select>
        </template>
        
        <div class="categories-grid">
          <div 
            v-for="category in badgeCategories" 
            :key="category.id"
            class="category-item"
            :class="{ 'active': selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            <div class="category-icon" :style="{ backgroundColor: category.color + '20', color: category.color }">
              <component :is="category.icon" class="w-6 h-6" />
            </div>
            <div class="category-info">
              <h4 class="category-title">{{ category.title }}</h4>
              <p class="category-description">{{ category.description }}</p>
              <div class="category-stats">
                <span class="unlocked-count">{{ category.unlockedCount }}</span>
                <span class="total-count">/ {{ category.totalCount }}</span>
              </div>
            </div>
            <div class="category-progress">
              <a-progress 
                type="circle" 
                :percent="category.progress" 
                :width="60"
                :stroke-color="category.color"
              />
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 徽章展示 -->
    <div class="badge-display">
      <a-card title="徽章收藏" class="display-card">
        <template #extra>
          <div class="display-controls">
            <a-radio-group v-model:value="displayMode" @change="handleDisplayModeChange">
              <a-radio-button value="grid">网格视图</a-radio-button>
              <a-radio-button value="list">列表视图</a-radio-button>
            </a-radio-group>
            <a-button @click="showBadgeStats">
              <BarChart3 class="w-4 h-4 mr-1" />
              统计
            </a-button>
          </div>
        </template>
        
        <div class="badge-grid" :class="displayMode">
          <div 
            v-for="badge in filteredBadges" 
            :key="badge.id"
            class="badge-item"
            :class="{ 
              'unlocked': badge.unlocked, 
              'locked': !badge.unlocked,
              'new': badge.isNew 
            }"
            @click="viewBadgeDetail(badge)"
          >
            <div class="badge-container">
              <div class="badge-icon" :style="getBadgeStyle(badge)">
                <component :is="badge.icon" class="w-8 h-8" />
                <div v-if="badge.unlocked && badge.isNew" class="new-indicator">
                  <Sparkles class="w-3 h-3" />
                </div>
                <div v-if="!badge.unlocked" class="lock-overlay">
                  <Lock class="w-4 h-4" />
                </div>
              </div>
              
              <div class="badge-info">
                <h4 class="badge-title">{{ badge.title }}</h4>
                <p class="badge-description">{{ badge.description }}</p>
                
                <div v-if="badge.unlocked" class="badge-meta">
                  <div class="unlock-date">
                    <Calendar class="w-3 h-3 mr-1" />
                    {{ formatDate(badge.unlockedAt) }}
                  </div>
                  <div class="badge-rarity" :class="badge.rarity">
                    <Star class="w-3 h-3 mr-1" />
                    {{ getRarityText(badge.rarity) }}
                  </div>
                </div>
                
                <div v-else class="badge-requirements">
                  <div class="requirement-title">解锁条件：</div>
                  <div class="requirement-list">
                    <div 
                      v-for="requirement in badge.requirements" 
                      :key="requirement.id"
                      class="requirement-item"
                      :class="{ 'completed': requirement.completed }"
                    >
                      <CheckCircle v-if="requirement.completed" class="w-3 h-3 mr-1 text-green-500" />
                      <Circle v-else class="w-3 h-3 mr-1 text-gray-400" />
                      <span>{{ requirement.description }}</span>
                      <div v-if="requirement.progress !== undefined" class="requirement-progress">
                        <a-progress 
                          :percent="requirement.progress" 
                          size="small"
                          :show-info="false"
                        />
                        <span class="progress-text">{{ requirement.current }}/{{ requirement.target }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 最近获得的徽章 -->
    <div class="recent-badges">
      <a-card title="最近获得" class="recent-card">
        <div class="recent-list">
          <div 
            v-for="badge in recentBadges" 
            :key="badge.id"
            class="recent-item"
          >
            <div class="recent-badge">
              <div class="badge-icon" :style="getBadgeStyle(badge)">
                <component :is="badge.icon" class="w-6 h-6" />
              </div>
              <div class="badge-shine"></div>
            </div>
            <div class="recent-info">
              <h4 class="recent-title">{{ badge.title }}</h4>
              <p class="recent-time">{{ getRelativeTime(badge.unlockedAt) }}</p>
            </div>
            <div class="recent-celebration">
              <a-button size="small" @click="celebrateBadge(badge)">
                <Zap class="w-3 h-3 mr-1" />
                庆祝
              </a-button>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 徽章详情模态框 -->
    <a-modal 
      v-model:open="showBadgeDetail" 
      :title="selectedBadge?.title" 
      width="600px"
      :footer="null"
    >
      <div v-if="selectedBadge" class="badge-detail">
        <div class="detail-header">
          <div class="detail-badge">
            <div class="badge-icon large" :style="getBadgeStyle(selectedBadge)">
              <component :is="selectedBadge.icon" class="w-12 h-12" />
              <div v-if="selectedBadge.unlocked && selectedBadge.isNew" class="new-indicator large">
                <Sparkles class="w-4 h-4" />
              </div>
              <div v-if="!selectedBadge.unlocked" class="lock-overlay large">
                <Lock class="w-6 h-6" />
              </div>
            </div>
            <div class="badge-glow" :style="{ backgroundColor: selectedBadge.color }"></div>
          </div>
          <div class="detail-info">
            <h3>{{ selectedBadge.title }}</h3>
            <p>{{ selectedBadge.description }}</p>
            <div class="detail-meta">
              <a-tag :color="getRarityColor(selectedBadge.rarity)">
                {{ getRarityText(selectedBadge.rarity) }}
              </a-tag>
              <a-tag :color="getCategoryColor(selectedBadge.category)">
                {{ getCategoryText(selectedBadge.category) }}
              </a-tag>
            </div>
          </div>
        </div>
        
        <div class="detail-content">
          <a-tabs>
            <a-tab-pane key="info" tab="详细信息">
              <div class="info-content">
                <div v-if="selectedBadge.unlocked" class="unlock-info">
                  <h4>获得信息</h4>
                  <div class="unlock-details">
                    <div class="detail-item">
                      <Calendar class="w-4 h-4 mr-2" />
                      <span>获得时间：{{ formatDateTime(selectedBadge.unlockedAt) }}</span>
                    </div>
                    <div class="detail-item">
                      <Trophy class="w-4 h-4 mr-2" />
                      <span>获得方式：{{ selectedBadge.unlockMethod }}</span>
                    </div>
                    <div class="detail-item">
                      <Users class="w-4 h-4 mr-2" />
                      <span>获得率：{{ selectedBadge.unlockRate }}%</span>
                    </div>
                  </div>
                </div>
                
                <div class="requirements-info">
                  <h4>{{ selectedBadge.unlocked ? '完成条件' : '解锁条件' }}</h4>
                  <div class="requirements-list">
                    <div 
                      v-for="requirement in selectedBadge.requirements" 
                      :key="requirement.id"
                      class="requirement-detail"
                      :class="{ 'completed': requirement.completed }"
                    >
                      <div class="requirement-header">
                        <CheckCircle v-if="requirement.completed" class="w-4 h-4 mr-2 text-green-500" />
                        <Circle v-else class="w-4 h-4 mr-2 text-gray-400" />
                        <span class="requirement-text">{{ requirement.description }}</span>
                      </div>
                      <div v-if="requirement.progress !== undefined" class="requirement-progress-detail">
                        <a-progress 
                          :percent="requirement.progress" 
                          :stroke-color="requirement.completed ? '#52c41a' : '#1890ff'"
                        />
                        <span class="progress-detail">{{ requirement.current }}/{{ requirement.target }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-if="selectedBadge.rewards" class="rewards-info">
                  <h4>奖励内容</h4>
                  <div class="rewards-list">
                    <div 
                      v-for="reward in selectedBadge.rewards" 
                      :key="reward.type"
                      class="reward-item"
                    >
                      <div class="reward-icon">
                        <component :is="reward.icon" class="w-4 h-4" />
                      </div>
                      <span class="reward-text">{{ reward.description }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </a-tab-pane>
            
            <a-tab-pane key="tips" tab="获得攻略">
              <div class="tips-content">
                <div v-if="selectedBadge.tips" class="tips-list">
                  <div 
                    v-for="(tip, index) in selectedBadge.tips" 
                    :key="index"
                    class="tip-item"
                  >
                    <div class="tip-number">{{ index + 1 }}</div>
                    <div class="tip-content">
                      <h5 class="tip-title">{{ tip.title }}</h5>
                      <p class="tip-description">{{ tip.description }}</p>
                    </div>
                  </div>
                </div>
                
                <div v-if="selectedBadge.relatedBadges" class="related-badges">
                  <h4>相关徽章</h4>
                  <div class="related-list">
                    <div 
                      v-for="relatedBadge in selectedBadge.relatedBadges" 
                      :key="relatedBadge.id"
                      class="related-item"
                      @click="viewBadgeDetail(relatedBadge)"
                    >
                      <div class="related-icon" :style="getBadgeStyle(relatedBadge)">
                        <component :is="relatedBadge.icon" class="w-5 h-5" />
                      </div>
                      <span class="related-title">{{ relatedBadge.title }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
        
        <div v-if="!selectedBadge.unlocked" class="detail-actions">
          <a-button 
            type="primary" 
            size="large"
            @click="startBadgeQuest(selectedBadge)"
          >
            <Target class="w-4 h-4 mr-1" />
            开始挑战
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- 徽章统计模态框 -->
    <a-modal 
      v-model:open="showStatsModal" 
      title="徽章统计" 
      width="800px"
      :footer="null"
    >
      <div class="stats-content">
        <div class="stats-overview">
          <a-row :gutter="16">
            <a-col :span="6" v-for="stat in badgeStats" :key="stat.key">
              <div class="stat-card">
                <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
                  <component :is="stat.icon" class="w-6 h-6" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
        
        <div class="stats-charts">
          <a-row :gutter="16">
            <a-col :span="12">
              <div class="chart-container">
                <h4>徽章分布</h4>
                <div class="category-distribution">
                  <div 
                    v-for="category in badgeCategories" 
                    :key="category.id"
                    class="distribution-item"
                  >
                    <span class="category-name">{{ category.title }}</span>
                    <div class="distribution-bar">
                      <div 
                        class="bar-fill" 
                        :style="{ 
                          width: category.progress + '%', 
                          backgroundColor: category.color 
                        }"
                      ></div>
                    </div>
                    <span class="category-percentage">{{ category.progress }}%</span>
                  </div>
                </div>
              </div>
            </a-col>
            
            <a-col :span="12">
              <div class="chart-container">
                <h4>稀有度分布</h4>
                <div class="rarity-distribution">
                  <div 
                    v-for="rarity in rarityStats" 
                    :key="rarity.type"
                    class="rarity-item"
                  >
                    <div class="rarity-icon" :style="{ color: rarity.color }">
                      <Star class="w-4 h-4" />
                    </div>
                    <span class="rarity-name">{{ rarity.name }}</span>
                    <span class="rarity-count">{{ rarity.count }}</span>
                  </div>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  Award,
  Star,
  Lock,
  Sparkles,
  Calendar,
  CheckCircle,
  Circle,
  BarChart3,
  Zap,
  Target,
  Trophy,
  Users,
  BookOpen,
  MessageSquare,
  Headphones,
  PenTool,
  Clock,
  TrendingUp,
  Heart,
  Shield,
  Crown,
  Gem,
  Flame,
  Lightning
} from 'lucide-vue-next'

interface BadgeRequirement {
  id: string
  description: string
  completed: boolean
  progress?: number
  current?: number
  target?: number
}

interface Badge {
  id: string
  title: string
  description: string
  category: 'learning' | 'skill' | 'progress' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon: any
  color: string
  unlocked: boolean
  unlockedAt?: Date
  unlockMethod?: string
  unlockRate?: number
  isNew?: boolean
  requirements: BadgeRequirement[]
  rewards?: Array<{
    type: string
    description: string
    icon: any
  }>
  tips?: Array<{
    title: string
    description: string
  }>
  relatedBadges?: Badge[]
}

interface BadgeCategory {
  id: string
  title: string
  description: string
  icon: any
  color: string
  unlockedCount: number
  totalCount: number
  progress: number
}

const router = useRouter()

// 响应式数据
const selectedCategory = ref('all')
const displayMode = ref('grid')
const showBadgeDetail = ref(false)
const showStatsModal = ref(false)
const selectedBadge = ref<Badge | null>(null)

// 徽章分类
const badgeCategories = ref<BadgeCategory[]>([
  {
    id: 'learning',
    title: '学习成就',
    description: '完成学习任务获得的徽章',
    icon: BookOpen,
    color: '#1890ff',
    unlockedCount: 8,
    totalCount: 15,
    progress: 53
  },
  {
    id: 'skill',
    title: '技能掌握',
    description: '掌握特定技能获得的徽章',
    icon: Star,
    color: '#52c41a',
    unlockedCount: 5,
    totalCount: 12,
    progress: 42
  },
  {
    id: 'progress',
    title: '进度里程碑',
    description: '达成学习进度获得的徽章',
    icon: TrendingUp,
    color: '#fa8c16',
    unlockedCount: 3,
    totalCount: 8,
    progress: 38
  },
  {
    id: 'special',
    title: '特殊奖励',
    description: '特殊活动或成就获得的徽章',
    icon: Crown,
    color: '#722ed1',
    unlockedCount: 2,
    totalCount: 5,
    progress: 40
  }
])

// 徽章数据
const badges = ref<Badge[]>([
  {
    id: '1',
    title: '初学者',
    description: '完成第一次学习任务',
    category: 'learning',
    rarity: 'common',
    icon: BookOpen,
    color: '#1890ff',
    unlocked: true,
    unlockedAt: new Date('2024-01-15'),
    unlockMethod: '完成首次学习',
    unlockRate: 95,
    isNew: false,
    requirements: [
      {
        id: '1',
        description: '完成任意一个学习任务',
        completed: true,
        progress: 100,
        current: 1,
        target: 1
      }
    ],
    rewards: [
      {
        type: 'points',
        description: '获得 50 学习积分',
        icon: Star
      }
    ],
    tips: [
      {
        title: '开始学习',
        description: '选择任意一个学习模块开始你的英语学习之旅'
      }
    ]
  },
  {
    id: '2',
    title: '口语达人',
    description: '完成100次口语练习',
    category: 'skill',
    rarity: 'rare',
    icon: MessageSquare,
    color: '#ff4d4f',
    unlocked: true,
    unlockedAt: new Date('2024-02-20'),
    unlockMethod: '口语练习累计',
    unlockRate: 35,
    isNew: true,
    requirements: [
      {
        id: '1',
        description: '完成100次口语练习',
        completed: true,
        progress: 100,
        current: 100,
        target: 100
      }
    ],
    rewards: [
      {
        type: 'title',
        description: '解锁"口语达人"称号',
        icon: Crown
      },
      {
        type: 'points',
        description: '获得 200 学习积分',
        icon: Star
      }
    ],
    tips: [
      {
        title: '坚持练习',
        description: '每天进行口语练习，保持连续性'
      },
      {
        title: '录音对比',
        description: '录制自己的发音并与标准发音对比'
      }
    ]
  },
  {
    id: '3',
    title: '词汇大师',
    description: '掌握1000个单词',
    category: 'skill',
    rarity: 'epic',
    icon: Zap,
    color: '#722ed1',
    unlocked: false,
    requirements: [
      {
        id: '1',
        description: '学习1000个单词',
        completed: false,
        progress: 75,
        current: 750,
        target: 1000
      },
      {
        id: '2',
        description: '词汇测试平均分达到85分',
        completed: false,
        progress: 60,
        current: 78,
        target: 85
      }
    ],
    tips: [
      {
        title: '分组学习',
        description: '将单词按主题分组，便于记忆和复习'
      },
      {
        title: '语境记忆',
        description: '在句子和文章中学习单词，提高记忆效果'
      }
    ]
  },
  {
    id: '4',
    title: '连续学习者',
    description: '连续学习30天',
    category: 'progress',
    rarity: 'rare',
    icon: Flame,
    color: '#fa8c16',
    unlocked: false,
    requirements: [
      {
        id: '1',
        description: '连续30天完成学习任务',
        completed: false,
        progress: 67,
        current: 20,
        target: 30
      }
    ],
    tips: [
      {
        title: '制定计划',
        description: '制定每日学习计划，养成学习习惯'
      },
      {
        title: '设置提醒',
        description: '设置学习提醒，避免遗忘'
      }
    ]
  },
  {
    id: '5',
    title: '听力专家',
    description: '听力测试连续10次满分',
    category: 'skill',
    rarity: 'epic',
    icon: Headphones,
    color: '#52c41a',
    unlocked: false,
    requirements: [
      {
        id: '1',
        description: '听力测试连续10次满分',
        completed: false,
        progress: 30,
        current: 3,
        target: 10
      }
    ],
    tips: [
      {
        title: '多样化练习',
        description: '练习不同类型的听力材料'
      },
      {
        title: '注意细节',
        description: '仔细听取关键信息和细节'
      }
    ]
  },
  {
    id: '6',
    title: '传奇学者',
    description: '获得所有技能徽章',
    category: 'special',
    rarity: 'legendary',
    icon: Crown,
    color: '#d4b106',
    unlocked: false,
    requirements: [
      {
        id: '1',
        description: '获得所有技能类徽章',
        completed: false,
        progress: 42,
        current: 5,
        target: 12
      }
    ],
    tips: [
      {
        title: '全面发展',
        description: '均衡发展听说读写各项技能'
      },
      {
        title: '持续挑战',
        description: '不断挑战更高难度的学习内容'
      }
    ]
  }
])

// 计算属性
const totalBadges = computed(() => badges.value.length)
const unlockedBadges = computed(() => badges.value.filter(badge => badge.unlocked))
const badgeProgress = computed(() => Math.round((unlockedBadges.value.length / totalBadges.value) * 100))

const filteredBadges = computed(() => {
  if (selectedCategory.value === 'all') {
    return badges.value
  }
  return badges.value.filter(badge => badge.category === selectedCategory.value)
})

const recentBadges = computed(() => {
  return unlockedBadges.value
    .filter(badge => badge.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 5)
})

const badgeStats = computed(() => [
  {
    key: 'total',
    label: '总徽章',
    value: totalBadges.value.toString(),
    icon: Award,
    color: '#1890ff'
  },
  {
    key: 'unlocked',
    label: '已获得',
    value: unlockedBadges.value.length.toString(),
    icon: CheckCircle,
    color: '#52c41a'
  },
  {
    key: 'rare',
    label: '稀有徽章',
    value: unlockedBadges.value.filter(b => ['rare', 'epic', 'legendary'].includes(b.rarity)).length.toString(),
    icon: Gem,
    color: '#722ed1'
  },
  {
    key: 'recent',
    label: '本月获得',
    value: unlockedBadges.value.filter(b => {
      const now = new Date()
      const unlockDate = new Date(b.unlockedAt!)
      return unlockDate.getMonth() === now.getMonth() && unlockDate.getFullYear() === now.getFullYear()
    }).length.toString(),
    icon: Calendar,
    color: '#fa8c16'
  }
])

const rarityStats = computed(() => [
  {
    type: 'common',
    name: '普通',
    color: '#8c8c8c',
    count: unlockedBadges.value.filter(b => b.rarity === 'common').length
  },
  {
    type: 'rare',
    name: '稀有',
    color: '#1890ff',
    count: unlockedBadges.value.filter(b => b.rarity === 'rare').length
  },
  {
    type: 'epic',
    name: '史诗',
    color: '#722ed1',
    count: unlockedBadges.value.filter(b => b.rarity === 'epic').length
  },
  {
    type: 'legendary',
    name: '传奇',
    color: '#d4b106',
    count: unlockedBadges.value.filter(b => b.rarity === 'legendary').length
  }
])

// 方法
const handleCategoryChange = (value: string) => {
  message.info(`切换到${getCategoryText(value)}`)
}

const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId
}

const handleDisplayModeChange = () => {
  message.info(`切换到${displayMode.value === 'grid' ? '网格' : '列表'}视图`)
}

const viewBadgeDetail = (badge: Badge) => {
  selectedBadge.value = badge
  showBadgeDetail.value = true
}

const showBadgeStats = () => {
  showStatsModal.value = true
}

const celebrateBadge = (badge: Badge) => {
  message.success(`🎉 恭喜获得徽章：${badge.title}！`)
}

const startBadgeQuest = (badge: Badge) => {
  message.info(`开始挑战徽章：${badge.title}`)
  showBadgeDetail.value = false
  router.push('/games')
}

// 工具函数
const getBadgeStyle = (badge: Badge) => {
  const baseStyle = {
    backgroundColor: badge.color + '20',
    color: badge.color,
    borderColor: badge.color
  }
  
  if (!badge.unlocked) {
    return {
      ...baseStyle,
      backgroundColor: '#f5f5f5',
      color: '#bfbfbf',
      borderColor: '#d9d9d9'
    }
  }
  
  return baseStyle
}

const getRarityColor = (rarity: string): string => {
  const colors: Record<string, string> = {
    common: 'default',
    rare: 'blue',
    epic: 'purple',
    legendary: 'gold'
  }
  return colors[rarity] || 'default'
}

const getRarityText = (rarity: string): string => {
  const texts: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传奇'
  }
  return texts[rarity] || rarity
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    learning: 'blue',
    skill: 'green',
    progress: 'orange',
    special: 'purple'
  }
  return colors[category] || 'default'
}

const getCategoryText = (category: string): string => {
  const texts: Record<string, string> = {
    all: '全部徽章',
    learning: '学习成就',
    skill: '技能掌握',
    progress: '进度里程碑',
    special: '特殊奖励'
  }
  return texts[category] || category
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN')
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString('zh-CN')
}

const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return `${Math.floor(days / 30)}个月前`
}

// 生命周期
onMounted(() => {
  // 初始化徽章数据
})

// 暴露方法给父组件
defineExpose({
  unlockBadge: (badgeId: string) => {
    const badge = badges.value.find(b => b.id === badgeId)
    if (badge && !badge.unlocked) {
      badge.unlocked = true
      badge.unlockedAt = new Date()
      badge.isNew = true
      message.success(`🎉 恭喜获得新徽章：${badge.title}！`)
    }
  },
  updateProgress: (badgeId: string, requirementId: string, progress: number) => {
    const badge = badges.value.find(b => b.id === badgeId)
    if (badge) {
      const requirement = badge.requirements.find(r => r.id === requirementId)
      if (requirement) {
        requirement.progress = progress
        requirement.completed = progress >= 100
      }
    }
  },
  getBadges: () => badges.value,
  getUnlockedBadges: () => unlockedBadges.value
})
</script>

<style scoped lang="less">
.badge-system {
  .badge-overview {
    margin-bottom: 24px;

    .overview-card {
      .overview-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;

        .header-info {
          .section-title {
            display: flex;
            align-items: center;
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 8px 0;
          }

          .section-desc {
            color: #6b7280;
            margin: 0;
          }
        }

        .header-stats {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;

          .stat-item {
            .stat-value {
              font-weight: 600;
              color: #1f2937;
            }

            .stat-label {
              font-size: 12px;
              color: #6b7280;
              margin-left: 4px;
            }
          }

          .stat-divider {
            color: #d1d5db;
            font-weight: 300;
          }
        }
      }

      .progress-overview {
        .progress-text {
          text-align: center;
          margin-top: 8px;
          color: #6b7280;
          font-size: 14px;
        }
      }
    }
  }

  .badge-categories {
    margin-bottom: 24px;

    .categories-card {
      .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;

        .category-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 1px solid #f0f0f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            border-color: #d9d9d9;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          }

          &.active {
            border-color: #1890ff;
            background: #f6ffed;
          }

          .category-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .category-info {
            flex: 1;

            .category-title {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              margin: 0 0 4px 0;
            }

            .category-description {
              font-size: 12px;
              color: #6b7280;
              margin: 0 0 8px 0;
            }

            .category-stats {
              font-size: 14px;

              .unlocked-count {
                font-weight: 600;
                color: #1f2937;
              }

              .total-count {
                color: #6b7280;
              }
            }
          }

          .category-progress {
            flex-shrink: 0;
          }
        }
      }
    }
  }

  .badge-display {
    margin-bottom: 24px;

    .display-card {
      .display-controls {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .badge-grid {
        display: grid;
        gap: 20px;

        &.grid {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        &.list {
          grid-template-columns: 1fr;
        }

        .badge-item {
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;

          &:hover {
            border-color: #d9d9d9;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }

          &.unlocked {
            background: linear-gradient(135deg, #fff 0%, #f9f9f9 100%);
          }

          &.locked {
            background: #fafafa;
            opacity: 0.7;
          }

          &.new::before {
            content: 'NEW';
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ff4d4f;
            color: white;
            font-size: 10px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 4px;
            z-index: 1;
          }

          .badge-container {
            display: flex;
            gap: 16px;

            .badge-icon {
              width: 64px;
              height: 64px;
              border-radius: 16px;
              border: 2px solid;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              position: relative;

              &.large {
                width: 96px;
                height: 96px;
                border-radius: 24px;
              }

              .new-indicator {
                position: absolute;
                top: -4px;
                right: -4px;
                background: #ff4d4f;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;

                &.large {
                  width: 28px;
                  height: 28px;
                  top: -6px;
                  right: -6px;
                }
              }

              .lock-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.3);
                border-radius: inherit;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;

                &.large {
                  border-radius: 24px;
                }
              }
            }

            .badge-info {
              flex: 1;

              .badge-title {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 8px 0;
              }

              .badge-description {
                color: #6b7280;
                line-height: 1.5;
                margin-bottom: 12px;
              }

              .badge-meta {
                display: flex;
                flex-direction: column;
                gap: 4px;

                .unlock-date,
                .badge-rarity {
                  display: flex;
                  align-items: center;
                  font-size: 12px;
                }

                .unlock-date {
                  color: #6b7280;
                }

                .badge-rarity {
                  &.common { color: #8c8c8c; }
                  &.rare { color: #1890ff; }
                  &.epic { color: #722ed1; }
                  &.legendary { color: #d4b106; }
                }
              }

              .badge-requirements {
                .requirement-title {
                  font-size: 12px;
                  color: #374151;
                  margin-bottom: 8px;
                  font-weight: 500;
                }

                .requirement-list {
                  .requirement-item {
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                    color: #6b7280;
                    margin-bottom: 4px;

                    &.completed {
                      color: #52c41a;
                    }

                    .requirement-progress {
                      margin-left: auto;
                      display: flex;
                      align-items: center;
                      gap: 8px;
                      min-width: 100px;

                      .progress-text {
                        font-size: 10px;
                        white-space: nowrap;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .recent-badges {
    .recent-card {
      .recent-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .recent-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #fafafa;
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover {
            background: #f0f0f0;
          }

          .recent-badge {
            position: relative;

            .badge-icon {
              width: 40px;
              height: 40px;
              border-radius: 10px;
              border: 2px solid;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .badge-shine {
              position: absolute;
              top: -2px;
              left: -2px;
              right: -2px;
              bottom: -2px;
              border-radius: 12px;
              background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.5), transparent);
              animation: shine 2s infinite;
            }
          }

          .recent-info {
            flex: 1;

            .recent-title {
              font-size: 14px;
              font-weight: 600;
              color: #1f2937;
              margin: 0 0 2px 0;
            }

            .recent-time {
              font-size: 12px;
              color: #6b7280;
              margin: 0;
            }
          }

          .recent-celebration {
            flex-shrink: 0;
          }
        }
      }
    }
  }

  .badge-detail {
    .detail-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;

      .detail-badge {
        position: relative;

        .badge-glow {
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          border-radius: 32px;
          opacity: 0.2;
          filter: blur(8px);
        }
      }

      .detail-info {
        flex: 1;

        h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        p {
          color: #6b7280;
          margin: 0 0 12px 0;
          line-height: 1.5;
        }

        .detail-meta {
          display: flex;
          gap: 8px;
        }
      }
    }

    .detail-content {
      margin-bottom: 24px;

      .info-content {
        .unlock-info,
        .requirements-info,
        .rewards-info {
          margin-bottom: 24px;

          h4 {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 12px;
          }

          .unlock-details,
          .requirements-list,
          .rewards-list {
            .detail-item,
            .requirement-detail,
            .reward-item {
              display: flex;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid #f0f0f0;

              &:last-child {
                border-bottom: none;
              }

              &.completed {
                .requirement-text {
                  color: #52c41a;
                }
              }
            }

            .requirement-detail {
              flex-direction: column;
              align-items: flex-start;

              .requirement-header {
                display: flex;
                align-items: center;
                width: 100%;
                margin-bottom: 8px;

                .requirement-text {
                  color: #374151;
                }
              }

              .requirement-progress-detail {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;

                .progress-detail {
                  font-size: 12px;
                  color: #6b7280;
                  white-space: nowrap;
                }
              }
            }

            .reward-item {
              .reward-icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
                flex-shrink: 0;
              }

              .reward-text {
                color: #374151;
              }
            }
          }
        }
      }

      .tips-content {
        .tips-list {
          margin-bottom: 24px;

          .tip-item {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;

            .tip-number {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: #1890ff;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: 600;
              flex-shrink: 0;
            }

            .tip-content {
              flex: 1;

              .tip-title {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 4px 0;
              }

              .tip-description {
                font-size: 14px;
                color: #6b7280;
                margin: 0;
                line-height: 1.5;
              }
            }
          }
        }

        .related-badges {
          h4 {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 12px;
          }

          .related-list {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;

            .related-item {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              border: 1px solid #f0f0f0;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.3s ease;

              &:hover {
                border-color: #d9d9d9;
                background: #fafafa;
              }

              .related-icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                border: 1px solid;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }

              .related-title {
                font-size: 12px;
                color: #374151;
              }
            }
          }
        }
      }
    }

    .detail-actions {
      display: flex;
      justify-content: center;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }
  }

  .stats-content {
    .stats-overview {
      margin-bottom: 24px;

      .stat-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #fafafa;
        border-radius: 8px;

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-content {
          .stat-value {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 2px;
          }

          .stat-label {
            font-size: 12px;
            color: #6b7280;
          }
        }
      }
    }

    .stats-charts {
      .chart-container {
        h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
        }

        .category-distribution {
          .distribution-item {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;

            .category-name {
              width: 80px;
              font-size: 14px;
              color: #374151;
              flex-shrink: 0;
            }

            .distribution-bar {
              flex: 1;
              height: 8px;
              background: #f0f0f0;
              border-radius: 4px;
              overflow: hidden;

              .bar-fill {
                height: 100%;
                transition: width 0.3s ease;
              }
            }

            .category-percentage {
              width: 40px;
              text-align: right;
              font-size: 12px;
              color: #6b7280;
              flex-shrink: 0;
            }
          }
        }

        .rarity-distribution {
          .rarity-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
              border-bottom: none;
            }

            .rarity-icon {
              flex-shrink: 0;
            }

            .rarity-name {
              flex: 1;
              font-size: 14px;
              color: #374151;
            }

            .rarity-count {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              flex-shrink: 0;
            }
          }
        }
      }
    }
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(200%) rotate(45deg);
  }
}
</style>