<template>
  <div class="role-permissions">
    <a-card title="角色权限管理" class="permissions-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showCreateRole = true">
            <Plus class="w-4 h-4 mr-1" />
            创建角色
          </a-button>
          <a-button @click="refreshRoles">
            <RefreshCw class="w-4 h-4 mr-1" />
            刷新
          </a-button>
        </a-space>
      </template>

      <!-- 角色列表 -->
      <div class="roles-grid">
        <div 
          v-for="role in roles" 
          :key="role.id"
          class="role-card"
          :class="{ active: selectedRole?.id === role.id }"
          @click="selectRole(role)"
        >
          <div class="role-header">
            <div class="role-info">
              <component :is="getRoleIcon(role.name)" class="role-icon" />
              <div>
                <h4>{{ role.displayName }}</h4>
                <p>{{ role.description }}</p>
              </div>
            </div>
            <a-dropdown>
              <a-button size="small" type="text">
                <MoreVertical class="w-4 h-4" />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="editRole(role)">
                    <Edit class="w-4 h-4 mr-2" />
                    编辑
                  </a-menu-item>
                  <a-menu-item @click="duplicateRole(role)">
                    <Copy class="w-4 h-4 mr-2" />
                    复制
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item 
                    @click="deleteRole(role.id)"
                    :disabled="role.isSystem"
                    class="danger-item"
                  >
                    <Trash2 class="w-4 h-4 mr-2" />
                    删除
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          
          <div class="role-stats">
            <div class="stat-item">
              <Users class="w-4 h-4" />
              <span>{{ role.userCount || 0 }} 用户</span>
            </div>
            <div class="stat-item">
              <Shield class="w-4 h-4" />
              <span>{{ role.permissions?.length || 0 }} 权限</span>
            </div>
          </div>
          
          <div class="role-permissions-preview">
            <a-tag 
              v-for="permission in role.permissions?.slice(0, 3)" 
              :key="permission"
              size="small"
            >
              {{ getPermissionName(permission) }}
            </a-tag>
            <span v-if="role.permissions && role.permissions.length > 3" class="more-permissions">
              +{{ role.permissions.length - 3 }} 更多
            </span>
          </div>
        </div>
      </div>

      <!-- 权限详情面板 -->
      <div v-if="selectedRole" class="permissions-panel">
        <a-divider />
        <div class="panel-header">
          <h3>{{ selectedRole.displayName }} - 权限详情</h3>
          <a-button type="primary" @click="editRolePermissions(selectedRole)">
            <Settings class="w-4 h-4 mr-1" />
            编辑权限
          </a-button>
        </div>
        
        <div class="permissions-content">
          <div v-for="group in permissionGroups" :key="group.name" class="permission-group">
            <h4>{{ group.label }}</h4>
            <div class="permissions-list">
              <div 
                v-for="permission in group.permissions" 
                :key="permission.id"
                class="permission-item"
                :class="{ 
                  granted: selectedRole.permissions?.includes(permission.id),
                  denied: !selectedRole.permissions?.includes(permission.id)
                }"
              >
                <div class="permission-info">
                  <component :is="getPermissionIcon(permission.id)" class="permission-icon" />
                  <div>
                    <span class="permission-name">{{ permission.name }}</span>
                    <p class="permission-desc">{{ permission.description }}</p>
                  </div>
                </div>
                <div class="permission-status">
                  <component 
                    :is="selectedRole.permissions?.includes(permission.id) ? CheckCircle : XCircle" 
                    :class="selectedRole.permissions?.includes(permission.id) ? 'granted-icon' : 'denied-icon'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 创建/编辑角色弹窗 -->
    <a-modal
      v-model:open="showCreateRole"
      :title="editingRole ? '编辑角色' : '创建角色'"
      @ok="handleSaveRole"
      @cancel="resetRoleForm"
      :confirm-loading="saving"
      width="600px"
    >
      <a-form
        :model="roleForm"
        :rules="roleRules"
        layout="vertical"
        ref="roleFormRef"
      >
        <a-form-item label="角色名称" name="name">
          <a-input 
            v-model:value="roleForm.name" 
            placeholder="请输入角色名称（英文）"
            :disabled="editingRole?.isSystem"
          />
        </a-form-item>
        
        <a-form-item label="显示名称" name="displayName">
          <a-input v-model:value="roleForm.displayName" placeholder="请输入显示名称" />
        </a-form-item>
        
        <a-form-item label="角色描述" name="description">
          <a-textarea 
            v-model:value="roleForm.description" 
            placeholder="请输入角色描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item label="权限设置">
          <div class="permissions-selector">
            <div v-for="group in permissionGroups" :key="group.name" class="permission-group-selector">
              <div class="group-header">
                <a-checkbox 
                  :indeterminate="getGroupIndeterminate(group)"
                  :checked="getGroupChecked(group)"
                  @change="toggleGroupPermissions(group, $event)"
                >
                  {{ group.label }}
                </a-checkbox>
              </div>
              <div class="group-permissions">
                <a-checkbox-group v-model:value="roleForm.permissions">
                  <a-checkbox 
                    v-for="permission in group.permissions" 
                    :key="permission.id"
                    :value="permission.id"
                    class="permission-checkbox"
                  >
                    <div class="permission-checkbox-content">
                      <span>{{ permission.name }}</span>
                      <small>{{ permission.description }}</small>
                    </div>
                  </a-checkbox>
                </a-checkbox-group>
              </div>
            </div>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 权限编辑弹窗 -->
    <a-modal
      v-model:open="showPermissionsEditor"
      title="编辑角色权限"
      @ok="saveRolePermissions"
      @cancel="showPermissionsEditor = false"
      width="800px"
    >
      <div class="permissions-editor">
        <div class="editor-header">
          <h4>为 "{{ editingPermissionsRole?.displayName }}" 设置权限</h4>
          <a-space>
            <a-button @click="selectAllPermissions">全选</a-button>
            <a-button @click="clearAllPermissions">清空</a-button>
          </a-space>
        </div>
        
        <a-divider />
        
        <div class="permissions-tree">
          <div v-for="group in permissionGroups" :key="group.name" class="permission-tree-group">
            <div class="tree-group-header">
              <a-checkbox 
                :indeterminate="getEditingGroupIndeterminate(group)"
                :checked="getEditingGroupChecked(group)"
                @change="toggleEditingGroupPermissions(group, $event)"
              >
                <strong>{{ group.label }}</strong>
              </a-checkbox>
            </div>
            <div class="tree-group-content">
              <div 
                v-for="permission in group.permissions" 
                :key="permission.id"
                class="tree-permission-item"
              >
                <a-checkbox 
                  :checked="editingPermissions.includes(permission.id)"
                  @change="toggleEditingPermission(permission.id, $event)"
                >
                  <div class="tree-permission-content">
                    <component :is="getPermissionIcon(permission.id)" class="tree-permission-icon" />
                    <div>
                      <div class="tree-permission-name">{{ permission.name }}</div>
                      <div class="tree-permission-desc">{{ permission.description }}</div>
                    </div>
                  </div>
                </a-checkbox>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  Plus,
  RefreshCw,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Users,
  Shield,
  Settings,
  CheckCircle,
  XCircle,
  User,
  UserCheck,
  GraduationCap,
  Crown,
  Gamepad2,
  BarChart3,
  BookOpen,
  Target,
  Award,
  Clock,
  FileText,
  Settings as SettingsIcon
} from 'lucide-vue-next'

