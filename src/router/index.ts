import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 导入页面组件
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import HomePage from '@/views/HomePage.vue'
import GamesPage from '@/views/GamesPage.vue'
import AssessmentPage from '@/views/AssessmentPage.vue'
import ProgressPage from '@/views/ProgressPage.vue'
import ReportsPage from '@/views/ReportsPage.vue'
import ProfilePage from '@/views/ProfilePage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: {
      title: '注册',
      requiresAuth: false
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: {
      title: '首页',
      requiresAuth: true
    }
  },
  {
    path: '/games',
    name: 'Games',
    component: GamesPage,
    meta: {
      title: '游戏学习',
      requiresAuth: true
    }
  },
  {
    path: '/assessment',
    name: 'Assessment',
    component: AssessmentPage,
    meta: {
      title: '能力评估',
      requiresAuth: true
    }
  },
  {
    path: '/progress',
    name: 'Progress',
    component: ProgressPage,
    meta: {
      title: '学习进度',
      requiresAuth: true
    }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsPage,
    meta: {
      title: '学习报告',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: {
      title: '个人资料',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user_token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (!to.meta.requiresAuth && isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    next('/home')
  } else {
    next()
  }
})

export default router
