<template>
  <div class="loading-states">
    <!-- 全屏加载 -->
    <div v-if="type === 'fullscreen'" class="fullscreen-loading">
      <div class="loading-container">
        <div class="loading-animation">
          <div class="spinner-container">
            <div class="spinner" :class="spinnerClass"></div>
          </div>
          <div class="loading-content">
            <h3 class="loading-title">{{ title || '加载中...' }}</h3>
            <p class="loading-description" v-if="description">{{ description }}</p>
            <div class="loading-progress" v-if="showProgress">
              <a-progress 
                :percent="progress" 
                :status="progressStatus"
                :show-info="showProgressText"
              />
              <div class="progress-text" v-if="progressText">{{ progressText }}</div>
            </div>
          </div>
        </div>
        
        <!-- 取消按钮 -->
        <div class="loading-actions" v-if="cancellable">
          <a-button @click="handleCancel">取消</a-button>
        </div>
      </div>
      
      <!-- 背景遮罩 -->
      <div class="loading-backdrop" :class="backdropClass"></div>
    </div>
    
    <!-- 卡片加载 -->
    <div v-else-if="type === 'card'" class="card-loading">
      <a-card :loading="true" :title="title">
        <template v-if="$slots.default">
          <slot />
        </template>
        <div v-else class="card-skeleton">
          <a-skeleton :loading="true" :paragraph="{ rows: skeletonRows }" />
        </div>
      </a-card>
    </div>
    
    <!-- 按钮加载 -->
    <div v-else-if="type === 'button'" class="button-loading">
      <a-button 
        :loading="true" 
        :type="buttonType"
        :size="buttonSize"
        :disabled="true"
      >
        {{ title || '加载中...' }}
      </a-button>
    </div>
    
    <!-- 表格加载 -->
    <div v-else-if="type === 'table'" class="table-loading">
      <a-table 
        :loading="true"
        :columns="tableColumns"
        :data-source="[]"
        :pagination="false"
      />
    </div>
    
    <!-- 列表加载 -->
    <div v-else-if="type === 'list'" class="list-loading">
      <a-list :loading="true">
        <template #loadMore>
          <div class="load-more">
            <a-spin />
            <span>{{ title || '加载更多...' }}</span>
          </div>
        </template>
      </a-list>
    </div>
    
    <!-- 内联加载 -->
    <div v-else-if="type === 'inline'" class="inline-loading">
      <a-spin :spinning="true" :size="spinSize">
        <div class="inline-content">
          <slot>
            <div class="inline-placeholder">
              <div class="placeholder-text">{{ title || '加载中...' }}</div>
            </div>
          </slot>
        </div>
      </a-spin>
    </div>
    
    <!-- 骨架屏加载 -->
    <div v-else-if="type === 'skeleton'" class="skeleton-loading">
      <a-skeleton 
        :loading="true"
        :active="skeletonActive"
        :paragraph="{ rows: skeletonRows }"
        :title="skeletonTitle"
        :avatar="skeletonAvatar"
      >
        <slot />
      </a-skeleton>
    </div>
    
    <!-- 点状加载 -->
    <div v-else-if="type === 'dots'" class="dots-loading">
      <div class="dots-container">
        <div class="dot" v-for="i in 3" :key="i"></div>
      </div>
      <div class="dots-text" v-if="title">{{ title }}</div>
    </div>
    
    <!-- 波浪加载 -->
    <div v-else-if="type === 'wave'" class="wave-loading">
      <div class="wave-container">
        <div class="wave" v-for="i in 5" :key="i" :style="{ animationDelay: `${i * 0.1}s` }"></div>
      </div>
      <div class="wave-text" v-if="title">{{ title }}</div>
    </div>
    
    <!-- 脉冲加载 -->
    <div v-else-if="type === 'pulse'" class="pulse-loading">
      <div class="pulse-container">
        <div class="pulse-circle"></div>
        <div class="pulse-text" v-if="title">{{ title }}</div>
      </div>
    </div>
    
    <!-- 自定义加载 -->
    <div v-else-if="type === 'custom'" class="custom-loading">
      <slot name="loading">
        <a-spin :spinning="true" :size="spinSize">
          <div class="custom-content">
            {{ title || '加载中...' }}
          </div>
        </a-spin>
      </slot>
    </div>
    
    <!-- 默认加载 -->
    <div v-else class="default-loading">
      <a-spin :spinning="true" :size="spinSize" :tip="title || '加载中...'">
        <div class="default-content">
          <slot />
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { TableColumnType } from 'ant-design-vue'

