<template>
  <a-layout class="min-h-screen">
    <!-- 顶部导航栏 -->
    <a-layout-header class="header">
      <div class="nav-container">
        <!-- Logo和标题 -->
        <div class="logo-section">
          <div class="logo">
            <BookOpen class="w-8 h-8 text-white" />
          </div>
          <h1 class="title">小学英语学习平台</h1>
        </div>

        <!-- 导航菜单 -->
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="horizontal"
          theme="dark"
          class="nav-menu"
          @click="handleMenuClick"
        >
          <a-menu-item key="home">
            <Home class="w-4 h-4" />
            首页
          </a-menu-item>
          <a-menu-item key="games">
            <Gamepad2 class="w-4 h-4" />
            游戏学习
          </a-menu-item>
          <a-menu-item key="progress">
            <TrendingUp class="w-4 h-4" />
            学习进度
          </a-menu-item>
          <a-menu-item key="assessment">
            <ClipboardCheck class="w-4 h-4" />
            能力评估
          </a-menu-item>
          <a-menu-item key="reports">
            <BarChart3 class="w-4 h-4" />
            学习报告
          </a-menu-item>
        </a-menu>

        <!-- 用户信息 -->
        <div class="user-section">
          <!-- 通知中心 -->
          <NotificationCenter ref="notificationCenter" />
          
          <a-dropdown>
            <a-button type="text" class="user-button">
              <a-avatar :src="authStore.user?.avatar_url" class="mr-2">
                <template #icon>
                  <User class="w-4 h-4" />
                </template>
              </a-avatar>
              <span class="user-name">{{ authStore.user?.name || '用户' }}</span>
              <ChevronDown class="w-4 h-4 ml-1" />
            </a-button>
            <template #overlay>
              <a-menu @click="handleUserMenuClick">
                <a-menu-item key="profile">
                  <Settings class="w-4 h-4 mr-2" />
                  个人中心
                </a-menu-item>
                <a-menu-item key="goals">
                  <Target class="w-4 h-4 mr-2" />
                  学习目标
                </a-menu-item>
                <a-menu-item key="reminders">
                  <Bell class="w-4 h-4 mr-2" />
                  提醒设置
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout">
                  <LogOut class="w-4 h-4 mr-2" />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </a-layout-header>

    <!-- 主要内容区域 -->
    <a-layout-content class="content">
      <div class="content-wrapper">
        <router-view />
      </div>
    </a-layout-content>

    <!-- 底部信息 -->
    <a-layout-footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 小学英语学习平台. 让英语学习变得有趣！</p>
      </div>
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import NotificationCenter from '@/components/NotificationCenter.vue'
import {
  BookOpen,
  Home,
  Gamepad2,
  TrendingUp,
  ClipboardCheck,
  BarChart3,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Target,
  Bell
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationCenter = ref()

const selectedKeys = ref<string[]>([])

// 根据当前路由设置选中的菜单项
const updateSelectedKeys = () => {
  const routeName = route.name as string
  if (routeName) {
    selectedKeys.value = [routeName]
  }
}

// 处理菜单点击
const handleMenuClick = ({ key }: { key: string }) => {
  router.push({ name: key })
}

// 处理用户菜单点击
const handleUserMenuClick = async ({ key }: { key: string }) => {
  if (key === 'profile') {
    router.push({ name: 'profile' })
  } else if (key === 'goals') {
    router.push({ name: 'goals' })
  } else if (key === 'reminders') {
    router.push({ name: 'reminders' })
  } else if (key === 'logout') {
    const result = await authStore.signOut()
    if (result.success) {
      message.success('退出登录成功')
      router.push('/login')
    } else {
      message.error('退出登录失败')
    }
  }
}

onMounted(() => {
  updateSelectedKeys()
})

// 监听路由变化
router.afterEach(() => {
  updateSelectedKeys()
})
</script>

<style scoped lang="less">
.header {
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.title {
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.nav-menu {
  flex: 1;
  background: transparent;
  border-bottom: none;
  margin: 0 40px;

  :deep(.ant-menu-item) {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.85);
    border-bottom: 2px solid transparent;
    
    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }
    
    &.ant-menu-item-selected {
      color: white;
      background: rgba(255, 255, 255, 0.15);
      border-bottom-color: #fa8c16;
    }
  }
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-button {
  color: white;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.user-name {
  font-weight: 500;
}

.content {
  background: #f5f5f5;
  min-height: calc(100vh - 64px - 70px);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.footer {
  background: #001529;
  text-align: center;
  padding: 24px 0;
}

.footer-content {
  color: rgba(255, 255, 255, 0.65);
  font-size: 14px;
}

// 响应式设计
@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
  }
  
  .title {
    display: none;
  }
  
  .nav-menu {
    margin: 0 16px;
    
    :deep(.ant-menu-item) {
      padding: 0 8px;
      font-size: 12px;
      
      span {
        display: none;
      }
    }
  }
  
  .content-wrapper {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .nav-menu {
    :deep(.ant-menu-item) {
      padding: 0 4px;
    }
  }
  
  .user-name {
    display: none;
  }
}
</style>