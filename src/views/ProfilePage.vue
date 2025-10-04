<template>
  <MainLayout>
    <div class="profile-page">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <User class="w-6 h-6 mr-3" />
          个人中心
        </h1>
        <p class="page-subtitle">管理你的个人信息和学习设置</p>
      </div>

      <a-row :gutter="[24, 24]">
        <!-- 左侧个人信息 -->
        <a-col :xs="24" :lg="8">
          <div class="profile-card">
            <div class="profile-header">
              <div class="avatar-section">
                <a-avatar :size="80" :src="userProfile?.avatar">
                  <template #icon><User /></template>
                </a-avatar>
                <a-button type="link" size="small" @click="showAvatarModal = true">
                  <Camera class="w-4 h-4 mr-1" />
                  更换头像
                </a-button>
              </div>
              <div class="profile-info">
                <h2 class="profile-name">{{ userProfile?.name || '未设置' }}</h2>
                <p class="profile-email">{{ userProfile?.email }}</p>
                <div class="profile-level">
                  <Star class="w-4 h-4 mr-1" />
                  等级 {{ studentProfile?.level || 1 }}
                </div>
              </div>
            </div>

            <div class="profile-stats">
              <div class="stat-item">
                <Trophy class="w-5 h-5 text-yellow-500" />
                <div class="stat-content">
                  <div class="stat-number">{{ studentProfile?.totalPoints || 0 }}</div>
                  <div class="stat-label">总积分</div>
                </div>
              </div>
              <div class="stat-item">
                <Target class="w-5 h-5 text-blue-500" />
                <div class="stat-content">
                  <div class="stat-number">{{ studentProfile?.completedLevels || 0 }}</div>
                  <div class="stat-label">完成关卡</div>
                </div>
              </div>
              <div class="stat-item">
                <Calendar class="w-5 h-5 text-green-500" />
                <div class="stat-content">
                  <div class="stat-number">{{ studentProfile?.studyDays || 0 }}</div>
                  <div class="stat-label">学习天数</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 学习偏好设置 -->
          <div class="settings-card">
            <h3 class="card-title">
              <Settings class="w-5 h-5 mr-2" />
              学习设置
            </h3>
            <div class="settings-list">
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-title">音效开关</div>
                  <div class="setting-desc">游戏和练习中的音效提示</div>
                </div>
                <a-switch v-model:checked="settings.soundEnabled" />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-title">自动播放</div>
                  <div class="setting-desc">听力练习时自动播放音频</div>
                </div>
                <a-switch v-model:checked="settings.autoPlay" />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-title">学习提醒</div>
                  <div class="setting-desc">每日学习时间提醒</div>
                </div>
                <a-switch v-model:checked="settings.dailyReminder" />
              </div>
            </div>
          </div>
        </a-col>

        <!-- 右侧信息编辑 -->
        <a-col :xs="24" :lg="16">
          <div class="edit-card">
            <h3 class="card-title">
              <Edit class="w-5 h-5 mr-2" />
              编辑资料
            </h3>
            <a-form
              :model="editForm"
              :rules="formRules"
              layout="vertical"
              @finish="handleUpdateProfile"
            >
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="姓名" name="name">
                    <a-input v-model:value="editForm.name" placeholder="请输入姓名" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="年级" name="grade">
                    <a-select v-model:value="editForm.grade" placeholder="请选择年级">
                      <a-select-option value="1">一年级</a-select-option>
                      <a-select-option value="2">二年级</a-select-option>
                      <a-select-option value="3">三年级</a-select-option>
                      <a-select-option value="4">四年级</a-select-option>
                      <a-select-option value="5">五年级</a-select-option>
                      <a-select-option value="6">六年级</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="学校" name="school">
                <a-input v-model:value="editForm.school" placeholder="请输入学校名称" />
              </a-form-item>

              <a-form-item label="个人简介" name="bio">
                <a-textarea
                  v-model:value="editForm.bio"
                  placeholder="介绍一下自己吧..."
                  :rows="4"
                />
              </a-form-item>

              <a-form-item label="学习目标" name="learningGoal">
                <a-select v-model:value="editForm.learningGoal" placeholder="选择学习目标">
                  <a-select-option value="basic">基础入门</a-select-option>
                  <a-select-option value="improve">提升水平</a-select-option>
                  <a-select-option value="exam">考试准备</a-select-option>
                  <a-select-option value="interest">兴趣爱好</a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item>
                <a-space>
                  <a-button type="primary" html-type="submit" :loading="updating">
                    保存修改
                  </a-button>
                  <a-button @click="resetForm">重置</a-button>
                </a-space>
              </a-form-item>
            </a-form>
          </div>

          <!-- 密码修改 -->
          <div class="password-card">
            <h3 class="card-title">
              <Lock class="w-5 h-5 mr-2" />
              修改密码
            </h3>
            <a-form
              :model="passwordForm"
              :rules="passwordRules"
              layout="vertical"
              @finish="handleChangePassword"
            >
              <a-form-item label="当前密码" name="currentPassword">
                <a-input-password
                  v-model:value="passwordForm.currentPassword"
                  placeholder="请输入当前密码"
                />
              </a-form-item>

              <a-form-item label="新密码" name="newPassword">
                <a-input-password
                  v-model:value="passwordForm.newPassword"
                  placeholder="请输入新密码"
                />
              </a-form-item>

              <a-form-item label="确认新密码" name="confirmPassword">
                <a-input-password
                  v-model:value="passwordForm.confirmPassword"
                  placeholder="请再次输入新密码"
                />
              </a-form-item>

              <a-form-item>
                <a-button type="primary" html-type="submit" :loading="changingPassword">
                  修改密码
                </a-button>
              </a-form-item>
            </a-form>
          </div>

          <!-- 账户操作 -->
          <div class="account-card">
            <h3 class="card-title">
              <Shield class="w-5 h-5 mr-2" />
              账户管理
            </h3>
            <div class="account-actions">
              <div class="action-item">
                <div class="action-info">
                  <div class="action-title">导出学习数据</div>
                  <div class="action-desc">下载你的学习记录和进度数据</div>
                </div>
                <a-button @click="exportData">
                  <Download class="w-4 h-4 mr-1" />
                  导出数据
                </a-button>
              </div>
              <div class="action-item">
                <div class="action-info">
                  <div class="action-title">清除缓存</div>
                  <div class="action-desc">清除本地缓存数据，可能需要重新登录</div>
                </div>
                <a-button @click="clearCache">
                  <Trash2 class="w-4 h-4 mr-1" />
                  清除缓存
                </a-button>
              </div>
              <div class="action-item danger">
                <div class="action-info">
                  <div class="action-title">删除账户</div>
                  <div class="action-desc">永久删除账户和所有数据，此操作不可恢复</div>
                </div>
                <a-button danger @click="showDeleteModal = true">
                  <AlertTriangle class="w-4 h-4 mr-1" />
                  删除账户
                </a-button>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- 头像选择模态框 -->
      <a-modal
        v-model:open="showAvatarModal"
        title="选择头像"
        @ok="handleAvatarChange"
      >
        <div class="avatar-grid">
          <div
            v-for="avatar in avatarOptions"
            :key="avatar.id"
            class="avatar-option"
            :class="{ selected: selectedAvatar === avatar.url }"
            @click="selectedAvatar = avatar.url"
          >
            <a-avatar :size="60" :src="avatar.url">
              <template #icon><User /></template>
            </a-avatar>
          </div>
        </div>
      </a-modal>

      <!-- 删除账户确认模态框 -->
      <a-modal
        v-model:open="showDeleteModal"
        title="删除账户"
        ok-text="确认删除"
        cancel-text="取消"
        ok-type="danger"
        @ok="handleDeleteAccount"
      >
        <div class="delete-warning">
          <AlertTriangle class="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p class="text-center text-lg font-medium mb-2">确定要删除账户吗？</p>
          <p class="text-center text-gray-600 mb-4">
            此操作将永久删除你的账户和所有学习数据，包括：
          </p>
          <ul class="delete-list">
            <li>个人资料和设置</li>
            <li>学习进度和成就</li>
            <li>游戏记录和积分</li>
            <li>所有学习报告</li>
          </ul>
          <p class="text-center text-red-600 font-medium mt-4">
            此操作不可恢复，请谨慎操作！
          </p>
        </div>
      </a-modal>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'
