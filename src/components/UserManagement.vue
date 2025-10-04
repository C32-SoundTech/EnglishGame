<template>
  <div class="user-management">
    <a-card title="用户管理" class="management-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showAddUser = true">
            <UserPlus class="w-4 h-4 mr-1" />
            添加用户
          </a-button>
          <a-button @click="refreshUsers">
            <RefreshCw class="w-4 h-4 mr-1" />
            刷新
          </a-button>
        </a-space>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-filters">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-input
              v-model:value="searchText"
              placeholder="搜索用户名或邮箱"
              @change="handleSearch"
            >
              <template #prefix>
                <Search class="w-4 h-4" />
              </template>
            </a-input>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model:value="roleFilter"
              placeholder="筛选角色"
              @change="handleRoleFilter"
              style="width: 100%"
            >
              <a-select-option value="">全部角色</a-select-option>
              <a-select-option value="student">学生</a-select-option>
              <a-select-option value="parent">家长</a-select-option>
              <a-select-option value="teacher">老师</a-select-option>
              <a-select-option value="admin">管理员</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model:value="statusFilter"
              placeholder="筛选状态"
              @change="handleStatusFilter"
              style="width: 100%"
            >
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="active">活跃</a-select-option>
              <a-select-option value="inactive">非活跃</a-select-option>
              <a-select-option value="suspended">已暂停</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="4">
            <a-button @click="resetFilters">重置</a-button>
          </a-col>
        </a-row>
      </div>

      <!-- 用户列表 -->
      <a-table
        :columns="columns"
        :data-source="filteredUsers"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        class="users-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar_url" :size="40">
              {{ record.name?.charAt(0) }}
            </a-avatar>
          </template>
          
          <template v-if="column.key === 'role'">
            <a-tag :color="getRoleColor(record.role)">
              {{ getRoleText(record.role) }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'lastActivity'">
            {{ formatDate(record.last_activity) }}
          </template>
          
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button size="small" @click="editUser(record)">
                <Edit class="w-3 h-3" />
              </a-button>
              <a-button 
                size="small" 
                :type="record.status === 'active' ? 'default' : 'primary'"
                @click="toggleUserStatus(record)"
              >
                <component :is="record.status === 'active' ? UserX : UserCheck" class="w-3 h-3" />
              </a-button>
              <a-popconfirm
                title="确定要删除这个用户吗？"
                @confirm="deleteUser(record.id)"
              >
                <a-button size="small" danger>
                  <Trash2 class="w-3 h-3" />
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 添加/编辑用户弹窗 -->
    <a-modal
      v-model:open="showAddUser"
      :title="editingUser ? '编辑用户' : '添加用户'"
      @ok="handleSaveUser"
      @cancel="resetUserForm"
      :confirm-loading="saving"
    >
      <a-form
        :model="userForm"
        :rules="userRules"
        layout="vertical"
        ref="userFormRef"
      >
        <a-form-item label="姓名" name="name">
          <a-input v-model:value="userForm.name" placeholder="请输入姓名" />
        </a-form-item>
        
        <a-form-item label="邮箱" name="email">
          <a-input 
            v-model:value="userForm.email" 
            placeholder="请输入邮箱"
            :disabled="!!editingUser"
          />
        </a-form-item>
        
        <a-form-item label="角色" name="role">
          <a-select v-model:value="userForm.role" placeholder="请选择角色">
            <a-select-option value="student">学生</a-select-option>
            <a-select-option value="parent">家长</a-select-option>
            <a-select-option value="teacher">老师</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item v-if="userForm.role === 'student'" label="年级" name="grade">
          <a-select v-model:value="userForm.grade" placeholder="请选择年级">
            <a-select-option :value="1">一年级</a-select-option>
            <a-select-option :value="2">二年级</a-select-option>
            <a-select-option :value="3">三年级</a-select-option>
            <a-select-option :value="4">四年级</a-select-option>
            <a-select-option :value="5">五年级</a-select-option>
            <a-select-option :value="6">六年级</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item v-if="!editingUser" label="密码" name="password">
          <a-input-password 
            v-model:value="userForm.password" 
            placeholder="请输入密码（至少6位）"
          />
        </a-form-item>
        
        <a-form-item label="状态" name="status">
          <a-select v-model:value="userForm.status" placeholder="请选择状态">
            <a-select-option value="active">活跃</a-select-option>
            <a-select-option value="inactive">非活跃</a-select-option>
            <a-select-option value="suspended">已暂停</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 权限管理弹窗 -->
    <a-modal
      v-model:open="showPermissions"
      title="权限管理"
      @ok="savePermissions"
      @cancel="showPermissions = false"
      width="600px"
    >
      <div class="permissions-content">
        <h4>当前角色：{{ selectedUser?.role }}</h4>
        <a-divider />
        
        <div class="permission-groups">
          <div v-for="group in permissionGroups" :key="group.name" class="permission-group">
            <h5>{{ group.label }}</h5>
            <a-checkbox-group v-model:value="userPermissions" class="permission-list">
              <a-checkbox 
                v-for="permission in group.permissions" 
                :key="permission.id"
                :value="permission.id"
                class="permission-item"
              >
                {{ permission.name }}
                <span class="permission-desc">{{ permission.description }}</span>
              </a-checkbox>
            </a-checkbox-group>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { storage } from '@/utils/storage'
import {
  UserPlus,
  RefreshCw,
  Search,
  Edit,
  UserX,
  UserCheck,
  Trash2
} from 'lucide-vue-next'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  avatar_url?: string
  last_activity?: string
  created_at: string
  grade?: number
}

