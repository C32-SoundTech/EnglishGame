<template>
  <div class="level-system">
    <!-- 关卡地图 -->
    <div class="level-map-container">
      <h3 class="section-title">
        <Trophy class="w-5 h-5 mr-2" />
        关卡地图
      </h3>
      
      <div class="level-map">
        <div class="level-path">
          <div
            v-for="(level, index) in levels"
            :key="level.id"
            class="level-node"
            :class="{
              'completed': level.status === 'completed',
              'current': level.status === 'current',
              'locked': level.status === 'locked',
              'perfect': level.stars === 3
            }"
            @click="handleLevelClick(level)"
          >
            <!-- 关卡连接线 -->
            <div v-if="index > 0" class="level-connector" :class="{ 'active': levels[index - 1].status === 'completed' }"></div>
            
            <!-- 关卡图标 -->
            <div class="level-icon-container">
              <div class="level-icon">
                <Trophy v-if="level.status === 'completed'" class="w-8 h-8" />
                <Play v-else-if="level.status === 'current'" class="w-8 h-8" />
                <Lock v-else class="w-8 h-8" />
              </div>
              
              <!-- 星级显示 -->
              <div v-if="level.status === 'completed'" class="level-stars">
                <Star
                  v-for="i in 3"
                  :key="i"
                  class="w-3 h-3"
                  :class="{ 'filled': i <= level.stars, 'empty': i > level.stars }"
                />
              </div>
            </div>
            
            <!-- 关卡信息 -->
            <div class="level-info">
              <div class="level-name">{{ level.name }}</div>
              <div class="level-number">第{{ level.id }}关</div>
              
              <!-- 进度条 -->
              <div v-if="level.status === 'current'" class="level-progress">
                <a-progress
                  :percent="level.progress"
                  :stroke-color="getLevelColor(level.status)"
                  :show-info="false"
                  size="small"
                />
                <span class="progress-text">{{ level.progress }}%</span>
              </div>
              
              <!-- 分数显示 -->
              <div v-if="level.status === 'completed'" class="level-score">
                {{ level.score }}/{{ level.maxScore }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 当前关卡详情 -->
    <div v-if="currentLevel" class="current-level-detail">
      <a-card class="level-detail-card">
        <div class="level-header">
          <div class="level-title">
            <component :is="getLevelIcon(currentLevel.status)" class="w-6 h-6 mr-2" />
            <h4>{{ currentLevel.name }}</h4>
          </div>
          <div class="level-difficulty">
            <a-tag :color="getDifficultyColor(currentLevel.difficulty)">
              {{ getDifficultyText(currentLevel.difficulty) }}
            </a-tag>
          </div>
        </div>
        
        <div class="level-content">
          <p class="level-description">{{ currentLevel.description }}</p>
          
          <div class="level-objectives">
            <h5>学习目标：</h5>
            <ul>
              <li v-for="objective in currentLevel.objectives" :key="objective">
                {{ objective }}
              </li>
            </ul>
          </div>
          
          <div class="level-rewards">
            <h5>完成奖励：</h5>
            <div class="reward-list">
              <div class="reward-item">
                <Zap class="w-4 h-4 mr-1" />
                <span>{{ currentLevel.rewards.exp }} 经验值</span>
              </div>
              <div class="reward-item">
                <Star class="w-4 h-4 mr-1" />
                <span>最多 3 颗星</span>
              </div>
              <div v-if="currentLevel.rewards.badge" class="reward-item">
                <Award class="w-4 h-4 mr-1" />
                <span>{{ currentLevel.rewards.badge }} 徽章</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="level-actions">
          <a-button
            v-if="currentLevel.status === 'current'"
            type="primary"
            size="large"
            @click="startLevel(currentLevel)"
          >
            <Play class="w-4 h-4 mr-1" />
            开始学习
          </a-button>
          
          <a-button
            v-else-if="currentLevel.status === 'completed'"
            type="default"
            size="large"
            @click="reviewLevel(currentLevel)"
          >
            <RotateCcw class="w-4 h-4 mr-1" />
            复习关卡
          </a-button>
          
          <a-button
            v-else
            type="default"
            size="large"
            disabled
          >
            <Lock class="w-4 h-4 mr-1" />
            未解锁
          </a-button>
        </div>
      </a-card>
    </div>

    <!-- 星级评价系统 -->
    <div class="star-rating-system">
      <a-card title="星级评价标准" class="rating-card">
        <div class="rating-criteria">
          <div class="criteria-item">
            <div class="star-display">
              <Star class="w-5 h-5 filled" />
              <Star class="w-5 h-5 empty" />
              <Star class="w-5 h-5 empty" />
            </div>
            <div class="criteria-text">
              <strong>1星：</strong>完成关卡（60-79分）
            </div>
          </div>
          
          <div class="criteria-item">
            <div class="star-display">
              <Star class="w-5 h-5 filled" />
              <Star class="w-5 h-5 filled" />
              <Star class="w-5 h-5 empty" />
            </div>
            <div class="criteria-text">
              <strong>2星：</strong>良好表现（80-89分）
            </div>
          </div>
          
          <div class="criteria-item">
            <div class="star-display">
              <Star class="w-5 h-5 filled" />
              <Star class="w-5 h-5 filled" />
              <Star class="w-5 h-5 filled" />
            </div>
            <div class="criteria-text">
              <strong>3星：</strong>完美表现（90-100分）
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 解锁条件说明 -->
    <div class="unlock-conditions">
      <a-card title="解锁条件" class="conditions-card">
        <div class="condition-list">
          <div v-for="condition in unlockConditions" :key="condition.id" class="condition-item">
            <div class="condition-icon">
              <component :is="condition.icon" class="w-5 h-5" :class="{ 'text-green-500': condition.met, 'text-gray-400': !condition.met }" />
            </div>
            <div class="condition-text">
              <span :class="{ 'text-green-600': condition.met, 'text-gray-600': !condition.met }">
                {{ condition.description }}
              </span>
            </div>
            <div class="condition-status">
              <CheckCircle v-if="condition.met" class="w-4 h-4 text-green-500" />
              <Circle v-else class="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  Trophy,
  Play,
  Lock,
  Star,
  Zap,
  Award,
  RotateCcw,
  CheckCircle,
  Circle,
  Target,
  BookOpen,
  Headphones,
  MessageSquare,
  PenTool
} from 'lucide-vue-next'