import {
  User,
  Camera,
  Star,
  Trophy,
  Target,
  Calendar,
  Settings,
  Edit,
  Lock,
  Shield,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-vue-next'

const authStore = useAuthStore()

// 响应式数据
const showAvatarModal = ref(false)
const showDeleteModal = ref(false)
const updating = ref(false)
const changingPassword = ref(false)
const selectedAvatar = ref('')

// 用户信息
const userProfile = computed(() => authStore.user)
const studentProfile = computed(() => authStore.studentProfile)

// 设置
const settings = reactive({
  soundEnabled: true,
  autoPlay: true,
  dailyReminder: true
})

// 编辑表单
const editForm = reactive({
  name: '',
  grade: '',
  school: '',
  bio: '',
  learningGoal: ''
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 头像选项
const avatarOptions = ref([
  { id: 1, url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20boy%20avatar%20with%20glasses%20smiling&image_size=square' },
  { id: 2, url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20girl%20avatar%20with%20pigtails%20smiling&image_size=square' },
  { id: 3, url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20boy%20avatar%20with%20cap%20smiling&image_size=square' },
  { id: 4, url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20girl%20avatar%20with%20long%20hair%20smiling&image_size=square' },
  { id: 5, url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20boy%20avatar%20with%20curly%20hair%20smiling&image_size=square' },
  { id: 6, url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20girl%20avatar%20with%20short%20hair%20smiling&image_size=square' }
])

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度应在2-20个字符之间', trigger: 'blur' }
  ],
  grade: [
    { required: true, message: '请选择年级', trigger: 'change' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string) => {
        if (value !== passwordForm.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

// 初始化表单数据
const initFormData = () => {
  if (userProfile.value) {
    editForm.name = userProfile.value.name || ''
  }
  if (studentProfile.value) {
    editForm.grade = studentProfile.value.grade || ''
    editForm.school = studentProfile.value.school || ''
    editForm.bio = studentProfile.value.bio || ''
    editForm.learningGoal = studentProfile.value.learningGoal || ''
  }
}

// 重置表单
const resetForm = () => {
  initFormData()
}

// 更新个人资料
const handleUpdateProfile = async () => {
  try {
    updating.value = true
    // 这里应该调用API更新用户信息
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    message.success('个人资料更新成功！')
  } catch (error) {
    message.error('更新失败，请重试')
  } finally {
    updating.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  try {
    changingPassword.value = true
    // 这里应该调用API修改密码
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    message.success('密码修改成功！')
    // 清空表单
    Object.keys(passwordForm).forEach(key => {
      passwordForm[key as keyof typeof passwordForm] = ''
    })
  } catch (error) {
    message.error('密码修改失败，请重试')
  } finally {
    changingPassword.value = false
  }
}

// 更换头像
const handleAvatarChange = async () => {
  try {
    // 这里应该调用API更新头像
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟API调用
    message.success('头像更新成功！')
    showAvatarModal.value = false
  } catch (error) {
    message.error('头像更新失败，请重试')
  }
}

// 导出数据
const exportData = () => {
  message.info('数据导出功能开发中...')
}

// 清除缓存
const clearCache = () => {
  localStorage.clear()
  sessionStorage.clear()
  message.success('缓存清除成功！')
}

// 删除账户
const handleDeleteAccount = async () => {
  try {
    // 这里应该调用API删除账户
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    message.success('账户删除成功')
    authStore.signOut()
  } catch (error) {
    message.error('账户删除失败，请重试')
  }
}

onMounted(() => {
  initFormData()
})
</script>

<style scoped lang="less">
.profile-page {
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

.profile-card,
.settings-card,
.edit-card,
.password-card,
.account-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.profile-header {
  text-align: center;
  margin-bottom: 24px;
}

.avatar-section {
  margin-bottom: 16px;
}

.profile-info {
  .profile-name {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .profile-email {
    color: #6b7280;
    margin: 0 0 8px 0;
  }

  .profile-level {
    display: inline-flex;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
  }
}

.profile-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.stat-content {
  .stat-number {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    line-height: 1;
  }

  .stat-label {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  }
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.setting-info {
  .setting-title {
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .setting-desc {
    font-size: 14px;
    color: #6b7280;
  }
}

.account-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;

  &.danger {
    background: #fef2f2;
    border: 1px solid #fecaca;
  }
}

.action-info {
  .action-title {
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .action-desc {
    font-size: 14px;
    color: #6b7280;
  }
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px 0;
}

.avatar-option {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f0f9ff;
    border-color: #bae6fd;
  }

  &.selected {
    background: #dbeafe;
    border-color: #3b82f6;
  }
}

.delete-warning {
  text-align: center;
}

.delete-list {
  text-align: left;
  margin: 16px 0;
  padding-left: 20px;

  li {
    margin-bottom: 8px;
    color: #6b7280;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .profile-card,
  .settings-card,
  .edit-card,
  .password-card,
  .account-card {
    padding: 20px;
  }

  .setting-item,
  .action-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .avatar-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>