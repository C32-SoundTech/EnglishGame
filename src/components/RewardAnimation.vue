<template>
  <div class="reward-animation-container">
    <!-- 积分奖励动画 -->
    <transition name="score-popup" appear>
      <div
        v-if="showScoreAnimation"
        class="score-popup"
        :class="scoreAnimationClass"
      >
        <div class="score-content">
          <Star class="w-6 h-6 text-yellow-400" />
          <span class="score-text">+{{ scoreGain }}</span>
          <div v-if="bonus > 0" class="bonus-text">
            奖励 +{{ bonus }}
          </div>
        </div>
      </div>
    </transition>

    <!-- 连击奖励动画 -->
    <transition name="streak-popup" appear>
      <div
        v-if="showStreakAnimation"
        class="streak-popup"
        :class="streakAnimationClass"
      >
        <div class="streak-content">
          <Zap class="w-8 h-8 text-orange-400" />
          <span class="streak-text">{{ streakCount }}连击!</span>
          <div class="streak-multiplier">{{ streakMultiplier }}x 积分</div>
        </div>
      </div>
    </transition>

    <!-- 徽章获得动画 -->
    <transition name="badge-earned" appear>
      <div v-if="showBadgeAnimation" class="badge-popup">
        <div class="badge-content">
          <div class="badge-glow">
            <Award class="w-12 h-12 text-yellow-500" />
          </div>
          <h3 class="badge-title">获得新徽章!</h3>
          <p class="badge-name">{{ earnedBadge?.name }}</p>
          <p class="badge-description">{{ earnedBadge?.description }}</p>
        </div>
      </div>
    </transition>

    <!-- 升级动画 -->
    <transition name="level-up" appear>
      <div v-if="showLevelUpAnimation" class="level-up-popup">
        <div class="level-up-content">
          <div class="level-up-icon">
            <TrendingUp class="w-16 h-16 text-green-500" />
          </div>
          <h2 class="level-up-title">恭喜升级!</h2>
          <div class="level-info">
            <span class="old-level">Lv.{{ oldLevel }}</span>
            <ArrowRight class="w-6 h-6 text-gray-400 mx-4" />
            <span class="new-level">Lv.{{ newLevel }}</span>
          </div>
          <p class="level-up-message">解锁了新的学习内容!</p>
        </div>
      </div>
    </transition>

    <!-- 完美完成动画 -->
    <transition name="perfect-completion" appear>
      <div v-if="showPerfectAnimation" class="perfect-popup">
        <div class="perfect-content">
          <div class="perfect-stars">
            <Star v-for="i in 3" :key="i" class="w-8 h-8 text-yellow-400 perfect-star" :style="{ animationDelay: `${i * 0.2}s` }" />
          </div>
          <h2 class="perfect-title">完美完成!</h2>
          <p class="perfect-message">你真是太棒了!</p>
        </div>
      </div>
    </transition>

    <!-- 粒子效果 -->
    <div v-if="showParticles" class="particles-container">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="{
          left: particle.x + 'px',
          top: particle.y + 'px',
          backgroundColor: particle.color,
          animationDelay: particle.delay + 's',
          animationDuration: particle.duration + 's'
        }"
      />
    </div>

    <!-- 彩带效果 -->
    <div v-if="showConfetti" class="confetti-container">
      <div
        v-for="confetti in confettiPieces"
        :key="confetti.id"
        class="confetti"
        :style="{
          left: confetti.x + '%',
          backgroundColor: confetti.color,
          animationDelay: confetti.delay + 's',
          animationDuration: confetti.duration + 's'
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Star, Zap, Award, TrendingUp, ArrowRight } from 'lucide-vue-next'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
  delay: number
  duration: number
}

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  duration: number
}

interface Props {
  scoreGain?: number
  bonus?: number
  streakCount?: number
  earnedBadge?: Badge | null
  oldLevel?: number
  newLevel?: number
  isPerfect?: boolean
}

interface Emits {
  (e: 'animationComplete', type: string): void
}

