<template>
  <div class="learning-progress">
    <!-- 学习进度概览 -->
    <div class="progress-overview">
      <h3 class="section-title">
        <TrendingUp class="w-5 h-5 mr-2" />
        学习进度概览
      </h3>
      <a-row :gutter="[16, 16]">
        <a-col :xs="12" :md="6" v-for="stat in progressStats" :key="stat.key">
          <div class="progress-card">
            <div class="progress-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
              <component :is="stat.icon" class="w-6 h-6" />
            </div>
            <div class="progress-content">
              <div class="progress-number">{{ stat.value }}</div>
              <div class="progress-label">{{ stat.label }}</div>
              <a-progress
                :percent="stat.percent"
                :stroke-color="stat.color"
                :show-info="false"
                size="small"
              />
            </div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 关卡系统 -->
    <LevelSystem ref="levelSystemRef" />

    <!-- 技能树 -->
    <div class="skill-tree">
      <h3 class="section-title">
        <Zap class="w-5 h-5 mr-2" />
        技能树
      </h3>
      <div class="skill-branches">
        <div
          v-for="branch in skillBranches"
          :key="branch.id"
          class="skill-branch"
        >
          <div class="branch-header">
            <div class="branch-icon" :style="{ backgroundColor: branch.color + '20', color: branch.color }">
              <component :is="branch.icon" class="w-6 h-6" />
            </div>
            <div class="branch-info">
              <h4 class="branch-name">{{ branch.name }}</h4>
              <div class="branch-progress">
                <a-progress
                  :percent="branch.progress"
                  :stroke-color="branch.color"
                  size="small"
                />
              </div>
            </div>
          </div>
          <div class="skill-nodes">
            <div
              v-for="skill in branch.skills"
              :key="skill.id"
              class="skill-node"
              :class="{
                'unlocked': skill.unlocked,
                'current': skill.current,
                'locked': !skill.unlocked
              }"
              @click="handleSkillClick(skill)"
            >
              <div class="skill-icon">
                <CheckCircle v-if="skill.unlocked && !skill.current" class="w-4 h-4" />
                <Play v-else-if="skill.current" class="w-4 h-4" />
                <Lock v-else class="w-4 h-4" />
              </div>
              <div class="skill-name">{{ skill.name }}</div>
              <div class="skill-level">Lv.{{ skill.level }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成就徽章系统 -->
    <div class="badge-section">
      <BadgeSystem />
    </div>

    <!-- 学习目标 -->
    <div class="learning-goals">
      <h3 class="section-title">
        <Target class="w-5 h-5 mr-2" />
        学习目标
      </h3>
      <div class="goals-list">
        <div
          v-for="goal in learningGoals"
          :key="goal.id"
          class="goal-item"
          :class="{ 'completed': goal.completed }"
        >
          <div class="goal-icon">
            <CheckCircle v-if="goal.completed" class="w-5 h-5 text-green-500" />
            <Circle v-else class="w-5 h-5 text-gray-400" />
          </div>
          <div class="goal-content">
            <h4 class="goal-title">{{ goal.title }}</h4>
            <p class="goal-desc">{{ goal.description }}</p>
            <div class="goal-progress">
              <a-progress
                :percent="goal.progress"
                :stroke-color="goal.completed ? '#52c41a' : '#1890ff'"
                size="small"
              />
              <span class="goal-deadline">截止：{{ formatDate(goal.deadline) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  TrendingUp,
  Trophy,
  Play,
  Lock,
  Star,
  Zap,
  CheckCircle,
  Award,
  Target,
  Circle,
  BookOpen,
  Headphones,
  MessageSquare,
  PenTool,
  Calendar,
  Clock,
  Users,
  Gamepad2
} from 'lucide-vue-next'
import LevelSystem from '@/components/LevelSystem.vue'
import BadgeSystem from '@/components/BadgeSystem.vue'

// 响应式数据
const levelSystemRef = ref(null)

const progressStats = ref([
  {
    key: 'completedLevels',
    label: '完成关卡',
    value: '5/12',
    percent: 42,
    icon: Trophy,
    color: '#52c41a'
  },
  {
    key: 'skillPoints',
    label: '技能点数',
    value: '1,250',
    percent: 75,
    icon: Zap,
    color: '#1890ff'
  },
  {
    key: 'studyDays',
    label: '连续学习',
    value: '12天',
    percent: 80,
    icon: Calendar,
    color: '#fa8c16'
  },
  {
    key: 'achievements',
    label: '获得成就',
    value: '8/20',
    percent: 40,
    icon: Award,
    color: '#722ed1'
  }
])

// 关卡数据
const levels = ref([
  {
    id: 1,
    name: '字母认知',
    status: 'completed',
    progress: 100,
    score: 95,
    maxScore: 100,
    stars: 3
  },
  {
    id: 2,
    name: '基础词汇',
    status: 'completed',
    progress: 100,
    score: 88,
    maxScore: 100,
    stars: 2
  },
  {
    id: 3,
    name: '简单对话',
    status: 'current',
    progress: 65,
    score: 65,
    maxScore: 100,
    stars: 1
  },
  {
    id: 4,
    name: '语法入门',
    status: 'locked',
    progress: 0,
    score: 0,
    maxScore: 100,
    stars: 0
  },
  {
    id: 5,
    name: '听力训练',
    status: 'locked',
    progress: 0,
    score: 0,
    maxScore: 100,
    stars: 0
  }
])

// 技能分支数据
const skillBranches = ref([
  {
    id: 1,
    name: '词汇掌握',
    progress: 75,
    color: '#1890ff',
    icon: BookOpen,
    skills: [
      { id: 1, name: '动物词汇', level: 3, unlocked: true, current: false },
      { id: 2, name: '颜色词汇', level: 2, unlocked: true, current: false },
      { id: 3, name: '数字词汇', level: 1, unlocked: true, current: true },
      { id: 4, name: '家庭词汇', level: 0, unlocked: false, current: false }
    ]
  },
  {
    id: 2,
    name: '听力理解',
    progress: 60,
    color: '#52c41a',
    icon: Headphones,
    skills: [
      { id: 5, name: '基础听力', level: 2, unlocked: true, current: false },
      { id: 6, name: '对话听力', level: 1, unlocked: true, current: true },
      { id: 7, name: '故事听力', level: 0, unlocked: false, current: false }
    ]
  },
  {
    id: 3,
    name: '口语表达',
    progress: 45,
    color: '#fa8c16',
    icon: MessageSquare,
    skills: [
      { id: 8, name: '发音练习', level: 2, unlocked: true, current: false },
      { id: 9, name: '简单对话', level: 1, unlocked: true, current: true },
      { id: 10, name: '情景对话', level: 0, unlocked: false, current: false }
    ]
  },
  {
    id: 4,
    name: '语法结构',
    progress: 30,
    color: '#722ed1',
    icon: PenTool,
    skills: [
      { id: 11, name: '基础语法', level: 1, unlocked: true, current: true },
      { id: 12, name: '时态语法', level: 0, unlocked: false, current: false },
      { id: 13, name: '复合句型', level: 0, unlocked: false, current: false }
    ]
  }
])

// 徽章系统引用
const badgeSystemRef = ref(null)

// 学习目标数据
const learningGoals = ref([
  {
    id: 1,
    title: '本周学习目标',
    description: '完成5个关卡，学习50个新单词',
    progress: 80,
    completed: false,
    deadline: new Date('2024-01-28')
  },
  {
    id: 2,
    title: '本月词汇目标',
    description: '掌握200个基础词汇',
    progress: 65,
    completed: false,
    deadline: new Date('2024-01-31')
  },
  {
    id: 3,
    title: '听力提升目标',
    description: '完成所有基础听力训练',
    progress: 100,
    completed: true,
    deadline: new Date('2024-01-20')
  }
])

// 工具函数
const updateLevelProgress = (levelId: number, score: number) => {
  if (levelSystemRef.value) {
    levelSystemRef.value.updateLevelProgress(levelId, score)
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 事件处理

const handleSkillClick = (skill: any) => {
  if (!skill.unlocked) {
    message.warning('技能尚未解锁')
    return
  }
  if (skill.current) {
    message.success(`开始学习：${skill.name}`)
  } else {
    message.info(`技能 ${skill.name} 已掌握，等级：${skill.level}`)
  }
}

// 暴露给父组件的方法
const refreshData = () => {
  // 刷新数据逻辑
  console.log('刷新学习进度数据')
}

const updateBadgeProgress = (badgeId: string, progress: any) => {
  if (badgeSystemRef.value) {
    badgeSystemRef.value.updateBadgeProgress(badgeId, progress)
  }
}

defineExpose({
  refreshData,
  updateLevelProgress,
  updateBadgeProgress
})
</script>

<style scoped lang="less">
.learning-progress {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

// 进度概览
.progress-overview {
  margin-bottom: 32px;
}

.progress-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.progress-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.progress-content {
  flex: 1;
}

.progress-number {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.progress-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

// 关卡进度
.level-progress {
  margin-bottom: 32px;
}

.level-map {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.level-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &.completed {
    border: 2px solid #52c41a;
    background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
  }

  &.current {
    border: 2px solid #1890ff;
    background: linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%);
  }

  &.locked {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.level-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  flex-shrink: 0;

  .completed & {
    background: #52c41a;
    color: white;
  }

  .current & {
    background: #1890ff;
    color: white;
  }

  .locked & {
    background: #d9d9d9;
    color: #8c8c8c;
  }
}

.level-info {
  flex: 1;
}

.level-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.level-progress-bar {
  margin-bottom: 8px;
}

.level-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.level-score {
  font-size: 14px;
  color: #6b7280;
}

.level-stars {
  display: flex;
  gap: 2px;

  .filled {
    color: #fadb14;
  }
}

// 技能树
.skill-tree {
  margin-bottom: 32px;
}

.skill-branches {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.skill-branch {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.branch-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.branch-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.branch-info {
  flex: 1;
}

.branch-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.skill-nodes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.skill-node {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.unlocked {
    border-color: #52c41a;
    background: #f6ffed;
  }

  &.current {
    border-color: #1890ff;
    background: #e6f7ff;
  }

  &.locked {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.skill-icon {
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
}

.skill-name {
  font-size: 12px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.skill-level {
  font-size: 10px;
  color: #6b7280;
}

// 成就系统
.achievement-system {
  margin-bottom: 32px;
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.achievement-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &.unlocked {
    border-color: #52c41a;
    background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
  }
}

.achievement-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.achievement-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
}

.achievement-date {
  font-size: 12px;
  color: #52c41a;
}

// 学习目标
.learning-goals {
  margin-bottom: 32px;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.goal-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &.completed {
    border: 2px solid #52c41a;
    background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
  }
}

.goal-icon {
  margin-top: 2px;
}

.goal-content {
  flex: 1;
}

.goal-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.goal-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.goal-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.goal-deadline {
  font-size: 12px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .level-map,
  .skill-branches,
  .achievement-grid {
    grid-template-columns: 1fr;
  }
}
</style>