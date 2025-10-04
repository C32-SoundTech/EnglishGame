<template>
  <div class="sound-effects">
    <!-- 音效控制面板 -->
    <div v-if="showControls" class="sound-controls">
      <div class="control-item">
        <Volume2 class="w-4 h-4 mr-2" />
        <span>音效</span>
        <a-switch v-model:checked="soundEnabled" size="small" />
      </div>
      <div class="control-item">
        <VolumeX class="w-4 h-4 mr-2" />
        <span>音量</span>
        <a-slider
          v-model:value="volume"
          :min="0"
          :max="100"
          :step="10"
          style="width: 80px; margin-left: 8px;"
        />
      </div>
    </div>

    <!-- 音频元素 -->
    <audio ref="successAudio" preload="auto">
      <source src="/sounds/success.mp3" type="audio/mpeg">
      <source src="/sounds/success.wav" type="audio/wav">
    </audio>
    
    <audio ref="errorAudio" preload="auto">
      <source src="/sounds/error.mp3" type="audio/mpeg">
      <source src="/sounds/error.wav" type="audio/wav">
    </audio>
    
    <audio ref="clickAudio" preload="auto">
      <source src="/sounds/click.mp3" type="audio/mpeg">
      <source src="/sounds/click.wav" type="audio/wav">
    </audio>
    
    <audio ref="levelUpAudio" preload="auto">
      <source src="/sounds/levelup.mp3" type="audio/mpeg">
      <source src="/sounds/levelup.wav" type="audio/wav">
    </audio>
    
    <audio ref="badgeAudio" preload="auto">
      <source src="/sounds/badge.mp3" type="audio/mpeg">
      <source src="/sounds/badge.wav" type="audio/wav">
    </audio>
    
    <audio ref="streakAudio" preload="auto">
      <source src="/sounds/streak.mp3" type="audio/mpeg">
      <source src="/sounds/streak.wav" type="audio/wav">
    </audio>
    
    <audio ref="completionAudio" preload="auto">
      <source src="/sounds/completion.mp3" type="audio/mpeg">
      <source src="/sounds/completion.wav" type="audio/wav">
    </audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Volume2, VolumeX } from 'lucide-vue-next'

interface Props {
  showControls?: boolean
}

interface Emits {
  (e: 'soundToggle', enabled: boolean): void
  (e: 'volumeChange', volume: number): void
}

const props = withDefaults(defineProps<Props>(), {
  showControls: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const soundEnabled = ref(true)
const volume = ref(70)

// 音频引用
const successAudio = ref<HTMLAudioElement>()
const errorAudio = ref<HTMLAudioElement>()
const clickAudio = ref<HTMLAudioElement>()
const levelUpAudio = ref<HTMLAudioElement>()
const badgeAudio = ref<HTMLAudioElement>()
const streakAudio = ref<HTMLAudioElement>()
const completionAudio = ref<HTMLAudioElement>()

// 音效类型枚举
export enum SoundType {
  SUCCESS = 'success',
  ERROR = 'error',
  CLICK = 'click',
  LEVEL_UP = 'levelUp',
  BADGE = 'badge',
  STREAK = 'streak',
  COMPLETION = 'completion'
}

// 播放音效的方法
const playSound = (type: SoundType, customVolume?: number) => {
  if (!soundEnabled.value) return

  let audio: HTMLAudioElement | undefined

  switch (type) {
    case SoundType.SUCCESS:
      audio = successAudio.value
      break
    case SoundType.ERROR:
      audio = errorAudio.value
      break
    case SoundType.CLICK:
      audio = clickAudio.value
      break
    case SoundType.LEVEL_UP:
      audio = levelUpAudio.value
      break
    case SoundType.BADGE:
      audio = badgeAudio.value
      break
    case SoundType.STREAK:
      audio = streakAudio.value
      break
    case SoundType.COMPLETION:
      audio = completionAudio.value
      break
  }

  if (audio) {
    try {
      audio.currentTime = 0
      audio.volume = (customVolume ?? volume.value) / 100
      audio.play().catch(() => {
        // 如果音频文件不存在，使用Web Audio API生成音效
        generateSyntheticSound(type)
      })
    } catch (error) {
      // 降级到合成音效
      generateSyntheticSound(type)
    }
  } else {
    generateSyntheticSound(type)
  }
}

// 生成合成音效
const generateSyntheticSound = (type: SoundType) => {
  if (!soundEnabled.value) return

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // 设置音量
    gainNode.gain.setValueAtTime(volume.value / 100 * 0.3, audioContext.currentTime)

    // 根据音效类型设置不同的频率和持续时间
    switch (type) {
      case SoundType.SUCCESS:
        // 成功音效：上升的音调
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
        oscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.1) // G5
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.stop(audioContext.currentTime + 0.3)
        break

      case SoundType.ERROR:
        // 错误音效：下降的音调
        oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime) // G4
        oscillator.frequency.exponentialRampToValueAtTime(196.00, audioContext.currentTime + 0.2) // G3
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
        oscillator.stop(audioContext.currentTime + 0.4)
        break

      case SoundType.CLICK:
        // 点击音效：短促的音调
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        oscillator.stop(audioContext.currentTime + 0.1)
        break

      case SoundType.LEVEL_UP:
        // 升级音效：快速上升的音阶
        const frequencies = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
        frequencies.forEach((freq, index) => {
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1)
        })
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)
        oscillator.stop(audioContext.currentTime + 0.6)
        break

      case SoundType.BADGE:
        // 徽章音效：华丽的和弦
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)
        oscillator.stop(audioContext.currentTime + 0.8)
        break

      case SoundType.STREAK:
        // 连击音效：快速的重复音调
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.05)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.15)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.stop(audioContext.currentTime + 0.3)
        break

      case SoundType.COMPLETION:
        // 完成音效：胜利的旋律
        const melody = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50] // C5, E5, G5, C6, G5, C6
        melody.forEach((freq, index) => {
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15)
        })
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2)
        oscillator.stop(audioContext.currentTime + 1.2)
        break

      default:
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        oscillator.stop(audioContext.currentTime + 0.2)
    }

    oscillator.start(audioContext.currentTime)
  } catch (error) {
    console.warn('无法播放音效:', error)
  }
}