interface Props {
  type?: 'fullscreen' | 'card' | 'button' | 'table' | 'list' | 'inline' | 'skeleton' | 'dots' | 'wave' | 'pulse' | 'custom' | 'default'
  title?: string
  description?: string
  progress?: number
  progressText?: string
  showProgress?: boolean
  showProgressText?: boolean
  progressStatus?: 'normal' | 'active' | 'success' | 'exception'
  cancellable?: boolean
  spinSize?: 'small' | 'default' | 'large'
  spinnerVariant?: 'default' | 'dots' | 'ring' | 'bars' | 'pulse'
  backdropBlur?: boolean
  buttonType?: 'default' | 'primary' | 'dashed' | 'text' | 'link'
  buttonSize?: 'small' | 'middle' | 'large'
  tableColumns?: TableColumnType[]
  skeletonRows?: number
  skeletonActive?: boolean
  skeletonTitle?: boolean
  skeletonAvatar?: boolean
  timeout?: number
  onTimeout?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  progress: 0,
  showProgress: false,
  showProgressText: true,
  progressStatus: 'active',
  cancellable: false,
  spinSize: 'default',
  spinnerVariant: 'default',
  backdropBlur: false,
  buttonType: 'primary',
  buttonSize: 'middle',
  skeletonRows: 3,
  skeletonActive: true,
  skeletonTitle: true,
  skeletonAvatar: false,
  timeout: 0
})

// Emits
const emit = defineEmits<{
  cancel: []
  timeout: []
}>()

// 响应式数据
const timeoutId = ref<NodeJS.Timeout | null>(null)

// 计算属性
const spinnerClass = computed(() => {
  const classes = ['spinner']
  
  switch (props.spinnerVariant) {
    case 'dots':
      classes.push('spinner-dots')
      break
    case 'ring':
      classes.push('spinner-ring')
      break
    case 'bars':
      classes.push('spinner-bars')
      break
    case 'pulse':
      classes.push('spinner-pulse')
      break
    default:
      classes.push('spinner-default')
  }
  
  return classes
})

const backdropClass = computed(() => {
  return {
    'backdrop-blur': props.backdropBlur
  }
})

// 方法
const handleCancel = () => {
  emit('cancel')
}

const handleTimeout = () => {
  emit('timeout')
  props.onTimeout?.()
}

// 生命周期
onMounted(() => {
  if (props.timeout > 0) {
    timeoutId.value = setTimeout(handleTimeout, props.timeout)
  }
})

onUnmounted(() => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }
})

// 暴露给父组件的方法
defineExpose({
  clearTimeout: () => {
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
      timeoutId.value = null
    }
  }
})
</script>

