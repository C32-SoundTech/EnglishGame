<template>
  <MainLayout>
    <div class="reminders-page">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <Bell class="w-6 h-6 mr-3" />
          提醒设置
        </h1>
        <p class="page-subtitle">个性化您的学习提醒，养成良好的学习习惯</p>
      </div>

      <!-- 提醒系统组件 -->
      <ReminderSystem :notification-center="notificationCenter" />
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import ReminderSystem from '@/components/ReminderSystem.vue'
import { Bell } from 'lucide-vue-next'

// 获取通知中心实例
const notificationCenter = inject('notificationCenter', null)
</script>

<style lang="less" scoped>
.reminders-page {
  .page-header {
    margin-bottom: 32px;
    text-align: center;

    .page-title {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 8px;
    }

    .page-subtitle {
      font-size: 16px;
      color: #8c8c8c;
      margin: 0;
    }
  }
}

@media (max-width: 768px) {
  .reminders-page {
    .page-header {
      .page-title {
        font-size: 24px;
        flex-direction: column;
        gap: 8px;
      }

      .page-subtitle {
        font-size: 14px;
      }
    }
  }
}
</style>