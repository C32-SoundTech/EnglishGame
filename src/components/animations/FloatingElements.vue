<template>
  <div class="floating-elements" :class="{ active: isActive }">
    <!-- 浮动气泡 -->
    <div class="floating-bubbles" v-if="showBubbles">
      <div 
        class="bubble" 
        v-for="i in bubbleCount" 
        :key="`bubble-${i}`"
        :style="getBubbleStyle(i)"
      ></div>
    </div>

    <!-- 浮动星星 -->
    <div class="floating-stars" v-if="showStars">
      <div 
        class="star" 
        v-for="i in starCount" 
        :key="`star-${i}`"
        :style="getStarStyle(i)"
      >⭐</div>
    </div>

    <!-- 浮动心形 -->
    <div class="floating-hearts" v-if="showHearts">
      <div 
        class="heart" 
        v-for="i in heartCount" 
        :key="`heart-${i}`"
        :style="getHeartStyle(i)"
      >💖</div>
    </div>

    <!-- 浮动彩虹 -->
    <div class="floating-rainbows" v-if="showRainbows">
      <div 
        class="rainbow" 
        v-for="i in rainbowCount" 
        :key="`rainbow-${i}`"
        :style="getRainbowStyle(i)"
      >🌈</div>
    </div>

    <!-- 浮动云朵 -->
    <div class="floating-clouds" v-if="showClouds">
      <div 
        class="cloud" 
        v-for="i in cloudCount" 
        :key="`cloud-${i}`"
        :style="getCloudStyle(i)"
      >☁️</div>
    </div>

    <!-- 浮动花朵 -->
    <div class="floating-flowers" v-if="showFlowers">
      <div 
        class="flower" 
        v-for="i in flowerCount" 
        :key="`flower-${i}`"
        :style="getFlowerStyle(i)"
      >🌸</div>
    </div>

    <!-- 浮动音符 -->
    <div class="floating-notes" v-if="showNotes">
      <div 
        class="note" 
        v-for="i in noteCount" 
        :key="`note-${i}`"
        :style="getNoteStyle(i)"
      >🎵</div>
    </div>

    <!-- 浮动礼物 -->
    <div class="floating-gifts" v-if="showGifts">
      <div 
        class="gift" 
        v-for="i in giftCount" 
        :key="`gift-${i}`"
        :style="getGiftStyle(i)"
      >🎁</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  isActive?: boolean
  showBubbles?: boolean
  showStars?: boolean
  showHearts?: boolean
  showRainbows?: boolean
  showClouds?: boolean
  showFlowers?: boolean
  showNotes?: boolean
  showGifts?: boolean
  bubbleCount?: number
  starCount?: number
  heartCount?: number
  rainbowCount?: number
  cloudCount?: number
  flowerCount?: number
  noteCount?: number
  giftCount?: number
  duration?: number
  intensity?: 'low' | 'medium' | 'high'
}

const props = withDefaults(defineProps<Props>(), {
  isActive: true,
  showBubbles: true,
  showStars: false,
  showHearts: false,
  showRainbows: false,
  showClouds: false,
  showFlowers: false,
  showNotes: false,
  showGifts: false,
  bubbleCount: 8,
  starCount: 6,
  heartCount: 5,
  rainbowCount: 3,
  cloudCount: 4,
  flowerCount: 6,
  noteCount: 5,
  giftCount: 4,
  duration: 10,
  intensity: 'medium'
})