const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const showAddUser = ref(false)
const showPermissions = ref(false)
const editingUser = ref<User | null>(null)
const selectedUser = ref<User | null>(null)

// 搜索和筛选
const searchText = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

// 用户列表
const users = ref<User[]>([])

// 表单数据
const userForm = reactive({
  name: '',
  email: '',
  role: '',
  grade: undefined,
  password: '',
  status: 'active'
})

const userFormRef = ref()

// 权限相关
const userPermissions = ref<string[]>([])

// 表格列配置
const columns = [
  {
    title: '头像',
    key: 'avatar',
    width: 80
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '角色',
    key: 'role',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '最后活动',
    key: 'lastActivity',
    width: 150
  },
  {
    title: '操作',
    key: 'actions',
    width: 150
  }
]

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

// 表单验证规则
const userRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

// 权限组配置
const permissionGroups = [
  {
    name: 'games',
    label: '游戏权限',
    permissions: [
      { id: 'games:play', name: '游戏游玩', description: '可以玩游戏' },
      { id: 'games:create', name: '游戏创建', description: '可以创建游戏' }
    ]
  },
  {
    name: 'assessment',
    label: '评估权限',
    permissions: [
      { id: 'assessment:take', name: '参加评估', description: '可以参加评估测试' },
      { id: 'assessment:create', name: '创建评估', description: '可以创建评估测试' }
    ]
  },
  {
    name: 'progress',
    label: '进度权限',
    permissions: [
      { id: 'progress:view', name: '查看进度', description: '可以查看学习进度' },
      { id: 'progress:manage', name: '管理进度', description: '可以管理学习进度' }
    ]
  }
]

