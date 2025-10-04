<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1>系统管理</h1>
          <p>管理用户、角色权限和系统设置</p>
        </div>
        <div class="header-actions">
          <a-space>
            <a-button @click="refreshData">
              <RefreshCw class="w-4 h-4 mr-1" />
              刷新数据
            </a-button>
            <a-button type="primary" @click="showSystemSettings = true">
              <Settings class="w-4 h-4 mr-1" />
              系统设置
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="总用户数"
              :value="stats.totalUsers"
              :value-style="{ color: '#3f8600' }"
            >
              <template #prefix>
                <Users class="w-4 h-4" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="活跃用户"
              :value="stats.activeUsers"
              :value-style="{ color: '#1890ff' }"
            >
              <template #prefix>
                <UserCheck class="w-4 h-4" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="今日新增"
              :value="stats.newUsersToday"
              :value-style="{ color: '#722ed1' }"
            >
              <template #prefix>
                <UserPlus class="w-4 h-4" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic
              title="系统角色"
              :value="stats.totalRoles"
              :value-style="{ color: '#fa8c16' }"
            >
              <template #prefix>
                <Shield class="w-4 h-4" />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 管理选项卡 -->
    <a-card class="management-tabs">
      <a-tabs v-model:activeKey="activeTab" type="card">
        <a-tab-pane key="users" tab="用户管理">
          <template #tab>
            <Users class="w-4 h-4 mr-1" />
            用户管理
          </template>
          <UserManagement />
        </a-tab-pane>
        
        <a-tab-pane key="roles" tab="角色权限">
          <template #tab>
            <Shield class="w-4 h-4 mr-1" />
            角色权限
          </template>
          <RolePermissions />
        </a-tab-pane>
        
        <a-tab-pane key="system" tab="系统监控">
          <template #tab>
            <Activity class="w-4 h-4 mr-1" />
            系统监控
          </template>
          <SystemMonitor />
        </a-tab-pane>
        
        <a-tab-pane key="logs" tab="操作日志">
          <template #tab>
            <FileText class="w-4 h-4 mr-1" />
            操作日志
          </template>
          <SystemLogs />
        </a-tab-pane>
        
        <a-tab-pane key="backup" tab="数据备份">
          <template #tab>
            <Database class="w-4 h-4 mr-1" />
            数据备份
          </template>
          <DataBackup />
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 系统设置弹窗 -->
    <a-modal
      v-model:open="showSystemSettings"
      title="系统设置"
      @ok="saveSystemSettings"
      @cancel="showSystemSettings = false"
      width="600px"
    >
      <a-form
        :model="systemSettings"
        layout="vertical"
        ref="settingsFormRef"
      >
        <a-form-item label="系统名称">
          <a-input v-model:value="systemSettings.systemName" />
        </a-form-item>
        
        <a-form-item label="系统描述">
          <a-textarea v-model:value="systemSettings.systemDescription" :rows="3" />
        </a-form-item>
        
        <a-form-item label="会话超时时间（小时）">
          <a-input-number 
            v-model:value="systemSettings.sessionTimeout" 
            :min="1" 
            :max="168"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item label="最大登录尝试次数">
          <a-input-number 
            v-model:value="systemSettings.maxLoginAttempts" 
            :min="3" 
            :max="10"
            style="width: 100%"
          />
        </a-form-item>
        
        <a-form-item label="系统维护模式">
          <a-switch 
            v-model:checked="systemSettings.maintenanceMode"
            checked-children="开启"
            un-checked-children="关闭"
          />
        </a-form-item>
        
        <a-form-item label="用户注册">
          <a-switch 
            v-model:checked="systemSettings.allowRegistration"
            checked-children="允许"
            un-checked-children="禁止"
          />
        </a-form-item>
        
        <a-form-item label="邮件通知">
          <a-switch 
            v-model:checked="systemSettings.emailNotifications"
            checked-children="开启"
            un-checked-children="关闭"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import UserManagement from '@/components/UserManagement.vue'
import RolePermissions from '@/components/RolePermissions.vue'
import SystemMonitor from '@/components/SystemMonitor.vue'
import NotificationCenter from '@/components/NotificationCenter.vue'
import SystemLogs from '@/components/SystemLogs.vue'
import DataBackup from '@/components/DataBackup.vue'
import {
  RefreshCw,
  Settings,
  Users,
  UserCheck,
  UserPlus,
  Shield,
  Activity,
  FileText,
  Database
} from 'lucide-vue-next'

const authStore = useAuthStore()

// 响应式数据
const activeTab = ref('users')
const showSystemSettings = ref(false)
const loading = ref(false)

// 统计数据
const stats = reactive({
  totalUsers: 0,
  activeUsers: 0,
  newUsersToday: 0,
  totalRoles: 0
})

// 系统设置
const systemSettings = reactive({
  systemName: '小学英语学习平台',
  systemDescription: '专为小学生设计的英语学习平台',
  sessionTimeout: 24,
  maxLoginAttempts: 5,
  maintenanceMode: false,
  allowRegistration: true,
  emailNotifications: true
})

const settingsFormRef = ref()

// 方法
const loadStats = async () => {
  try {
    // 模拟加载统计数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    stats.totalUsers = 258
    stats.activeUsers = 186
    stats.newUsersToday = 12
    stats.totalRoles = 4
    
  } catch (error) {
    message.error('加载统计数据失败')
  }
}

const loadSystemSettings = async () => {
  try {
    // 模拟加载系统设置
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 系统设置已在reactive中初始化
  } catch (error) {
    message.error('加载系统设置失败')
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadStats(),
      loadSystemSettings()
    ])
    message.success('数据刷新成功')
  } catch (error) {
    message.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

const saveSystemSettings = async () => {
  try {
    // 模拟保存系统设置
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    message.success('系统设置保存成功')
    showSystemSettings.value = false
  } catch (error) {
    message.error('系统设置保存失败')
  }
}

// 生命周期
onMounted(() => {
  // 检查管理员权限
  if (!authStore.isAdmin) {
    message.error('权限不足，无法访问管理页面')
    return
  }
  
  loadStats()
  loadSystemSettings()
})
</script>

<style scoped lang="less">
.admin-page {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;

  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 24px;
    color: white;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-info {
        h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
        }

        p {
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
        }
      }

      .header-actions {
        :deep(.ant-btn) {
          border-color: rgba(255, 255, 255, 0.3);
          color: white;

          &:hover {
            background-color: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.5);
          }

          &.ant-btn-primary {
            background-color: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.3);

            &:hover {
              background-color: rgba(255, 255, 255, 0.3);
            }
          }
        }
      }
    }
  }

  .stats-overview {
    margin-bottom: 24px;

    .stat-card {
      text-align: center;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      :deep(.ant-statistic-title) {
        color: #666;
        font-weight: 500;
      }

      :deep(.ant-statistic-content) {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
    }
  }

  .management-tabs {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    :deep(.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab) {
      border-radius: 6px 6px 0 0;
      border-color: #e8e8e8;

      &.ant-tabs-tab-active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-color: #667eea;
        color: white;

        .ant-tabs-tab-btn {
          color: white;
        }
      }
    }

    :deep(.ant-tabs-content-holder) {
      padding: 24px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .admin-page {
    padding: 16px;

    .page-header {
      padding: 24px 16px;

      .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
    }

    .stats-overview {
      :deep(.ant-col) {
        margin-bottom: 16px;
      }
    }
  }
}
</style>

// 在 components 中添加
const components = {
  UserManagement,
  RolePermissions,
  SystemMonitor,
  NotificationCenter
}