<template>
  <div class="register-container">
    <div class="register-card">
      <!-- 头部Logo和标题 -->
      <div class="register-header">
        <div class="logo">
          <BookOpen class="w-12 h-12 text-blue-500" />
        </div>
        <h1 class="title">加入学习之旅</h1>
        <p class="subtitle">创建账号，开始精彩的英语学习！</p>
      </div>

      <!-- 注册表单 -->
      <a-form
        :model="formData"
        :rules="rules"
        @finish="handleRegister"
        layout="vertical"
        class="register-form"
      >
        <a-form-item name="name" label="姓名">
          <a-input
            v-model:value="formData.name"
            size="large"
            placeholder="请输入姓名"
            :prefix="User"
          />
        </a-form-item>

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
            placeholder="请输入密码（至少6位）"
            :prefix="Lock"
          />
        </a-form-item>

        <a-form-item name="confirmPassword" label="确认密码">
          <a-input-password
            v-model:value="formData.confirmPassword"
            size="large"
            placeholder="请再次输入密码"
            :prefix="Lock"
          />
        </a-form-item>

        <a-form-item name="grade" label="年级">
          <a-select
            v-model:value="formData.grade"
            size="large"
            placeholder="请选择年级"
          >
            <a-select-option value="1">一年级</a-select-option>
            <a-select-option value="2">二年级</a-select-option>
            <a-select-option value="3">三年级</a-select-option>
            <a-select-option value="4">四年级</a-select-option>
            <a-select-option value="5">五年级</a-select-option>
            <a-select-option value="6">六年级</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item name="agreement">
          <a-checkbox v-model:checked="formData.agreement">
            我已阅读并同意
            <a href="#" @click.prevent="showTerms">《用户协议》</a>
            和
            <a href="#" @click.prevent="showPrivacy">《隐私政策》</a>
          </a-checkbox>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            class="register-button"
            block
          >
            注册账号
          </a-button>
        </a-form-item>

        <div class="form-footer">
          <span>已有账号？</span>
          <a-button type="link" @click="goToLogin">
            立即登录
          </a-button>
        </div>
      </a-form>
    </div>

    <!-- 装饰性元素 -->
    <div class="decoration">
      <div class="floating-element element-1">
        <Sparkles class="w-6 h-6 text-purple-400" />
      </div>
      <div class="floating-element element-2">
        <Zap class="w-5 h-5 text-yellow-400" />
      </div>
      <div class="floating-element element-3">
        <Gift class="w-7 h-7 text-pink-400" />
      </div>
      <div class="floating-element element-4">
        <Rocket class="w-6 h-6 text-blue-400" />
      </div>
    </div>

    <!-- 条款弹窗 -->
    <a-modal
      v-model:open="termsVisible"
      title="用户协议"
      :footer="null"
      width="600px"
    >
      <div class="terms-content">
        <h3>欢迎使用小学英语学习平台</h3>
        <p>本协议是您与小学英语学习平台之间的法律协议。使用本平台即表示您同意遵守以下条款：</p>
        <ul>
          <li>您承诺提供真实、准确的个人信息</li>
          <li>您同意遵守平台的学习规则和社区准则</li>
          <li>您理解平台内容仅供学习使用</li>
          <li>您承诺不进行任何违法或有害的行为</li>
        </ul>
      </div>
    </a-modal>

    <a-modal
      v-model:open="privacyVisible"
      title="隐私政策"
      :footer="null"
      width="600px"
    >
      <div class="privacy-content">
        <h3>隐私保护承诺</h3>
        <p>我们非常重视您的隐私保护，特此说明我们的隐私政策：</p>
        <ul>
          <li>我们仅收集必要的学习相关信息</li>
          <li>您的个人信息将被严格保密</li>
          <li>我们不会向第三方泄露您的信息</li>
          <li>您有权随时查看、修改或删除个人信息</li>
        </ul>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import {
  BookOpen,
  User,
  Mail,
  Lock,
  Sparkles,
  Zap,
  Gift,
  Rocket
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const termsVisible = ref(false)
const privacyVisible = ref(false)

const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  grade: undefined,
  agreement: false
})

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, message: '姓名至少2个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => {
        if (value !== formData.password) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ],
  grade: [
    { required: true, message: '请选择年级', trigger: 'change' }
  ],
  agreement: [
    {
      validator: (_rule: any, value: boolean) => {
        if (!value) {
          return Promise.reject('请阅读并同意用户协议和隐私政策')
        }
        return Promise.resolve()
      },
      trigger: 'change'
    }
  ]
}

// 处理注册
const handleRegister = async () => {
  loading.value = true
  try {
    const result = await authStore.signUp(
      formData.email,
      formData.password,
      {
        name: formData.name,
        grade: parseInt(formData.grade!)
      }
    )
    
    if (result.success) {
      message.success('注册成功！请查看邮箱验证链接')
      router.push('/login')
    } else {
      message.error(result.error || '注册失败')
    }
  } catch (error) {
    message.error('注册过程中发生错误')
  } finally {
    loading.value = false
  }
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 显示条款
const showTerms = () => {
  termsVisible.value = true
}

// 显示隐私政策
const showPrivacy = () => {
  privacyVisible.value = true
}
</script>

<style scoped lang="less">
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.register-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 10;
  max-height: 90vh;
  overflow-y: auto;
}

.register-header {
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

.register-form {
  margin-bottom: 24px;

  :deep(.ant-form-item-label) {
    font-weight: 600;
    color: #374151;
  }

  :deep(.ant-input-affix-wrapper),
  :deep(.ant-select-selector) {
    border-radius: 8px;
    border: 2px solid #e5e7eb;
    transition: all 0.3s;

    &:hover, &:focus {
      border-color: #f5576c;
      box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
    }
  }

  :deep(.ant-select-focused .ant-select-selector) {
    border-color: #f5576c !important;
    box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1) !important;
  }
}

.register-button {
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  border: none;
  border-radius: 8px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(245, 87, 108, 0.3);
  }
}

.form-footer {
  text-align: center;
  color: #6b7280;
  
  .ant-btn-link {
    color: #f5576c;
    font-weight: 600;
    padding: 0;
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
    top: 15%;
    left: 8%;
    animation-delay: 0s;
  }

  &.element-2 {
    top: 25%;
    right: 12%;
    animation-delay: 1.5s;
  }

  &.element-3 {
    bottom: 35%;
    left: 5%;
    animation-delay: 3s;
  }

  &.element-4 {
    bottom: 20%;
    right: 8%;
    animation-delay: 4.5s;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-25px) rotate(15deg);
  }
}

.terms-content,
.privacy-content {
  h3 {
    color: #1f2937;
    margin-bottom: 16px;
  }

  p {
    color: #4b5563;
    line-height: 1.6;
    margin-bottom: 16px;
  }

  ul {
    color: #4b5563;
    line-height: 1.6;
    
    li {
      margin-bottom: 8px;
    }
  }
}

// 响应式设计
@media (max-width: 480px) {
  .register-container {
    padding: 16px;
  }

  .register-card {
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