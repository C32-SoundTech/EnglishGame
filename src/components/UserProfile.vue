<template>
  <a-card class="user-profile" :bordered="false">
    <template #title>
      <div class="profile-header">
        <User class="w-5 h-5 mr-2" />
        个人资料
      </div>
    </template>
    <template #extra>
      <a-button type="link" size="small" @click="editMode = !editMode">
        <Edit class="w-4 h-4 mr-1" />
        {{ editMode ? '取消' : '编辑' }}
      </a-button>
    </template>

    <div class="profile-content">
      <!-- 头像和基本信息 -->
      <div class="profile-avatar-section">
        <a-upload
          :show-upload-list="false"
          :before-upload="beforeUpload"
          @change="handleAvatarChange"
          :disabled="!editMode"
        >
          <a-avatar :size="80" :src="userProfile.avatar_url" class="avatar-upload">
            <template #icon>
              <User class="w-8 h-8" />
            </template>
          </a-avatar>
          <div v-if="editMode" class="avatar-overlay">
            <Camera class="w-4 h-4" />
          </div>
        </a-upload>
        <div class="profile-basic">
          <div v-if="!editMode" class="profile-name">
            {{ userProfile.name || '未设置姓名' }}
          </div>
          <a-input
            v-else
            v-model:value="editProfile.name"
            placeholder="请输入姓名"
            size="large"
            class="name-input"
          />
          <a-tag :color="getLevelColor(userProfile.level)" class="level-tag">
            <Star class="w-3 h-3 mr-1" />
            Level {{ userProfile.level || 1 }}
          </a-tag>
        </div>
      </div>

      <!-- 详细信息表单 -->
      <a-form
        :model="editMode ? editProfile : userProfile"
        layout="vertical"
        class="profile-form"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="年龄">
              <a-input-number
                v-if="editMode"
                v-model:value="editProfile.age"
                :min="6"
                :max="18"
                placeholder="请输入年龄"
                style="width: 100%"
              />
              <span v-else class="form-value">{{ userProfile.age || '未设置' }} 岁</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="年级">
              <a-select
                v-if="editMode"
                v-model:value="editProfile.grade"
                placeholder="请选择年级"
              >
                <a-select-option value="1">一年级</a-select-option>
                <a-select-option value="2">二年级</a-select-option>
                <a-select-option value="3">三年级</a-select-option>
                <a-select-option value="4">四年级</a-select-option>
                <a-select-option value="5">五年级</a-select-option>
                <a-select-option value="6">六年级</a-select-option>
              </a-select>
              <span v-else class="form-value">{{ getGradeName(userProfile.grade) }}</span>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="学习目标">
              <a-select
                v-if="editMode"
                v-model:value="editProfile.learning_goal"
                placeholder="请选择学习目标"
              >
                <a-select-option value="basic">基础入门</a-select-option>
                <a-select-option value="improve">提升水平</a-select-option>
                <a-select-option value="advanced">高级进阶</a-select-option>
                <a-select-option value="exam">考试准备</a-select-option>
              </a-select>
              <span v-else class="form-value">{{ getGoalName(userProfile.learning_goal) }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="兴趣爱好">
              <a-select
                v-if="editMode"
                v-model:value="editProfile.interests"
                mode="multiple"
                placeholder="请选择兴趣爱好"
              >
                <a-select-option value="games">游戏</a-select-option>
                <a-select-option value="music">音乐</a-select-option>
                <a-select-option value="sports">运动</a-select-option>
                <a-select-option value="reading">阅读</a-select-option>
                <a-select-option value="art">艺术</a-select-option>
                <a-select-option value="science">科学</a-select-option>
              </a-select>
              <div v-else class="interests-tags">
                <a-tag
                  v-for="interest in userProfile.interests"
                  :key="interest"
                  color="blue"
                  size="small"
                >
                  {{ getInterestName(interest) }}
                </a-tag>
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="个人简介">
          <a-textarea
            v-if="editMode"
            v-model:value="editProfile.bio"
            placeholder="介绍一下自己吧..."
            :rows="3"
          />
          <p v-else class="form-value bio-text">
            {{ userProfile.bio || '这个小朋友还没有写个人简介哦~' }}
          </p>
        </a-form-item>

        <!-- 学习统计 -->
        <div class="learning-stats">
          <h4 class="stats-title">
            <BarChart class="w-4 h-4 mr-2" />
            学习统计
          </h4>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-statistic
                title="总积分"
                :value="userProfile.total_points || 0"
                :value-style="{ color: '#faad14' }"
              />
            </a-col>
            <a-col :span="8">
              <a-statistic
                title="学习天数"
                :value="userProfile.study_days || 0"
                :value-style="{ color: '#52c41a' }"
              />
            </a-col>
            <a-col :span="8">
              <a-statistic
                title="完成关卡"
                :value="userProfile.completed_levels || 0"
                :value-style="{ color: '#1890ff' }"
              />
            </a-col>
          </a-row>
        </div>

        <!-- 操作按钮 -->
        <div v-if="editMode" class="form-actions">
          <a-space>
            <a-button @click="cancelEdit">取消</a-button>
            <a-button type="primary" @click="saveProfile" :loading="saving">
              <Save class="w-4 h-4 mr-1" />
              保存
            </a-button>
          </a-space>
        </div>
      </a-form>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import {
  User,
  Edit,
  Camera,
  Star,
  BarChart,
  Save
} from 'lucide-vue-next'

const authStore = useAuthStore()

// 响应式数据
const editMode = ref(false)
const saving = ref(false)

// 用户资料数据
const userProfile = reactive({
  name: '小明',
  age: 8,
  grade: '2',
  learning_goal: 'basic',
  interests: ['games', 'music'],
  bio: '我是一个爱学习的小朋友，喜欢玩游戏学英语！',
  avatar_url: '',
  level: 3,
  total_points: 1250,
  study_days: 15,
  completed_levels: 8
})

// 编辑时的临时数据
const editProfile = reactive({
  name: '',
  age: null,
  grade: '',
  learning_goal: '',
  interests: [],
  bio: '',
  avatar_url: ''
})

// 监听编辑模式变化
watch(editMode, (newVal) => {
  if (newVal) {
    // 进入编辑模式，复制当前数据
    Object.assign(editProfile, userProfile)
  }
})

// 工具方法
const getLevelColor = (level: number) => {
  if (level >= 10) return 'purple'
  if (level >= 5) return 'gold'
  return 'blue'
}

const getGradeName = (grade: string) => {
  const gradeMap: Record<string, string> = {
    '1': '一年级',
    '2': '二年级',
    '3': '三年级',
    '4': '四年级',
    '5': '五年级',
    '6': '六年级'
  }
  return gradeMap[grade] || '未设置'
}

const getGoalName = (goal: string) => {
  const goalMap: Record<string, string> = {
    'basic': '基础入门',
    'improve': '提升水平',
    'advanced': '高级进阶',
    'exam': '考试准备'
  }
  return goalMap[goal] || '未设置'
}

const getInterestName = (interest: string) => {
  const interestMap: Record<string, string> = {
    'games': '游戏',
    'music': '音乐',
    'sports': '运动',
    'reading': '阅读',
    'art': '艺术',
    'science': '科学'
  }
  return interestMap[interest] || interest
}

// 头像上传
const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }
  return false // 阻止自动上传
}