interface Role {
  id: string
  name: string
  displayName: string
  description: string
  permissions: string[]
  isSystem: boolean
  userCount?: number
  created_at: string
  updated_at?: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface PermissionGroup {
  name: string
  label: string
  permissions: Permission[]
}

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const showCreateRole = ref(false)
const showPermissionsEditor = ref(false)
const editingRole = ref<Role | null>(null)
const editingPermissionsRole = ref<Role | null>(null)
const selectedRole = ref<Role | null>(null)

// 角色列表
const roles = ref<Role[]>([])

// 编辑权限时的临时权限列表
const editingPermissions = ref<string[]>([])

// 表单数据
const roleForm = reactive({
  name: '',
  displayName: '',
  description: '',
  permissions: [] as string[]
})

const roleFormRef = ref()

// 表单验证规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '角色名称只能包含字母、数字和下划线，且以字母或下划线开头', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ]
}

// 权限组配置
const permissionGroups: PermissionGroup[] = [
  {
    name: 'games',
    label: '游戏权限',
    permissions: [
      { id: 'games:play', name: '游戏游玩', description: '可以玩各种学习游戏', category: 'games' },
      { id: 'games:create', name: '游戏创建', description: '可以创建和编辑游戏', category: 'games' },
      { id: 'games:manage', name: '游戏管理', description: '可以管理所有游戏内容', category: 'games' }
    ]
  },
  {
    name: 'assessment',
    label: '评估权限',
    permissions: [
      { id: 'assessment:take', name: '参加评估', description: '可以参加评估测试', category: 'assessment' },
      { id: 'assessment:create', name: '创建评估', description: '可以创建评估测试', category: 'assessment' },
      { id: 'assessment:manage', name: '评估管理', description: '可以管理所有评估内容', category: 'assessment' },
      { id: 'assessment:view_results', name: '查看结果', description: '可以查看评估结果', category: 'assessment' }
    ]
  },
  {
    name: 'progress',
    label: '进度权限',
    permissions: [
      { id: 'progress:view', name: '查看进度', description: '可以查看学习进度', category: 'progress' },
      { id: 'progress:manage', name: '管理进度', description: '可以管理学习进度', category: 'progress' },
      { id: 'progress:export', name: '导出数据', description: '可以导出进度数据', category: 'progress' }
    ]
  },
  {
    name: 'content',
    label: '内容权限',
    permissions: [
      { id: 'content:view', name: '查看内容', description: '可以查看学习内容', category: 'content' },
      { id: 'content:create', name: '创建内容', description: '可以创建学习内容', category: 'content' },
      { id: 'content:edit', name: '编辑内容', description: '可以编辑学习内容', category: 'content' },
      { id: 'content:delete', name: '删除内容', description: '可以删除学习内容', category: 'content' }
    ]
  },
  {
    name: 'user',
    label: '用户权限',
    permissions: [
      { id: 'user:view', name: '查看用户', description: '可以查看用户信息', category: 'user' },
      { id: 'user:create', name: '创建用户', description: '可以创建新用户', category: 'user' },
      { id: 'user:edit', name: '编辑用户', description: '可以编辑用户信息', category: 'user' },
      { id: 'user:delete', name: '删除用户', description: '可以删除用户', category: 'user' }
    ]
  },
  {
    name: 'system',
    label: '系统权限',
    permissions: [
      { id: 'system:settings', name: '系统设置', description: '可以修改系统设置', category: 'system' },
      { id: 'system:backup', name: '数据备份', description: '可以备份系统数据', category: 'system' },
      { id: 'system:logs', name: '查看日志', description: '可以查看系统日志', category: 'system' }
    ]
  }
]

