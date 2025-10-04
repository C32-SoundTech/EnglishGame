<template>
  <div class="recommendation-system">
    <!-- 智能推荐概览 -->
    <div class="recommendation-overview">
      <a-card class="overview-card">
        <div class="overview-header">
          <div class="header-info">
            <h3 class="section-title">
              <Brain class="w-6 h-6 mr-2" />
              智能学习推荐
            </h3>
            <p class="section-desc">基于你的学习数据和评估结果，为你量身定制学习计划</p>
          </div>
          <div class="header-actions">
            <a-button @click="refreshRecommendations">
              <RefreshCw class="w-4 h-4 mr-1" />
              刷新推荐
            </a-button>
          </div>
        </div>
        
        <div class="recommendation-stats">
          <a-row :gutter="16">
            <a-col :span="6" v-for="stat in recommendationStats" :key="stat.key">
              <div class="stat-item">
                <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
                  <component :is="stat.icon" class="w-5 h-5" />
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
      </a-card>
    </div>

    <!-- 个性化推荐 -->
    <div class="personalized-recommendations">
      <a-card title="个性化推荐" class="recommendations-card">
        <template #extra>
          <a-select 
            v-model:value="selectedRecommendationType" 
            style="width: 150px"
            @change="handleRecommendationTypeChange"
          >
            <a-select-option value="all">全部推荐</a-select-option>
            <a-select-option value="weakness">弱项提升</a-select-option>
            <a-select-option value="strength">优势巩固</a-select-option>
            <a-select-option value="balanced">均衡发展</a-select-option>
          </a-select>
        </template>
        
        <div class="recommendations-grid">
          <div 
            v-for="recommendation in filteredRecommendations" 
            :key="recommendation.id"
            class="recommendation-card"
            :class="recommendation.priority"
          >
            <div class="card-header">
              <div class="recommendation-icon" :style="{ backgroundColor: recommendation.color + '20', color: recommendation.color }">
                <component :is="recommendation.icon" class="w-6 h-6" />
              </div>
              <div class="recommendation-info">
                <h4 class="recommendation-title">{{ recommendation.title }}</h4>
                <div class="recommendation-meta">
                  <a-tag :color="getPriorityColor(recommendation.priority)">
                    {{ getPriorityText(recommendation.priority) }}
                  </a-tag>
                  <span class="recommendation-type">{{ getTypeText(recommendation.type) }}</span>
                </div>
              </div>
              <div class="recommendation-score">
                <a-tooltip :title="`匹配度：${recommendation.matchScore}%`">
                  <div class="score-circle" :style="{ background: `conic-gradient(${recommendation.color} ${recommendation.matchScore * 3.6}deg, #f0f0f0 0deg)` }">
                    <span class="score-text">{{ recommendation.matchScore }}%</span>
                  </div>
                </a-tooltip>
              </div>
            </div>
            
            <div class="card-content">
              <p class="recommendation-description">{{ recommendation.description }}</p>
              
              <div class="recommendation-details">
                <div class="detail-item">
                  <Clock class="w-4 h-4 mr-1" />
                  <span>预计时长：{{ recommendation.estimatedTime }}</span>
                </div>
                <div class="detail-item">
                  <Target class="w-4 h-4 mr-1" />
                  <span>难度：{{ getDifficultyText(recommendation.difficulty) }}</span>
                </div>
                <div class="detail-item">
                  <TrendingUp class="w-4 h-4 mr-1" />
                  <span>预期提升：{{ recommendation.expectedImprovement }}%</span>
                </div>
              </div>
              
              <div class="recommendation-skills">
                <span class="skills-label">涉及技能：</span>
                <div class="skills-tags">
                  <a-tag 
                    v-for="skill in recommendation.skills" 
                    :key="skill"
                    size="small"
                    :color="getSkillColor(skill)"
                  >
                    {{ getSkillText(skill) }}
                  </a-tag>
                </div>
              </div>
            </div>
            
            <div class="card-actions">
              <a-button 
                type="primary" 
                @click="startRecommendedLearning(recommendation)"
                :loading="recommendation.loading"
              >
                <Play class="w-4 h-4 mr-1" />
                开始学习
              </a-button>
              <a-button @click="viewRecommendationDetail(recommendation)">
                <Eye class="w-4 h-4 mr-1" />
                查看详情
              </a-button>
              <a-button @click="dismissRecommendation(recommendation.id)">
                <X class="w-4 h-4 mr-1" />
                忽略
              </a-button>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 学习路径推荐 -->
    <div class="learning-path">
      <a-card title="推荐学习路径" class="path-card">
        <div class="path-container">
          <div 
            v-for="(path, index) in learningPaths" 
            :key="path.id"
            class="path-item"
            :class="{ 'active': selectedPath === path.id }"
            @click="selectLearningPath(path.id)"
          >
            <div class="path-header">
              <div class="path-icon" :style="{ backgroundColor: path.color + '20', color: path.color }">
                <component :is="path.icon" class="w-5 h-5" />
              </div>
              <div class="path-info">
                <h4 class="path-title">{{ path.title }}</h4>
                <p class="path-description">{{ path.description }}</p>
              </div>
              <div class="path-meta">
                <div class="path-duration">{{ path.duration }}</div>
                <div class="path-difficulty">{{ getDifficultyText(path.difficulty) }}</div>
              </div>
            </div>
            
            <div class="path-progress">
              <a-progress 
                :percent="path.progress" 
                :stroke-color="path.color"
                size="small"
              />
              <span class="progress-text">{{ path.completedSteps }}/{{ path.totalSteps }} 步骤</span>
            </div>
            
            <div class="path-steps">
              <div 
                v-for="(step, stepIndex) in path.steps.slice(0, 3)" 
                :key="step.id"
                class="step-item"
                :class="{ 'completed': step.completed, 'current': step.current }"
              >
                <div class="step-number">{{ stepIndex + 1 }}</div>
                <div class="step-content">
                  <span class="step-title">{{ step.title }}</span>
                  <span class="step-type">{{ step.type }}</span>
                </div>
                <div class="step-status">
                  <CheckCircle v-if="step.completed" class="w-4 h-4 text-green-500" />
                  <Play v-else-if="step.current" class="w-4 h-4 text-blue-500" />
                  <Circle v-else class="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div v-if="path.steps.length > 3" class="more-steps">
                还有 {{ path.steps.length - 3 }} 个步骤...
              </div>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 推荐详情模态框 -->
    <a-modal 
      v-model:open="showRecommendationDetail" 
      :title="selectedRecommendation?.title" 
      width="800px"
      :footer="null"
    >
      <div v-if="selectedRecommendation" class="recommendation-detail">
        <div class="detail-header">
          <div class="detail-icon" :style="{ backgroundColor: selectedRecommendation.color + '20', color: selectedRecommendation.color }">
            <component :is="selectedRecommendation.icon" class="w-8 h-8" />
          </div>
          <div class="detail-info">
            <h3>{{ selectedRecommendation.title }}</h3>
            <p>{{ selectedRecommendation.description }}</p>
          </div>
        </div>
        
        <div class="detail-content">
          <a-tabs>
            <a-tab-pane key="overview" tab="概览">
              <div class="overview-content">
                <div class="content-section">
                  <h4>学习目标</h4>
                  <ul>
                    <li v-for="objective in selectedRecommendation.objectives" :key="objective">
                      {{ objective }}
                    </li>
                  </ul>
                </div>
                
                <div class="content-section">
                  <h4>学习内容</h4>
                  <div class="content-list">
                    <div 
                      v-for="content in selectedRecommendation.contents" 
                      :key="content.id"
                      class="content-item"
                    >
                      <div class="content-icon">
                        <component :is="content.icon" class="w-4 h-4" />
                      </div>
                      <div class="content-info">
                        <span class="content-title">{{ content.title }}</span>
                        <span class="content-duration">{{ content.duration }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a-tab-pane>
            
            <a-tab-pane key="analysis" tab="分析报告">
              <div class="analysis-content">
                <div class="analysis-section">
                  <h4>推荐理由</h4>
                  <div class="reason-list">
                    <div 
                      v-for="reason in selectedRecommendation.reasons" 
                      :key="reason.type"
                      class="reason-item"
                    >
                      <div class="reason-icon">
                        <component :is="reason.icon" class="w-4 h-4" />
                      </div>
                      <div class="reason-content">
                        <span class="reason-title">{{ reason.title }}</span>
                        <span class="reason-description">{{ reason.description }}</span>
                      </div>
                      <div class="reason-weight">
                        权重：{{ reason.weight }}%
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="analysis-section">
                  <h4>预期效果</h4>
                  <div class="effect-chart">
                    <div 
                      v-for="effect in selectedRecommendation.expectedEffects" 
                      :key="effect.skill"
                      class="effect-item"
                    >
                      <span class="effect-skill">{{ effect.skill }}</span>
                      <div class="effect-progress">
                        <a-progress 
                          :percent="effect.improvement" 
                          :stroke-color="getSkillColor(effect.skill)"
                          size="small"
                        />
                      </div>
                      <span class="effect-value">+{{ effect.improvement }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
        
        <div class="detail-actions">
          <a-button 
            type="primary" 
            size="large"
            @click="startRecommendedLearning(selectedRecommendation)"
          >
            <Play class="w-4 h-4 mr-1" />
            开始学习
          </a-button>
          <a-button size="large" @click="addToLearningPlan(selectedRecommendation)">
            <Plus class="w-4 h-4 mr-1" />
            加入学习计划
          </a-button>
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
  Brain,
  RefreshCw,
  Clock,
  Target,
  TrendingUp,
  Play,
  Eye,
  X,
  CheckCircle,
  Circle,
  Plus,
  BookOpen,
  Headphones,
  MessageSquare,
  PenTool,
  Zap,
  Award,
  Users,
  Gamepad2,
  FileText,
  Video,
  Music,
  Image,
  AlertTriangle,
  Star,
  ThumbsUp
} from 'lucide-vue-next'

interface Recommendation {
  id: string
  title: string
  description: string
  type: 'weakness' | 'strength' | 'balanced' | 'new'
  priority: 'high' | 'medium' | 'low'
  matchScore: number
  estimatedTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  expectedImprovement: number
  skills: string[]
  icon: any
  color: string
  loading?: boolean
  objectives: string[]
  contents: Array<{
    id: string
    title: string
    duration: string
    icon: any
  }>
  reasons: Array<{
    type: string
    title: string
    description: string
    weight: number
    icon: any
  }>
  expectedEffects: Array<{
    skill: string
    improvement: number
  }>
}

interface LearningPath {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'easy' | 'medium' | 'hard'
  progress: number
  completedSteps: number
  totalSteps: number
  color: string
  icon: any
  steps: Array<{
    id: string
    title: string
    type: string
    completed: boolean
    current: boolean
  }>
}

const router = useRouter()

// 响应式数据
const selectedRecommendationType = ref('all')
const selectedPath = ref('')
const showRecommendationDetail = ref(false)
const selectedRecommendation = ref<Recommendation | null>(null)

// 推荐统计数据
const recommendationStats = ref([
  {
    key: 'totalRecommendations',
    label: '推荐内容',
    value: '12',
    icon: Brain,
    color: '#1890ff'
  },
  {
    key: 'matchRate',
    label: '匹配度',
    value: '92%',
    icon: Target,
    color: '#52c41a'
  },
  {
    key: 'completedRecommendations',
    label: '已完成',
    value: '8',
    icon: CheckCircle,
    color: '#722ed1'
  },
  {
    key: 'averageImprovement',
    label: '平均提升',
    value: '15%',
    icon: TrendingUp,
    color: '#fa8c16'
  }
])

// 推荐内容
const recommendations = ref<Recommendation[]>([
  {
    id: '1',
    title: '口语表达强化训练',
    description: '基于你的评估结果，口语是需要重点提升的技能。通过情景对话和发音练习来提高口语流利度。',
    type: 'weakness',
    priority: 'high',
    matchScore: 95,
    estimatedTime: '2-3周',
    difficulty: 'medium',
    expectedImprovement: 25,
    skills: ['speaking', 'pronunciation'],
    icon: MessageSquare,
    color: '#ff4d4f',
    objectives: [
      '提高口语流利度和准确性',
      '掌握日常对话表达',
      '改善发音和语调',
      '增强口语自信心'
    ],
    contents: [
      { id: '1', title: '日常对话练习', duration: '30分钟', icon: MessageSquare },
      { id: '2', title: '发音纠正训练', duration: '20分钟', icon: Music },
      { id: '3', title: '情景模拟对话', duration: '25分钟', icon: Users },
      { id: '4', title: '口语测试评估', duration: '15分钟', icon: FileText }
    ],
    reasons: [
      {
        type: 'weakness',
        title: '技能薄弱',
        description: '口语评估分数较低，需要重点提升',
        weight: 40,
        icon: AlertTriangle
      },
      {
        type: 'frequency',
        title: '使用频率',
        description: '口语练习频率较低，需要增加练习',
        weight: 30,
        icon: Clock
      },
      {
        type: 'potential',
        title: '提升潜力',
        description: '基础较好，有很大提升空间',
        weight: 30,
        icon: TrendingUp
      }
    ],
    expectedEffects: [
      { skill: '口语表达', improvement: 25 },
      { skill: '发音准确性', improvement: 20 },
      { skill: '对话流利度', improvement: 30 }
    ]
  },
  {
    id: '2',
    title: '词汇量扩展计划',
    description: '你的词汇基础很好，建议继续扩展高级词汇，提升语言表达的丰富性和准确性。',
    type: 'strength',
    priority: 'medium',
    matchScore: 88,
    estimatedTime: '4-6周',
    difficulty: 'medium',
    expectedImprovement: 20,
    skills: ['vocabulary', 'reading'],
    icon: BookOpen,
    color: '#1890ff',
    objectives: [
      '掌握1000个高级词汇',
      '提高词汇运用能力',
      '增强阅读理解能力',
      '丰富写作表达'
    ],
    contents: [
      { id: '1', title: '高频词汇学习', duration: '25分钟', icon: BookOpen },
      { id: '2', title: '词汇运用练习', duration: '20分钟', icon: PenTool },
      { id: '3', title: '阅读理解训练', duration: '30分钟', icon: FileText },
      { id: '4', title: '词汇测试', duration: '15分钟', icon: Target }
    ],
    reasons: [
      {
        type: 'strength',
        title: '优势巩固',
        description: '词汇基础较好，适合进一步提升',
        weight: 50,
        icon: Star
      },
      {
        type: 'progression',
        title: '学习进度',
        description: '当前学习进度适合挑战更高难度',
        weight: 30,
        icon: TrendingUp
      },
      {
        type: 'interest',
        title: '学习兴趣',
        description: '在词汇学习方面表现出较高兴趣',
        weight: 20,
        icon: ThumbsUp
      }
    ],
    expectedEffects: [
      { skill: '词汇量', improvement: 20 },
      { skill: '阅读理解', improvement: 15 },
      { skill: '写作表达', improvement: 18 }
    ]
  },
  {
    id: '3',
    title: '听力理解提升',
    description: '通过多样化的听力材料和练习，提高听力理解能力和反应速度。',
    type: 'balanced',
    priority: 'medium',
    matchScore: 82,
    estimatedTime: '3-4周',
    difficulty: 'medium',
    expectedImprovement: 18,
    skills: ['listening', 'comprehension'],
    icon: Headphones,
    color: '#52c41a',
    objectives: [
      '提高听力理解准确率',
      '增强听力反应速度',
      '适应不同口音和语速',
      '掌握听力技巧'
    ],
    contents: [
      { id: '1', title: '基础听力练习', duration: '20分钟', icon: Headphones },
      { id: '2', title: '对话理解训练', duration: '25分钟', icon: MessageSquare },
      { id: '3', title: '新闻听力练习', duration: '30分钟', icon: Video },
      { id: '4', title: '听力测试', duration: '20分钟', icon: FileText }
    ],
    reasons: [
      {
        type: 'balance',
        title: '均衡发展',
        description: '听力技能需要与其他技能保持平衡',
        weight: 40,
        icon: Target
      },
      {
        type: 'foundation',
        title: '基础重要',
        description: '听力是语言学习的重要基础',
        weight: 35,
        icon: BookOpen
      },
      {
        type: 'practical',
        title: '实用性强',
        description: '听力技能在实际交流中非常重要',
        weight: 25,
        icon: Users
      }
    ],
    expectedEffects: [
      { skill: '听力理解', improvement: 18 },
      { skill: '反应速度', improvement: 15 },
      { skill: '语音识别', improvement: 20 }
    ]
  },
  {
    id: '4',
    title: '游戏化学习体验',
    description: '通过趣味游戏的方式学习英语，提高学习兴趣和参与度。',
    type: 'new',
    priority: 'low',
    matchScore: 75,
    estimatedTime: '持续进行',
    difficulty: 'easy',
    expectedImprovement: 12,
    skills: ['vocabulary', 'grammar', 'listening'],
    icon: Gamepad2,
    color: '#722ed1',
    objectives: [
      '通过游戏提高学习兴趣',
      '在娱乐中掌握知识点',
      '培养持续学习习惯',
      '增强学习动机'
    ],
    contents: [
      { id: '1', title: '单词拼写游戏', duration: '15分钟', icon: Gamepad2 },
      { id: '2', title: '语法选择游戏', duration: '20分钟', icon: Target },
      { id: '3', title: '听力反应游戏', duration: '18分钟', icon: Headphones },
      { id: '4', title: '综合挑战赛', duration: '25分钟', icon: Award }
    ],
    reasons: [
      {
        type: 'engagement',
        title: '提高参与度',
        description: '游戏化学习能提高学习参与度',
        weight: 40,
        icon: Gamepad2
      },
      {
        type: 'motivation',
        title: '增强动机',
        description: '趣味性学习能增强学习动机',
        weight: 35,
        icon: Star
      },
      {
        type: 'retention',
        title: '知识保持',
        description: '游戏化学习有助于知识记忆',
        weight: 25,
        icon: Brain
      }
    ],
    expectedEffects: [
      { skill: '学习兴趣', improvement: 30 },
      { skill: '知识记忆', improvement: 15 },
      { skill: '学习持续性', improvement: 25 }
    ]
  }
])

// 学习路径
const learningPaths = ref<LearningPath[]>([
  {
    id: '1',
    title: '基础英语全面提升',
    description: '适合初学者的全面英语学习路径',
    duration: '8-12周',
    difficulty: 'easy',
    progress: 35,
    completedSteps: 3,
    totalSteps: 8,
    color: '#1890ff',
    icon: BookOpen,
    steps: [
      { id: '1', title: '字母和发音', type: '基础课程', completed: true, current: false },
      { id: '2', title: '基础词汇', type: '词汇学习', completed: true, current: false },
      { id: '3', title: '简单句型', type: '语法学习', completed: true, current: false },
      { id: '4', title: '日常对话', type: '口语练习', completed: false, current: true },
      { id: '5', title: '听力训练', type: '听力练习', completed: false, current: false },
      { id: '6', title: '阅读理解', type: '阅读练习', completed: false, current: false },
      { id: '7', title: '写作入门', type: '写作练习', completed: false, current: false },
      { id: '8', title: '综合测试', type: '能力评估', completed: false, current: false }
    ]
  },
  {
    id: '2',
    title: '口语专项突破',
    description: '专注提升口语表达能力的学习路径',
    duration: '6-8周',
    difficulty: 'medium',
    progress: 20,
    completedSteps: 1,
    totalSteps: 6,
    color: '#ff4d4f',
    icon: MessageSquare,
    steps: [
      { id: '1', title: '发音基础', type: '发音练习', completed: true, current: false },
      { id: '2', title: '日常对话', type: '对话练习', completed: false, current: true },
      { id: '3', title: '情景模拟', type: '实战练习', completed: false, current: false },
      { id: '4', title: '演讲技巧', type: '高级练习', completed: false, current: false },
      { id: '5', title: '辩论训练', type: '思维练习', completed: false, current: false },
      { id: '6', title: '口语测试', type: '能力评估', completed: false, current: false }
    ]
  },
  {
    id: '3',
    title: '词汇量快速扩展',
    description: '系统性扩展词汇量的高效学习路径',
    duration: '10-14周',
    difficulty: 'medium',
    progress: 60,
    completedSteps: 4,
    totalSteps: 7,
    color: '#52c41a',
    icon: Zap,
    steps: [
      { id: '1', title: '高频词汇', type: '词汇学习', completed: true, current: false },
      { id: '2', title: '主题词汇', type: '分类学习', completed: true, current: false },
      { id: '3', title: '词根词缀', type: '构词法', completed: true, current: false },
      { id: '4', title: '同义反义', type: '词汇关系', completed: true, current: false },
      { id: '5', title: '语境运用', type: '实际应用', completed: false, current: true },
      { id: '6', title: '高级词汇', type: '进阶学习', completed: false, current: false },
      { id: '7', title: '词汇测试', type: '能力评估', completed: false, current: false }
    ]
  }
])

// 计算属性
const filteredRecommendations = computed(() => {
  if (selectedRecommendationType.value === 'all') {
    return recommendations.value
  }
  return recommendations.value.filter(rec => rec.type === selectedRecommendationType.value)
})

// 方法
const refreshRecommendations = () => {
  message.success('推荐内容已刷新')
  // 重新生成推荐
}

const handleRecommendationTypeChange = (value: string) => {
  message.info(`切换到${getTypeText(value)}推荐`)
}

const startRecommendedLearning = (recommendation: Recommendation) => {
  recommendation.loading = true
  
  setTimeout(() => {
    recommendation.loading = false
    message.success(`开始学习：${recommendation.title}`)
    router.push('/games')
  }, 1000)
}

const viewRecommendationDetail = (recommendation: Recommendation) => {
  selectedRecommendation.value = recommendation
  showRecommendationDetail.value = true
}

const dismissRecommendation = (id: string) => {
  const index = recommendations.value.findIndex(rec => rec.id === id)
  if (index > -1) {
    recommendations.value.splice(index, 1)
    message.info('推荐已忽略')
  }
}

const selectLearningPath = (pathId: string) => {
  selectedPath.value = pathId
  message.info('学习路径已选择')
}

const addToLearningPlan = (recommendation: Recommendation) => {
  message.success(`已将"${recommendation.title}"加入学习计划`)
  showRecommendationDetail.value = false
}

// 工具函数
const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    high: 'red',
    medium: 'orange',
    low: 'blue'
  }
  return colors[priority] || 'default'
}