interface Level {
  id: number
  name: string
  description: string
  status: 'locked' | 'current' | 'completed'
  progress: number
  score: number
  maxScore: number
  stars: number
  difficulty: 'easy' | 'medium' | 'hard'
  objectives: string[]
  rewards: {
    exp: number
    badge?: string
  }
  unlockConditions: string[]
}

interface UnlockCondition {
  id: string
  description: string
  icon: any
  met: boolean
}

const router = useRouter()

// 响应式数据
const currentLevel = ref<Level | null>(null)

// 关卡数据
const levels = ref<Level[]>([
  {
    id: 1,
    name: '字母认知',
    description: '学习26个英文字母的发音和书写',
    status: 'completed',
    progress: 100,
    score: 95,
    maxScore: 100,
    stars: 3,
    difficulty: 'easy',
    objectives: ['认识所有字母', '掌握字母发音', '学会字母书写'],
    rewards: { exp: 100, badge: '字母大师' },
    unlockConditions: []
  },
  {
    id: 2,
    name: '基础词汇',
    description: '学习常用的基础英语单词',
    status: 'completed',
    progress: 100,
    score: 88,
    maxScore: 100,
    stars: 2,
    difficulty: 'easy',
    objectives: ['学会50个基础单词', '掌握单词发音', '理解单词含义'],
    rewards: { exp: 150, badge: '词汇新手' },
    unlockConditions: ['完成字母认知关卡']
  },
  {
    id: 3,
    name: '简单对话',
    description: '学习基本的英语对话表达',
    status: 'current',
    progress: 65,
    score: 65,
    maxScore: 100,
    stars: 1,
    difficulty: 'medium',
    objectives: ['学会基本问候语', '掌握自我介绍', '进行简单对话'],
    rewards: { exp: 200, badge: '对话达人' },
    unlockConditions: ['完成基础词汇关卡']
  },
  {
    id: 4,
    name: '语法入门',
    description: '学习基础的英语语法规则',
    status: 'locked',
    progress: 0,
    score: 0,
    maxScore: 100,
    stars: 0,
    difficulty: 'medium',
    objectives: ['理解基本语法', '掌握句型结构', '正确使用语法'],
    rewards: { exp: 250, badge: '语法专家' },
    unlockConditions: ['完成简单对话关卡', '获得至少2颗星']
  },
  {
    id: 5,
    name: '听力训练',
    description: '提高英语听力理解能力',
    status: 'locked',
    progress: 0,
    score: 0,
    maxScore: 100,
    stars: 0,
    difficulty: 'hard',
    objectives: ['听懂基本对话', '理解听力内容', '提高听力速度'],
    rewards: { exp: 300, badge: '听力高手' },
    unlockConditions: ['完成语法入门关卡', '总分达到400分']
  }
])

