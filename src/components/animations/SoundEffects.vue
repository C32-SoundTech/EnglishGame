<template>
  <div class="sound-effects" style="display: none;">
    <!-- 音效播放器 -->
    <audio
      v-for="(sound, key) in sounds"
      :key="key"
      :ref="el => audioRefs[key] = el"
      preload="auto"
    >
      <source :src="sound.src" type="audio/mpeg">
      <source :src="sound.fallback" type="audio/wav">
    </audio>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface SoundConfig {
  src: string
  fallback: string
  volume: number
}

interface Props {
  enabled?: boolean
  volume?: number
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
  volume: 0.5
})

const audioRefs = ref<Record<string, HTMLAudioElement>>({})

// 音效配置
const sounds = reactive<Record<string, SoundConfig>>({
  correct: {
    src: '/sounds/correct.mp3',
    fallback: '/sounds/correct.wav',
    volume: 0.6
  },
  incorrect: {
    src: '/sounds/incorrect.mp3',
    fallback: '/sounds/incorrect.wav',
    volume: 0.4
  },
  success: {
    src: '/sounds/success.mp3',
    fallback: '/sounds/success.wav',
    volume: 0.7
  },
  levelUp: {
    src: '/sounds/level-up.mp3',
    fallback: '/sounds/level-up.wav',
    volume: 0.8
  },
  badge: {
    src: '/sounds/badge.mp3',
    fallback: '/sounds/badge.wav',
    volume: 0.7
  },
  points: {
    src: '/sounds/points.mp3',
    fallback: '/sounds/points.wav',
    volume: 0.5
  },
  combo: {
    src: '/sounds/combo.mp3',
    fallback: '/sounds/combo.wav',
    volume: 0.6
  },
  perfect: {
    src: '/sounds/perfect.mp3',
    fallback: '/sounds/perfect.wav',
    volume: 0.8
  },
  click: {
    src: '/sounds/click.mp3',
    fallback: '/sounds/click.wav',
    volume: 0.3
  },
  hover: {
    src: '/sounds/hover.mp3',
    fallback: '/sounds/hover.wav',
    volume: 0.2
  },
  whoosh: {
    src: '/sounds/whoosh.mp3',
    fallback: '/sounds/whoosh.wav',
    volume: 0.4
  },
  pop: {
    src: '/sounds/pop.mp3',
    fallback: '/sounds/pop.wav',
    volume: 0.5
  },
  chime: {
    src: '/sounds/chime.mp3',
    fallback: '/sounds/chime.wav',
    volume: 0.6
  },
  magic: {
    src: '/sounds/magic.mp3',
    fallback: '/sounds/magic.wav',
    volume: 0.5
  },
  applause: {
    src: '/sounds/applause.mp3',
    fallback: '/sounds/applause.wav',
    volume: 0.7
  }
})

// 播放音效
const playSound = (soundName: string, customVolume?: number) => {
  if (!props.enabled) return

  const audio = audioRefs.value[soundName]
  if (!audio) {
    console.warn(`Sound "${soundName}" not found`)
    return
  }

  try {
    // 重置音频到开始位置
    audio.currentTime = 0
    
    // 设置音量
    const volume = customVolume ?? sounds[soundName]?.volume ?? props.volume
    audio.volume = Math.min(Math.max(volume, 0), 1)
    
    // 播放音效
    const playPromise = audio.play()
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn(`Failed to play sound "${soundName}":`, error)
      })
    }
  } catch (error) {
    console.warn(`Error playing sound "${soundName}":`, error)
  }
}

// 停止音效
const stopSound = (soundName: string) => {
  const audio = audioRefs.value[soundName]
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
}

// 停止所有音效
const stopAllSounds = () => {
  Object.keys(audioRefs.value).forEach(soundName => {
    stopSound(soundName)
  })
}

// 设置全局音量
const setVolume = (volume: number) => {
  const clampedVolume = Math.min(Math.max(volume, 0), 1)
  Object.keys(audioRefs.value).forEach(soundName => {
    const audio = audioRefs.value[soundName]
    if (audio) {
      audio.volume = clampedVolume * (sounds[soundName]?.volume ?? 1)
    }
  })
}

// 预加载音效
const preloadSounds = () => {
  Object.keys(sounds).forEach(soundName => {
    const audio = audioRefs.value[soundName]
    if (audio) {
      audio.load()
    }
  })
}

// 检查音效是否可用
const isSoundAvailable = (soundName: string): boolean => {
  const audio = audioRefs.value[soundName]
  return audio && audio.readyState >= 2 // HAVE_CURRENT_DATA
}

// 获取音效状态
const getSoundStatus = () => {
  const status: Record<string, boolean> = {}
  Object.keys(sounds).forEach(soundName => {
    status[soundName] = isSoundAvailable(soundName)
  })
  return status
}

// 播放组合音效
const playComboSounds = (soundNames: string[], delay = 100) => {
  soundNames.forEach((soundName, index) => {
    setTimeout(() => {
      playSound(soundName)
    }, index * delay)
  })
}

// 播放随机音效
const playRandomSound = (soundNames: string[]) => {
  if (soundNames.length === 0) return
  const randomIndex = Math.floor(Math.random() * soundNames.length)
  playSound(soundNames[randomIndex])
}

// 创建音效序列
const createSoundSequence = (sequence: Array<{ sound: string; delay: number; volume?: number }>) => {
  let totalDelay = 0
  sequence.forEach(({ sound, delay, volume }) => {
    setTimeout(() => {
      playSound(sound, volume)
    }, totalDelay)
    totalDelay += delay
  })
}

// 预定义的音效组合
const soundCombos = {
  correctAnswer: () => playSound('correct'),
  incorrectAnswer: () => playSound('incorrect'),
  levelComplete: () => createSoundSequence([
    { sound: 'success', delay: 0 },
    { sound: 'applause', delay: 500 }
  ]),
  perfectScore: () => createSoundSequence([
    { sound: 'perfect', delay: 0 },
    { sound: 'magic', delay: 300 },
    { sound: 'applause', delay: 800 }
  ]),
  badgeUnlock: () => createSoundSequence([
    { sound: 'chime', delay: 0 },
    { sound: 'badge', delay: 200 },
    { sound: 'magic', delay: 500 }
  ]),
  comboStreak: (comboCount: number) => {
    if (comboCount <= 3) {
      playSound('combo')
    } else if (comboCount <= 6) {
      createSoundSequence([
        { sound: 'combo', delay: 0 },
        { sound: 'chime', delay: 200 }
      ])
    } else {
      createSoundSequence([
        { sound: 'combo', delay: 0 },
        { sound: 'perfect', delay: 200 },
        { sound: 'magic', delay: 400 }
      ])
    }
  },
  gameStart: () => createSoundSequence([
    { sound: 'whoosh', delay: 0 },
    { sound: 'chime', delay: 300 }
  ]),
  gameEnd: () => createSoundSequence([
    { sound: 'success', delay: 0 },
    { sound: 'applause', delay: 600 }
  ])
}

// 暴露方法和属性
defineExpose({
  playSound,
  stopSound,
  stopAllSounds,
  setVolume,
  preloadSounds,
  isSoundAvailable,
  getSoundStatus,
  playComboSounds,
  playRandomSound,
  createSoundSequence,
  soundCombos
})

onMounted(() => {
  // 预加载音效
  setTimeout(() => {
    preloadSounds()
  }, 1000)
})
</script>

<style scoped lang="less">
.sound-effects {
  position: absolute;
  top: -9999px;
  left: -9999px;
  opacity: 0;
  pointer-events: none;
}
</style>