<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 头部Logo和标题 -->
      <div class="login-header">
        <div class="logo">
          <BookOpen class="w-12 h-12 text-blue-500" />
        </div>
        <h1 class="title">小学英语学习平台</h1>
        <p class="subtitle">让英语学习变得有趣！</p>
      </div>

      <!-- 登录表单 -->
      <a-form
        :model="formData"
        :rules="rules"
        @finish="handleLogin"
        layout="vertical"
        class="login-form"
      >
        <a-form-item name="email" label="邮箱">
          <a-input
            v-model:value="formData.email"
            size="large"
            placeholder="请输入邮箱"
            :prefix="Mail"
          />
        </a-form-item>

        <a-form-item name="password" label="密码">
          <a-input-password
            v-model:value="formData.password"
            size="large"
            placeholder="请输入密码"
            :prefix="Lock"
          />
        </a-form-item>

        <a-form-item>
          <a-checkbox v-model:checked="formData.remember">
            记住我
          </a-checkbox>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            class="login-button"
            block
          >
            登录
          </a-button>
        </a-form-item>

        <div class="form-footer">
          <span>还没有账号？</span>
          <a-button type="link" @click="goToRegister">
            立即注册
          </a-button>
        </div>
      </a-form>

      <!-- 快速登录选项 -->
      <div class="quick-login">
        <a-divider>
          <span class="divider-text">快速体验</span>
        </a-divider>
        <a-button
          type="default"
          size="large"
          @click="handleGuestLogin"
          :loading="guestLoading"
          class="guest-button"
          block
        >
          <User class="w-4 h-4 mr-2" />
          游客登录
        </a-button>
      </div>
    </div>

    <!-- 装饰性元素 -->
    <div class="decoration">
      <div class="floating-element element-1">
        <Star class="w-6 h-6 text-yellow-400" />
      </div>
      <div class="floating-element element-2">
        <Heart class="w-5 h-5 text-pink-400" />
      </div>
      <div class="floating-element element-3">
        <Smile class="w-7 h-7 text-green-400" />
      </div>
      <div class="floating-element element-4">
        <Trophy class="w-6 h-6 text-orange-400" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import {
  BookOpen,
  Mail,
  Lock,
  User,
  Star,
  Heart,
  Smile,
  Trophy
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const guestLoading = ref(false)

const formData = reactive({
  email: '',
  password: '',
  remember: false
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  loading.value = true
  try {
    const result = await authStore.signIn(formData.email, formData.password)
    if (result.success) {
      message.success('登录成功！')
      router.push('/')
    } else {
      message.error(result.error || '登录失败')
    }
  } catch (error) {
    message.error('登录过程中发生错误')
  } finally {
    loading.value = false
  }
}

// 游客登录
const handleGuestLogin = async () => {
  guestLoading.value = true
  try {
    // 使用预设的游客账号
    const result = await authStore.signIn('guest@example.com', 'guest123')
    if (result.success) {
      message.success('游客登录成功！')
      router.push('/')
    } else {
      message.error('游客登录失败，请稍后重试')
    }
  } catch (error) {
    message.error('游客登录过程中发生错误')
  } finally {
    guestLoading.value = false
  }
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped lang="less">
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 10;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;

  :deep(.ant-form-item-label) {
    font-weight: 600;
    color: #374151;
  }

  :deep(.ant-input-affix-wrapper) {
    border-radius: 8px;
    border: 2px solid #e5e7eb;
    transition: all 0.3s;

    &:hover, &:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
}

.login-button {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 8px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
  }
}

.form-footer {
  text-align: center;
  color: #6b7280;
  
  .ant-btn-link {
    color: #3b82f6;
    font-weight: 600;
    padding: 0;
  }
}

.quick-login {
  margin-top: 24px;
}

.divider-text {
  color: #9ca3af;
  font-size: 14px;
}

.guest-button {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  height: 48px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.05);
  }
}

.decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  animation: float 6s ease-in-out infinite;

  &.element-1 {
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  &.element-2 {
    top: 20%;
    right: 15%;
    animation-delay: 1s;
  }

  &.element-3 {
    bottom: 30%;
    left: 8%;
    animation-delay: 2s;
  }

  &.element-4 {
    bottom: 15%;
    right: 10%;
    animation-delay: 3s;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

// 响应式设计
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }

  .login-card {
    padding: 24px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }
}
</style>