const handleAvatarChange = (info: any) => {
  if (info.file) {
    // 这里可以处理图片预览
    const reader = new FileReader()
    reader.onload = (e) => {
      editProfile.avatar_url = e.target?.result as string
    }
    reader.readAsDataURL(info.file)
  }
}

// 保存资料
const saveProfile = async () => {
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新用户资料
    Object.assign(userProfile, editProfile)
    
    message.success('个人资料保存成功！')
    editMode.value = false
  } catch (error) {
    message.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 取消编辑
const cancelEdit = () => {
  editMode.value = false
  // 重置编辑数据
  Object.keys(editProfile).forEach(key => {
    editProfile[key] = userProfile[key]
  })
}
</script>

<style scoped lang="less">
.user-profile {
  .profile-header {
    display: flex;
    align-items: center;
    font-weight: 600;
  }

  .profile-content {
    .profile-avatar-section {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 32px;
      padding: 20px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-radius: 12px;

      .avatar-upload {
        position: relative;
        cursor: pointer;

        .avatar-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s;

          &:hover {
            opacity: 1;
          }
        }
      }

      .profile-basic {
        flex: 1;

        .profile-name {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .name-input {
          margin-bottom: 8px;
        }

        .level-tag {
          display: inline-flex;
          align-items: center;
        }
      }
    }

    .profile-form {
      .form-value {
        color: #1f2937;
        font-weight: 500;
      }

      .bio-text {
        color: #6b7280;
        font-style: italic;
        line-height: 1.6;
      }

      .interests-tags {
        .ant-tag {
          margin-bottom: 4px;
        }
      }

      .learning-stats {
        margin-top: 32px;
        padding: 20px;
        background: #fafafa;
        border-radius: 8px;

        .stats-title {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          color: #1f2937;
        }
      }

      .form-actions {
        margin-top: 24px;
        text-align: right;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-profile {
    .profile-content {
      .profile-avatar-section {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }
    }
  }
}
</style>