// 预设音效组合
const playSuccessSequence = () => {
  playSound(SoundType.SUCCESS)
  setTimeout(() => playSound(SoundType.CLICK, 30), 200)
}

const playErrorSequence = () => {
  playSound(SoundType.ERROR)
}

const playLevelUpSequence = () => {
  playSound(SoundType.LEVEL_UP)
  setTimeout(() => playSound(SoundType.SUCCESS, 50), 600)
}

const playBadgeSequence = () => {
  playSound(SoundType.BADGE)
  setTimeout(() => playSound(SoundType.LEVEL_UP, 40), 400)
}

const playStreakSequence = (streakCount: number) => {
  playSound(SoundType.STREAK)
  // 连击数越高，音效越华丽
  if (streakCount >= 5) {
    setTimeout(() => playSound(SoundType.SUCCESS, 60), 300)
  }
  if (streakCount >= 10) {
    setTimeout(() => playSound(SoundType.LEVEL_UP, 40), 600)
  }
}

const playCompletionSequence = () => {
  playSound(SoundType.COMPLETION)
  setTimeout(() => playSound(SoundType.LEVEL_UP, 50), 800)
}

// 监听设置变化
watch(soundEnabled, (enabled) => {
  emit('soundToggle', enabled)
  // 保存到本地存储
  localStorage.setItem('soundEnabled', enabled.toString())
})

watch(volume, (newVolume) => {
  emit('volumeChange', newVolume)
  // 保存到本地存储
  localStorage.setItem('soundVolume', newVolume.toString())
})

// 从本地存储加载设置
const loadSettings = () => {
  const savedSoundEnabled = localStorage.getItem('soundEnabled')
  const savedVolume = localStorage.getItem('soundVolume')

  if (savedSoundEnabled !== null) {
    soundEnabled.value = savedSoundEnabled === 'true'
  }

  if (savedVolume !== null) {
    volume.value = parseInt(savedVolume, 10)
  }
}

// 暴露方法给父组件
defineExpose({
  playSound,
  playSuccessSequence,
  playErrorSequence,
  playLevelUpSequence,
  playBadgeSequence,
  playStreakSequence,
  playCompletionSequence,
  SoundType
})

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.sound-effects {
  position: relative;
}

.sound-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.control-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
}

.control-item span {
  margin-right: 8px;
  min-width: 40px;
}

/* 隐藏音频元素 */
audio {
  display: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sound-controls {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .control-item {
    justify-content: space-between;
  }
}
</style>