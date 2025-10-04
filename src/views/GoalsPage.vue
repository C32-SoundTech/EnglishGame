<template>
  <div class="goals-page">
    <div class="page-header">
      <h1>学习目标</h1>
      <p>设定和管理你的学习目标</p>
    </div>
    
    <a-card title="学习目标管理" class="goals-card">
      <div class="goals-content">
        <a-empty description="目标功能正在开发中..." />
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
// 目标页面组件
</script>

<style lang="less" scoped>
.goals-page {
  padding: 24px;
  
  .page-header {
    margin-bottom: 24px;
    
    h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    p {
      color: #666;
      margin: 0;
    }
  }
  
  .goals-card {
    .goals-content {
      padding: 40px 0;
    }
  }
}
</style>