const getPriorityText = (priority: string): string => {
  const texts: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return texts[priority] || priority
}

const getTypeText = (type: string): string => {
  const texts: Record<string, string> = {
    all: '全部',
    weakness: '弱项提升',
    strength: '优势巩固',
    balanced: '均衡发展',
    new: '新内容'
  }
  return texts[type] || type
}

const getDifficultyText = (difficulty: string): string => {
  const texts: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty] || difficulty
}

const getSkillColor = (skill: string): string => {
  const colors: Record<string, string> = {
    listening: 'blue',
    speaking: 'red',
    reading: 'green',
    writing: 'orange',
    vocabulary: 'purple',
    grammar: 'cyan',
    pronunciation: 'magenta'
  }
  return colors[skill] || 'default'
}

const getSkillText = (skill: string): string => {
  const texts: Record<string, string> = {
    listening: '听力',
    speaking: '口语',
    reading: '阅读',
    writing: '写作',
    vocabulary: '词汇',
    grammar: '语法',
    pronunciation: '发音',
    comprehension: '理解'
  }
  return texts[skill] || skill
}

// 生命周期
onMounted(() => {
  // 初始化推荐数据
})

// 暴露方法给父组件
defineExpose({
  refreshRecommendations,
  getRecommendations: () => recommendations.value
})
</script>