<style scoped lang="less">
.loading-states {
  // 全屏加载样式
  .fullscreen-loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;

    .loading-container {
      position: relative;
      z-index: 10000;
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 400px;
      width: 90%;

      .loading-animation {
        .spinner-container {
          margin-bottom: 24px;

          .spinner {
            width: 60px;
            height: 60px;
            margin: 0 auto;

            &.spinner-default {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #1890ff;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }

            &.spinner-dots {
              display: flex;
              justify-content: space-between;
              align-items: center;

              &::before,
              &::after {
                content: '';
                width: 12px;
                height: 12px;
                background: #1890ff;
                border-radius: 50%;
                animation: dots 1.4s ease-in-out infinite both;
              }

              &::before {
                animation-delay: -0.32s;
              }

              &::after {
                animation-delay: -0.16s;
              }
            }

            &.spinner-ring {
              border: 4px solid rgba(24, 144, 255, 0.2);
              border-left: 4px solid #1890ff;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }

            &.spinner-bars {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              height: 40px;

              &::before,
              &::after {
                content: '';
                width: 8px;
                background: #1890ff;
                animation: bars 1.2s ease-in-out infinite;
              }

              &::before {
                animation-delay: -0.24s;
              }

              &::after {
                animation-delay: -0.12s;
              }
            }

            &.spinner-pulse {
              background: #1890ff;
              border-radius: 50%;
              animation: pulse 1.5s ease-in-out infinite;
            }
          }
        }

        .loading-content {
          .loading-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
          }

          .loading-description {
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
            line-height: 1.5;
          }

          .loading-progress {
            margin-top: 20px;

            .progress-text {
              margin-top: 8px;
              font-size: 12px;
              color: #999;
            }
          }
        }
      }

      .loading-actions {
        margin-top: 24px;
      }
    }

    .loading-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);

      &.backdrop-blur {
        backdrop-filter: blur(4px);
      }
    }
  }

  // 卡片加载样式
  .card-loading {
    .card-skeleton {
      padding: 20px 0;
    }
  }

  // 列表加载样式
  .list-loading {
    .load-more {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      color: #666;
    }
  }

  // 内联加载样式
  .inline-loading {
    .inline-content {
      min-height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;

      .inline-placeholder {
        .placeholder-text {
          color: #999;
          font-size: 14px;
        }
      }
    }
  }

  // 点状加载样式
  .dots-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    .dots-container {
      display: flex;
      gap: 8px;

      .dot {
        width: 12px;
        height: 12px;
        background: #1890ff;
        border-radius: 50%;
        animation: dots 1.4s ease-in-out infinite both;

        &:nth-child(1) { animation-delay: -0.32s; }
        &:nth-child(2) { animation-delay: -0.16s; }
        &:nth-child(3) { animation-delay: 0s; }
      }
    }

    .dots-text {
      font-size: 14px;
      color: #666;
    }
  }

  // 波浪加载样式
  .wave-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    .wave-container {
      display: flex;
      gap: 4px;

      .wave {
        width: 4px;
        height: 40px;
        background: #1890ff;
        border-radius: 2px;
        animation: wave 1.2s ease-in-out infinite;
      }
    }

    .wave-text {
      font-size: 14px;
      color: #666;
    }
  }

  // 脉冲加载样式
  .pulse-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    .pulse-container {
      .pulse-circle {
        width: 60px;
        height: 60px;
        background: #1890ff;
        border-radius: 50%;
        animation: pulse 1.5s ease-in-out infinite;
      }

      .pulse-text {
        margin-top: 16px;
        font-size: 14px;
        color: #666;
        text-align: center;
      }
    }
  }

  // 自定义加载样式
  .custom-loading {
    .custom-content {
      padding: 40px;
      text-align: center;
      color: #666;
    }
  }

  // 默认加载样式
  .default-loading {
    .default-content {
      min-height: 200px;
    }
  }
}

// 动画定义
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes dots {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bars {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

@keyframes wave {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .loading-states {
    .fullscreen-loading {
      .loading-container {
        padding: 24px 20px;
        margin: 20px;

        .loading-animation {
          .spinner-container {
            margin-bottom: 16px;

            .spinner {
              width: 40px;
              height: 40px;
            }
          }

          .loading-content {
            .loading-title {
              font-size: 16px;
            }

            .loading-description {
              font-size: 13px;
            }
          }
        }
      }
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .loading-states {
    .fullscreen-loading {
      .loading-container {
        background: #1f2937;
        color: #f9fafb;

        .loading-animation {
          .loading-content {
            .loading-title {
              color: #f9fafb;
            }

            .loading-description {
              color: #d1d5db;
            }
          }
        }
      }
    }

    .dots-loading .dots-text,
    .wave-loading .wave-text,
    .pulse-loading .pulse-text,
    .inline-loading .inline-placeholder .placeholder-text,
    .custom-loading .custom-content {
      color: #d1d5db;
    }
  }
}

// 无障碍支持
@media (prefers-reduced-motion: reduce) {
  .loading-states {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
</style>