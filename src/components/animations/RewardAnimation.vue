<template>
  <div class="reward-animation" v-if="isVisible">
    <!-- 积分奖励动画 -->
    <div class="points-reward" v-if="type === 'points'" :class="{ active: isActive }">
      <div class="points-container">
        <div class="points-icon">🏆</div>
        <div class="points-text">+{{ points }}分</div>
        <div class="points-sparkles">
          <span v-for="i in 8" :key="i" class="sparkle" :style="{ animationDelay: `${i * 0.1}s` }">✨</span>
        </div>
      </div>
    </div>

    <!-- 星星奖励动画 -->
    <div class="stars-reward" v-if="type === 'stars'" :class="{ active: isActive }">
      <div class="stars-container">
        <div class="star-burst">
          <div class="star" v-for="i in starCount" :key="i" :style="{ animationDelay: `${i * 0.2}s` }">⭐</div>
        </div>
        <div class="stars-text">获得 {{ starCount }} 颗星星!</div>
      </div>
    </div>

    <!-- 徽章解锁动画 -->
    <div class="badge-reward" v-if="type === 'badge'" :class="{ active: isActive }">
      <div class="badge-container">
        <div class="badge-glow"></div>
        <div class="badge-icon">🏅</div>
        <div class="badge-text">解锁新徽章!</div>
        <div class="badge-name">{{ badgeName }}</div>
        <div class="confetti-burst">
          <div class="confetti" v-for="i in 20" :key="i" :style="getConfettiStyle(i)"></div>
        </div>
      </div>
    </div>

    <!-- 关卡完成动画 -->
    <div class="level-complete" v-if="type === 'level'" :class="{ active: isActive }">
      <div class="level-container">
        <div class="level-circle">
          <div class="level-number">{{ level }}</div>
        </div>
        <div class="level-text">关卡完成!</div>
        <div class="level-fireworks">
          <div class="firework" v-for="i in 6" :key="i" :style="{ animationDelay: `${i * 0.3}s` }">
            <div class="firework-spark" v-for="j in 8" :key="j"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 连击奖励动画 -->
    <div class="combo-reward" v-if="type === 'combo'" :class="{ active: isActive }">
      <div class="combo-container">
        <div class="combo-text">{{ combo }}连击!</div>
        <div class="combo-multiplier">x{{ multiplier }}</div>
        <div class="combo-lightning">
          <div class="lightning" v-for="i in 4" :key="i" :style="{ animationDelay: `${i * 0.1}s` }">⚡</div>
        </div>
      </div>
    </div>

    <!-- 完美答题动画 -->
    <div class="perfect-reward" v-if="type === 'perfect'" :class="{ active: isActive }">
      <div class="perfect-container">
        <div class="perfect-text">完美!</div>
        <div class="perfect-crown">👑</div>
        <div class="perfect-rays">
          <div class="ray" v-for="i in 12" :key="i" :style="{ transform: `rotate(${i * 30}deg)` }"></div>
        </div>
      </div>
    </div>

    <!-- 经验值奖励动画 -->
    <div class="exp-reward" v-if="type === 'exp'" :class="{ active: isActive }">
      <div class="exp-container">
        <div class="exp-bar">
          <div class="exp-fill" :style="{ width: `${expPercentage}%` }"></div>
        </div>
        <div class="exp-text">+{{ exp }} EXP</div>
        <div class="exp-particles">
          <div class="particle" v-for="i in 15" :key="i" :style="getParticleStyle(i)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface Props {
  type: 'points' | 'stars' | 'badge' | 'level' | 'combo' | 'perfect' | 'exp'
  points?: number
  starCount?: number
  badgeName?: string
  level?: number
  combo?: number
  multiplier?: number
  exp?: number
  expPercentage?: number
  duration?: number
  autoHide?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  points: 100,
  starCount: 3,
  badgeName: '学习达人',
  level: 1,
  combo: 5,
  multiplier: 2,
  exp: 50,
  expPercentage: 75,
  duration: 3000,
  autoHide: true
})

const emit = defineEmits<{
  complete: []
}>()

const isVisible = ref(false)
const isActive = ref(false)

// 显示动画
const show = () => {
  isVisible.value = true
  setTimeout(() => {
    isActive.value = true
  }, 50)

  if (props.autoHide) {
    setTimeout(() => {
      hide()
    }, props.duration)
  }
}

// 隐藏动画
const hide = () => {
  isActive.value = false
  setTimeout(() => {
    isVisible.value = false
    emit('complete')
  }, 500)
}

// 生成彩纸样式
const getConfettiStyle = (index: number) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']
  return {
    backgroundColor: colors[index % colors.length],
    animationDelay: `${index * 0.05}s`,
    left: `${Math.random() * 100}%`,
    animationDuration: `${1 + Math.random()}s`
  }
}