// 生成随机样式
const getRandomPosition = () => ({
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 2}s`,
  animationDuration: `${props.duration + Math.random() * 5}s`
})

const getBubbleStyle = (index: number) => ({
  ...getRandomPosition(),
  '--size': `${20 + Math.random() * 30}px`,
  '--opacity': Math.random() * 0.7 + 0.3
})

const getStarStyle = (index: number) => ({
  ...getRandomPosition(),
  fontSize: `${16 + Math.random() * 12}px`
})

const getHeartStyle = (index: number) => ({
  ...getRandomPosition(),
  fontSize: `${14 + Math.random() * 10}px`
})

const getRainbowStyle = (index: number) => ({
  ...getRandomPosition(),
  fontSize: `${18 + Math.random() * 8}px`
})

const getCloudStyle = (index: number) => ({
  ...getRandomPosition(),
  fontSize: `${20 + Math.random() * 15}px`
})

const getFlowerStyle = (index: number) => ({
  ...getRandomPosition(),
  fontSize: `${12 + Math.random() * 8}px`
})

const getNoteStyle = (index: number) => ({
  ...getRandomPosition(),
  fontSize: `${14 + Math.random() * 10}px`
})

const getGiftStyle = (index: number) => ({
  ...getRandomPosition(),
  fontSize: `${16 + Math.random() * 8}px`
})
</script>

<style scoped lang="less">
.floating-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1000;
  overflow: hidden;

  &.active {
    .bubble, .star, .heart, .rainbow, .cloud, .flower, .note, .gift {
      animation-play-state: running;
    }
  }
}

.floating-bubbles {
  position: absolute;
  width: 100%;
  height: 100%;

  .bubble {
    position: absolute;
    bottom: -100px;
    width: var(--size, 30px);
    height: var(--size, 30px);
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(135, 206, 250, 0.6));
    border-radius: 50%;
    opacity: var(--opacity, 0.6);
    animation: bubbleFloat linear infinite;
    animation-play-state: paused;

    &::before {
      content: '';
      position: absolute;
      top: 20%;
      left: 20%;
      width: 30%;
      height: 30%;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
    }
  }
}

.floating-stars {
  position: absolute;
  width: 100%;
  height: 100%;

  .star {
    position: absolute;
    top: -50px;
    animation: starFloat linear infinite;
    animation-play-state: paused;
    filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.8));
  }
}

.floating-hearts {
  position: absolute;
  width: 100%;
  height: 100%;

  .heart {
    position: absolute;
    bottom: -50px;
    animation: heartFloat linear infinite;
    animation-play-state: paused;
    filter: drop-shadow(0 0 4px rgba(255, 105, 180, 0.6));
  }
}

.floating-rainbows {
  position: absolute;
  width: 100%;
  height: 100%;

  .rainbow {
    position: absolute;
    top: -50px;
    animation: rainbowFloat linear infinite;
    animation-play-state: paused;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
  }
}

.floating-clouds {
  position: absolute;
  width: 100%;
  height: 100%;

  .cloud {
    position: absolute;
    top: -50px;
    animation: cloudFloat linear infinite;
    animation-play-state: paused;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.9));
  }
}

.floating-flowers {
  position: absolute;
  width: 100%;
  height: 100%;

  .flower {
    position: absolute;
    top: -50px;
    animation: flowerFloat linear infinite;
    animation-play-state: paused;
    filter: drop-shadow(0 0 4px rgba(255, 182, 193, 0.7));
  }
}

.floating-notes {
  position: absolute;
  width: 100%;
  height: 100%;

  .note {
    position: absolute;
    bottom: -50px;
    animation: noteFloat linear infinite;
    animation-play-state: paused;
    filter: drop-shadow(0 0 6px rgba(138, 43, 226, 0.6));
  }
}

.floating-gifts {
  position: absolute;
  width: 100%;
  height: 100%;

  .gift {
    position: absolute;
    top: -50px;
    animation: giftFloat linear infinite;
    animation-play-state: paused;
    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.7));
  }
}

// 动画定义
@keyframes bubbleFloat {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: var(--opacity, 0.6);
  }
  50% {
    transform: translateY(-50vh) rotate(180deg);
    opacity: calc(var(--opacity, 0.6) * 0.8);
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes starFloat {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 1;
  }
  25% {
    transform: translateY(25vh) rotate(90deg) scale(1.2);
    opacity: 0.8;
  }
  50% {
    transform: translateY(50vh) rotate(180deg) scale(0.8);
    opacity: 0.6;
  }
  75% {
    transform: translateY(75vh) rotate(270deg) scale(1.1);
    opacity: 0.4;
  }
  100% {
    transform: translateY(100vh) rotate(360deg) scale(1);
    opacity: 0;
  }
}

@keyframes heartFloat {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  25% {
    transform: translateY(-25vh) scale(1.3);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-50vh) scale(0.9);
    opacity: 0.7;
  }
  75% {
    transform: translateY(-75vh) scale(1.2);
    opacity: 0.5;
  }
  100% {
    transform: translateY(-100vh) scale(1);
    opacity: 0;
  }
}

@keyframes rainbowFloat {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 1;
  }
  25% {
    transform: translateY(25vh) translateX(10px) rotate(5deg);
    opacity: 0.8;
  }
  50% {
    transform: translateY(50vh) translateX(-10px) rotate(-5deg);
    opacity: 0.6;
  }
  75% {
    transform: translateY(75vh) translateX(5px) rotate(3deg);
    opacity: 0.4;
  }
  100% {
    transform: translateY(100vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
}

@keyframes cloudFloat {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 1;
  }
  33% {
    transform: translateY(33vh) translateX(20px);
    opacity: 0.8;
  }
  66% {
    transform: translateY(66vh) translateX(-15px);
    opacity: 0.5;
  }
  100% {
    transform: translateY(100vh) translateX(10px);
    opacity: 0;
  }
}

@keyframes flowerFloat {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  20% {
    transform: translateY(20vh) rotate(72deg);
    opacity: 0.9;
  }
  40% {
    transform: translateY(40vh) rotate(144deg);
    opacity: 0.8;
  }
  60% {
    transform: translateY(60vh) rotate(216deg);
    opacity: 0.6;
  }
  80% {
    transform: translateY(80vh) rotate(288deg);
    opacity: 0.4;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes noteFloat {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  30% {
    transform: translateY(-30vh) scale(1.2);
    opacity: 0.8;
  }
  60% {
    transform: translateY(-60vh) scale(0.9);
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100vh) scale(1.1);
    opacity: 0;
  }
}

@keyframes giftFloat {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 1;
  }
  25% {
    transform: translateY(25vh) rotate(10deg) scale(1.1);
    opacity: 0.9;
  }
  50% {
    transform: translateY(50vh) rotate(-10deg) scale(0.9);
    opacity: 0.7;
  }
  75% {
    transform: translateY(75vh) rotate(5deg) scale(1.05);
    opacity: 0.5;
  }
  100% {
    transform: translateY(100vh) rotate(0deg) scale(1);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .floating-elements {
    .bubble, .star, .heart, .rainbow, .cloud, .flower, .note, .gift {
      font-size: 0.8em;
    }
  }

  .floating-bubbles .bubble {
    --size: calc(var(--size, 30px) * 0.7);
  }
}

@media (prefers-reduced-motion: reduce) {
  .floating-elements {
    display: none;
  }
}
</style>