const props = withDefaults(defineProps<Props>(), {
  scoreGain: 0,
  bonus: 0,
  streakCount: 0,
  earnedBadge: null,
  oldLevel: 1,
  newLevel: 1,
  isPerfect: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const showScoreAnimation = ref(false)
const showStreakAnimation = ref(false)
const showBadgeAnimation = ref(false)
const showLevelUpAnimation = ref(false)
const showPerfectAnimation = ref(false)
const showParticles = ref(false)
const showConfetti = ref(false)

const particles = ref<Particle[]>([])
const confettiPieces = ref<ConfettiPiece[]>([])

// 计算属性
const scoreAnimationClass = computed(() => {
  if (props.scoreGain >= 100) return 'score-excellent'
  if (props.scoreGain >= 50) return 'score-good'
  return 'score-normal'
})

const streakAnimationClass = computed(() => {
  if (props.streakCount >= 10) return 'streak-amazing'
  if (props.streakCount >= 5) return 'streak-great'
  return 'streak-good'
})

const streakMultiplier = computed(() => {
  if (props.streakCount >= 10) return 3
  if (props.streakCount >= 5) return 2
  return 1.5
})

// 动画控制方法
const showScorePopup = async (duration = 2000) => {
  showScoreAnimation.value = true
  createParticles(20, '#fbbf24')
  
  setTimeout(() => {
    showScoreAnimation.value = false
    emit('animationComplete', 'score')
  }, duration)
}

const showStreakPopup = async (duration = 2500) => {
  showStreakAnimation.value = true
  createParticles(30, '#f97316')
  
  setTimeout(() => {
    showStreakAnimation.value = false
    emit('animationComplete', 'streak')
  }, duration)
}

const showBadgePopup = async (duration = 4000) => {
  showBadgeAnimation.value = true
  createConfetti()
  
  setTimeout(() => {
    showBadgeAnimation.value = false
    emit('animationComplete', 'badge')
  }, duration)
}

const showLevelUpPopup = async (duration = 4000) => {
  showLevelUpAnimation.value = true
  createConfetti()
  createParticles(50, '#10b981')
  
  setTimeout(() => {
    showLevelUpAnimation.value = false
    emit('animationComplete', 'levelUp')
  }, duration)
}

const showPerfectPopup = async (duration = 3000) => {
  showPerfectAnimation.value = true
  createConfetti()
  createParticles(40, '#fbbf24')
  
  setTimeout(() => {
    showPerfectAnimation.value = false
    emit('animationComplete', 'perfect')
  }, duration)
}

// 粒子效果
const createParticles = (count: number, baseColor: string) => {
  const colors = [baseColor, '#fbbf24', '#f97316', '#10b981', '#3b82f6']
  const newParticles: Particle[] = []
  
  for (let i = 0; i < count; i++) {
    newParticles.push({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 2
    })
  }
  
  particles.value = newParticles
  showParticles.value = true
  
  setTimeout(() => {
    showParticles.value = false
    particles.value = []
  }, 3000)
}

// 彩带效果
const createConfetti = () => {
  const colors = ['#fbbf24', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
  const newConfetti: ConfettiPiece[] = []
  
  for (let i = 0; i < 50; i++) {
    newConfetti.push({
      id: Date.now() + i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2
    })
  }
  
  confettiPieces.value = newConfetti
  showConfetti.value = true
  
  setTimeout(() => {
    showConfetti.value = false
    confettiPieces.value = []
  }, 5000)
}

// 组合动画
const playRewardSequence = async (type: 'score' | 'streak' | 'badge' | 'levelUp' | 'perfect') => {
  switch (type) {
    case 'score':
      await showScorePopup()
      break
    case 'streak':
      await showStreakPopup()
      break
    case 'badge':
      await showBadgePopup()
      break
    case 'levelUp':
      await showLevelUpPopup()
      break
    case 'perfect':
      await showPerfectPopup()
      break
  }
}

// 监听属性变化
watch(() => props.scoreGain, (newValue) => {
  if (newValue > 0) {
    nextTick(() => showScorePopup())
  }
})

watch(() => props.streakCount, (newValue) => {
  if (newValue > 1) {
    nextTick(() => showStreakPopup())
  }
})

watch(() => props.earnedBadge, (newValue) => {
  if (newValue) {
    nextTick(() => showBadgePopup())
  }
})

watch(() => props.newLevel, (newValue, oldValue) => {
  if (newValue > oldValue) {
    nextTick(() => showLevelUpPopup())
  }
})

watch(() => props.isPerfect, (newValue) => {
  if (newValue) {
    nextTick(() => showPerfectPopup())
  }
})

// 暴露方法
defineExpose({
  showScorePopup,
  showStreakPopup,
  showBadgePopup,
  showLevelUpPopup,
  showPerfectPopup,
  playRewardSequence
})
</script>

<style scoped>
.reward-animation-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}

/* 积分弹出动画 */
.score-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.score-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(251, 191, 36, 0.4);
  color: white;
  font-weight: bold;
}

.score-text {
  font-size: 24px;
  margin-top: 8px;
}

.bonus-text {
  font-size: 14px;
  margin-top: 4px;
  opacity: 0.9;
}

.score-normal {
  animation: scorePopup 2s ease-out;
}

.score-good {
  animation: scorePopupGood 2s ease-out;
}

.score-excellent {
  animation: scorePopupExcellent 2s ease-out;
}

/* 连击弹出动画 */
.streak-popup {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
}

.streak-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 28px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(249, 115, 22, 0.5);
  color: white;
  font-weight: bold;
}

.streak-text {
  font-size: 28px;
  margin-top: 8px;
}

.streak-multiplier {
  font-size: 16px;
  margin-top: 4px;
  opacity: 0.9;
}