// 生成粒子样式
const getParticleStyle = (index: number) => {
  return {
    animationDelay: `${index * 0.05}s`,
    left: `${Math.random() * 100}%`,
    animationDuration: `${0.8 + Math.random() * 0.4}s`
  }
}

// 暴露方法
defineExpose({
  show,
  hide
})

onMounted(() => {
  show()
})
</script>

<style scoped lang="less">
.reward-animation {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  pointer-events: none;
}

// 积分奖励动画
.points-reward {
  .points-container {
    text-align: center;
    opacity: 0;
    transform: scale(0.5) translateY(50px);
    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);

    .points-icon {
      font-size: 60px;
      margin-bottom: 10px;
      animation: pointsBounce 0.8s ease-out;
    }

    .points-text {
      font-size: 36px;
      font-weight: bold;
      color: #ffd700;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      animation: pointsGlow 1s ease-in-out infinite alternate;
    }

    .points-sparkles {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      .sparkle {
        position: absolute;
        font-size: 20px;
        animation: sparkleFloat 1.5s ease-out forwards;

        &:nth-child(1) { top: -40px; left: -40px; }
        &:nth-child(2) { top: -30px; right: -40px; }
        &:nth-child(3) { bottom: -40px; left: -30px; }
        &:nth-child(4) { bottom: -30px; right: -30px; }
        &:nth-child(5) { top: -50px; left: 0; }
        &:nth-child(6) { bottom: -50px; right: 0; }
        &:nth-child(7) { top: 0; left: -50px; }
        &:nth-child(8) { top: 0; right: -50px; }
      }
    }
  }

  &.active .points-container {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// 星星奖励动画
.stars-reward {
  .stars-container {
    text-align: center;
    opacity: 0;
    transform: scale(0.3);
    transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);

    .star-burst {
      margin-bottom: 20px;

      .star {
        display: inline-block;
        font-size: 40px;
        margin: 0 5px;
        animation: starPop 0.6s ease-out forwards;
        transform: scale(0);
      }
    }

    .stars-text {
      font-size: 24px;
      font-weight: bold;
      color: #ffd700;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }
  }

  &.active .stars-container {
    opacity: 1;
    transform: scale(1);
  }
}

// 徽章奖励动画
.badge-reward {
  .badge-container {
    position: relative;
    text-align: center;
    opacity: 0;
    transform: scale(0.5) rotateY(180deg);
    transition: all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);

    .badge-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 120px;
      height: 120px;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%);
      border-radius: 50%;
      animation: badgeGlow 2s ease-in-out infinite;
    }

    .badge-icon {
      font-size: 80px;
      margin-bottom: 15px;
      animation: badgeRotate 1s ease-out;
    }

    .badge-text {
      font-size: 28px;
      font-weight: bold;
      color: #ff6b6b;
      margin-bottom: 10px;
    }

    .badge-name {
      font-size: 20px;
      color: #4ecdc4;
      font-weight: 600;
    }

    .confetti-burst {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      .confetti {
        position: absolute;
        width: 8px;
        height: 8px;
        animation: confettiFall 2s ease-out forwards;
      }
    }
  }

  &.active .badge-container {
    opacity: 1;
    transform: scale(1) rotateY(0deg);
  }
}

// 关卡完成动画
.level-complete {
  .level-container {
    text-align: center;
    opacity: 0;
    transform: scale(0.8) translateY(-30px);
    transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);

    .level-circle {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: levelPulse 1s ease-in-out infinite alternate;

      .level-number {
        font-size: 36px;
        font-weight: bold;
        color: white;
      }
    }

    .level-text {
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 20px;
    }

    .level-fireworks {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      .firework {
        position: absolute;
        animation: fireworkExplode 1.5s ease-out forwards;

        .firework-spark {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #ffd700;
          border-radius: 50%;
          animation: sparkFly 1s ease-out forwards;

          &:nth-child(1) { animation-delay: 0s; transform: rotate(0deg); }
          &:nth-child(2) { animation-delay: 0.1s; transform: rotate(45deg); }
          &:nth-child(3) { animation-delay: 0.2s; transform: rotate(90deg); }
          &:nth-child(4) { animation-delay: 0.3s; transform: rotate(135deg); }
          &:nth-child(5) { animation-delay: 0.4s; transform: rotate(180deg); }
          &:nth-child(6) { animation-delay: 0.5s; transform: rotate(225deg); }
          &:nth-child(7) { animation-delay: 0.6s; transform: rotate(270deg); }
          &:nth-child(8) { animation-delay: 0.7s; transform: rotate(315deg); }
        }
      }
    }
  }

  &.active .level-container {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// 连击奖励动画
.combo-reward {
  .combo-container {
    text-align: center;
    opacity: 0;
    transform: scale(1.2) rotateZ(10deg);
    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);

    .combo-text {
      font-size: 48px;
      font-weight: bold;
      color: #ff6b6b;
      text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
      animation: comboShake 0.5s ease-in-out;
    }

    .combo-multiplier {
      font-size: 32px;
      color: #ffd700;
      font-weight: bold;
      margin-top: 10px;
    }

    .combo-lightning {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      .lightning {
        position: absolute;
        font-size: 30px;
        animation: lightningStrike 0.8s ease-out forwards;

        &:nth-child(1) { top: -60px; left: -30px; }
        &:nth-child(2) { top: -40px; right: -30px; }
        &:nth-child(3) { bottom: -60px; left: -20px; }
        &:nth-child(4) { bottom: -40px; right: -20px; }
      }
    }
  }

  &.active .combo-container {
    opacity: 1;
    transform: scale(1) rotateZ(0deg);
  }
}