// 解锁条件
const unlockConditions = ref<UnlockCondition[]>([
  {
    id: 'complete_previous',
    description: '完成前一关卡',
    icon: CheckCircle,
    met: true
  },
  {
    id: 'min_stars',
    description: '获得至少2颗星',
    icon: Star,
    met: false
  },
  {
    id: 'total_score',
    description: '总分达到400分',
    icon: Target,
    met: false
  }
])

// 计算属性
const totalStars = computed(() => {
  return levels.value.reduce((total, level) => total + level.stars, 0)
})

const totalScore = computed(() => {
  return levels.value.reduce((total, level) => total + level.score, 0)
})

// 方法
const handleLevelClick = (level: Level) => {
  if (level.status === 'locked') {
    message.warning('该关卡尚未解锁')
    return
  }
  
  currentLevel.value = level
}

const getLevelColor = (status: string): string => {
  switch (status) {
    case 'completed': return '#52c41a'
    case 'current': return '#1890ff'
    case 'locked': return '#d9d9d9'
    default: return '#d9d9d9'
  }
}

const getLevelIcon = (status: string) => {
  switch (status) {
    case 'completed': return Trophy
    case 'current': return Play
    case 'locked': return Lock
    default: return Lock
  }
}

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'green'
    case 'medium': return 'orange'
    case 'hard': return 'red'
    default: return 'default'
  }
}

const getDifficultyText = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return '简单'
    case 'medium': return '中等'
    case 'hard': return '困难'
    default: return '未知'
  }
}

const startLevel = (level: Level) => {
  message.success(`开始学习：${level.name}`)
  router.push(`/games?level=${level.id}`)
}

const reviewLevel = (level: Level) => {
  message.info(`复习关卡：${level.name}`)
  router.push(`/games?level=${level.id}&mode=review`)
}

const calculateStars = (score: number): number => {
  if (score >= 90) return 3
  if (score >= 80) return 2
  if (score >= 60) return 1
  return 0
}

const checkUnlockConditions = () => {
  // 检查解锁条件
  const completedLevels = levels.value.filter(l => l.status === 'completed')
  const totalStarsEarned = totalStars.value
  const totalScoreEarned = totalScore.value
  
  unlockConditions.value.forEach(condition => {
    switch (condition.id) {
      case 'complete_previous':
        condition.met = completedLevels.length >= 2
        break
      case 'min_stars':
        condition.met = totalStarsEarned >= 5
        break
      case 'total_score':
        condition.met = totalScoreEarned >= 400
        break
    }
  })
}

// 生命周期
onMounted(() => {
  currentLevel.value = levels.value.find(l => l.status === 'current') || levels.value[0]
  checkUnlockConditions()
})

// 暴露方法给父组件
defineExpose({
  updateLevelProgress: (levelId: number, score: number) => {
    const level = levels.value.find(l => l.id === levelId)
    if (level) {
      level.score = score
      level.stars = calculateStars(score)
      level.status = 'completed'
      level.progress = 100
      
      // 解锁下一关
      const nextLevel = levels.value.find(l => l.id === levelId + 1)
      if (nextLevel && nextLevel.status === 'locked') {
        nextLevel.status = 'current'
      }
      
      checkUnlockConditions()
    }
  }
})
</script>