// 计算属性
const filteredUsers = computed(() => {
  let result = users.value

  if (searchText.value) {
    result = result.filter(user => 
      user.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  if (roleFilter.value) {
    result = result.filter(user => user.role === roleFilter.value)
  }

  if (statusFilter.value) {
    result = result.filter(user => user.status === statusFilter.value)
  }

  return result
})

// 方法
const loadUsers = async () => {
  loading.value = true
  try {
    // 模拟加载用户数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockUsers: User[] = [
      {
        id: '1',
        name: '小明',
        email: 'xiaoming@example.com',
        role: 'student',
        status: 'active',
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
        grade: 3
      },
      {
        id: '2',
        name: '李老师',
        email: 'teacher@example.com',
        role: 'teacher',
        status: 'active',
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: '管理员',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ]
    
    users.value = mockUsers
    pagination.total = mockUsers.length
    
  } catch (error) {
    message.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const refreshUsers = () => {
  loadUsers()
  message.success('用户列表已刷新')
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleRoleFilter = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleStatusFilter = () => {
  // 筛选逻辑已在计算属性中处理
}

const resetFilters = () => {
  searchText.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
}

const editUser = (user: User) => {
  editingUser.value = user
  Object.assign(userForm, {
    name: user.name,
    email: user.email,
    role: user.role,
    grade: user.grade,
    status: user.status,
    password: ''
  })
  showAddUser.value = true
}

const resetUserForm = () => {
  editingUser.value = null
  Object.assign(userForm, {
    name: '',
    email: '',
    role: '',
    grade: undefined,
    password: '',
    status: 'active'
  })
  showAddUser.value = false
}

const handleSaveUser = async () => {
  try {
    await userFormRef.value.validate()
    saving.value = true
    
    // 模拟保存用户
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (editingUser.value) {
      // 更新用户
      const index = users.value.findIndex(u => u.id === editingUser.value!.id)
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          ...userForm,
          updated_at: new Date().toISOString()
        }
      }
      message.success('用户信息更新成功')
    } else {
      // 添加新用户
      const newUser: User = {
        id: `user-${Date.now()}`,
        ...userForm,
        created_at: new Date().toISOString()
      }
      users.value.push(newUser)
      message.success('用户添加成功')
    }
    
    resetUserForm()
  } catch (error) {
    // 表单验证失败
  } finally {
    saving.value = false
  }
}

const toggleUserStatus = async (user: User) => {
  try {
    const newStatus = user.status === 'active' ? 'suspended' : 'active'
    
    // 模拟状态切换
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value[index].status = newStatus
    }
    
    message.success(`用户状态已${newStatus === 'active' ? '激活' : '暂停'}`)
  } catch (error) {
    message.error('状态切换失败')
  }
}

const deleteUser = async (userId: string) => {
  try {
    // 模拟删除用户
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = users.value.findIndex(u => u.id === userId)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
    
    message.success('用户删除成功')
  } catch (error) {
    message.error('用户删除失败')
  }
}

const savePermissions = async () => {
  try {
    // 模拟保存权限
    await new Promise(resolve => setTimeout(resolve, 500))
    
    message.success('权限设置已保存')
    showPermissions.value = false
  } catch (error) {
    message.error('权限保存失败')
  }
}

// 工具函数
const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    student: 'blue',
    parent: 'green',
    teacher: 'orange',
    admin: 'red'
  }
  return colors[role] || 'default'
}

const getRoleText = (role: string): string => {
  const texts: Record<string, string> = {
    student: '学生',
    parent: '家长',
    teacher: '老师',
    admin: '管理员'
  }
  return texts[role] || role
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'green',
    inactive: 'orange',
    suspended: 'red'
  }
  return colors[status] || 'default'
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    active: '活跃',
    inactive: '非活跃',
    suspended: '已暂停'
  }
  return texts[status] || status
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  loadUsers()
})
</script>

<style scoped lang="less">
.user-management {
  .management-card {
    .search-filters {
      margin-bottom: 16px;
    }

    .users-table {
      :deep(.ant-table-tbody > tr > td) {
        vertical-align: middle;
      }
    }
  }

  .permissions-content {
    .permission-groups {
      .permission-group {
        margin-bottom: 24px;

        h5 {
          margin-bottom: 12px;
          color: #1f2937;
          font-weight: 600;
        }

        .permission-list {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .permission-item {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 8px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            transition: all 0.2s;

            &:hover {
              border-color: #3b82f6;
              background-color: #f8fafc;
            }

            .permission-desc {
              font-size: 12px;
              color: #6b7280;
              margin-top: 2px;
            }
          }
        }
      }
    }
  }
}
</style>