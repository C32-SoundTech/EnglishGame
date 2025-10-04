<template>
  <div 
    class="animated-card" 
    :class="[
      `card-${variant}`,
      { 'card-hover': hover, 'card-loading': loading, 'card-success': success }
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <!-- 卡通装饰元素 -->
    <div class="card-decorations">
      <div class="decoration star" v-if="showStars">
        <div class="star-item" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.2}s` }">⭐</div>
      </div>
      <div class="decoration rainbow" v-if="showRainbow">🌈</div>
      <div class="decoration sparkles" v-if="showSparkles">
        <span v-for="i in 5" :key="i" :style="{ animationDelay: `${i * 0.1}s` }">✨</span>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="card-content">
      <div class="card-icon" v-if="icon">
        <component :is="icon" class="icon" />
      </div>
      
      <div class="card-body">
        <h3 class="card-title" v-if="title">{{ title }}</h3>
        <p class="card-description" v-if="description">{{ description }}</p>
        <slot></slot>
      </div>

      <!-- 进度指示器 -->
      <div class="card-progress" v-if="progress !== undefined">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <span class="progress-text">{{ progress }}%</span>
      </div>
    </div>

    <!-- 成功动画 -->
    <div class="success-animation" v-if="success">
      <div class="success-circle">
        <div class="success-check">✓</div>
      </div>
      <div class="success-confetti">
        <div class="confetti" v-for="i in 10" :key="i" :style="{ animationDelay: `${i * 0.1}s` }"></div>
      </div>
    </div>

    <!-- 加载动画 -->
    <div class="loading-overlay" v-if="loading">
      <div class="loading-spinner">
        <div class="spinner-dot" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.2}s` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'cute'
  title?: string
  description?: string
  icon?: any
  progress?: number
  loading?: boolean
  success?: boolean
  showStars?: boolean
  showRainbow?: boolean
  showSparkles?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  showStars: false,
  showRainbow: false,
  showSparkles: false,
  clickable: true
})

const emit = defineEmits<{
  click: []
  hover: [boolean]
}>()

const hover = ref(false)

const handleMouseEnter = () => {
  hover.value = true
  emit('hover', true)
}

const handleMouseLeave = () => {
  hover.value = false
  emit('hover', false)
}

const handleClick = () => {
  if (props.clickable && !props.loading) {
    emit('click')
  }
}
</script>

<style scoped lang="less">
.animated-card {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  &.card-primary {
    border-color: #1890ff;
    background: linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%);
  }

  &.card-success {
    border-color: #52c41a;
    background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
  }

  &.card-warning {
    border-color: #fa8c16;
    background: linear-gradient(135deg, #fff7e6 0%, #ffffff 100%);
  }

  &.card-info {
    border-color: #13c2c2;
    background: linear-gradient(135deg, #e6fffb 0%, #ffffff 100%);
  }

  &.card-cute {
    border-color: #eb2f96;
    background: linear-gradient(135deg, #fff0f6 0%, #ffffff 100%);
  }

  &.card-loading {
    pointer-events: none;
  }

  &.card-success {
    animation: successPulse 0.6s ease-out;
  }
}

.card-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;

  .decoration {
    position: absolute;

    &.star {
      top: 10px;
      right: 10px;

      .star-item {
        display: inline-block;
        font-size: 16px;
        animation: starTwinkle 2s infinite;
        margin-left: 4px;
      }
    }

    &.rainbow {
      top: 10px;
      left: 10px;
      font-size: 20px;
      animation: rainbowFloat 3s ease-in-out infinite;
    }

    &.sparkles {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      span {
        position: absolute;
        font-size: 12px;
        animation: sparkleFloat 2s infinite;

        &:nth-child(1) { top: -20px; left: -20px; }
        &:nth-child(2) { top: -10px; right: -20px; }
        &:nth-child(3) { bottom: -20px; left: -10px; }
        &:nth-child(4) { bottom: -10px; right: -10px; }
        &:nth-child(5) { top: 0; left: 0; }
      }
    }
  }
}

.card-content {
  position: relative;
  z-index: 2;
}

.card-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;

  .icon {
    width: 48px;
    height: 48px;
    color: #1890ff;
    animation: iconBounce 2s ease-in-out infinite;
  }
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
  text-align: center;
}

.card-description {
  font-size: 14px;
  color: #595959;
  margin: 0 0 16px 0;
  text-align: center;
  line-height: 1.5;
}

.card-progress {
  margin-top: 16px;

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #1890ff, #52c41a);
      border-radius: 4px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      animation: progressShine 2s infinite;
    }
  }

  .progress-text {
    display: block;
    text-align: center;
    font-size: 12px;
    color: #8c8c8c;
    font-weight: 600;
  }
}

.success-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;

  .success-circle {
    width: 80px;
    height: 80px;
    background: #52c41a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: successScale 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);

    .success-check {
      color: white;
      font-size: 32px;
      font-weight: bold;
      animation: checkAppear 0.4s ease-out 0.3s both;
    }
  }

  .success-confetti {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .confetti {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #ffd700;
      animation: confettiFall 1s ease-out forwards;

      &:nth-child(odd) { background: #ff69b4; }
      &:nth-child(3n) { background: #00bfff; }
      &:nth-child(4n) { background: #32cd32; }
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;

  .loading-spinner {
    display: flex;
    gap: 8px;

    .spinner-dot {
      width: 12px;
      height: 12px;
      background: #1890ff;
      border-radius: 50%;
      animation: spinnerBounce 1.4s ease-in-out infinite both;
    }
  }
}

// 动画定义
@keyframes starTwinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

@keyframes rainbowFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes sparkleFloat {
  0%, 100% { opacity: 0; transform: translateY(0) scale(0); }
  50% { opacity: 1; transform: translateY(-10px) scale(1); }
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes progressShine {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes successScale {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes checkAppear {
  0% { opacity: 0; transform: scale(0); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes confettiFall {
  0% {
    opacity: 1;
    transform: translateY(-50px) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(100px) rotate(360deg);
  }
}

@keyframes spinnerBounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .animated-card {
    padding: 16px;
    border-radius: 16px;

    &:hover {
      transform: translateY(-4px) scale(1.01);
    }
  }

  .card-icon .icon {
    width: 40px;
    height: 40px;
  }

  .card-title {
    font-size: 18px;
  }

  .success-animation .success-circle {
    width: 60px;
    height: 60px;

    .success-check {
      font-size: 24px;
    }
  }
}
</style>