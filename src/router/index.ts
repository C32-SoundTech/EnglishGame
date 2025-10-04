import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由组件懒加载
const HomePage = () => import('@/views/HomePage.vue')
const LoginPage = () => import('@/views/LoginPage.vue')
const RegisterPage = () => import('@/views/RegisterPage.vue')
const GamesPage = () => import('@/views/GamesPage.vue')
const GameLevelPage = () => import('@/views/GameLevelPage.vue')
const ProgressPage = () => import('@/views/ProgressPage.vue')
const AssessmentPage = () => import('@/views/AssessmentPage.vue')
const AssessmentResultPage = () => import('@/views/AssessmentResultPage.vue')
const ReportsPage = () => import('@/views/ReportsPage.vue')
const ProfilePage = () => import('@/views/ProfilePage.vue')
const GoalsPage = () => import('@/views/GoalsPage.vue')
const RemindersPage = () => import('@/views/RemindersPage.vue')

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/games',
    name: 'games',
    component: GamesPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/games/:levelId',
    name: 'game-level',
    component: GameLevelPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/progress',
    name: 'progress',
    component: ProgressPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/assessment',
    name: 'assessment',
    component: AssessmentPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/assessment/result',
    name: 'assessment-result',
    component: AssessmentResultPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'reports',
    component: ReportsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/goals',
    name: 'goals',
    component: GoalsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/reminders',
    name: 'reminders',
    component: RemindersPage,
    meta: { requiresAuth: true }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 初始化认证状态（仅在首次访问时）
  if (!authStore.user && !authStore.loading) {
    await authStore.initialize()
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  if (requiresAuth && !authStore.isAuthenticated) {
    // 需要认证但未登录，跳转到登录页
    next('/login')
  } else if (requiresGuest && authStore.isAuthenticated) {
    // 需要游客状态但已登录，跳转到首页
    next('/')
  } else {
    next()
  }
})

export default router