.streak-good {
  animation: streakPopup 2.5s ease-out;
}

.streak-great {
  animation: streakPopupGreat 2.5s ease-out;
}

.streak-amazing {
  animation: streakPopupAmazing 2.5s ease-out;
}

/* 徽章获得动画 */
.badge-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1002;
}

.badge-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 24px;
  box-shadow: 0 16px 48px rgba(251, 191, 36, 0.6);
  color: white;
  text-align: center;
  max-width: 300px;
}

.badge-glow {
  position: relative;
  margin-bottom: 16px;
}

.badge-glow::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.6), transparent);
  border-radius: 50%;
  animation: glow 2s ease-in-out infinite alternate;
}

.badge-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.badge-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.badge-description {
  font-size: 14px;
  opacity: 0.9;
}

/* 升级动画 */
.level-up-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1003;
}

.level-up-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(16, 185, 129, 0.6);
  color: white;
  text-align: center;
}

.level-up-icon {
  margin-bottom: 16px;
  animation: bounce 1s ease-in-out infinite;
}

.level-up-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 16px;
}

.level-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 20px;
  font-weight: 600;
}

.old-level {
  opacity: 0.7;
}

.new-level {
  color: #fbbf24;
}

.level-up-message {
  font-size: 16px;
  opacity: 0.9;
}

/* 完美完成动画 */
.perfect-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1004;
}

.perfect-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 24px;
  box-shadow: 0 16px 48px rgba(251, 191, 36, 0.6);
  color: white;
  text-align: center;
}

.perfect-stars {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.perfect-star {
  animation: starTwinkle 1s ease-in-out infinite;
}

.perfect-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.perfect-message {
  font-size: 16px;
  opacity: 0.9;
}

/* 粒子效果 */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: particleFloat 3s ease-out forwards;
}

/* 彩带效果 */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  animation: confettiFall 5s linear forwards;
}

/* 动画定义 */
@keyframes scorePopup {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(-180deg);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.2) rotate(0deg);
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -80%) scale(0.8) rotate(0deg);
    opacity: 0;
  }
}

@keyframes scorePopupGood {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(-180deg);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.3) rotate(0deg);
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -50%) scale(1.1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -80%) scale(0.9) rotate(0deg);
    opacity: 0;
  }
}

@keyframes scorePopupExcellent {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(-360deg);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.4) rotate(0deg);
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -50%) scale(1.2) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -80%) scale(1) rotate(0deg);
    opacity: 0;
  }
}

@keyframes streakPopup {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  30% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  70% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -30%) scale(0.8);
    opacity: 0;
  }
}

@keyframes streakPopupGreat {
  0% {
    transform: translate(-50%, -50%) scale(0) rotateY(-180deg);
    opacity: 0;
  }
  30% {
    transform: translate(-50%, -50%) scale(1.3) rotateY(0deg);
    opacity: 1;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.1) rotateY(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -30%) scale(0.9) rotateY(0deg);
    opacity: 0;
  }
}

@keyframes streakPopupAmazing {
  0% {
    transform: translate(-50%, -50%) scale(0) rotateY(-360deg);
    opacity: 0;
  }
  30% {
    transform: translate(-50%, -50%) scale(1.4) rotateY(0deg);
    opacity: 1;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.2) rotateY(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -30%) scale(1) rotateY(0deg);
    opacity: 0;
  }
}

@keyframes glow {
  0% {
    opacity: 0.5;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes starTwinkle {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes confettiFall {
  0% {
    transform: translateY(-10px) rotateZ(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotateZ(720deg);
    opacity: 0;
  }
}

/* 过渡动画 */
.score-popup-enter-active,
.score-popup-leave-active {
  transition: all 0.3s ease;
}

.score-popup-enter-from,
.score-popup-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
}

.streak-popup-enter-active,
.streak-popup-leave-active {
  transition: all 0.3s ease;
}

.streak-popup-enter-from,
.streak-popup-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
}

.badge-earned-enter-active,
.badge-earned-leave-active {
  transition: all 0.5s ease;
}

.badge-earned-enter-from,
.badge-earned-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0) rotate(-180deg);
}

.level-up-enter-active,
.level-up-leave-active {
  transition: all 0.5s ease;
}

.level-up-enter-from,
.level-up-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
}

.perfect-completion-enter-active,
.perfect-completion-leave-active {
  transition: all 0.4s ease;
}

.perfect-completion-enter-from,
.perfect-completion-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .score-content,
  .streak-content {
    padding: 12px 20px;
  }
  
  .score-text {
    font-size: 20px;
  }
  
  .streak-text {
    font-size: 24px;
  }
  
  .badge-content,
  .level-up-content,
  .perfect-content {
    padding: 24px;
    max-width: 280px;
  }
  
  .level-up-title {
    font-size: 28px;
  }
  
  .perfect-title {
    font-size: 24px;
  }
}
</style>