// 方法
const loadRoles = async () => {
  loading.value = true
  try {
    // 模拟加载角色数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockRoles: Role[] = [
      {
        id: 'student',
        name: 'student',
        displayName: '学生',
        description: '普通学生用户，可以进行学习和游戏',
        permissions: ['games:play', 'assessment:take', 'progress:view', 'content:view'],
        isSystem: true,
        userCount: 150,
        created_at: new Date().toISOString()
      },
      {
        id: 'parent',
        name: 'parent',
        displayName: '家长',
        description: '学生家长，可以查看孩子的学习进度',
        permissions: ['progress:view', 'assessment:view_results', 'content:view'],
        isSystem: true,
        userCount: 80,
        created_at: new Date().toISOString()
      },
      {
        id: 'teacher',
        name: 'teacher',
        displayName: '老师',
        description: '教师用户，可以创建内容和管理学生',
        permissions: [
          'games:create', 'games:manage',
          'assessment:create', 'assessment:manage', 'assessment:view_results',
          'progress:view', 'progress:manage',
          'content:view', 'content:create', 'content:edit',
          'user:view'
        ],
        isSystem: true,
        userCount: 25,
        created_at: new Date().toISOString()
      },
      {
        id: 'admin',
        name: 'admin',
        displayName: '管理员',
        description: '系统管理员，拥有所有权限',
        permissions: permissionGroups.flatMap(group => group.permissions.map(p => p.id)),
        isSystem: true,
        userCount: 3,
        created_at: new Date().toISOString()
      }
    ]
    
    roles.value = mockRoles
    if (!selectedRole.value && mockRoles.length > 0) {
      selectedRole.value = mockRoles[0]
    }
    
  } catch (error) {
    message.error('加载角色列表失败')
  } finally {
    loading.value = false
  }
}

const refreshRoles = () => {
  loadRoles()
  message.success('角色列表已刷新')
}

const selectRole = (role: Role) => {
  selectedRole.value = role
}

const editRole = (role: Role) => {
  editingRole.value = role
  Object.assign(roleForm, {
    name: role.name,
    displayName: role.displayName,
    description: role.description,
    permissions: [...role.permissions]
  })
  showCreateRole.value = true
}

const duplicateRole = (role: Role) => {
  editingRole.value = null
  Object.assign(roleForm, {
    name: `${role.name}_copy`,
    displayName: `${role.displayName} (副本)`,
    description: role.description,
    permissions: [...role.permissions]
  })
  showCreateRole.value = true
}

