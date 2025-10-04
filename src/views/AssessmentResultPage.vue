<template>
  <MainLayout>
    <div class="assessment-result-page">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <FileBarChart class="w-6 h-6 mr-3" />
          评估报告
        </h1>
        <p class="page-subtitle">详细的能力分析和学习建议</p>
      </div>

      <!-- 总体结果卡片 -->
      <div class="overall-result">
        <div class="result-card">
          <div class="result-header">
            <div class="result-icon">
              <Trophy class="w-16 h-16 text-yellow-500" />
            </div>
            <div class="result-info">
              <h2 class="result-title">{{ assessmentResult.title }}</h2>
              <p class="result-date">测试时间：{{ formatDate(assessmentResult.completedAt) }}</p>
              <div class="result-score">
                <span class="score-number">{{ assessmentResult.totalScore }}</span>
                <span class="score-label">分</span>
              </div>
              <div class="result-level" :style="{ backgroundColor: getLevelColor(assessmentResult.level) }">
                {{ assessmentResult.level }}
              </div>
            </div>
          </div>
          <div class="result-summary">
            <p>{{ assessmentResult.summary }}</p>
          </div>
        </div>
      </div>

      <!-- 详细分析 -->
      <a-row :gutter="[24, 24]">
        <!-- 能力雷达图 -->
        <a-col :xs="24" :lg="12">
          <div class="chart-card">
            <h3 class="card-title">
              <Target class="w-5 h-5 mr-2" />
              能力分析雷达图
            </h3>
            <div class="radar-chart">
              <!-- 这里可以集成真实的雷达图组件 -->
              <div class="mock-radar">
                <div class="radar-center">
                  <div class="center-score">{{ assessmentResult.totalScore }}</div>
                  <div class="center-label">总分</div>
                </div>
                <div class="radar-skills">
                  <div
                    v-for="(skill, index) in assessmentResult.skillBreakdown"
                    :key="skill.name"
                    class="skill-point"
                    :style="getSkillPointStyle(skill.score, index)"
                  >
                    <div class="skill-dot"></div>
                    <div class="skill-label">{{ skill.name }}</div>
                    <div class="skill-score">{{ skill.score }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-col>

        <!-- 分项得分 -->
        <a-col :xs="24" :lg="12">
          <div class="breakdown-card">
            <h3 class="card-title">
              <BarChart3 class="w-5 h-5 mr-2" />
              分项得分
            </h3>
            <div class="skill-list">
              <div
                v-for="skill in assessmentResult.skillBreakdown"
                :key="skill.name"
                class="skill-item"
              >
                <div class="skill-header">
                  <div class="skill-info">
                    <component :is="skill.icon" class="w-5 h-5 mr-2" />
                    <span class="skill-name">{{ skill.name }}</span>
                  </div>
                  <div class="skill-score-display">
                    <span class="score">{{ skill.score }}%</span>
                    <span class="level" :class="getSkillLevelClass(skill.score)">
                      {{ getSkillLevel(skill.score) }}
                    </span>
                  </div>
                </div>
                <div class="skill-progress">
                  <a-progress
                    :percent="skill.score"
                    :show-info="false"
                    :stroke-color="getSkillColor(skill.score)"
                  />
                </div>
                <div class="skill-desc">{{ skill.description }}</div>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- 错题分析 -->
      <div class="mistakes-analysis">
        <h3 class="section-title">
          <AlertCircle class="w-5 h-5 mr-2" />
          错题分析
        </h3>
        <div class="mistakes-grid">
          <div
            v-for="mistake in assessmentResult.mistakes"
            :key="mistake.id"
            class="mistake-card"
          >
            <div class="mistake-header">
              <div class="mistake-type">{{ mistake.type }}</div>
              <div class="mistake-difficulty" :class="getDifficultyClass(mistake.difficulty)">
                {{ mistake.difficulty }}
              </div>
            </div>
            <div class="mistake-content">
              <h4 class="mistake-question">{{ mistake.question }}</h4>
              <div class="mistake-answers">
                <div class="answer-item wrong">
                  <span class="answer-label">你的答案：</span>
                  <span class="answer-text">{{ mistake.userAnswer }}</span>
                </div>
                <div class="answer-item correct">
                  <span class="answer-label">正确答案：</span>
                  <span class="answer-text">{{ mistake.correctAnswer }}</span>
                </div>
              </div>
              <div class="mistake-explanation">
                <h5>解析：</h5>
                <p>{{ mistake.explanation }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习建议 -->
      <div class="recommendations">
        <h3 class="section-title">
          <Lightbulb class="w-5 h-5 mr-2" />
          个性化学习建议
        </h3>
        <a-row :gutter="[24, 24]">
          <a-col :xs="24" :md="12" :lg="8" v-for="recommendation in assessmentResult.recommendations" :key="recommendation.id">
            <div class="recommendation-card">
              <div class="recommendation-header">
                <div class="recommendation-icon">
                  <component :is="recommendation.icon" class="w-8 h-8" />
                </div>
                <div class="recommendation-priority" :class="getPriorityClass(recommendation.priority)">
                  {{ recommendation.priority }}
                </div>
              </div>
              <div class="recommendation-content">
                <h4 class="recommendation-title">{{ recommendation.title }}</h4>
                <p class="recommendation-desc">{{ recommendation.description }}</p>
                <div class="recommendation-actions">
                  <a-button type="primary" size="small" @click="startLearning(recommendation)">
                    开始学习
                  </a-button>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 历史对比 -->
      <div class="history-comparison" v-if="assessmentResult.previousResults.length > 0">
        <h3 class="section-title">
          <TrendingUp class="w-5 h-5 mr-2" />
          进步趋势
        </h3>
        <div class="comparison-chart">
          <div class="chart-container">
            <!-- 这里可以集成真实的图表组件 -->
            <div class="mock-line-chart">
              <div class="chart-lines">
                <div
                  v-for="(result, index) in [...assessmentResult.previousResults, assessmentResult]"
                  :key="index"
                  class="chart-point"
                  :style="{ left: `${(index / (assessmentResult.previousResults.length)) * 100}%`, bottom: `${result.totalScore}%` }"
                >
                  <div class="point-dot"></div>
                  <div class="point-label">{{ result.totalScore }}</div>
                </div>
              </div>
              <div class="chart-axis">
                <div
                  v-for="(result, index) in [...assessmentResult.previousResults, assessmentResult]"
                  :key="index"
                  class="axis-label"
                >
                  {{ formatShortDate(result.completedAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="result-actions">
        <a-space size="large">
          <a-button size="large" @click="retakeAssessment">
            <RotateCcw class="w-4 h-4 mr-1" />
            重新测试
          </a-button>
          <a-button type="primary" size="large" @click="startLearning">
            <Gamepad2 class="w-4 h-4 mr-1" />
            开始学习
          </a-button>
          <a-button size="large" @click="downloadReport">
            <Download class="w-4 h-4 mr-1" />
            下载报告
          </a-button>
          <a-button size="large" @click="shareResult">
            <Share2 class="w-4 h-4 mr-1" />
            分享结果
          </a-button>
        </a-space>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import MainLayout from '@/layouts/MainLayout.vue'
import {
  FileBarChart,
  Trophy,
  Target,
  BarChart3,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  RotateCcw,
  Gamepad2,
  Download,
  Share2,
  BookOpen,
  Headphones,
  PenTool,
  MessageSquare,
  Zap,
  Clock
} from 'lucide-vue-next'

const router = useRouter()

// 模拟评估结果数据
const assessmentResult = ref({
  title: '综合英语能力测试',
  completedAt: new Date('2024-01-20T14:30:00'),
  totalScore: 85,
  level: '中级',
  summary: '你的英语水平处于中级阶段，在词汇和阅读方面表现优秀，但在听力和口语方面还有提升空间。建议加强听力训练和口语练习。',
  skillBreakdown: [
    {
      name: '词汇',
      score: 92,
      icon: BookOpen,
      description: '词汇量丰富，理解准确，建议学习更多高级词汇'
    },
    {
      name: '语法',
      score: 78,
      icon: PenTool,
      description: '基础语法掌握良好，复杂语法结构需要加强'
    },
    {
      name: '听力',
      score: 75,
      icon: Headphones,
      description: '听力理解基本准确，语速较快时理解有困难'
    },
    {
      name: '阅读',
      score: 88,
      icon: BookOpen,
      description: '阅读理解能力强，能够准确把握文章主旨'
    },
    {
      name: '口语',
      score: 70,
      icon: MessageSquare,
      description: '口语表达基本流利，发音和语调需要改进'
    }
  ],
  mistakes: [
    {
      id: 1,
      type: '语法',
      difficulty: '中等',
      question: 'She _____ to the store yesterday.',
      userAnswer: 'go',
      correctAnswer: 'went',
      explanation: '这是一般过去时的用法，yesterday表示过去的时间，动词应该用过去式went。'
    },
    {
      id: 2,
      type: '词汇',
      difficulty: '简单',
      question: 'What is the opposite of "big"?',
      userAnswer: 'little',
      correctAnswer: 'small',
      explanation: 'big的反义词是small，little通常指数量少或年龄小。'
    },
    {
      id: 3,
      type: '听力',
      difficulty: '困难',
      question: '听音频选择正确答案',
      userAnswer: 'He likes apples',
      correctAnswer: 'He likes oranges',
      explanation: '注意听清楚单词的发音，apples和oranges的发音有明显区别。'
    }
  ],
  recommendations: [
    {
      id: 1,
      title: '语法强化训练',
      description: '针对时态和语态进行专项练习，提高语法运用准确性',
      icon: PenTool,
      priority: '高优先级'
    },
    {
      id: 2,
      title: '听力技能提升',
      description: '每天进行30分钟听力练习，从慢速材料开始逐步提高',
      icon: Headphones,
      priority: '中优先级'
    },
    {
      id: 3,
      title: '口语表达练习',
      description: '参与口语对话练习，提高发音准确性和表达流利度',
      icon: MessageSquare,
      priority: '中优先级'
    }
  ],
  previousResults: [
    { totalScore: 72, completedAt: new Date('2024-01-10T10:00:00') },
    { totalScore: 78, completedAt: new Date('2024-01-15T15:30:00') }
  ]
})

// 格式化日期
const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatShortDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

// 获取等级颜色
const getLevelColor = (level: string) => {
  const colors = {
    '入门': '#f5222d',
    '初级': '#fa8c16',
    '中级': '#1890ff',
    '高级': '#52c41a'
  }
  return colors[level as keyof typeof colors] || '#1890ff'
}

// 获取技能颜色
const getSkillColor = (score: number) => {
  if (score >= 90) return '#52c41a'
  if (score >= 80) return '#1890ff'
  if (score >= 70) return '#fa8c16'
  return '#f5222d'
}

// 获取技能等级
const getSkillLevel = (score: number) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '一般'
  return '需提高'
}

const getSkillLevelClass = (score: number) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'average'
  return 'poor'
}

// 获取难度样式类
const getDifficultyClass = (difficulty: string) => {
  const classes = {
    '简单': 'easy',
    '中等': 'medium',
    '困难': 'hard'
  }
  return classes[difficulty as keyof typeof classes] || 'medium'
}

// 获取优先级样式类
const getPriorityClass = (priority: string) => {
  const classes = {
    '高优先级': 'high',
    '中优先级': 'medium',
    '低优先级': 'low'
  }
  return classes[priority as keyof typeof classes] || 'medium'
}

// 获取技能点位置样式
const getSkillPointStyle = (score: number, index: number) => {
  const angle = (index / assessmentResult.value.skillBreakdown.length) * 360
  const radius = (score / 100) * 80 + 20 // 20-100px radius
  const x = Math.cos((angle - 90) * Math.PI / 180) * radius
  const y = Math.sin((angle - 90) * Math.PI / 180) * radius
  
  return {
    transform: `translate(${x}px, ${y}px)`,
    color: getSkillColor(score)
  }
}

// 操作方法
const retakeAssessment = () => {
  router.push('/assessment')
}

const startLearning = (recommendation?: any) => {
  if (recommendation) {
    message.info(`开始${recommendation.title}...`)
  }
  router.push('/games')
}

const downloadReport = () => {
  message.info('报告下载功能开发中...')
}

const shareResult = () => {
  message.info('分享功能开发中...')
}
</script>

<style scoped lang="less">
.assessment-result-page {
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

.overall-result {
  margin-bottom: 40px;
}

.result-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.result-info {
  flex: 1;
}

.result-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.result-date {
  opacity: 0.8;
  margin: 0 0 16px 0;
}

.result-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 12px;

  .score-number {
    font-size: 48px;
    font-weight: 700;
    line-height: 1;
  }

  .score-label {
    font-size: 20px;
    opacity: 0.8;
  }
}

.result-level {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
}

.result-summary {
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.9;
}

.chart-card,
.breakdown-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.card-title,
.section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.radar-chart {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mock-radar {
  position: relative;
  width: 200px;
  height: 200px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-center {
  text-align: center;
  z-index: 2;
}

.center-score {
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
}

.center-label {
  font-size: 14px;
  color: #6b7280;
}

.radar-skills {
  position: absolute;
  inset: 0;
}

.skill-point {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center;
  text-align: center;
  font-size: 12px;
}

.skill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  margin: 0 auto 4px;
}

.skill-label {
  font-weight: 500;
  white-space: nowrap;
}

.skill-score {
  color: #6b7280;
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skill-item {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.skill-info {
  display: flex;
  align-items: center;
  color: #1f2937;
  font-weight: 500;
}

.skill-score-display {
  display: flex;
  align-items: center;
  gap: 8px;

  .score {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
  }

  .level {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;

    &.excellent {
      background: #f6ffed;
      color: #52c41a;
    }

    &.good {
      background: #e6f7ff;
      color: #1890ff;
    }

    &.average {
      background: #fff7e6;
      color: #fa8c16;
    }

    &.poor {
      background: #fff2f0;
      color: #f5222d;
    }
  }
}

.skill-progress {
  margin-bottom: 8px;
}

.skill-desc {
  font-size: 14px;
  color: #6b7280;
}

.mistakes-analysis,
.recommendations,
.history-comparison {
  margin-bottom: 40px;
}

.mistakes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.mistake-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #f5222d;
}

.mistake-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mistake-type {
  font-weight: 500;
  color: #1f2937;
}

.mistake-difficulty {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.easy {
    background: #f6ffed;
    color: #52c41a;
  }

  &.medium {
    background: #fff7e6;
    color: #fa8c16;
  }

  &.hard {
    background: #fff2f0;
    color: #f5222d;
  }
}

.mistake-question {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.mistake-answers {
  margin-bottom: 16px;
}

.answer-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;

  .answer-label {
    font-weight: 500;
    min-width: 80px;
  }

  .answer-text {
    padding: 2px 8px;
    border-radius: 4px;
  }

  &.wrong .answer-text {
    background: #fff2f0;
    color: #f5222d;
  }

  &.correct .answer-text {
    background: #f6ffed;
    color: #52c41a;
  }
}

.mistake-explanation {
  h5 {
    font-weight: 500;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  p {
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
  }
}

.recommendation-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.recommendation-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(24, 144, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
}

.recommendation-priority {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.high {
    background: #fff2f0;
    color: #f5222d;
  }

  &.medium {
    background: #fff7e6;
    color: #fa8c16;
  }

  &.low {
    background: #f6ffed;
    color: #52c41a;
  }
}

.recommendation-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recommendation-title {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.recommendation-desc {
  color: #6b7280;
  margin: 0 0 16px 0;
  flex: 1;
  line-height: 1.5;
}

.recommendation-actions {
  margin-top: auto;
}

.comparison-chart {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-container {
  height: 200px;
  position: relative;
}

.mock-line-chart {
  height: 100%;
  position: relative;
}

.chart-lines {
  position: relative;
  height: 80%;
}

.chart-point {
  position: absolute;
  text-align: center;
}

.point-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1890ff;
  margin: 0 auto 4px;
}

.point-label {
  font-size: 12px;
  font-weight: 500;
  color: #1f2937;
}

.chart-axis {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.axis-label {
  font-size: 12px;
  color: #6b7280;
}

.result-actions {
  text-align: center;
  margin-top: 40px;
}

// 响应式设计
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .result-card {
    padding: 24px;
  }

  .result-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .mistakes-grid {
    grid-template-columns: 1fr;
  }

  .mistake-card {
    padding: 16px;
  }

  .recommendation-card {
    padding: 16px;
  }

  .result-actions {
    :deep(.ant-space) {
      flex-direction: column;
      width: 100%;
    }
  }
}
</style>