<template>
  <div class="reports-page min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <button @click="$router.go(-1)" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft class="w-5 h-5 text-gray-600" />
            </button>
            <h1 class="text-xl font-semibold text-gray-900">学习报告</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button 
              @click="generateReport"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FileText class="w-4 h-4" />
              <span>生成报告</span>
            </button>
            <div class="text-sm text-gray-600">
              {{ currentUser?.name || '学生' }}
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Report Period Selection -->
      <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">报告时间范围</h2>
          <div class="flex items-center space-x-2">
            <Calendar class="w-4 h-4 text-gray-500" />
            <span class="text-sm text-gray-600">最后更新：{{ lastUpdated }}</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="period in reportPeriods"
            :key="period.value"
            @click="selectedPeriod = period.value"
            :class="`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === period.value
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`"
          >
            {{ period.label }}
          </button>
        </div>
      </div>

      <!-- Overall Performance Summary -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Performance Score -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">综合表现</h3>
            <TrendingUp class="w-5 h-5 text-green-500" />
          </div>
          <div class="text-center">
            <div class="relative w-32 h-32 mx-auto mb-4">
              <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  stroke-width="6"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#10b981"
                  stroke-width="6"
                  fill="none"
                  :stroke-dasharray="`${overallScore * 2.51} 251`"
                  stroke-linecap="round"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-bold text-gray-900">{{ overallScore }}%</span>
                <span class="text-xs text-gray-500">综合得分</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">等级评定</span>
                <span class="font-medium text-green-600">{{ performanceLevel }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">班级排名</span>
                <span class="font-medium text-blue-600">{{ classRank }}/{{ totalStudents }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Learning Time Analysis -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">学习时间分析</h3>
            <Clock class="w-5 h-5 text-blue-500" />
          </div>
          <div class="space-y-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600 mb-1">{{ totalStudyTime }}h</div>
              <div class="text-sm text-gray-600">总学习时长</div>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">日均学习</span>
                <span class="text-sm font-medium">{{ dailyAverage }}min</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">最长连续</span>
                <span class="text-sm font-medium">{{ longestStreak }}天</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">活跃天数</span>
                <span class="text-sm font-medium">{{ activeDays }}天</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Achievement Summary -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">成就总结</h3>
            <Award class="w-5 h-5 text-yellow-500" />
          </div>
          <div class="space-y-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-yellow-600 mb-1">{{ totalAchievements }}</div>
              <div class="text-sm text-gray-600">获得成就</div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div 
                v-for="achievement in recentAchievements" 
                :key="achievement.id"
                class="text-center p-3 bg-yellow-50 rounded-lg"
              >
                <div :class="`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${achievement.color}`">
                  <component :is="achievement.icon" class="w-4 h-4 text-white" />
                </div>
                <div class="text-xs font-medium text-gray-900">{{ achievement.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Analysis -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Skills Analysis -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">技能分析</h3>
            <BarChart3 class="w-5 h-5 text-purple-500" />
          </div>
          <div class="space-y-6">
            <div 
              v-for="skill in skillsAnalysis" 
              :key="skill.name"
              class="space-y-3"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div :class="`w-8 h-8 rounded-lg flex items-center justify-center ${skill.color}`">
                    <component :is="skill.icon" class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">{{ skill.name }}</div>
                    <div class="text-xs text-gray-500">{{ skill.description }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">{{ skill.score }}%</div>
                  <div :class="`text-xs ${skill.trend > 0 ? 'text-green-600' : 'text-red-600'}`">
                    {{ skill.trend > 0 ? '+' : '' }}{{ skill.trend }}%
                  </div>
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  :class="`h-2 rounded-full transition-all duration-500 ${skill.color.replace('bg-', 'bg-')}`"
                  :style="{ width: `${skill.score}%` }"
                ></div>
              </div>
              <div class="text-xs text-gray-600">
                {{ skill.feedback }}
              </div>
            </div>
          </div>
        </div>

        <!-- Learning Pattern -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">学习模式分析</h3>
            <Activity class="w-5 h-5 text-indigo-500" />
          </div>
          <div class="space-y-6">
            <!-- Best Learning Time -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">最佳学习时段</h4>
              <div class="grid grid-cols-4 gap-2">
                <div 
                  v-for="time in learningTimes" 
                  :key="time.period"
                  :class="`text-center p-3 rounded-lg ${
                    time.isBest ? 'bg-indigo-100 border-2 border-indigo-200' : 'bg-gray-50'
                  }`"
                >
                  <div class="text-xs font-medium text-gray-900">{{ time.period }}</div>
                  <div class="text-xs text-gray-600">{{ time.efficiency }}%</div>
                </div>
              </div>
            </div>

            <!-- Learning Preferences -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">学习偏好</h4>
              <div class="space-y-3">
                <div 
                  v-for="preference in learningPreferences" 
                  :key="preference.type"
                  class="flex items-center justify-between"
                >
                  <span class="text-sm text-gray-600">{{ preference.type }}</span>
                  <div class="flex items-center space-x-2">
                    <div class="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        class="h-2 bg-indigo-500 rounded-full transition-all duration-500"
                        :style="{ width: `${preference.percentage}%` }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ preference.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Difficulty Analysis -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">难点分析</h4>
              <div class="space-y-2">
                <div 
                  v-for="difficulty in difficultyAreas" 
                  :key="difficulty.area"
                  class="flex items-center justify-between p-2 bg-red-50 rounded-lg"
                >
                  <span class="text-sm text-red-800">{{ difficulty.area }}</span>
                  <span class="text-xs text-red-600">{{ difficulty.errorRate }}% 错误率</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">个性化建议</h3>
          <Lightbulb class="w-5 h-5 text-amber-500" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="recommendation in recommendations" 
            :key="recommendation.id"
            class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="flex items-start space-x-3">
              <div :class="`w-8 h-8 rounded-lg flex items-center justify-center ${recommendation.color}`">
                <component :is="recommendation.icon" class="w-4 h-4 text-white" />
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900 mb-2">{{ recommendation.title }}</h4>
                <p class="text-xs text-gray-600 mb-3">{{ recommendation.description }}</p>
                <div class="flex items-center justify-between">
                  <span :class="`text-xs px-2 py-1 rounded-full ${recommendation.priorityColor}`">
                    {{ recommendation.priority }}
                  </span>
                  <button class="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    查看详情
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Comparison -->
      <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">进步对比</h3>
          <TrendingUp class="w-5 h-5 text-green-500" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            v-for="comparison in progressComparisons" 
            :key="comparison.metric"
            class="text-center p-4 bg-gray-50 rounded-lg"
          >
            <div class="text-2xl font-bold text-gray-900 mb-1">
              {{ comparison.current }}
            </div>
            <div class="text-sm text-gray-600 mb-2">{{ comparison.metric }}</div>
            <div class="flex items-center justify-center space-x-2">
              <span class="text-xs text-gray-500">vs 上期:</span>
              <span :class="`text-xs font-medium ${
                comparison.change > 0 ? 'text-green-600' : 'text-red-600'
              }`">
                {{ comparison.change > 0 ? '+' : '' }}{{ comparison.change }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Options -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">导出报告</h3>
          <Download class="w-5 h-5 text-gray-500" />
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="format in exportFormats"
            :key="format.type"
            @click="exportReport(format.type)"
            class="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <component :is="format.icon" class="w-4 h-4 text-gray-600" />
            <span class="text-sm text-gray-700">{{ format.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  Award,
  BarChart3,
  Activity,
  Lightbulb,
  Download,
  BookOpen,
  Headphones,
  PenTool,
  MessageCircle,
  Star,
  Trophy,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Users,
  FileDown,
  Mail,
  Printer
} from 'lucide-vue-next'

const router = useRouter()

// Current user info
const currentUser = ref(JSON.parse(localStorage.getItem('user_info') || '{}'))

// Report period selection
const selectedPeriod = ref('month')
const reportPeriods = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季度', value: 'quarter' },
  { label: '本学期', value: 'semester' },
  { label: '自定义', value: 'custom' }
]

// Last updated time
const lastUpdated = ref('2024年1月15日 14:30')

// Overall performance data
const overallScore = ref(85)
const performanceLevel = ref('优秀')
const classRank = ref(3)
const totalStudents = ref(25)

// Learning time data
const totalStudyTime = ref(68)
const dailyAverage = ref(45)
const longestStreak = ref(12)
const activeDays = ref(22)

// Achievement data
const totalAchievements = ref(8)
const recentAchievements = ref([
  {
    id: 1,
    title: '词汇达人',
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: '连续学习',
    icon: Zap,
    color: 'bg-orange-500'
  },
  {
    id: 3,
    title: '听力高手',
    icon: Headphones,
    color: 'bg-green-500'
  },
  {
    id: 4,
    title: '语法专家',
    icon: Award,
    color: 'bg-purple-500'
  }
])

// Skills analysis
const skillsAnalysis = ref([
  {
    name: '词汇掌握',
    description: '单词记忆与运用能力',
    score: 88,
    trend: 5,
    icon: BookOpen,
    color: 'bg-blue-500',
    feedback: '词汇量增长稳定，建议加强词汇在句子中的运用练习'
  },
  {
    name: '听力理解',
    description: '英语听力理解能力',
    score: 75,
    trend: 8,
    icon: Headphones,
    color: 'bg-green-500',
    feedback: '听力理解能力有显著提升，可以尝试更复杂的听力材料'
  },
  {
    name: '语法运用',
    description: '语法规则掌握与应用',
    score: 82,
    trend: 3,
    icon: PenTool,
    color: 'bg-purple-500',
    feedback: '语法基础扎实，建议多做综合性语法练习'
  },
  {
    name: '口语表达',
    description: '英语口语交流能力',
    score: 70,
    trend: -2,
    icon: MessageCircle,
    color: 'bg-orange-500',
    feedback: '口语表达需要加强，建议增加口语练习时间'
  }
])

// Learning pattern data
const learningTimes = ref([
  { period: '早晨', efficiency: 85, isBest: true },
  { period: '上午', efficiency: 78, isBest: false },
  { period: '下午', efficiency: 72, isBest: false },
  { period: '晚上', efficiency: 68, isBest: false }
])

const learningPreferences = ref([
  { type: '游戏学习', percentage: 45 },
  { type: '听力练习', percentage: 30 },
  { type: '阅读理解', percentage: 15 },
  { type: '语法练习', percentage: 10 }
])

const difficultyAreas = ref([
  { area: '复杂语法结构', errorRate: 25 },
  { area: '长句理解', errorRate: 18 },
  { area: '语音识别', errorRate: 15 }
])

// Recommendations
const recommendations = ref([
  {
    id: 1,
    title: '加强口语练习',
    description: '建议每天进行15分钟口语练习，提高表达流利度',
    priority: '高优先级',
    priorityColor: 'bg-red-100 text-red-800',
    icon: MessageCircle,
    color: 'bg-red-500'
  },
  {
    id: 2,
    title: '复习语法规则',
    description: '重点复习时态和语态的使用，巩固语法基础',
    priority: '中优先级',
    priorityColor: 'bg-yellow-100 text-yellow-800',
    icon: PenTool,
    color: 'bg-yellow-500'
  },
  {
    id: 3,
    title: '扩展词汇量',
    description: '学习更多高频词汇，提高阅读理解能力',
    priority: '中优先级',
    priorityColor: 'bg-yellow-100 text-yellow-800',
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  {
    id: 4,
    title: '增加听力训练',
    description: '多听英语对话和短文，提高听力理解速度',
    priority: '低优先级',
    priorityColor: 'bg-green-100 text-green-800',
    icon: Headphones,
    color: 'bg-green-500'
  },
  {
    id: 5,
    title: '保持学习节奏',
    description: '继续保持每日学习习惯，稳步提升英语水平',
    priority: '低优先级',
    priorityColor: 'bg-green-100 text-green-800',
    icon: Target,
    color: 'bg-indigo-500'
  },
  {
    id: 6,
    title: '参与互动学习',
    description: '多参与课堂互动和小组讨论，提高交流能力',
    priority: '中优先级',
    priorityColor: 'bg-yellow-100 text-yellow-800',
    icon: Users,
    color: 'bg-purple-500'
  }
])

// Progress comparisons
const progressComparisons = ref([
  {
    metric: '平均分数',
    current: '85分',
    change: 8
  },
  {
    metric: '完成练习',
    current: '156个',
    change: 23
  },
  {
    metric: '学习时长',
    current: '68小时',
    change: 12
  }
])

// Export formats
const exportFormats = ref([
  { type: 'pdf', label: 'PDF报告', icon: FileDown },
  { type: 'email', label: '邮件发送', icon: Mail },
  { type: 'print', label: '打印报告', icon: Printer }
])

// Methods
const generateReport = () => {
  console.log('Generating new report...')
  // Simulate report generation
  setTimeout(() => {
    lastUpdated.value = new Date().toLocaleString('zh-CN')
  }, 1000)
}

const exportReport = (format: string) => {
  console.log(`Exporting report as ${format}`)
  // Handle different export formats
  switch (format) {
    case 'pdf':
      // Generate PDF
      break
    case 'email':
      // Send via email
      break
    case 'print':
      // Print report
      window.print()
      break
  }
}

onMounted(() => {
  // Load report data
  console.log('Loading report data...')
})
</script>

<style scoped>
.reports-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reports-page > * {
  animation: fadeIn 0.6s ease-out;
}

/* Progress bar animations */
.bg-blue-500,
.bg-green-500,
.bg-purple-500,
.bg-orange-500,
.bg-indigo-500 {
  transition: width 0.8s ease-in-out;
}

/* Hover effects */
.hover\:shadow-md:hover {
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* Card hover effects */
.hover\:shadow-md:hover {
  transform: translateY(-2px);
}

/* Gradient backgrounds */
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Print styles */
@media print {
  .reports-page {
    background: white !important;
  }
  
  nav {
    display: none !important;
  }
  
  .shadow-sm {
    box-shadow: none !important;
  }
}
</style>