const deleteRole = async (roleId: string) => {
  try {
    // 模拟删除角色
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = roles.value.findIndex(r => r.id === roleId)
    if (index !== -1) {
      roles.value.splice(index, 1)
      if (selectedRole.value?.id === roleId) {
        selectedRole.value = roles.value[0] || null
      }
    }
    
    message.success('角色删除成功')
  } catch (error) {
    message.error('角色删除失败')
  }
}

const resetRoleForm = () => {
  editingRole.value = null
  Object.assign(roleForm, {
    name: '',
    displayName: '',
    description: '',
    permissions: []
  })
  showCreateRole.value = false
}

const handleSaveRole = async () => {
  try {
    await roleFormRef.value.validate()
    saving.value = true
    
    // 模拟保存角色
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (editingRole.value) {
      // 更新角色
      const index = roles.value.findIndex(r => r.id === editingRole.value!.id)
      if (index !== -1) {
        roles.value[index] = {
          ...roles.value[index],
          ...roleForm,
          updated_at: new Date().toISOString()
        }
      }
      message.success('角色更新成功')
    } else {
      // 创建新角色
      const newRole: Role = {
        id: `role-${Date.now()}`,
        ...roleForm,
        isSystem: false,
        userCount: 0,
        created_at: new Date().toISOString()
      }
      roles.value.push(newRole)
      message.success('角色创建成功')
    }
    
    resetRoleForm()
  } catch (error) {
    // 表单验证失败
  } finally {
    saving.value = false
  }
}

const editRolePermissions = (role: Role) => {
  editingPermissionsRole.value = role
  editingPermissions.value = [...role.permissions]
  showPermissionsEditor.value = true
}

const saveRolePermissions = async () => {
  try {
    // 模拟保存权限
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (editingPermissionsRole.value) {
      const index = roles.value.findIndex(r => r.id === editingPermissionsRole.value!.id)
      if (index !== -1) {
        roles.value[index].permissions = [...editingPermissions.value]
        roles.value[index].updated_at = new Date().toISOString()
      }
      
      if (selectedRole.value?.id === editingPermissionsRole.value.id) {
        selectedRole.value.permissions = [...editingPermissions.value]
      }
    }
    
    message.success('权限设置已保存')
    showPermissionsEditor.value = false
  } catch (error) {
    message.error('权限保存失败')
  }
}

const selectAllPermissions = () => {
  editingPermissions.value = permissionGroups.flatMap(group => group.permissions.map(p => p.id))
}

const clearAllPermissions = () => {
  editingPermissions.value = []
}

const toggleEditingPermission = (permissionId: string, event: any) => {
  if (event.target.checked) {
    if (!editingPermissions.value.includes(permissionId)) {
      editingPermissions.value.push(permissionId)
    }
  } else {
    const index = editingPermissions.value.indexOf(permissionId)
    if (index !== -1) {
      editingPermissions.value.splice(index, 1)
    }
  }
}

const toggleEditingGroupPermissions = (group: PermissionGroup, event: any) => {
  const groupPermissionIds = group.permissions.map(p => p.id)
  
  if (event.target.checked) {
    // 添加组内所有权限
    groupPermissionIds.forEach(id => {
      if (!editingPermissions.value.includes(id)) {
        editingPermissions.value.push(id)
      }
    })
  } else {
    // 移除组内所有权限
    editingPermissions.value = editingPermissions.value.filter(id => !groupPermissionIds.includes(id))
  }
}

const getEditingGroupChecked = (group: PermissionGroup): boolean => {
  const groupPermissionIds = group.permissions.map(p => p.id)
  return groupPermissionIds.every(id => editingPermissions.value.includes(id))
}

const getEditingGroupIndeterminate = (group: PermissionGroup): boolean => {
  const groupPermissionIds = group.permissions.map(p => p.id)
  const checkedCount = groupPermissionIds.filter(id => editingPermissions.value.includes(id)).length
  return checkedCount > 0 && checkedCount < groupPermissionIds.length
}

// 表单中的权限组操作
const toggleGroupPermissions = (group: PermissionGroup, event: any) => {
  const groupPermissionIds = group.permissions.map(p => p.id)
  
  if (event.target.checked) {
    groupPermissionIds.forEach(id => {
      if (!roleForm.permissions.includes(id)) {
        roleForm.permissions.push(id)
      }
    })
  } else {
    roleForm.permissions = roleForm.permissions.filter(id => !groupPermissionIds.includes(id))
  }
}

const getGroupChecked = (group: PermissionGroup): boolean => {
  const groupPermissionIds = group.permissions.map(p => p.id)
  return groupPermissionIds.every(id => roleForm.permissions.includes(id))
}