<style scoped lang="less">
.level-system {
  .section-title {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 16px;
  }

  .level-map-container {
    margin-bottom: 24px;

    .level-map {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 24px;
      position: relative;
      overflow-x: auto;

      .level-path {
        display: flex;
        align-items: center;
        gap: 40px;
        min-width: max-content;
        padding: 20px 0;

        .level-node {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-4px);
          }

          &.completed {
            .level-icon-container .level-icon {
              background: #52c41a;
              color: white;
              box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
            }
          }

          &.current {
            .level-icon-container .level-icon {
              background: #1890ff;
              color: white;
              box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
              animation: pulse 2s infinite;
            }
          }

          &.locked {
            .level-icon-container .level-icon {
              background: #d9d9d9;
              color: #8c8c8c;
            }
            cursor: not-allowed;
          }

          &.perfect {
            .level-icon-container::after {
              content: '✨';
              position: absolute;
              top: -8px;
              right: -8px;
              font-size: 16px;
            }
          }

          .level-connector {
            position: absolute;
            left: -40px;
            top: 50%;
            width: 40px;
            height: 3px;
            background: #d9d9d9;
            transform: translateY(-50%);

            &.active {
              background: #52c41a;
            }
          }

          .level-icon-container {
            position: relative;
            margin-bottom: 12px;

            .level-icon {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
              border: 3px solid #e5e7eb;
              transition: all 0.3s ease;
            }

            .level-stars {
              position: absolute;
              bottom: -8px;
              left: 50%;
              transform: translateX(-50%);
              display: flex;
              gap: 2px;
              background: rgba(255, 255, 255, 0.9);
              padding: 2px 6px;
              border-radius: 12px;

              .filled {
                color: #fadb14;
              }

              .empty {
                color: #d9d9d9;
              }
            }
          }

          .level-info {
            text-align: center;
            color: white;

            .level-name {
              font-weight: 600;
              margin-bottom: 4px;
            }

            .level-number {
              font-size: 12px;
              opacity: 0.8;
              margin-bottom: 8px;
            }

            .level-progress {
              width: 80px;
              margin-bottom: 4px;

              .progress-text {
                font-size: 12px;
                margin-top: 4px;
              }
            }

            .level-score {
              font-size: 14px;
              font-weight: 600;
            }
          }
        }
      }
    }
  }

  .current-level-detail {
    margin-bottom: 24px;

    .level-detail-card {
      .level-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .level-title {
          display: flex;
          align-items: center;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }
      }

      .level-content {
        margin-bottom: 24px;

        .level-description {
          color: #6b7280;
          margin-bottom: 16px;
        }

        .level-objectives {
          margin-bottom: 16px;

          h5 {
            font-weight: 600;
            margin-bottom: 8px;
            color: #374151;
          }

          ul {
            margin: 0;
            padding-left: 20px;

            li {
              color: #6b7280;
              margin-bottom: 4px;
            }
          }
        }

        .level-rewards {
          h5 {
            font-weight: 600;
            margin-bottom: 8px;
            color: #374151;
          }

          .reward-list {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;

            .reward-item {
              display: flex;
              align-items: center;
              background: #f3f4f6;
              padding: 6px 12px;
              border-radius: 8px;
              font-size: 14px;
              color: #374151;
            }
          }
        }
      }

      .level-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .star-rating-system {
    margin-bottom: 24px;

    .rating-card {
      .rating-criteria {
        .criteria-item {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;

          .star-display {
            display: flex;
            gap: 4px;

            .filled {
              color: #fadb14;
            }

            .empty {
              color: #d9d9d9;
            }
          }

          .criteria-text {
            color: #374151;
          }
        }
      }
    }
  }

  .unlock-conditions {
    .conditions-card {
      .condition-list {
        .condition-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .condition-icon {
            flex-shrink: 0;
          }

          .condition-text {
            flex: 1;
          }

          .condition-status {
            flex-shrink: 0;
          }
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>