<style scoped lang="less">
.recommendation-system {
  .recommendation-overview {
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
      }

      .recommendation-stats {
        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #fafafa;
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover {
            background: #f0f0f0;
          }

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
    }
  }

  .personalized-recommendations {
    margin-bottom: 24px;

    .recommendations-card {
      .recommendations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 20px;

        .recommendation-card {
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;

          &:hover {
            border-color: #d9d9d9;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }

          &.high {
            border-left: 4px solid #ff4d4f;
          }

          &.medium {
            border-left: 4px solid #fa8c16;
          }

          &.low {
            border-left: 4px solid #1890ff;
          }

          .card-header {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 16px;

            .recommendation-icon {
              width: 48px;
              height: 48px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }

            .recommendation-info {
              flex: 1;

              .recommendation-title {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 8px 0;
              }

              .recommendation-meta {
                display: flex;
                align-items: center;
                gap: 12px;

                .recommendation-type {
                  font-size: 12px;
                  color: #6b7280;
                }
              }
            }

            .recommendation-score {
              .score-circle {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;

                .score-text {
                  font-size: 12px;
                  font-weight: 600;
                  color: #1f2937;
                }
              }
            }
          }

          .card-content {
            margin-bottom: 20px;

            .recommendation-description {
              color: #374151;
              line-height: 1.6;
              margin-bottom: 16px;
            }

            .recommendation-details {
              display: flex;
              flex-direction: column;
              gap: 8px;
              margin-bottom: 16px;

              .detail-item {
                display: flex;
                align-items: center;
                font-size: 14px;
                color: #6b7280;
              }
            }

            .recommendation-skills {
              .skills-label {
                font-size: 14px;
                color: #374151;
                margin-right: 8px;
              }

              .skills-tags {
                display: inline-flex;
                flex-wrap: wrap;
                gap: 4px;
              }
            }
          }

          .card-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
        }
      }
    }
  }

  .learning-path {
    .path-card {
      .path-container {
        display: grid;
        gap: 20px;

        .path-item {
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          padding: 20px;
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

          .path-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;

            .path-icon {
              width: 40px;
              height: 40px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }

            .path-info {
              flex: 1;

              .path-title {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 4px 0;
              }

              .path-description {
                font-size: 14px;
                color: #6b7280;
                margin: 0;
              }
            }

            .path-meta {
              text-align: right;

              .path-duration {
                font-size: 14px;
                font-weight: 500;
                color: #374151;
              }

              .path-difficulty {
                font-size: 12px;
                color: #6b7280;
              }
            }
          }

          .path-progress {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;

            .progress-text {
              font-size: 12px;
              color: #6b7280;
            }
          }

          .path-steps {
            .step-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 8px 0;
              border-bottom: 1px solid #f0f0f0;

              &:last-child {
                border-bottom: none;
              }

              &.completed {
                .step-number {
                  background: #52c41a;
                  color: white;
                }
              }

              &.current {
                .step-number {
                  background: #1890ff;
                  color: white;
                }
              }

              .step-number {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #f0f0f0;
                color: #8c8c8c;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
                flex-shrink: 0;
              }

              .step-content {
                flex: 1;

                .step-title {
                  font-size: 14px;
                  color: #374151;
                  margin-right: 8px;
                }

                .step-type {
                  font-size: 12px;
                  color: #8c8c8c;
                }
              }

              .step-status {
                flex-shrink: 0;
              }
            }

            .more-steps {
              text-align: center;
              font-size: 12px;
              color: #8c8c8c;
              padding: 8px 0;
            }
          }
        }
      }
    }
  }

  .recommendation-detail {
    .detail-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;

      .detail-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
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
          margin: 0;
          line-height: 1.5;
        }
      }
    }

    .detail-content {
      margin-bottom: 24px;

      .overview-content {
        .content-section {
          margin-bottom: 24px;

          h4 {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 12px;
          }

          ul {
            margin: 0;
            padding-left: 20px;

            li {
              color: #374151;
              margin-bottom: 8px;
              line-height: 1.5;
            }
          }

          .content-list {
            .content-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              border: 1px solid #f0f0f0;
              border-radius: 8px;
              margin-bottom: 8px;

              .content-icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }

              .content-info {
                flex: 1;

                .content-title {
                  font-weight: 500;
                  color: #374151;
                  margin-right: 12px;
                }

                .content-duration {
                  font-size: 12px;
                  color: #8c8c8c;
                }
              }
            }
          }
        }
      }

      .analysis-content {
        .analysis-section {
          margin-bottom: 24px;

          h4 {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 12px;
          }

          .reason-list {
            .reason-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              border: 1px solid #f0f0f0;
              border-radius: 8px;
              margin-bottom: 8px;

              .reason-icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }

              .reason-content {
                flex: 1;

                .reason-title {
                  font-weight: 500;
                  color: #374151;
                  display: block;
                  margin-bottom: 4px;
                }

                .reason-description {
                  font-size: 12px;
                  color: #8c8c8c;
                }
              }

              .reason-weight {
                font-size: 12px;
                color: #1890ff;
                font-weight: 500;
              }
            }
          }

          .effect-chart {
            .effect-item {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 12px;

              .effect-skill {
                width: 80px;
                font-size: 14px;
                color: #374151;
                flex-shrink: 0;
              }

              .effect-progress {
                flex: 1;
              }

              .effect-value {
                width: 40px;
                text-align: right;
                font-size: 14px;
                font-weight: 500;
                color: #52c41a;
                flex-shrink: 0;
              }
            }
          }
        }
      }
    }

    .detail-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }
  }
}
</style>