const getGroupIndeterminate = (group: PermissionGroup): boolean => {
  const groupPermissionIds = group.permissions.map(p => p.id)
  const checkedCount = groupPermissionIds.filter(id => roleForm.permissions.includes(id)).length
  return checkedCount > 0 && checkedCount < groupPermissionIds.length
}

// 工具函数
const getRoleIcon = (roleName: string) => {
  const icons: Record<string, any> = {
    student: User,
    parent: UserCheck,
    teacher: GraduationCap,
    admin: Crown
  }
  return icons[roleName] || User
}

const getPermissionIcon = (permissionId: string) => {
  if (permissionId.startsWith('games:')) return Gamepad2
  if (permissionId.startsWith('assessment:')) return BarChart3
  if (permissionId.startsWith('progress:')) return Target
  if (permissionId.startsWith('content:')) return BookOpen
  if (permissionId.startsWith('user:')) return Users
  if (permissionId.startsWith('system:')) return SettingsIcon
  return Shield
}

const getPermissionName = (permissionId: string): string => {
  for (const group of permissionGroups) {
    const permission = group.permissions.find(p => p.id === permissionId)
    if (permission) {
      return permission.name
    }
  }
  return permissionId
}

// 生命周期
onMounted(() => {
  loadRoles()
})
</script>

<style scoped lang="less">
.role-permissions {
  .permissions-card {
    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;

      .role-card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: #3b82f6;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
        }

        &.active {
          border-color: #3b82f6;
          background-color: #f8fafc;
        }

        .role-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;

          .role-info {
            display: flex;
            gap: 12px;

            .role-icon {
              width: 24px;
              height: 24px;
              color: #3b82f6;
              flex-shrink: 0;
              margin-top: 2px;
            }

            h4 {
              margin: 0 0 4px 0;
              font-size: 16px;
              font-weight: 600;
            }

            p {
              margin: 0;
              font-size: 14px;
              color: #6b7280;
            }
          }
        }

        .role-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;

          .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #6b7280;

            svg {
              width: 14px;
              height: 14px;
            }
          }
        }

        .role-permissions-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          align-items: center;

          .more-permissions {
            font-size: 12px;
            color: #6b7280;
          }
        }
      }
    }

    .permissions-panel {
      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
      }

      .permissions-content {
        .permission-group {
          margin-bottom: 24px;

          h4 {
            margin-bottom: 12px;
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
          }

          .permissions-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 8px;

            .permission-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              transition: all 0.2s;

              &.granted {
                border-color: #10b981;
                background-color: #f0fdf4;
              }

              &.denied {
                border-color: #ef4444;
                background-color: #fef2f2;
              }

              .permission-info {
                display: flex;
                align-items: center;
                gap: 8px;

                .permission-icon {
                  width: 16px;
                  height: 16px;
                  color: #6b7280;
                }

                .permission-name {
                  font-weight: 500;
                  display: block;
                }

                .permission-desc {
                  font-size: 12px;
                  color: #6b7280;
                  margin: 2px 0 0 0;
                }
              }

              .permission-status {
                .granted-icon {
                  color: #10b981;
                  width: 20px;
                  height: 20px;
                }

                .denied-icon {
                  color: #ef4444;
                  width: 20px;
                  height: 20px;
                }
              }
            }
          }
        }
      }
    }
  }

  .permissions-selector {
    .permission-group-selector {
      margin-bottom: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      overflow: hidden;

      .group-header {
        background-color: #f9fafb;
        padding: 12px 16px;
        border-bottom: 1px solid #e5e7eb;
      }

      .group-permissions {
        padding: 12px 16px;

        .permission-checkbox {
          display: block;
          margin-bottom: 8px;

          .permission-checkbox-content {
            display: flex;
            flex-direction: column;
            margin-left: 8px;

            span {
              font-weight: 500;
            }

            small {
              color: #6b7280;
              margin-top: 2px;
            }
          }
        }
      }
    }
  }

  .permissions-editor {
    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .permissions-tree {
      .permission-tree-group {
        margin-bottom: 20px;

        .tree-group-header {
          margin-bottom: 12px;
        }

        .tree-group-content {
          margin-left: 24px;

          .tree-permission-item {
            margin-bottom: 8px;

            .tree-permission-content {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-left: 8px;

              .tree-permission-icon {
                width: 16px;
                height: 16px;
                color: #6b7280;
              }

              .tree-permission-name {
                font-weight: 500;
              }

              .tree-permission-desc {
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

  .danger-item {
    color: #ef4444 !important;

    &:hover {
      background-color: #fef2f2 !important;
    }
  }
}
</style>