// 完美答题动画
.perfect-reward {
  .perfect-container {
    text-align: center;
    opacity: 0;
    transform: scale(0.5) rotateY(90deg);
    transition: all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);

    .perfect-text {
      font-size: 56px;
      font-weight: bold;
      background: linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: perfectShine 2s ease-in-out infinite;
    }

    .perfect-crown {
      font-size: 60px;
      margin-top: 15px;
      animation: crownFloat 2s ease-in-out infinite;
    }

    .perfect-rays {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      .ray {
        position: absolute;
        width: 4px;
        height: 60px;
        background: linear-gradient(to top, transparent, #ffd700, transparent);
        transform-origin: bottom center;
        animation: rayRotate 3s linear infinite;
      }
    }
  }

  &.active .perfect-container {
    opacity: 1;
    transform: scale(1) rotateY(0deg);
  }
}

// 经验值奖励动画
.exp-reward {
  .exp-container {
    text-align: center;
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease-out;

    .exp-bar {
      width: 200px;
      height: 20px;
      background: #f0f0f0;
      border-radius: 10px;
      overflow: hidden;
      margin: 0 auto 15px;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

      .exp-fill {
        height: 100%;
        background: linear-gradient(90deg, #4ecdc4, #44a08d);
        border-radius: 10px;
        transition: width 1s ease-out;
        animation: expGlow 1.5s ease-in-out infinite alternate;
      }
    }

    .exp-text {
      font-size: 24px;
      font-weight: bold;
      color: #4ecdc4;
    }

    .exp-particles {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      .particle {
        position: absolute;
        width: 6px;
        height: 6px;
        background: #4ecdc4;
        border-radius: 50%;
        animation: particleRise 1.2s ease-out forwards;
      }
    }
  }

  &.active .exp-container {
    opacity: 1;
    transform: translateY(0);
  }
}

// 动画定义
@keyframes pointsBounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

@keyframes pointsGlow {
  0% { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.5); }
  100% { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 215, 0, 0.8); }
}

@keyframes sparkleFloat {
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
  100% { opacity: 0; transform: scale(0) rotate(360deg); }
}

@keyframes starPop {
  0% { transform: scale(0) rotate(0deg); }
  50% { transform: scale(1.3) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

@keyframes badgeGlow {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
}

@keyframes badgeRotate {
  0% { transform: rotateY(0deg) scale(0.5); }
  50% { transform: rotateY(180deg) scale(1.2); }
  100% { transform: rotateY(360deg) scale(1); }
}

@keyframes confettiFall {
  0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100px) rotate(360deg); opacity: 0; }
}

@keyframes levelPulse {
  0% { transform: scale(1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
  100% { transform: scale(1.05); box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4); }
}

@keyframes fireworkExplode {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}

@keyframes sparkFly {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(50px); opacity: 0; }
}

@keyframes comboShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes lightningStrike {
  0% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0; transform: scale(1); }
}

@keyframes perfectShine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes crownFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes rayRotate {
  0% { transform: rotate(0deg); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: rotate(360deg); opacity: 0; }
}

@keyframes expGlow {
  0% { box-shadow: 0 0 5px rgba(78, 205, 196, 0.5); }
  100% { box-shadow: 0 0 20px rgba(78, 205, 196, 0.8); }
}

@keyframes particleRise {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-50px) scale(0); opacity: 0; }
}

@media (max-width: 768px) {
  .reward-animation {
    .points-reward .points-container .points-text,
    .combo-reward .combo-container .combo-text,
    .perfect-reward .perfect-container .perfect-text {
      font-size: 28px;
    }

    .level-complete .level-container .level-circle {
      width: 80px;
      height: 80px;

      .level-number {
        font-size: 28px;
      }
    }

    .badge-reward .badge-container .badge-icon {
      font-size: 60px;
    }
  }
}
</style>