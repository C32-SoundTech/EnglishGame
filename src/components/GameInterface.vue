<template>
  <div class="game-interface">
    <!-- 游戏头部信息 -->
    <div class="game-header">
      <a-card class="game-info-card">
        <div class="game-info">
          <div class="game-title">
            <component :is="getGameIcon(currentGame.type)" class="w-6 h-6 mr-2" />
            {{ currentGame.title }}
          </div>
          <div class="game-meta">
            <a-tag color="blue">{{ currentGame.difficulty }}</a-tag>
            <a-tag color="green">{{ currentGame.category }}</a-tag>
          </div>
        </div>
        <div class="game-progress">
          <div class="progress-info">
            <span>进度: {{ currentQuestionIndex + 1 }} / {{ currentGame.questions.length }}</span>
            <span class="score">得分: {{ gameScore }}</span>
          </div>
          <a-progress 
            :percent="progressPercent" 
            :stroke-color="{ '0%': '#108ee9', '100%': '#87d068' }"
            :show-info="false"
          />
        </div>
      </a-card>

      <!-- 游戏控制 -->
      <div class="game-controls">
        <a-button @click="pauseGame" :disabled="gameState !== 'playing'">
          <Pause class="w-4 h-4 mr-1" />
          暂停
        </a-button>
        <a-button @click="exitGame" type="text" danger>
          <X class="w-4 h-4 mr-1" />
          退出
        </a-button>
      </div>
    </div>

    <!-- 游戏内容区域 -->
    <div class="game-content">
      <a-card class="question-card" v-if="gameState === 'playing'">
        <!-- 单词拼写游戏 -->
        <div v-if="currentGame.type === 'spelling'" class="spelling-game">
          <div class="question-section">
            <h3>听音拼词</h3>
            <div class="audio-section">
              <a-button 
                type="primary" 
                size="large" 
                @click="playAudio"
                class="play-button"
              >
                <Volume2 class="w-5 h-5 mr-2" />
                播放单词
              </a-button>
              <div class="play-count">已播放 {{ playCount }} 次</div>
            </div>
            <div class="word-hint" v-if="showHint">
              <span>提示: {{ currentQuestion.hint }}</span>
            </div>
          </div>
          
          <div class="answer-section">
            <div class="letter-boxes">
              <div 
                v-for="(letter, index) in userAnswer" 
                :key="index"
                class="letter-box"
                :class="{ 
                  correct: letter && letter === currentQuestion.answer[index],
                  incorrect: letter && letter !== currentQuestion.answer[index]
                }"
              >
                {{ letter }}
              </div>
            </div>
            <div class="letter-keyboard">
              <div 
                v-for="letter in alphabet" 
                :key="letter"
                class="letter-key"
                :class="{ 
                  used: usedLetters.includes(letter),
                  disabled: usedLetters.includes(letter)
                }"
                @click="selectLetter(letter)"
              >
                {{ letter }}
              </div>
            </div>
            <div class="game-actions">
              <a-button @click="clearAnswer" :disabled="userAnswer.length === 0">
                <RotateCcw class="w-4 h-4 mr-1" />
                清空
              </a-button>
              <a-button @click="showHint = true" :disabled="showHint" type="dashed">
                <Lightbulb class="w-4 h-4 mr-1" />
                提示
              </a-button>
              <a-button 
                type="primary" 
                @click="submitAnswer"
                :disabled="userAnswer.join('').length !== currentQuestion.answer.length || submitting"
                :loading="submitting"
              >
                <Check class="w-4 h-4 mr-1" />
                提交
              </a-button>
            </div>
          </div>
        </div>

        <!-- 听力练习游戏 -->
        <div v-else-if="currentGame.type === 'listening'" class="listening-game">
          <div class="question-section">
            <h3>听力理解</h3>
            <div class="audio-section">
              <a-button 
                type="primary" 
                size="large" 
                @click="playAudio"
                class="play-button"
              >
                <Headphones class="w-5 h-5 mr-2" />
                播放音频
              </a-button>
              <div class="audio-controls">
                <a-slider 
                  v-model:value="playbackSpeed" 
                  :min="0.5" 
                  :max="2" 
                  :step="0.1"
                  class="speed-slider"
                />
                <span class="speed-label">{{ playbackSpeed }}x</span>
              </div>
            </div>
          </div>
          
          <div class="answer-section">
            <div class="question-text">{{ currentQuestion.question }}</div>
            <a-radio-group v-model:value="selectedAnswer" class="answer-options">
              <div 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                class="option-item"
              >
                <a-radio :value="option.value" class="option-radio">
                  <div class="option-content">
                    <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                    <span class="option-text">{{ option.text }}</span>
                  </div>
                </a-radio>
              </div>
            </a-radio-group>
            <div class="game-actions">
              <a-button @click="playAudio" type="dashed">
                <Volume2 class="w-4 h-4 mr-1" />
                重播
              </a-button>
              <a-button 
                type="primary" 
                @click="submitAnswer"
                :disabled="!selectedAnswer || submitting"
                :loading="submitting"
              >
                <Check class="w-4 h-4 mr-1" />
                提交答案
              </a-button>
            </div>
          </div>
        </div>

        <!-- 语法选择游戏 -->
        <div v-else-if="currentGame.type === 'grammar'" class="grammar-game">
          <div class="question-section">
            <h3>语法练习</h3>
            <div class="sentence-container">
              <div class="sentence">
                <span v-for="(part, index) in sentenceParts" :key="index" class="sentence-part">
                  <span v-if="part.type === 'text'">{{ part.content }}</span>
                  <span v-else-if="part.type === 'blank'" class="blank-space">
                    <a-select 
                      v-model:value="part.selected"
                      placeholder="选择"
                      class="blank-select"
                      @change="updateSentence"
                    >
                      <a-select-option 
                        v-for="option in part.options" 
                        :key="option"
                        :value="option"
                      >
                        {{ option }}
                      </a-select-option>
                    </a-select>
                  </span>
                </span>
              </div>
            </div>
            <div class="grammar-explanation" v-if="showExplanation">
              <a-alert 
                :message="currentQuestion.explanation" 
                type="info" 
                show-icon 
                class="explanation-alert"
              />
            </div>
          </div>
          
          <div class="answer-section">
            <div class="game-actions">
              <a-button @click="showExplanation = !showExplanation" type="dashed">
                <BookOpen class="w-4 h-4 mr-1" />
                {{ showExplanation ? '隐藏' : '显示' }}解释
              </a-button>
              <a-button 
                type="primary" 
                @click="submitAnswer"
                :disabled="!isGrammarComplete || submitting"
                :loading="submitting"
              >
                <Check class="w-4 h-4 mr-1" />
                提交答案
              </a-button>
            </div>
          </div>
        </div>

        <!-- 阅读理解游戏 -->
        <div v-else-if="currentGame.type === 'reading'" class="reading-game">
          <div class="reading-content">
            <div class="passage-section">
              <h3>阅读理解</h3>
              <div class="passage-container">
                <div class="passage-text">{{ currentQuestion.passage }}</div>
                <div class="reading-tools">
                  <a-button @click="toggleHighlight" size="small" type="dashed">
                    <Highlighter class="w-4 h-4 mr-1" />
                    标记重点
                  </a-button>
                  <a-button @click="showTranslation = !showTranslation" size="small" type="dashed">
                    <Languages class="w-4 h-4 mr-1" />
                    {{ showTranslation ? '隐藏' : '显示' }}翻译
                  </a-button>
                </div>
                <div v-if="showTranslation" class="translation">
                  {{ currentQuestion.translation }}
                </div>
              </div>
            </div>
            
            <div class="questions-section">
              <div class="question-item" v-for="(q, index) in currentQuestion.questions" :key="index">
                <div class="question-title">{{ index + 1 }}. {{ q.question }}</div>
                <a-radio-group v-model:value="readingAnswers[index]" class="question-options">
                  <div 
                    v-for="(option, optIndex) in q.options" 
                    :key="optIndex"
                    class="option-item"
                  >
                    <a-radio :value="option.value">
                      <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                      <span class="option-text">{{ option.text }}</span>
                    </a-radio>
                  </div>
                </a-radio-group>
              </div>
              
              <div class="game-actions">
                <a-button 
                  type="primary" 
                  @click="submitAnswer"
                  :disabled="!isReadingComplete || submitting"
                  :loading="submitting"
                >
                  <Check class="w-4 h-4 mr-1" />
                  提交答案
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 单词配对游戏 -->
        <div v-else-if="currentGame.type === 'vocabulary'" class="vocabulary-game">
          <div class="question-section">
            <h3>{{ currentQuestion.question }}</h3>
            <div class="game-mode-tabs">
              <a-tabs v-model:activeKey="vocabularyMode" centered>
                <a-tab-pane key="image" tab="图片匹配">
                  <div class="image-matching">
                    <div class="target-word">
                      <div class="word-card">
                        <h4>{{ currentQuestion.word }}</h4>
                        <div class="word-pronunciation" v-if="currentQuestion.pronunciation">
                          [{{ currentQuestion.pronunciation }}]
                        </div>
                      </div>
                    </div>
                    <div class="image-options">
                      <div 
                        v-for="(option, index) in currentQuestion.imageOptions" 
                        :key="index"
                        class="image-option"
                        :class="{ 
                          selected: selectedImageIndex === index,
                          correct: showImageFeedback && option.correct,
                          incorrect: showImageFeedback && selectedImageIndex === index && !option.correct
                        }"
                        @click="selectImage(index)"
                      >
                        <div class="image-container">
                          <img :src="option.image" :alt="option.alt" />
                        </div>
                        <div class="image-label">{{ option.label }}</div>
                      </div>
                    </div>
                  </div>
                </a-tab-pane>
                <a-tab-pane key="meaning" tab="词义匹配">
                  <div class="meaning-matching">
                    <div class="words-column">
                      <h4>单词</h4>
                      <div class="word-list">
                        <div 
                          v-for="(word, index) in currentQuestion.words" 
                          :key="index"
                          class="word-item"
                          :class="{ 
                            selected: selectedWordIndex === index,
                            matched: wordMatches[index] !== undefined
                          }"
                          @click="selectWord(index)"
                        >
                          {{ word }}
                        </div>
                      </div>
                    </div>
                    <div class="meanings-column">
                      <h4>词义</h4>
                      <div class="meaning-list">
                        <div 
                          v-for="(meaning, index) in currentQuestion.meanings" 
                          :key="index"
                          class="meaning-item"
                          :class="{ 
                            selected: selectedMeaningIndex === index,
                            matched: meaningMatches[index] !== undefined,
                            correct: showMeaningFeedback && meaning.correct,
                            incorrect: showMeaningFeedback && meaningMatches[index] !== undefined && !meaning.correct
                          }"
                          @click="selectMeaning(index)"
                        >
                          {{ meaning.text }}
                        </div>
                      </div>
                    </div>
                  </div>
                </a-tab-pane>
              </a-tabs>
            </div>
          </div>
          
          <div class="answer-section">
            <div class="vocabulary-actions">
              <a-button 
                v-if="vocabularyMode === 'image'"
                type="primary" 
                size="large" 
                :disabled="selectedImageIndex === null"
                @click="submitImageAnswer"
              >
                <CheckCircle class="w-4 h-4" />
                确认选择
              </a-button>
              <div v-else class="matching-actions">
                <a-button 
                  type="default" 
                  size="large" 
                  @click="clearMatches"
                  :disabled="Object.keys(wordMatches).length === 0"
                >
                  <RotateCcw class="w-4 h-4" />
                  重新匹配
                </a-button>
                <a-button 
                  type="primary" 
                  size="large" 
                  :disabled="Object.keys(wordMatches).length !== currentQuestion.words.length"
                  @click="submitMeaningAnswer"
                >
                  <CheckCircle class="w-4 h-4" />
                  提交答案
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 句子排序游戏 -->
        <div v-else-if="currentGame.type === 'sentence-order'" class="sentence-order-game">
          <div class="question-section">
            <h3>句子排序</h3>
            <div class="instruction">
              <p>将下面的单词拖拽排列成正确的句子</p>
            </div>
            <div class="target-sentence" v-if="showTargetSentence">
              <div class="sentence-hint">
                <Lightbulb class="w-4 h-4 mr-2" />
                参考: {{ currentQuestion.hint }}
              </div>
            </div>
          </div>
          
          <div class="answer-section">
            <div class="word-bank">
              <h4>单词库</h4>
              <div class="word-list">
                <div 
                  v-for="(word, index) in availableWords" 
                  :key="`bank-${index}`"
                  class="word-item draggable"
                  :class="{ used: word.used }"
                  draggable="true"
                  @dragstart="startDrag($event, word, 'bank')"
                  @click="selectWordFromBank(word)"
                >
                  {{ word.text }}
                </div>
              </div>
            </div>
            
            <div class="sentence-builder">
              <h4>组成句子</h4>
              <div 
                class="drop-zone"
                @drop="dropWord($event)"
                @dragover.prevent
                @dragenter.prevent
              >
                <div 
                  v-for="(word, index) in sentenceWords" 
                  :key="`sentence-${index}`"
                  class="sentence-word"
                  draggable="true"
                  @dragstart="startDrag($event, word, 'sentence')"
                  @click="removeWordFromSentence(index)"
                >
                  {{ word.text }}
                  <X class="w-3 h-3 ml-1 remove-icon" />
                </div>
                <div v-if="sentenceWords.length === 0" class="drop-placeholder">
                  将单词拖拽到这里组成句子
                </div>
              </div>
            </div>
            
            <div class="game-actions">
              <a-button @click="clearSentence" :disabled="sentenceWords.length === 0">
                <RotateCcw class="w-4 h-4 mr-1" />
                清空
              </a-button>
              <a-button @click="showTargetSentence = !showTargetSentence" type="dashed">
                <Lightbulb class="w-4 h-4 mr-1" />
                {{ showTargetSentence ? '隐藏' : '显示' }}提示
              </a-button>
              <a-button 
                type="primary" 
                @click="submitAnswer"
                :disabled="sentenceWords.length === 0 || submitting"
                :loading="submitting"
              >
                <Check class="w-4 h-4 mr-1" />
                提交答案
              </a-button>
            </div>
          </div>
        </div>

        <!-- 语音识别游戏 -->
        <div v-else-if="currentGame.type === 'speech-recognition'" class="speech-game">
          <div class="question-section">
            <h3>语音练习</h3>
            <div class="target-text">
              <div class="text-to-read">
                <h4>请朗读以下内容:</h4>
                <div class="reading-text">{{ currentQuestion.text }}</div>
                <div class="pronunciation-guide" v-if="currentQuestion.phonetic">
                  <span class="phonetic">{{ currentQuestion.phonetic }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="answer-section">
            <div class="speech-controls">
              <div class="recording-area">
                <a-button 
                  :type="isRecording ? 'danger' : 'primary'"
                  size="large"
                  class="record-button"
                  @click="toggleRecording"
                  :loading="processingAudio"
                >
                  <Mic v-if="!isRecording" class="w-6 h-6 mr-2" />
                  <Square v-else class="w-6 h-6 mr-2" />
                  {{ isRecording ? '停止录音' : '开始录音' }}
                </a-button>
                
                <div v-if="isRecording" class="recording-indicator">
                  <div class="pulse-dot"></div>
                  <span>正在录音... {{ recordingTime }}s</span>
                </div>
              </div>
              
              <div v-if="recordedAudio" class="playback-controls">
                <a-button @click="playRecording" :loading="playingRecording">
                  <Play class="w-4 h-4 mr-1" />
                  播放录音
                </a-button>
                <a-button @click="clearRecording">
                  <Trash2 class="w-4 h-4 mr-1" />
                  重新录音
                </a-button>
              </div>
            </div>
            
            <div v-if="speechResult" class="speech-result">
              <div class="result-header">
                <h4>识别结果</h4>
                <div class="accuracy-score">
                  <span class="score-label">准确度:</span>
                  <span class="score-value" :class="getAccuracyClass(speechAccuracy)">
                    {{ speechAccuracy }}%
                  </span>
                </div>
              </div>
              
              <div class="text-comparison">
                <div class="original-text">
                  <h5>原文:</h5>
                  <p>{{ currentQuestion.text }}</p>
                </div>
                <div class="recognized-text">
                  <h5>识别:</h5>
                  <p>{{ speechResult }}</p>
                </div>
              </div>
              
              <div class="pronunciation-feedback">
                <div class="feedback-items">
                  <div 
                    v-for="feedback in pronunciationFeedback" 
                    :key="feedback.word"
                    class="feedback-item"
                    :class="feedback.status"
                  >
                    <span class="word">{{ feedback.word }}</span>
                    <span class="status-icon">
                      <Check v-if="feedback.status === 'correct'" class="w-4 h-4" />
                      <AlertCircle v-else class="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="game-actions">
              <a-button 
                type="primary" 
                @click="submitAnswer"
                :disabled="!speechResult || submitting"
                :loading="submitting"
              >
                <Check class="w-4 h-4 mr-1" />
                确认结果
              </a-button>
            </div>
          </div>
        </div>

        <!-- 填空练习游戏 -->
        <div v-else-if="currentGame.type === 'fill-blanks'" class="fill-blanks-game">
          <div class="question-section">
            <h3>填空练习</h3>
            <div class="passage-container">
              <div class="passage-text">
                <span 
                  v-for="(part, index) in passageParts" 
                  :key="index"
                  class="passage-part"
                >
                  <span v-if="part.type === 'text'">{{ part.content }}</span>
                  <span v-else-if="part.type === 'blank'" class="blank-container">
                    <a-input 
                      v-model:value="part.userInput"
                      :placeholder="`空格${part.blankIndex + 1}`"
                      class="blank-input"
                      :class="{ 
                        correct: part.showFeedback && part.isCorrect,
                        incorrect: part.showFeedback && !part.isCorrect
                      }"
                      @input="updateBlankAnswer(part.blankIndex, $event.target.value)"
                    />
                    <div v-if="part.showHint" class="blank-hint">
                      {{ part.hint }}
                    </div>
                  </span>
                </span>
              </div>
            </div>
            
            <div class="word-options" v-if="currentQuestion.options">
              <h4>选择词汇</h4>
              <div class="option-list">
                <a-tag 
                  v-for="(option, index) in currentQuestion.options" 
                  :key="index"
                  class="word-option"
                  :class="{ used: usedOptions.includes(option) }"
                  @click="selectOption(option)"
                  :color="usedOptions.includes(option) ? 'default' : 'blue'"
                >
                  {{ option }}
                </a-tag>
              </div>
            </div>
          </div>
          
          <div class="answer-section">
            <div class="fill-progress">
              <div class="progress-info">
                <span>已填写: {{ filledBlanks }} / {{ totalBlanks }}</span>
                <a-progress 
                  :percent="Math.round((filledBlanks / totalBlanks) * 100)" 
                  size="small"
                  :show-info="false"
                />
              </div>
            </div>
            
            <div class="game-actions">
              <a-button @click="showAllHints" :disabled="allHintsShown">
                <Lightbulb class="w-4 h-4 mr-1" />
                显示提示
              </a-button>
              <a-button @click="checkAnswers" :disabled="filledBlanks === 0">
                <Eye class="w-4 h-4 mr-1" />
                检查答案
              </a-button>
              <a-button 
                type="primary" 
                @click="submitAnswer"
                :disabled="filledBlanks !== totalBlanks || submitting"
                :loading="submitting"
              >
                <Check class="w-4 h-4 mr-1" />
                提交答案
              </a-button>
            </div>
          </div>
        </div>

        <!-- 图片描述游戏 -->
        <div v-else-if="currentGame.type === 'image-description'" class="image-description-game">
          <div class="question-section">
            <h3>看图说话</h3>
            <div class="image-container">
              <img :src="currentQuestion.imageUrl" :alt="currentQuestion.imageAlt" class="description-image" />
              <div class="image-info">
                <div class="image-title">{{ currentQuestion.imageTitle }}</div>
                <div class="image-prompt">{{ currentQuestion.prompt }}</div>
              </div>
            </div>
          </div>
          
          <div class="answer-section">
            <div class="description-input">
              <h4>请用英语描述这张图片</h4>
              <a-textarea 
                v-model:value="imageDescription"
                :rows="6"
                placeholder="请用英语描述你看到的内容..."
                class="description-textarea"
                :maxlength="500"
                show-count
              />
            </div>
            
            <div class="description-tools">
              <div class="word-suggestions" v-if="wordSuggestions.length > 0">
                <h5>参考词汇</h5>
                <div class="suggestion-list">
                  <a-tag 
                    v-for="word in wordSuggestions" 
                    :key="word"
                    class="suggestion-word"
                    @click="addWordToDescription(word)"
                    color="blue"
                  >
                    {{ word }}
                  </a-tag>
                </div>
              </div>
              
              <div class="description-requirements">
                <h5>描述要求</h5>
                <ul class="requirement-list">
                  <li 
                    v-for="requirement in currentQuestion.requirements" 
                    :key="requirement"
                    class="requirement-item"
                  >
                    {{ requirement }}
                  </li>
                </ul>
              </div>
            </div>
            
            <div class="game-actions">
              <a-button @click="getWordSuggestions" :loading="loadingSuggestions">
                <Lightbulb class="w-4 h-4 mr-1" />
                获取词汇提示
              </a-button>
              <a-button @click="clearDescription" :disabled="!imageDescription">
                <RotateCcw class="w-4 h-4 mr-1" />
                清空重写
              </a-button>
              <a-button 
                type="primary" 
                @click="submitAnswer"
                :disabled="!imageDescription.trim() || submitting"
                :loading="submitting"
              >
                <Check class="w-4 h-4 mr-1" />
                提交描述
              </a-button>
            </div>
          </div>
        </div>

        <!-- 单词连线游戏 -->
        <div v-else-if="currentGame.type === 'word-matching'" class="word-matching-game">
          <div class="question-section">
            <h3>单词连线</h3>
            <p class="game-instruction">将左边的单词与右边对应的意思连线</p>
          </div>
          
          <div class="matching-area">
            <div class="words-column">
              <h4>单词</h4>
              <div class="word-list">
                <div 
                  v-for="(word, index) in currentQuestion.words" 
                  :key="index"
                  class="word-item"
                  :class="{ 
                    selected: selectedWordIndex === index,
                    matched: wordMatches[index] !== undefined,
                    correct: wordMatches[index] === word.correctMatch
                  }"
                  @click="selectWord(index)"
                >
                  <div class="word-text">{{ word.text }}</div>
                  <div class="word-pronunciation" v-if="word.pronunciation">
                    [{{ word.pronunciation }}]
                  </div>
                </div>
              </div>
            </div>
            
            <div class="connection-area">
              <svg class="connection-svg" ref="connectionSvg">
                <line 
                  v-for="(line, index) in connectionLines" 
                  :key="index"
                  :x1="line.x1" 
                  :y1="line.y1" 
                  :x2="line.x2" 
                  :y2="line.y2"
                  :class="{ correct: line.correct, incorrect: line.incorrect }"
                  stroke-width="3"
                />
              </svg>
            </div>
            
            <div class="meanings-column">
              <h4>释义</h4>
              <div class="meaning-list">
                <div 
                  v-for="(meaning, index) in currentQuestion.meanings" 
                  :key="index"
                  class="meaning-item"
                  :class="{ 
                    selected: selectedMeaningIndex === index,
                    matched: meaningMatches[index] !== undefined,
                    correct: meaningMatches[index] === meaning.correctMatch
                  }"
                  @click="selectMeaning(index)"
                >
                  <div class="meaning-text">{{ meaning.text }}</div>
                  <div class="meaning-example" v-if="meaning.example">
                    例: {{ meaning.example }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="game-actions">
            <a-button @click="clearMatches" :disabled="Object.keys(wordMatches).length === 0">
              <RotateCcw class="w-4 h-4 mr-1" />
              重新连线
            </a-button>
            <a-button @click="showMatchingHint" type="dashed">
              <Lightbulb class="w-4 h-4 mr-1" />
              提示
            </a-button>
            <a-button 
              type="primary" 
              @click="submitMatching"
              :disabled="Object.keys(wordMatches).length !== currentQuestion.words.length || submitting"
              :loading="submitting"
            >
              <Check class="w-4 h-4 mr-1" />
              提交答案
            </a-button>
          </div>
        </div>

        <!-- 单词拼图游戏 -->
        <div v-else-if="currentGame.type === 'word-puzzle'" class="word-puzzle-game">
          <div class="question-section">
            <h3>单词拼图</h3>
            <div class="word-clue">
              <div class="clue-text">{{ currentQuestion.clue }}</div>
              <div class="word-length">单词长度: {{ currentQuestion.answer.length }} 个字母</div>
            </div>
          </div>
          
          <div class="puzzle-area">
            <div class="letter-grid">
              <div 
                v-for="(letter, index) in puzzleLetters" 
                :key="index"
                class="puzzle-letter"
                :class="{ 
                  selected: selectedLetters.includes(index),
                  used: letter.used,
                  correct: letter.correct 
                }"
                @click="selectPuzzleLetter(index)"
              >
                {{ letter.char }}
              </div>
            </div>
            
            <div class="word-construction">
              <div class="constructed-word">
                <div 
                  v-for="(char, index) in constructedWord" 
                  :key="index"
                  class="word-char"
                  :class="{ empty: !char }"
                >
                  {{ char || '_' }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="puzzle-hints" v-if="puzzleHints.length > 0">
            <h5>提示：</h5>
            <ul class="hint-list">
              <li v-for="hint in puzzleHints" :key="hint">{{ hint }}</li>
            </ul>
          </div>
          
          <div class="game-actions">
            <a-button @click="clearPuzzle" :disabled="constructedWord.every(c => !c)">
              <RotateCcw class="w-4 h-4 mr-1" />
              重新拼图
            </a-button>
            <a-button @click="getPuzzleHint" type="dashed">
              <Lightbulb class="w-4 h-4 mr-1" />
              获取提示
            </a-button>
            <a-button 
              type="primary" 
              @click="submitPuzzle"
              :disabled="constructedWord.some(c => !c) || submitting"
              :loading="submitting"
            >
              <Check class="w-4 h-4 mr-1" />
              提交答案
            </a-button>
          </div>
        </div>

        <!-- 图片选择游戏 -->
        <div v-else-if="currentGame.type === 'image-choice'" class="image-choice-game">
          <div class="question-section">
            <h3>看图选词</h3>
            <div class="question-text">{{ currentQuestion.question }}</div>
            <div class="audio-section" v-if="currentQuestion.audioUrl">
              <a-button @click="playQuestionAudio" type="dashed">
                <Volume2 class="w-4 h-4 mr-1" />
                播放音频
              </a-button>
            </div>
          </div>
          
          <div class="image-options">
            <div 
              v-for="(option, index) in currentQuestion.imageOptions" 
              :key="index"
              class="image-option"
              :class="{ 
                selected: selectedImageIndex === index,
                correct: showImageFeedback && option.correct,
                incorrect: showImageFeedback && selectedImageIndex === index && !option.correct
              }"
              @click="selectImage(index)"
            >
              <div class="image-container">
                <img :src="option.imageUrl" :alt="option.alt" class="option-image" />
                <div class="image-overlay" v-if="showImageFeedback">
                  <CheckCircle v-if="option.correct" class="w-8 h-8 text-green-500" />
                  <XCircle v-else-if="selectedImageIndex === index" class="w-8 h-8 text-red-500" />
                </div>
              </div>
              <div class="image-label">{{ String.fromCharCode(65 + index) }}</div>
              <div class="image-text" v-if="option.text">{{ option.text }}</div>
            </div>
          </div>
          
          <div class="game-actions">
            <a-button @click="playQuestionAudio" type="dashed" v-if="currentQuestion.audioUrl">
              <Volume2 class="w-4 h-4 mr-1" />
              重播音频
            </a-button>
            <a-button 
              type="primary" 
              @click="submitImageChoice"
              :disabled="selectedImageIndex === null || submitting"
              :loading="submitting"
            >
              <Check class="w-4 h-4 mr-1" />
              提交选择
            </a-button>
          </div>
        </div>
      </a-card>

      <!-- 游戏暂停界面 -->
      <div v-else-if="gameState === 'paused'" class="game-paused">
        <a-card class="pause-card">
          <div class="pause-content">
            <Pause class="w-16 h-16 text-gray-400 mb-4" />
            <h3>游戏已暂停</h3>
            <p>休息一下，准备好了再继续吧！</p>
            <div class="pause-actions">
              <a-button type="primary" @click="resumeGame" size="large">
                <Play class="w-4 h-4 mr-1" />
                继续游戏
              </a-button>
              <a-button @click="exitGame" size="large">
                <X class="w-4 h-4 mr-1" />
                退出游戏
              </a-button>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 游戏结束界面 -->
      <div v-else-if="gameState === 'finished'" class="game-finished">
        <a-card class="finish-card">
          <div class="finish-content">
            <div class="finish-header">
              <Trophy class="w-16 h-16 text-yellow-500 mb-4" />
              <h2>游戏完成！</h2>
              <div class="final-score">
                <div class="score-circle">
                  <a-progress 
                    type="circle" 
                    :percent="Math.round((gameScore / (currentGame.questions.length * 100)) * 100)" 
                    :size="120"
                    :stroke-color="getScoreColor(gameScore)"
                  />
                </div>
                <div class="score-details">
                  <div class="score-label">总得分</div>
                  <div class="score-value">{{ gameScore }}</div>
                  <div class="score-rating">{{ getScoreRating(gameScore) }}</div>
                </div>
              </div>

              <!-- 游戏统计 -->
              <div class="game-stats">
                <a-row :gutter="16">
                  <a-col :span="6">
                    <div class="stat-item">
                      <Target class="w-6 h-6 mb-2 text-blue-500" />
                      <div class="stat-value">{{ correctAnswers }}</div>
                      <div class="stat-label">正确答案</div>
                    </div>
                  </a-col>
                  <a-col :span="6">
                    <div class="stat-item">
                      <Clock class="w-6 h-6 mb-2 text-green-500" />
                      <div class="stat-value">{{ formatTime(gameTime) }}</div>
                      <div class="stat-label">用时</div>
                    </div>
                  </a-col>
                  <a-col :span="6">
                    <div class="stat-item">
                      <Zap class="w-6 h-6 mb-2 text-orange-500" />
                      <div class="stat-value">{{ streak }}</div>
                      <div class="stat-label">连击</div>
                    </div>
                  </a-col>
                  <a-col :span="6">
                    <div class="stat-item">
                      <Star class="w-6 h-6 mb-2 text-purple-500" />
                      <div class="stat-value">{{ earnedStars }}</div>
                      <div class="stat-label">获得星星</div>
                    </div>
                  </a-col>
                </a-row>
              </div>

              <!-- 获得徽章 -->
              <div v-if="earnedBadges.length > 0" class="earned-badges">
                <h4>🎉 获得新徽章！</h4>
                <div class="badge-list">
                  <div 
                    v-for="badge in earnedBadges" 
                    :key="badge.id"
                    class="badge-item"
                  >
                    <div class="badge-icon">{{ badge.emoji }}</div>
                    <div class="badge-info">
                      <div class="badge-name">{{ badge.name }}</div>
                      <div class="badge-description">{{ badge.description }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 学习建议 -->
              <div class="learning-suggestions">
                <h4>💡 学习建议</h4>
                <div class="suggestion-list">
                  <div 
                    v-for="suggestion in suggestions" 
                    :key="suggestion.id"
                    class="suggestion-item"
                  >
                    <component :is="suggestion.icon" class="w-5 h-5 mr-2" />
                    <span>{{ suggestion.text }}</span>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="finish-actions">
                <a-button type="primary" @click="playAgain" size="large">
                  <RotateCcw class="w-4 h-4 mr-1" />
                  再玩一次
                </a-button>
                <a-button @click="nextLevel" size="large" :disabled="!canAdvance">
                  <ArrowRight class="w-4 h-4 mr-1" />
                  下一关
                </a-button>
                <a-button @click="backToMenu" size="large">
                  <Home class="w-4 h-4 mr-1" />
                  返回主页
                </a-button>
              </div>
            </div>
          </a-card>
        </div>
      </div>
    </div>

      <!-- 答题反馈模态框 -->
      <a-modal
        v-model:open="showFeedback"
        :title="null"
        :footer="null"
        :closable="false"
        class="feedback-modal"
        :width="400"
      >
        <div class="feedback-content">
          <div class="feedback-icon">
            <CheckCircle v-if="isCorrect" class="w-16 h-16 text-green-500" />
            <XCircle v-else class="w-16 h-16 text-red-500" />
          </div>
          <div class="feedback-message">
            <h3>{{ isCorrect ? '回答正确！' : '回答错误' }}</h3>
            <p v-if="!isCorrect">正确答案是: {{ correctAnswer }}</p>
            <p v-if="explanation">{{ explanation }}</p>
          </div>
          <div class="feedback-score" v-if="isCorrect">
            <div class="score-animation">+{{ lastScore }}</div>
          </div>
        </div>
      </a-modal>

      <!-- 积分动画 -->
      <div class="points-animation" v-if="showPointsAnimation">
        <div 
          v-for="point in animatedPoints" 
          :key="point.id"
          class="point-item"
          :style="{ 
            left: point.x + 'px', 
            top: point.y + 'px',
            animationDelay: point.delay + 'ms'
          }"
        >
          +{{ point.value }}
        </div>
      </div>

      <!-- 连击效果 -->
      <div class="streak-effect" v-if="showStreakEffect">
        <div class="streak-text">
          {{ streak }}连击！
          <div class="streak-multiplier">x{{ streakMultiplier }}</div>
        </div>
      </div>
    </div>

    <!-- 动画组件 -->
    <RewardAnimation 
      ref="rewardAnimationRef"
      :type="rewardType"
      :points="rewardPoints"
      :star-count="rewardStars"
      :badge-name="rewardBadgeName"
      :level="currentLevel"
      :combo="streak"
      :multiplier="streakMultiplier"
      :exp="rewardExp"
      :exp-percentage="expPercentage"
      @complete="onRewardAnimationComplete"
    />

    <!-- 音效组件 -->
    <SoundEffects 
      ref="soundEffectsRef"
      :enabled="soundEnabled"
      :volume="soundVolume"
    />

    <!-- 浮动元素 -->
    <FloatingElements 
      :show-bubbles="true"
      :show-stars="true"
      :show-hearts="false"
      :show-rainbows="false"
      :show-clouds="true"
      :show-flowers="false"
      :show-notes="true"
      :show-gifts="false"
      :count="8"
      :duration="15000"
      :intensity="0.6"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { storage } from '@/utils/storage'
import RewardAnimation from '@/components/animations/RewardAnimation.vue'
import SoundEffects from '@/components/animations/SoundEffects.vue'
import FloatingElements from '@/components/animations/FloatingElements.vue'
import {
  Volume2,
  Headphones,
  BookOpen,
  PenTool,
  Pause,
  Play,
  X,
  Check,
  RotateCcw,
  Lightbulb,
  Highlighter,
  Languages,
  Trophy,
  Target,
  Clock,
  Zap,
  Star,
  ArrowRight,
  Home,
  CheckCircle,
  XCircle,
  Mic,
  Square,
  Trash2,
  AlertCircle,
  Eye
} from 'lucide-vue-next'

interface GameQuestion {
  id: string
  type: string
  question?: string
  answer: string | string[]
  options?: Array<{ text: string; value: string }>
  hint?: string
  explanation?: string
  passage?: string
  translation?: string
  questions?: Array<{
    question: string
    options: Array<{ text: string; value: string }>
    answer: string
  }>
  audioUrl?: string
  difficulty: number
  points: number
}

interface Game {
  id: string
  title: string
  type: string
  difficulty: string
  category: string
  questions: GameQuestion[]
  timeLimit?: number
}

interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  condition: (stats: any) => boolean
}

const router = useRouter()

// 响应式数据
const gameState = ref<'playing' | 'paused' | 'finished'>('playing')
const currentQuestionIndex = ref(0)
const gameScore = ref(0)
const correctAnswers = ref(0)
const gameTime = ref(0)
const streak = ref(0)
const maxStreak = ref(0)
const earnedStars = ref(0)
const earnedBadges = ref<Badge[]>([])
const comboCount = ref(0)
const totalQuestions = ref(0)

// 答题相关
const userAnswer = ref<string[]>([])
const selectedAnswer = ref('')
const selectedOption = ref('')
const readingAnswers = ref<string[]>([])
const usedLetters = ref<string[]>([])
const showHint = ref(false)
const showExplanation = ref(false)
const showTranslation = ref(false)
const hintUsed = ref(false)
const highlightMode = ref(false)
const highlightedText = ref('')

// 反馈系统
const feedbackMessage = ref('')
const isCorrectAnswer = ref(false)

// 加载状态
const audioLoading = ref(false)
const submitting = ref(false)
const nextQuestionLoading = ref(false)

// 单词配对游戏相关
const vocabularyMode = ref('image')
const selectedImageIndex = ref<number | null>(null)
const showImageFeedback = ref(false)
const selectedWordIndex = ref<number | null>(null)
const selectedMeaningIndex = ref<number | null>(null)
const wordMatches = ref<Record<number, number>>({})
const meaningMatches = ref<Record<number, number>>({})
const showMeaningFeedback = ref(false)

// 单词连线游戏状态
const connectionLines = ref([])
const connectionSvg = ref(null)

// 单词拼图游戏状态
const puzzleLetters = ref([])
const selectedLetters = ref([])
const constructedWord = ref([])
const puzzleHints = ref([])

// 图片选择游戏状态
const playQuestionAudio = () => {
  soundEffectsRef.value?.playSound('click')
  message.info('播放音频...')
}

// 句子排序游戏状态
const availableWords = ref([])
const sentenceWords = ref([])
const showTargetSentence = ref(false)
const draggedWord = ref(null)
const dragSource = ref('')

// 语音识别游戏状态
const isRecording = ref(false)
const recordingTime = ref(0)
const recordedAudio = ref(null)
const speechResult = ref('')
const speechAccuracy = ref(0)
const pronunciationFeedback = ref([])
const processingAudio = ref(false)
const playingRecording = ref(false)
const recordingTimer = ref(null)

// 填空练习游戏状态
const passageParts = ref([])
const blankAnswers = ref({})
const usedOptions = ref([])
const allHintsShown = ref(false)

// 图片描述游戏状态
const imageDescription = ref('')
const wordSuggestions = ref([])
const loadingSuggestions = ref(false)

// 音频控制
const playCount = ref(0)
const playbackSpeed = ref(1)

// 语法游戏
const sentenceParts = ref([])

// 反馈系统
const showFeedback = ref(false)
const isCorrect = ref(false)
const correctAnswer = ref('')
const explanation = ref('')
const lastScore = ref(0)

// 动画效果
const showPointsAnimation = ref(false)
const showStreakEffect = ref(false)
const animatedPoints = ref([])
const streakMultiplier = ref(1)

// 新增动画相关状态
const rewardAnimationRef = ref()
const soundEffectsRef = ref()
const rewardType = ref<'points' | 'stars' | 'badge' | 'level' | 'combo' | 'perfect' | 'exp'>('points')
const rewardPoints = ref(0)
const rewardStars = ref(0)
const rewardBadgeName = ref('')
const currentLevel = ref(1)
const rewardExp = ref(0)
const expPercentage = ref(0)
const soundEnabled = ref(true)
const soundVolume = ref(0.7)

// 字母表
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// 模拟游戏数据
const currentGame = ref<Game>({
  id: '1',
  title: '单词拼写挑战',
  type: 'spelling',
  difficulty: '简单',
  category: '词汇',
  questions: [
    {
      id: '1',
      type: 'spelling',
      answer: 'APPLE',
      hint: '一种红色的水果',
      explanation: 'Apple是苹果的意思',
      audioUrl: '/audio/apple.mp3',
      difficulty: 1,
      points: 100
    },
    {
      id: '2',
      type: 'spelling',
      answer: 'BOOK',
      hint: '用来阅读的物品',
      explanation: 'Book是书的意思',
      audioUrl: '/audio/book.mp3',
      difficulty: 1,
      points: 100
    }
  ]
})

// 徽章系统
const badges: Badge[] = [
  {
    id: 'first_correct',
    name: '初次成功',
    description: '第一次答对题目',
    emoji: '🎯',
    condition: (stats) => stats.correctAnswers >= 1
  },
  {
    id: 'streak_master',
    name: '连击大师',
    description: '连续答对5题',
    emoji: '🔥',
    condition: (stats) => stats.maxStreak >= 5
  },
  {
    id: 'perfect_score',
    name: '完美得分',
    description: '获得满分',
    emoji: '⭐',
    condition: (stats) => stats.score === stats.maxScore
  }
]

// 学习建议
const suggestions = ref([
  {
    id: '1',
    icon: BookOpen,
    text: '多练习单词拼写，提高词汇量'
  },
  {
    id: '2',
    icon: Headphones,
    text: '加强听力训练，提高语音识别能力'
  }
])

// 计算属性
const progressPercent = computed(() => {
  if (currentGame.value.questions.length === 0) return 0
  return Math.round(((currentQuestionIndex.value + 1) / currentGame.value.questions.length) * 100)
})

const currentQuestion = computed(() => {
  return currentGame.value.questions[currentQuestionIndex.value]
})

const isGrammarComplete = computed(() => {
  return sentenceParts.value.every(part => 
    part.type === 'text' || (part.type === 'blank' && part.selected)
  )
})

const isReadingComplete = computed(() => {
  if (!currentQuestion.value?.questions) return false
  return currentQuestion.value.questions.every((_, index) => readingAnswers.value[index])
})

const canAdvance = computed(() => {
  const scorePercent = (gameScore.value / (currentGame.value.questions.length * 100)) * 100
  return scorePercent >= 60 // 60%以上可以进入下一关
})

// 方法
const getGameIcon = (type: string) => {
  const icons = {
    spelling: PenTool,
    listening: Headphones,
    grammar: BookOpen,
    reading: BookOpen
  }
  return icons[type] || BookOpen
}

const playAudio = () => {
  playCount.value++
  soundEffectsRef.value?.playSound('click')
  message.info('播放音频...')
  // 这里实现音频播放逻辑
}

const selectLetter = (letter: string) => {
  if (usedLetters.value.includes(letter)) return
  
  soundEffectsRef.value?.playSound('pop')
  
  const answerLength = currentQuestion.value.answer.length
  if (userAnswer.value.length < answerLength) {
    userAnswer.value.push(letter)
    usedLetters.value.push(letter)
  }
}

const clearAnswer = () => {
  soundEffectsRef.value?.playSound('whoosh')
  userAnswer.value = []
  usedLetters.value = []
}

const pauseGame = () => {
  soundEffectsRef.value?.playSound('click')
  gameState.value = 'paused'
}

const resumeGame = () => {
  soundEffectsRef.value?.playSound('click')
  soundEffectsRef.value?.soundCombos.gameStart()
  gameState.value = 'playing'
}

const exitGame = () => {
  soundEffectsRef.value?.playSound('click')
  router.push('/games')
}

const playAgain = () => {
  // 重置游戏状态
  gameState.value = 'playing'
  currentQuestionIndex.value = 0
  gameScore.value = 0
  correctAnswers.value = 0
  gameTime.value = 0
  streak.value = 0
  maxStreak.value = 0
  earnedStars.value = 0
  earnedBadges.value = []
  comboCount.value = 0
  
  // 播放重新开始音效
  soundEffectsRef.value?.soundCombos.gameStart()
  
  resetQuestionState()
}

const nextLevel = () => {
  message.info('下一关功能开发中...')
}

const backToMenu = () => {
  router.push('/')
}

const getScoreColor = (score: number): string => {
  const percent = (score / (currentGame.value.questions.length * 100)) * 100
  if (percent >= 90) return '#52c41a'
  if (percent >= 70) return '#1890ff'
  if (percent >= 50) return '#faad14'
  return '#ff4d4f'
}

const getScoreRating = (score: number): string => {
  const percent = (score / (currentGame.value.questions.length * 100)) * 100
  if (percent >= 90) return '优秀'
  if (percent >= 70) return '良好'
  if (percent >= 50) return '及格'
  return '需要努力'
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 生命周期
onMounted(() => {
  // 开始计时
  const timer = setInterval(() => {
    if (gameState.value === 'playing') {
      gameTime.value++
    }
  }, 1000)
  
  // 初始化题目状态
  resetQuestionState()
  
  // 初始化游戏特定状态
  initializeGameState()
  
  // 清理定时器
  onUnmounted(() => {
    clearInterval(timer)
  })
})

const initializeGameState = () => {
  if (currentGame.value.type === 'word-puzzle') {
    // 初始化拼图游戏
    const answer = currentQuestion.value?.answer || 'HELLO'
    const letters = answer.split('')
    const extraLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    
    // 创建字母池（包含答案字母和干扰字母）
    const allLetters = [...letters, ...extraLetters.slice(0, 6)]
    puzzleLetters.value = allLetters
      .sort(() => Math.random() - 0.5)
      .map((char, index) => ({
        char,
        id: index,
        used: false
      }))
    
    constructedWord.value = Array(answer.length).fill('')
    puzzleHints.value = []
  }
}
</script>

<style scoped lang="less">
.game-interface {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;

  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 16px;

    .game-info-card {
      flex: 1;
      
      .game-info {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;

        .game-title {
          display: flex;
          align-items: center;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .game-meta {
          display: flex;
          gap: 8px;
        }
      }

      .game-progress {
        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          color: #6b7280;

          .score {
            font-weight: 600;
            color: #059669;
          }
        }
      }
    }

    .game-controls {
      display: flex;
      gap: 8px;
    }
  }

  .game-content {
    .question-card {
      min-height: 500px;
      
      .spelling-game,
      .listening-game,
      .grammar-game,
      .reading-game,
      .vocabulary-game {
        .question-section {
          margin-bottom: 32px;

          h3 {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
          }

          .audio-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            margin-bottom: 20px;

            .play-button {
              height: 60px;
              font-size: 16px;
              border-radius: 30px;
              padding: 0 32px;
            }

            .play-count {
              color: #6b7280;
              font-size: 14px;
            }

            .audio-controls {
              display: flex;
              align-items: center;
              gap: 12px;

              .speed-slider {
                width: 120px;
              }

              .speed-label {
                font-size: 14px;
                color: #6b7280;
                min-width: 40px;
              }
            }
          }

          .word-hint {
            text-align: center;
            padding: 12px;
            background: #f3f4f6;
            border-radius: 8px;
            color: #374151;
          }
        }

        .answer-section {
          .letter-boxes {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-bottom: 24px;

            .letter-box {
              width: 50px;
              height: 50px;
              border: 2px solid #d1d5db;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: 600;
              background: white;
              transition: all 0.3s;

              &.correct {
                border-color: #10b981;
                background: #ecfdf5;
                color: #065f46;
              }

              &.incorrect {
                border-color: #ef4444;
                background: #fef2f2;
                color: #991b1b;
              }
            }
          }

          .letter-keyboard {
            display: grid;
            grid-template-columns: repeat(13, 1fr);
            gap: 8px;
            margin-bottom: 24px;
            max-width: 650px;
            margin-left: auto;
            margin-right: auto;

            .letter-key {
              width: 40px;
              height: 40px;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              cursor: pointer;
              background: white;
              transition: all 0.3s;

              &:hover:not(.disabled) {
                border-color: #3b82f6;
                background: #eff6ff;
              }

              &.used,
              &.disabled {
                background: #f3f4f6;
                color: #9ca3af;
                cursor: not-allowed;
              }
            }
          }

          .answer-options {
            width: 100%;

            .option-item {
              margin-bottom: 12px;
              padding: 12px;
              border-radius: 8px;
              transition: all 0.3s;

              &:hover {
                background: #f9fafb;
              }

              .option-radio {
                width: 100%;

                .option-content {
                  display: flex;
                  align-items: center;
                  gap: 8px;

                  .option-label {
                    font-weight: 600;
                    color: #374151;
                    min-width: 24px;
                  }

                  .option-text {
                    flex: 1;
                  }
                }
              }
            }
          }

          .sentence-container {
            margin-bottom: 24px;

            .sentence {
              font-size: 18px;
              line-height: 1.6;
              text-align: center;
              padding: 20px;
              background: #f9fafb;
              border-radius: 12px;

              .sentence-part {
                .blank-space {
                  display: inline-block;
                  margin: 0 4px;

                  .blank-select {
                    min-width: 100px;
                  }
                }
              }
            }
          }

          .grammar-explanation {
            margin-top: 16px;

            .explanation-alert {
              border-radius: 8px;
            }
          }

          .game-actions {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .vocabulary-actions {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-top: 24px;

            .matching-actions {
              display: flex;
              gap: 12px;
            }
          }
        }
      }

      // 单词配对游戏样式
      .vocabulary-game {
        .game-mode-tabs {
          margin-bottom: 32px;

          .ant-tabs-tab {
            font-size: 16px;
            font-weight: 600;
          }
        }

        .image-matching {
          .target-word {
            text-align: center;
            margin-bottom: 32px;

            .word-card {
              display: inline-block;
              padding: 20px 32px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 16px;
              color: white;
              box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);

              h4 {
                font-size: 32px;
                font-weight: 700;
                margin: 0 0 8px 0;
                letter-spacing: 2px;
              }

              .word-pronunciation {
                font-size: 16px;
                opacity: 0.9;
                font-style: italic;
              }
            }
          }

          .image-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            max-width: 800px;
            margin: 0 auto;

            .image-option {
              background: white;
              border: 3px solid #e5e7eb;
              border-radius: 16px;
              padding: 16px;
              cursor: pointer;
              transition: all 0.3s ease;
              text-align: center;

              &:hover {
                border-color: #3b82f6;
                transform: translateY(-4px);
                box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
              }

              &.selected {
                border-color: #3b82f6;
                background: #eff6ff;
                transform: translateY(-2px);
              }

              &.correct {
                border-color: #10b981;
                background: #ecfdf5;
                animation: correctPulse 0.6s ease-in-out;
              }

              &.incorrect {
                border-color: #ef4444;
                background: #fef2f2;
                animation: incorrectShake 0.6s ease-in-out;
              }

              .image-container {
                width: 100%;
                height: 120px;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 12px;
                background: #f3f4f6;
                display: flex;
                align-items: center;
                justify-content: center;

                img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }
              }

              .image-label {
                font-size: 16px;
                font-weight: 600;
                color: #374151;
              }
            }
          }
        }

        .meaning-matching {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          max-width: 800px;
          margin: 0 auto;

          .words-column,
          .meanings-column {
            h4 {
              text-align: center;
              font-size: 20px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
              padding-bottom: 12px;
              border-bottom: 2px solid #e5e7eb;
            }

            .word-list,
            .meaning-list {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            .word-item,
            .meaning-item {
              padding: 16px 20px;
              background: white;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              cursor: pointer;
              transition: all 0.3s ease;
              font-size: 16px;
              font-weight: 500;
              text-align: center;

              &:hover:not(.matched) {
                border-color: #3b82f6;
                background: #eff6ff;
                transform: translateX(4px);
              }

              &.selected {
                border-color: #3b82f6;
                background: #3b82f6;
                color: white;
                transform: scale(1.05);
              }

              &.matched {
                border-color: #10b981;
                background: #ecfdf5;
                color: #065f46;
                cursor: not-allowed;
              }

              &.correct {
                border-color: #10b981;
                background: #10b981;
                color: white;
                animation: correctPulse 0.6s ease-in-out;
              }

              &.incorrect {
                border-color: #ef4444;
                background: #ef4444;
                color: white;
                animation: incorrectShake 0.6s ease-in-out;
              }
            }
          }
        }

        @keyframes correctPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes incorrectShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      }

      .reading-game {
        .reading-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;

          .passage-section {
            .passage-container {
              .passage-text {
                background: #f9fafb;
                padding: 20px;
                border-radius: 12px;
                line-height: 1.8;
                font-size: 16px;
                margin-bottom: 16px;
              }

              .reading-tools {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
              }

              .translation {
                background: #eff6ff;
                padding: 16px;
                border-radius: 8px;
                font-size: 14px;
                color: #1e40af;
                border-left: 4px solid #3b82f6;
              }
            }
          }

          .questions-section {
            .question-item {
              margin-bottom: 24px;
              padding: 16px;
              background: #f9fafb;
              border-radius: 12px;

              .question-title {
                font-weight: 600;
                margin-bottom: 12px;
                color: #1f2937;
              }

              .question-options {
                .option-item {
                  margin-bottom: 8px;
                }
              }
            }
          }
        }
      }
    }

    .game-paused {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 500px;

      .pause-card {
        max-width: 600px;
        width: 100%;

        .pause-content {
          text-align: center;

          h3 {
            margin: 16px 0;
            color: #1f2937;
          }

          p {
            color: #6b7280;
            margin-bottom: 24px;
          }

          .pause-actions {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }
        }
      }
    }

    .game-finished {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 500px;

      .finish-card {
        max-width: 800px;
        width: 100%;

        .finish-content {
          text-align: center;

          .finish-header {
            margin-bottom: 32px;

            h2 {
              margin: 16px 0;
              color: #1f2937;
              font-size: 28px;
            }

            .final-score {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 32px;
              margin: 24px 0;

              .score-circle {
                position: relative;
              }

              .score-details {
                text-align: left;

                .score-label {
                  font-size: 14px;
                  color: #6b7280;
                  margin-bottom: 4px;
                }

                .score-value {
                  font-size: 36px;
                  font-weight: 700;
                  color: #1f2937;
                  margin-bottom: 4px;
                }

                .score-rating {
                  font-size: 16px;
                  font-weight: 600;
                  color: #059669;
                }
              }
            }
          }

          .game-stats {
            margin-bottom: 32px;

            .stat-item {
              text-align: center;
              padding: 20px;
              background: #f9fafb;
              border-radius: 12px;
              transition: all 0.3s;

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              }

              .stat-value {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin-top: 8px;
                margin-bottom: 4px;
              }

              .stat-label {
                font-size: 14px;
                color: #6b7280;
              }
            }
          }

          .earned-badges {
            margin-bottom: 32px;
            padding: 24px;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 16px;
            border: 2px solid #f59e0b;

            h4 {
              margin-bottom: 16px;
              color: #92400e;
              font-size: 18px;
              font-weight: 600;
            }

            .badge-list {
              display: flex;
              flex-direction: column;
              gap: 12px;

              .badge-item {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 12px;
                animation: badgeAppear 0.6s ease-out;

                .badge-icon {
                  font-size: 32px;
                  animation: bounce 1s infinite;
                }

                .badge-info {
                  flex: 1;
                  text-align: left;

                  .badge-name {
                    font-weight: 600;
                    color: #92400e;
                    font-size: 16px;
                    margin-bottom: 4px;
                  }

                  .badge-description {
                    font-size: 14px;
                    color: #a16207;
                  }
                }
              }
            }
          }

          .learning-suggestions {
            margin-bottom: 32px;
            text-align: left;

            h4 {
              margin-bottom: 16px;
              color: #1f2937;
              font-size: 18px;
              font-weight: 600;
              text-align: center;
            }

            .suggestion-list {
              display: flex;
              flex-direction: column;
              gap: 12px;

              .suggestion-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                background: #eff6ff;
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
                color: #1e40af;
                font-size: 14px;
              }
            }
          }

          .finish-actions {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }
        }
      }
    }
  }

  // 反馈模态框
  .feedback-modal {
    :deep(.ant-modal-content) {
      border-radius: 16px;
      overflow: hidden;
    }

    .feedback-content {
      text-align: center;
      padding: 32px 20px;

      .feedback-icon {
        margin-bottom: 20px;
        animation: iconPulse 0.6s ease-out;
      }

      .feedback-message {
        margin-bottom: 24px;

        h3 {
          margin-bottom: 12px;
          color: #1f2937;
          font-size: 24px;
          font-weight: 600;
        }

        p {
          color: #6b7280;
          margin-bottom: 8px;
          font-size: 16px;
        }
      }

      .feedback-score {
        .score-animation {
          font-size: 32px;
          font-weight: 700;
          color: #059669;
          animation: scoreUp 0.8s ease-out;
        }
      }
    }
  }

  // 积分动画
  .points-animation {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;

    .point-item {
      position: absolute;
      font-size: 24px;
      font-weight: 700;
      color: #10b981;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      animation: pointFloat 2s ease-out forwards;
    }
  }

  <!-- 连击效果 -->
  <div class="streak-effect" v-if="showStreakEffect">
    <div class="streak-text">
      {{ streak }}连击！
      <div class="streak-multiplier">x{{ streakMultiplier }}</div>
    </div>
  </div>
</div>

<!-- 动画组件 -->
<RewardAnimation 
  ref="rewardAnimationRef"
  :type="rewardType"
  :points="rewardPoints"
  :star-count="rewardStars"
  :badge-name="rewardBadgeName"
  :level="currentLevel"
  :combo="streak"
  :multiplier="streakMultiplier"
  :exp="rewardExp"
  :exp-percentage="expPercentage"
  @complete="onRewardAnimationComplete"
/>

<!-- 音效组件 -->
<SoundEffects 
  ref="soundEffectsRef"
  :enabled="soundEnabled"
  :volume="soundVolume"
/>

<!-- 浮动元素 -->
<FloatingElements 
  :show-bubbles="true"
  :show-stars="true"
  :show-hearts="false"
  :show-rainbows="false"
  :show-clouds="true"
  :show-flowers="false"
  :show-notes="true"
  :show-gifts="false"
  :count="8"
  :duration="15000"
  :intensity="0.6"
/>
</template>

@keyframes pointFloat {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateY(-50px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(0.8);
  }
}

@keyframes streakPulse {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  80% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}

@keyframes multiplierBounce {
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

@keyframes iconPulse {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes scoreUp {
  0% {
    transform: translateY(20px) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: translateY(-10px) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes badgeAppear {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
  60% {
    transform: translateY(-4px);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .game-interface {
    padding: 16px;

    .game-header {
      flex-direction: column;
      gap: 12px;

      .game-controls {
        align-self: stretch;
        justify-content: center;
      }
    }

    .game-content {
      .reading-game .reading-content {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .letter-keyboard {
        grid-template-columns: repeat(8, 1fr) !important;
        
        .letter-key {
          width: 35px !important;
          height: 35px !important;
          font-size: 14px;
        }
      }

      .finish-card {
        .finish-content {
          .final-score {
            flex-direction: column;
            gap: 16px;

            .score-details {
              text-align: center;
            }
          }

          .game-stats {
            :deep(.ant-row) {
              .ant-col {
                margin-bottom: 16px;
              }
            }
          }

          .finish-actions {
            flex-direction: column;
            align-items: center;

            .ant-btn {
              width: 100%;
              max-width: 200px;
            }
          }
        }
      }
    }

    .streak-effect {
      .streak-text {
        font-size: 36px;

        .streak-multiplier {
          font-size: 18px;
        }
      }
    }
  }
}
</style>

// 单词配对游戏
<div v-else-if="currentGame.type === 'vocabulary'" class="vocabulary-game">
  <div class="question-section">
    <h3>{{ currentQuestion.question }}</h3>
    <div class="game-mode-tabs">
      <a-tabs v-model:activeKey="vocabularyMode" centered>
        <a-tab-pane key="image" tab="图片匹配">
          <div class="image-matching">
            <div class="target-word">
              <div class="word-card">
                <h4>{{ currentQuestion.word }}</h4>
                <div class="word-pronunciation" v-if="currentQuestion.pronunciation">
                  [{{ currentQuestion.pronunciation }}]
                </div>
              </div>
            </div>
            <div class="image-options">
              <div 
                v-for="(option, index) in currentQuestion.imageOptions" 
                :key="index"
                class="image-option"
                :class="{ 
                  selected: selectedImageIndex === index,
                  correct: showImageFeedback && option.correct,
                  incorrect: showImageFeedback && selectedImageIndex === index && !option.correct
                }"
                @click="selectImage(index)"
              >
                <div class="image-container">
                  <img :src="option.image" :alt="option.alt" />
                </div>
                <div class="image-label">{{ option.label }}</div>
              </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="meaning" tab="词义匹配">
          <div class="meaning-matching">
            <div class="words-column">
              <h4>单词</h4>
              <div class="word-list">
                <div 
                  v-for="(word, index) in currentQuestion.words" 
                  :key="index"
                  class="word-item"
                  :class="{ 
                    selected: selectedWordIndex === index,
                    matched: wordMatches[index] !== undefined
                  }"
                  @click="selectWord(index)"
                >
                  {{ word }}
                </div>
              </div>
            </div>
            <div class="meanings-column">
              <h4>词义</h4>
              <div class="meaning-list">
                <div 
                  v-for="(meaning, index) in currentQuestion.meanings" 
                  :key="index"
                  class="meaning-item"
                  :class="{ 
                    selected: selectedMeaningIndex === index,
                    matched: meaningMatches[index] !== undefined,
                    correct: showMeaningFeedback && meaning.correct,
                    incorrect: showMeaningFeedback && meaningMatches[index] !== undefined && !meaning.correct
                  }"
                  @click="selectMeaning(index)"
                >
                  {{ meaning.text }}
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
  
  <div class="answer-section">
    <div class="vocabulary-actions">
      <a-button 
        v-if="vocabularyMode === 'image'"
        type="primary" 
        size="large" 
        :disabled="selectedImageIndex === null"
        @click="submitImageAnswer"
      >
        <CheckCircle class="w-4 h-4" />
        确认选择
      </a-button>
      <div v-else class="matching-actions">
        <a-button 
          type="default" 
          size="large" 
          @click="clearMatches"
          :disabled="Object.keys(wordMatches).length === 0"
        >
          <RotateCcw class="w-4 h-4" />
          重新匹配
        </a-button>
        <a-button 
          type="primary" 
          size="large" 
          :disabled="Object.keys(wordMatches).length !== currentQuestion.words.length"
          @click="submitMeaningAnswer"
        >
          <CheckCircle class="w-4 h-4" />
          提交答案
        </a-button>
      </div>
    </div>
  </div>
</div>

// 添加单词配对游戏相关方法
const selectImage = (index: number) => {
  if (showImageFeedback.value) return
  soundEffectsRef.value?.playSound('click')
  selectedImageIndex.value = index
}

// 通用答题提交方法
const submitAnswer = async () => {
  submitting.value = true
  
  try {
    let isAnswerCorrect = false
    let points = 0
    
    // 根据游戏类型检查答案
    switch (currentGame.value.type) {
      case 'spelling':
        isAnswerCorrect = userAnswer.value.join('') === currentQuestion.value.answer
        points = isAnswerCorrect ? (hintUsed.value ? 90 : 100) : 0
        break
      case 'listening':
        isAnswerCorrect = selectedOption.value === currentQuestion.value.answer
        points = isAnswerCorrect ? 100 : 0
        break
      case 'grammar':
        isAnswerCorrect = checkGrammarAnswer()
        points = isAnswerCorrect ? 100 : 0
        break
      case 'reading':
        isAnswerCorrect = checkReadingAnswer()
        points = isAnswerCorrect ? 100 : 0
        break
    }
    
    // 播放音效
    if (isAnswerCorrect) {
      soundEffectsRef.value?.playSuccessSequence()
      comboCount.value++
      streak.value++
      maxStreak.value = Math.max(maxStreak.value, streak.value)
    } else {
      soundEffectsRef.value?.playErrorSequence()
      comboCount.value = 0
      streak.value = 0
    }
    
    // 计算得分
    if (isAnswerCorrect) {
      const comboBonus = Math.min(comboCount.value * 10, 50)
      points += comboBonus
      gameScore.value += points
      correctAnswers.value++
      lastScore.value = points
      
      // 显示奖励动画
      showRewardAnimation('points', points)
      
      // 连击奖励
      if (streak.value >= 3) {
        showRewardAnimation('combo', streak.value)
        soundEffectsRef.value?.playStreakSequence(streak.value)
      }
    }
    
    // 显示反馈
    showAnswerFeedback(isAnswerCorrect, points)
    
    // 检查徽章
    checkBadges()
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 进入下一题或结束游戏
    if (currentQuestionIndex.value < currentGame.value.questions.length - 1) {
      nextQuestion()
    } else {
      finishGame()
    }
    
  } finally {
    submitting.value = false
  }
}

const checkGrammarAnswer = (): boolean => {
  return sentenceParts.value.every(part => 
    part.type === 'text' || (part.type === 'blank' && part.selected === part.correct)
  )
}

const checkReadingAnswer = (): boolean => {
  return currentQuestion.value.questions?.every((q, index) => 
    readingAnswers.value[index] === q.answer
  ) || false
}

const showRewardAnimation = (type: string, value?: number) => {
  rewardType.value = type
  if (type === 'points' && value) {
    rewardPoints.value = value
  }
  rewardAnimationRef.value?.showAnimation()
}

const showAnswerFeedback = (isCorrect: boolean, points: number) => {
  feedbackMessage.value = isCorrect ? `回答正确！+${points}分` : '回答错误，继续加油！'
  isCorrectAnswer.value = isCorrect
  showFeedback.value = true
  
  setTimeout(() => {
    showFeedback.value = false
  }, 2000)
}

const checkBadges = () => {
  const stats = {
    correctAnswers: correctAnswers.value,
    maxStreak: maxStreak.value,
    score: gameScore.value,
    maxScore: currentGame.value.questions.length * 100
  }
  
  badges.forEach(badge => {
    if (!earnedBadges.value.find(b => b.id === badge.id) && badge.condition(stats)) {
      earnedBadges.value.push(badge)
      soundEffectsRef.value?.playBadgeSequence()
      showRewardAnimation('badge')
      message.success(`🎉 获得新徽章: ${badge.name}`)
    }
  })
}

const nextQuestion = () => {
  nextQuestionLoading.value = true
  
  setTimeout(() => {
    currentQuestionIndex.value++
    resetQuestionState()
    nextQuestionLoading.value = false
  }, 500)
}

const finishGame = () => {
  gameState.value = 'finished'
  
  // 计算星星
  const scorePercent = (gameScore.value / (currentGame.value.questions.length * 100)) * 100
  if (scorePercent >= 90) earnedStars.value = 3
  else if (scorePercent >= 70) earnedStars.value = 2
  else if (scorePercent >= 50) earnedStars.value = 1
  else earnedStars.value = 0
  
  // 播放完成音效
  soundEffectsRef.value?.playCompletionSequence()
  
  // 显示完成动画
  showRewardAnimation('completion')
  
  // 保存游戏结果
  saveGameResult()
}

const saveGameResult = () => {
  const result = {
    gameId: currentGame.value.id,
    score: gameScore.value,
    stars: earnedStars.value,
    correctAnswers: correctAnswers.value,
    totalQuestions: currentGame.value.questions.length,
    time: gameTime.value,
    badges: earnedBadges.value,
    completedAt: new Date()
  }
  
  // 保存到本地存储
  storage.saveGameResult(result)
}

const submitImageAnswer = () => {
  if (selectedImageIndex.value === null) return
  
  const selectedOption = currentQuestion.value.imageOptions[selectedImageIndex.value]
  const isCorrect = selectedOption.correct
  
  showImageFeedback.value = true
  
  if (isCorrect) {
    soundEffectsRef.value?.playSound('correct')
    correctAnswers.value++
    streak.value++
    maxStreak.value = Math.max(maxStreak.value, streak.value)
    
    const points = 100 + (streak.value - 1) * 10
    gameScore.value += points
    lastScore.value = points
    
    showRewardAnimation('points', points)
    
    if (streak.value >= 5) {
      showRewardAnimation('combo', streak.value)
      soundEffectsRef.value?.soundCombos.comboStreak()
    }
  } else {
    soundEffectsRef.value?.playSound('incorrect')
    streak.value = 0
  }
  
  setTimeout(() => {
    showImageFeedback.value = false
    selectedImageIndex.value = null
    nextQuestion()
  }, 2000)
}

const selectWord = (index: number) => {
  if (wordMatches.value[index] !== undefined) return
  soundEffectsRef.value?.playSound('click')
  selectedWordIndex.value = index
}

const selectMeaning = (index: number) => {
  if (meaningMatches.value[index] !== undefined) return
  if (selectedWordIndex.value === null) return
  
  soundEffectsRef.value?.playSound('pop')
  
  // 创建匹配
  wordMatches.value[selectedWordIndex.value] = index
  meaningMatches.value[index] = selectedWordIndex.value
  
  selectedWordIndex.value = null
  selectedMeaningIndex.value = null
}

const clearMatches = () => {
  soundEffectsRef.value?.playSound('whoosh')
  wordMatches.value = {}
  meaningMatches.value = {}
  selectedWordIndex.value = null
  selectedMeaningIndex.value = null
}

const submitMeaningAnswer = () => {
  let correctMatches = 0
  const totalMatches = currentQuestion.value.words.length
  
  // 检查每个匹配是否正确
  Object.entries(wordMatches.value).forEach(([wordIndex, meaningIndex]) => {
    const word = currentQuestion.value.words[parseInt(wordIndex)]
    const meaning = currentQuestion.value.meanings[meaningIndex]
    if (meaning.correctWord === word) {
      correctMatches++
    }
  })
  
  showMeaningFeedback.value = true
  
  const accuracy = correctMatches / totalMatches
  const isCorrect = accuracy >= 0.8 // 80%正确率算通过
  
  if (isCorrect) {
    soundEffectsRef.value?.playSound('correct')
    correctAnswers.value++
    streak.value++
    maxStreak.value = Math.max(maxStreak.value, streak.value)
    
    const points = Math.floor(100 * accuracy) + (streak.value - 1) * 10
    gameScore.value += points
    lastScore.value = points
    
    showRewardAnimation('points', points)
    
    if (accuracy === 1) {
      showRewardAnimation('perfect')
      soundEffectsRef.value?.soundCombos.perfectScore()
    }
  } else {
    soundEffectsRef.value?.playSound('incorrect')
    streak.value = 0
  }
  
  setTimeout(() => {
    showMeaningFeedback.value = false
    clearMatches()
    nextQuestion()
  }, 3000)
}

// 在 resetQuestionState 方法中添加单词配对游戏的重置逻辑
const resetQuestionState = () => {
  // 拼写游戏
  userAnswer.value = []
  usedLetters.value = []
  
  // 听力和语法游戏
  selectedOption.value = null
  
  // 语法游戏
  sentenceParts.value = []
  if (currentQuestion.value?.type === 'grammar' && currentQuestion.value.sentence) {
    const parts = currentQuestion.value.sentence.split('___')
    sentenceParts.value = parts.map((part, index) => ({
      text: part,
      isBlank: index < parts.length - 1,
      selectedValue: ''
    }))
  }
  
  // 阅读游戏
  highlightedText.value = ''
  showTranslation.value = false
  
  // 单词配对游戏
  vocabularyMode.value = 'image'
  selectedImageIndex.value = null
  showImageFeedback.value = false
  selectedWordIndex.value = null
  selectedMeaningIndex.value = null
  wordMatches.value = {}
  meaningMatches.value = {}
  showMeaningFeedback.value = false
  
  // 句子排序游戏
  availableWords.value = []
  sentenceWords.value = []
  showTargetSentence.value = false
  draggedWord.value = null
  dragSource.value = ''
  
  // 语音识别游戏
  isRecording.value = false
  recordingTime.value = 0
  recordedAudio.value = null
  speechResult.value = ''
  speechAccuracy.value = 0
  pronunciationFeedback.value = []
  processingAudio.value = false
  playingRecording.value = false
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value)
    recordingTimer.value = null
  }
  
  // 填空练习游戏
  passageParts.value = []
  blankAnswers.value = {}
  usedOptions.value = []
  allHintsShown.value = false
  
  // 图片描述游戏
  imageDescription.value = ''
  wordSuggestions.value = []
  loadingSuggestions.value = false
  
  // 通用状态
  showFeedback.value = false
  feedbackMessage.value = ''
  isCorrectAnswer.value = false
}

// 句子排序游戏方法
const startDrag = (event: DragEvent, word: any, source: string) => {
  draggedWord.value = word
  dragSource.value = source
  event.dataTransfer?.setData('text/plain', JSON.stringify({ word, source }))
}

const dropWord = (event: DragEvent) => {
  event.preventDefault()
  const data = JSON.parse(event.dataTransfer?.getData('text/plain') || '{}')
  
  if (data.source === 'bank' && !data.word.used) {
    sentenceWords.value.push(data.word)
    data.word.used = true
    soundEffectsRef.value?.playSound('pop')
  }
}

const selectWordFromBank = (word: any) => {
  if (!word.used) {
    sentenceWords.value.push(word)
    word.used = true
    soundEffectsRef.value?.playSound('pop')
  }
}

const removeWordFromSentence = (index: number) => {
  const word = sentenceWords.value[index]
  word.used = false
  sentenceWords.value.splice(index, 1)
  soundEffectsRef.value?.playSound('whoosh')
}

const clearSentence = () => {
  sentenceWords.value.forEach(word => word.used = false)
  sentenceWords.value = []
  soundEffectsRef.value?.playSound('whoosh')
}

// 语音识别游戏方法
const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    isRecording.value = true
    recordingTime.value = 0
    
    // 开始计时
    recordingTimer.value = setInterval(() => {
      recordingTime.value++
    }, 1000)
    
    // 模拟录音（实际项目中需要使用MediaRecorder）
    recordedAudio.value = stream
    soundEffectsRef.value?.playSound('beep')
    
  } catch (error) {
    message.error('无法访问麦克风，请检查权限设置')
  }
}

const stopRecording = () => {
  isRecording.value = false
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value)
    recordingTimer.value = null
  }
  
  // 模拟语音识别处理
  processingAudio.value = true
  setTimeout(() => {
    processingAudio.value = false
    // 模拟识别结果
    speechResult.value = currentQuestion.value.text || '识别结果'
    speechAccuracy.value = Math.floor(Math.random() * 30) + 70 // 70-100%
    
    // 生成发音反馈
    const words = currentQuestion.value.text?.split(' ') || []
    pronunciationFeedback.value = words.map(word => ({
      word,
      status: Math.random() > 0.3 ? 'correct' : 'incorrect'
    }))
    
    soundEffectsRef.value?.playSound('success')
  }, 2000)
}

const playRecording = () => {
  playingRecording.value = true
  soundEffectsRef.value?.playSound('click')
  setTimeout(() => {
    playingRecording.value = false
  }, 2000)
}

const clearRecording = () => {
  recordedAudio.value = null
  speechResult.value = ''
  speechAccuracy.value = 0
  pronunciationFeedback.value = []
  soundEffectsRef.value?.playSound('whoosh')
}

const getAccuracyClass = (accuracy: number) => {
  if (accuracy >= 90) return 'text-green-500'
  if (accuracy >= 70) return 'text-blue-500'
  if (accuracy >= 50) return 'text-yellow-500'
  return 'text-red-500'
}

// 填空练习游戏方法
const updateBlankAnswer = (blankIndex: number, value: string) => {
  blankAnswers.value[blankIndex] = value
}

const selectOption = (option: string) => {
  if (usedOptions.value.includes(option)) return
  
  // 找到第一个空白处填入
  const emptyBlank = passageParts.value.find(part => 
    part.type === 'blank' && !part.userInput
  )
  
  if (emptyBlank) {
    emptyBlank.userInput = option
    usedOptions.value.push(option)
    soundEffectsRef.value?.playSound('pop')
  }
}

const showAllHints = () => {
  passageParts.value.forEach(part => {
    if (part.type === 'blank') {
      part.showHint = true
    }
  })
  allHintsShown.value = true
  soundEffectsRef.value?.playSound('click')
}

const checkAnswers = () => {
  passageParts.value.forEach(part => {
    if (part.type === 'blank') {
      part.showFeedback = true
      part.isCorrect = part.userInput === part.correctAnswer
    }
  })
  soundEffectsRef.value?.playSound('click')
}

// 计算属性
const filledBlanks = computed(() => {
  return passageParts.value.filter(part => 
    part.type === 'blank' && part.userInput
  ).length
})

const totalBlanks = computed(() => {
  return passageParts.value.filter(part => part.type === 'blank').length
})

// 图片描述游戏方法
const addWordToDescription = (word: string) => {
  if (imageDescription.value) {
    imageDescription.value += ' ' + word
  } else {
    imageDescription.value = word
  }
  soundEffectsRef.value?.playSound('pop')
}

const getWordSuggestions = () => {
  loadingSuggestions.value = true
  
  // 模拟获取词汇建议
  setTimeout(() => {
    wordSuggestions.value = [
      'beautiful', 'colorful', 'happy', 'playing', 'garden',
      'sunshine', 'flowers', 'children', 'running', 'laughing'
    ]
    loadingSuggestions.value = false
    soundEffectsRef.value?.playSound('success')
  }, 1000)
}

const clearDescription = () => {
  imageDescription.value = ''
  soundEffectsRef.value?.playSound('whoosh')
}

// 单词连线游戏方法
const selectWord = (index: number) => {
  if (wordMatches.value[index] !== undefined) return
  soundEffectsRef.value?.playSound('click')
  
  if (selectedWordIndex.value === index) {
    selectedWordIndex.value = null
  } else {
    selectedWordIndex.value = index
    if (selectedMeaningIndex.value !== null) {
      createMatch(index, selectedMeaningIndex.value)
    }
  }
}

const selectMeaning = (index: number) => {
  if (meaningMatches.value[index] !== undefined) return
  soundEffectsRef.value?.playSound('click')
  
  if (selectedMeaningIndex.value === index) {
    selectedMeaningIndex.value = null
  } else {
    selectedMeaningIndex.value = index
    if (selectedWordIndex.value !== null) {
      createMatch(selectedWordIndex.value, index)
    }
  }
}

const createMatch = (wordIndex: number, meaningIndex: number) => {
  wordMatches.value[wordIndex] = meaningIndex
  meaningMatches.value[meaningIndex] = wordIndex
  
  // 创建连线
  updateConnectionLines()
  
  // 重置选择
  selectedWordIndex.value = null
  selectedMeaningIndex.value = null
  
  soundEffectsRef.value?.playSound('success')
}

const updateConnectionLines = () => {
  // 这里应该计算连线的坐标
  // 简化实现，实际需要根据DOM元素位置计算
  connectionLines.value = Object.entries(wordMatches.value).map(([wordIdx, meaningIdx]) => ({
    x1: 100,
    y1: parseInt(wordIdx) * 60 + 30,
    x2: 200,
    y2: parseInt(meaningIdx) * 60 + 30,
    correct: true
  }))
}

const clearMatches = () => {
  wordMatches.value = {}
  meaningMatches.value = {}
  connectionLines.value = []
  selectedWordIndex.value = null
  selectedMeaningIndex.value = null
  soundEffectsRef.value?.playSound('whoosh')
}

const showMatchingHint = () => {
  message.info('提示：仔细观察单词的词性和含义')
  soundEffectsRef.value?.playSound('click')
}

const submitMatching = () => {
  // 检查答案逻辑
  submitAnswer()
}

// 单词拼图游戏方法
const selectPuzzleLetter = (index: number) => {
  if (puzzleLetters.value[index]?.used) return
  
  const letter = puzzleLetters.value[index]
  if (selectedLetters.value.includes(index)) {
    // 取消选择
    selectedLetters.value = selectedLetters.value.filter(i => i !== index)
    const wordIndex = constructedWord.value.findIndex(c => c === letter.char)
    if (wordIndex !== -1) {
      constructedWord.value[wordIndex] = ''
    }
  } else {
    // 选择字母
    const emptyIndex = constructedWord.value.findIndex(c => !c)
    if (emptyIndex !== -1) {
      selectedLetters.value.push(index)
      constructedWord.value[emptyIndex] = letter.char
      letter.used = true
    }
  }
  
  soundEffectsRef.value?.playSound('pop')
}

const clearPuzzle = () => {
  selectedLetters.value = []
  constructedWord.value = Array(currentQuestion.value.answer.length).fill('')
  puzzleLetters.value.forEach(letter => {
    letter.used = false
  })
  soundEffectsRef.value?.playSound('whoosh')
}

const getPuzzleHint = () => {
  const hints = [
    '这个单词的第一个字母是 ' + currentQuestion.value.answer[0],
    '这个单词有 ' + currentQuestion.value.answer.length + ' 个字母',
    '提示：' + currentQuestion.value.hint
  ]
  
  const newHint = hints[puzzleHints.value.length]
  if (newHint && !puzzleHints.value.includes(newHint)) {
    puzzleHints.value.push(newHint)
    soundEffectsRef.value?.playSound('click')
  }
}

const submitPuzzle = () => {
  // 检查拼图答案
  const userAnswer = constructedWord.value.join('')
  if (userAnswer === currentQuestion.value.answer) {
    soundEffectsRef.value?.playSuccessSequence()
  } else {
    soundEffectsRef.value?.playErrorSequence()
  }
  submitAnswer()
}

// 图片选择游戏方法
const submitImageChoice = () => {
  if (selectedImageIndex.value === null) return
  
  const selectedOption = currentQuestion.value.imageOptions[selectedImageIndex.value]
  showImageFeedback.value = true
  
  if (selectedOption.correct) {
    soundEffectsRef.value?.playSuccessSequence()
  } else {
    soundEffectsRef.value?.playErrorSequence()
  }
  
  setTimeout(() => {
    submitAnswer()
  }, 1500)
}
</script>

<style scoped lang="scss">
.game-interface {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  
  .game-container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .game-header {
    background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .game-icon {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }
      
      .game-info {
        h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .game-meta {
          display: flex;
          gap: 16px;
          margin-top: 4px;
          font-size: 14px;
          opacity: 0.9;
        }
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .score-display {
        text-align: center;
        
        .score-label {
          font-size: 12px;
          opacity: 0.8;
        }
        
        .score-value {
          font-size: 20px;
          font-weight: 600;
        }
      }
      
      .game-controls {
        display: flex;
        gap: 8px;
      }
    }
  }
  
  .game-progress {
    padding: 16px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    
    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .question-counter {
        font-weight: 500;
        color: #495057;
      }
      
      .time-display {
        color: #6c757d;
        font-size: 14px;
      }
    }
  }
  
  .game-content {
    padding: 32px;
    min-height: 400px;
    
    .question-container {
      margin-bottom: 32px;
      
      .question-text {
        font-size: 20px;
        font-weight: 500;
        color: #333;
        margin-bottom: 24px;
        text-align: center;
        line-height: 1.6;
      }
      
      .question-audio {
        text-align: center;
        margin-bottom: 24px;
      }
      
      .question-image {
        text-align: center;
        margin-bottom: 24px;
        
        img {
          max-width: 300px;
          max-height: 200px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
  
  // 拼写游戏样式
  .spelling-game {
    .word-display {
      text-align: center;
      margin-bottom: 32px;
      
      .target-word {
        font-size: 32px;
        font-weight: 600;
        color: #1890ff;
        margin-bottom: 16px;
        letter-spacing: 4px;
      }
      
      .word-pronunciation {
        color: #666;
        font-style: italic;
        margin-bottom: 8px;
      }
      
      .word-meaning {
        color: #333;
        font-size: 16px;
      }
    }
    
    .spelling-input {
      text-align: center;
      margin-bottom: 24px;
      
      .letter-input {
        font-size: 24px;
        text-align: center;
        letter-spacing: 8px;
        border-radius: 8px;
        
        &.correct {
          border-color: #52c41a;
          background: #f6ffed;
        }
        
        &.incorrect {
          border-color: #ff4d4f;
          background: #fff2f0;
        }
      }
    }
    
    .letter-keyboard {
      .keyboard-row {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-bottom: 8px;
        
        .letter-key {
          min-width: 40px;
          height: 40px;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-2px);
          }
          
          &.used {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }
  }
  
  // 听力游戏样式
  .listening-game {
    .audio-controls {
      text-align: center;
      margin-bottom: 32px;
      
      .play-button {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        font-size: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        
        &.playing {
          animation: pulse 1s infinite;
        }
      }
      
      .audio-hint {
        color: #666;
        font-size: 14px;
      }
    }
    
    .answer-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      
      .option-card {
        padding: 20px;
        border: 2px solid #e9ecef;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        
        &:hover {
          border-color: #1890ff;
          transform: translateY(-2px);
        }
        
        &.selected {
          border-color: #1890ff;
          background: #f0f8ff;
        }
        
        &.correct {
          border-color: #52c41a;
          background: #f6ffed;
        }
        
        &.incorrect {
          border-color: #ff4d4f;
          background: #fff2f0;
        }
      }
    }
  }
  
  // 语法游戏样式
  .grammar-game {
    .sentence-container {
      background: #f8f9fa;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      
      .sentence-text {
        font-size: 18px;
        line-height: 1.8;
        color: #333;
        
        .grammar-blank {
          display: inline-block;
          min-width: 100px;
          padding: 4px 8px;
          margin: 0 4px;
          border: 2px dashed #1890ff;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          
          &.filled {
            border-style: solid;
            background: #f0f8ff;
          }
          
          &.correct {
            border-color: #52c41a;
            background: #f6ffed;
          }
          
          &.incorrect {
            border-color: #ff4d4f;
            background: #fff2f0;
          }
        }
      }
    }
    
    .grammar-options {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
      
      .grammar-option {
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
        }
        
        &.used {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }
  
  // 阅读游戏样式
  .reading-game {
    .reading-content {
      display: flex;
      gap: 32px;
      
      .passage-section {
        flex: 1;
        
        .passage-title {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }
        
        .passage-text {
          background: #f8f9fa;
          padding: 24px;
          border-radius: 12px;
          line-height: 1.8;
          font-size: 16px;
          color: #333;
        }
      }
      
      .questions-section {
        flex: 1;
        
        .question-item {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
          
          .question-title {
            font-weight: 500;
            margin-bottom: 12px;
            color: #333;
          }
          
          .question-options {
            .option-item {
              padding: 8px 12px;
              border-radius: 6px;
              cursor: pointer;
              transition: all 0.3s ease;
              margin-bottom: 8px;
              
              &:hover {
                background: #f0f8ff;
              }
              
              &.selected {
                background: #1890ff;
                color: white;
              }
              
              &.correct {
                background: #52c41a;
                color: white;
              }
              
              &.incorrect {
                background: #ff4d4f;
                color: white;
              }
            }
          }
        }
      }
    }
  }
  
  // 词汇游戏样式
  .vocabulary-game {
    .image-matching {
      .target-word-display {
        text-align: center;
        margin-bottom: 24px;
        
        .word-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          border-radius: 16px;
          display: inline-block;
          
          .word-text {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .word-pronunciation {
            font-size: 16px;
            opacity: 0.9;
          }
        }
      }
      
      .image-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        
        .image-option {
          background: white;
          border: 3px solid #e9ecef;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          
          &:hover {
            border-color: #1890ff;
            transform: translateY(-4px);
          }
          
          &.selected {
            border-color: #1890ff;
            background: #f0f8ff;
          }
          
          &.correct {
            border-color: #52c41a;
            background: #f6ffed;
          }
          
          &.incorrect {
            border-color: #ff4d4f;
            background: #fff2f0;
          }
          
          img {
            width: 100%;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 12px;
          }
          
          .option-text {
            font-weight: 500;
            color: #333;
          }
        }
      }
    }
    
    .meaning-matching {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      
      .words-column, .meanings-column {
        h4 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }
        
        .match-item {
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            border-color: #1890ff;
          }
          
          &.selected {
            border-color: #1890ff;
            background: #f0f8ff;
          }
          
          &.matched {
            border-color: #52c41a;
            background: #f6ffed;
            cursor: default;
          }
          
          &.incorrect {
            border-color: #ff4d4f;
            background: #fff2f0;
          }
        }
      }
    }
  }
  
  // 游戏完成样式
  .game-finished {
    text-align: center;
    padding: 40px;
    
    .finish-content {
      max-width: 600px;
      margin: 0 auto;
      
      .completion-icon {
        font-size: 64px;
        margin-bottom: 24px;
        animation: bounce 1s ease-in-out;
      }
      
      .finish-title {
        font-size: 32px;
        font-weight: 600;
        color: #333;
        margin-bottom: 16px;
      }
      
      .finish-subtitle {
        font-size: 18px;
        color: #666;
        margin-bottom: 32px;
      }
      
      .game-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
        
        .stat-item {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          
          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #1890ff;
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 14px;
            color: #666;
          }
        }
      }
      
      .earned-stars {
        margin-bottom: 24px;
        
        .stars-display {
          display: flex;
          justify-content: center;
          gap: 8px;
          font-size: 32px;
          
          .star {
            color: #ffd700;
            animation: starTwinkle 1s ease-in-out infinite alternate;
            
            &:nth-child(2) {
              animation-delay: 0.2s;
            }
            
            &:nth-child(3) {
              animation-delay: 0.4s;
            }
          }
        }
      }
      
      .earned-badges {
        margin-bottom: 32px;
        
        .badges-list {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          
          .badge-item {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 20px;
            font-weight: 500;
            animation: badgeAppear 0.5s ease-out;
          }
        }
      }
      
      .learning-suggestions {
        background: #f0f8ff;
        padding: 24px;
        border-radius: 12px;
        margin-bottom: 32px;
        
        h4 {
          color: #1890ff;
          margin-bottom: 16px;
        }
        
        .suggestions-list {
          text-align: left;
          
          .suggestion-item {
            padding: 8px 0;
            color: #333;
            border-bottom: 1px solid #e6f7ff;
            
            &:last-child {
              border-bottom: none;
            }
          }
        }
      }
      
      .finish-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }
  
  // 反馈模态框样式
  .feedback-modal {
    .feedback-content {
      text-align: center;
      padding: 20px;
      
      .feedback-icon {
        font-size: 48px;
        margin-bottom: 16px;
        
        &.correct {
          color: #52c41a;
        }
        
        &.incorrect {
          color: #ff4d4f;
        }
      }
      
      .feedback-message {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 16px;
        
        &.correct {
          color: #52c41a;
        }
        
        &.incorrect {
          color: #ff4d4f;
        }
      }
      
      .feedback-explanation {
        color: #666;
        margin-bottom: 20px;
      }
    }
  }
  
  // 点数动画
  .point-animation {
    position: fixed;
    z-index: 1000;
    pointer-events: none;
    font-size: 24px;
    font-weight: 600;
    color: #52c41a;
    animation: pointFloat 2s ease-out forwards;
  }
  
  // 连击效果
  .streak-effect {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    pointer-events: none;
    
    .streak-text {
      font-size: 32px;
      font-weight: 600;
      color: #ff6b35;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      animation: streakPulse 1s ease-out;
    }
    
    .multiplier-text {
      font-size: 24px;
      color: #1890ff;
      animation: multiplierBounce 1s ease-out;
    }
  }
  
  // 句子排序游戏样式
  .sentence-order-game {
    .instruction {
      text-align: center;
      margin-bottom: 20px;
      
      p {
        color: #666;
        font-size: 16px;
      }
    }
    
    .sentence-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f8ff;
      padding: 12px;
      border-radius: 8px;
      margin: 16px 0;
      color: #1890ff;
      font-weight: 500;
    }
    
    .word-bank {
      margin-bottom: 24px;
      
      h4 {
        margin-bottom: 12px;
        color: #333;
      }
      
      .word-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        min-height: 60px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 2px dashed #d9d9d9;
        
        .word-item {
          background: #1890ff;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          user-select: none;
          transition: all 0.3s ease;
          
          &:hover {
            background: #40a9ff;
            transform: translateY(-2px);
          }
          
          &.used {
            background: #d9d9d9;
            color: #999;
            cursor: not-allowed;
            
            &:hover {
              transform: none;
            }
          }
          
          &.draggable {
            cursor: grab;
            
            &:active {
              cursor: grabbing;
            }
          }
        }
      }
    }
    
    .sentence-builder {
      h4 {
        margin-bottom: 12px;
        color: #333;
      }
      
      .drop-zone {
        min-height: 80px;
        padding: 16px;
        background: #fff;
        border: 2px dashed #52c41a;
        border-radius: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        
        .sentence-word {
          background: #52c41a;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          
          &:hover {
            background: #73d13d;
            
            .remove-icon {
              opacity: 1;
            }
          }
          
          .remove-icon {
            opacity: 0.7;
            transition: opacity 0.3s ease;
          }
        }
        
        .drop-placeholder {
          color: #999;
          font-style: italic;
          text-align: center;
          width: 100%;
        }
      }
    }
  }
  
  // 语音识别游戏样式
  .speech-game {
    .target-text {
      text-align: center;
      margin-bottom: 24px;
      
      .text-to-read {
        background: #f0f8ff;
        padding: 24px;
        border-radius: 12px;
        
        h4 {
          margin-bottom: 16px;
          color: #333;
        }
        
        .reading-text {
          font-size: 20px;
          font-weight: 500;
          color: #1890ff;
          margin-bottom: 12px;
          line-height: 1.6;
        }
        
        .pronunciation-guide {
          .phonetic {
            color: #666;
            font-style: italic;
          }
        }
      }
    }
    
    .speech-controls {
      text-align: center;
      margin-bottom: 24px;
      
      .recording-area {
        margin-bottom: 16px;
        
        .record-button {
          height: 60px;
          font-size: 16px;
          font-weight: 500;
          border-radius: 30px;
          min-width: 180px;
        }
        
        .recording-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 16px;
          color: #ff4d4f;
          font-weight: 500;
          
          .pulse-dot {
            width: 12px;
            height: 12px;
            background: #ff4d4f;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 1s infinite;
          }
        }
      }
      
      .playback-controls {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
    }
    
    .speech-result {
      background: #f6ffed;
      border: 1px solid #b7eb8f;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
      
      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        h4 {
          margin: 0;
          color: #333;
        }
        
        .accuracy-score {
          .score-label {
            margin-right: 8px;
            color: #666;
          }
          
          .score-value {
            font-weight: 600;
            font-size: 18px;
          }
        }
      }
      
      .text-comparison {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
        
        h5 {
          margin-bottom: 8px;
          color: #333;
        }
        
        p {
          background: white;
          padding: 12px;
          border-radius: 6px;
          margin: 0;
          border-left: 4px solid #1890ff;
        }
        
        .recognized-text p {
          border-left-color: #52c41a;
        }
      }
      
      .pronunciation-feedback {
        .feedback-items {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          
          .feedback-item {
            display: flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 14px;
            
            &.correct {
              background: #f6ffed;
              color: #52c41a;
              border: 1px solid #b7eb8f;
            }
            
            &.incorrect {
              background: #fff2f0;
              color: #ff4d4f;
              border: 1px solid #ffccc7;
            }
            
            .word {
              margin-right: 6px;
            }
          }
        }
      }
    }
  }
  
  // 填空练习游戏样式
  .fill-blanks-game {
    .passage-container {
      margin-bottom: 24px;
      
      .passage-text {
        background: white;
        padding: 24px;
        border-radius: 8px;
        line-height: 1.8;
        font-size: 16px;
        
        .passage-part {
          .blank-container {
            display: inline-block;
            position: relative;
            margin: 0 4px;
            
            .blank-input {
              width: 120px;
              text-align: center;
              border-radius: 4px;
              
              &.correct {
                border-color: #52c41a;
                background: #f6ffed;
              }
              
              &.incorrect {
                border-color: #ff4d4f;
                background: #fff2f0;
              }
            }
            
            .blank-hint {
              position: absolute;
              top: 100%;
              left: 50%;
              transform: translateX(-50%);
              background: #1890ff;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              white-space: nowrap;
              margin-top: 4px;
              z-index: 10;
              
              &::before {
                content: '';
                position: absolute;
                top: -4px;
                left: 50%;
                transform: translateX(-50%);
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-bottom: 4px solid #1890ff;
              }
            }
          }
        }
      }
    }
    
    .word-options {
      margin-bottom: 24px;
      
      h4 {
        margin-bottom: 12px;
        color: #333;
      }
      
      .option-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .word-option {
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-2px);
          }
          
          &.used {
            opacity: 0.5;
            cursor: not-allowed;
            
            &:hover {
              transform: none;
            }
          }
        }
      }
    }
    
    .fill-progress {
      margin-bottom: 16px;
      
      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        span {
          color: #666;
          font-size: 14px;
        }
      }
    }
  }
  
  // 图片描述游戏样式
  .image-description-game {
    .image-container {
      text-align: center;
      margin-bottom: 24px;
      
      .description-image {
        max-width: 100%;
        max-height: 300px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        margin-bottom: 16px;
      }
      
      .image-info {
        .image-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }
        
        .image-prompt {
          color: #666;
          font-size: 14px;
        }
      }
    }
    
    .description-input {
      margin-bottom: 24px;
      
      h4 {
        margin-bottom: 12px;
        color: #333;
      }
      
      .description-textarea {
        border-radius: 8px;
        
        &:focus {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
      }
    }
    
    .description-tools {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
      
      .word-suggestions {
        h5 {
          margin-bottom: 12px;
          color: #333;
        }
        
        .suggestion-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          
          .suggestion-word {
            cursor: pointer;
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateY(-2px);
            }
          }
        }
      }
      
      .description-requirements {
        h5 {
          margin-bottom: 12px;
          color: #333;
        }
        
        .requirement-list {
          list-style: none;
          padding: 0;
          margin: 0;
          
          .requirement-item {
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
            color: #666;
            font-size: 14px;
            
            &:last-child {
              border-bottom: none;
            }
            
            &::before {
              content: '✓';
              color: #52c41a;
              margin-right: 8px;
              font-weight: bold;
            }
          }
        }
      }
    }
  }
  
  // 动画效果
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes pointFloat {
    0% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-100px);
    }
  }
  
  @keyframes streakPulse {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
  
  @keyframes multiplierBounce {
    0% {
      transform: scale(0.5) translateY(20px);
      opacity: 0;
    }
    50% {
      transform: scale(1.1) translateY(-10px);
      opacity: 1;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 0;
    }
  }
  
  @keyframes iconPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
  
  @keyframes scoreUp {
    0% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-10px) scale(1.1);
    }
    100% {
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes badgeAppear {
    0% {
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0, 0, 0);
    }
    40%, 43% {
      transform: translate3d(0, -30px, 0);
    }
    70% {
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  }
  
  @keyframes starTwinkle {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.2);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    .game-header {
      flex-direction: column;
      gap: 12px;
    }

    .reading-game {
      .reading-content {
        flex-direction: column;
      }
    }

    .letter-keyboard {
      .keyboard-row {
        justify-content: center;
        
        .letter-key {
          min-width: 32px;
          height: 32px;
          font-size: 14px;
        }
      }
    }

    .game-finished {
      .finish-content {
        padding: 16px;
      }
    }
    
    // 新游戏类型的响应式样式
    .sentence-order-game {
      .word-bank .word-list {
        justify-content: center;
      }
      
      .sentence-builder .drop-zone {
        justify-content: center;
      }
    }
    
    .speech-game {
      .text-comparison {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
    
    .fill-blanks-game {
      .passage-text {
        padding: 16px;
        font-size: 14px;
        
        .blank-input {
          width: 100px;
        }
      }
    }
    
    .image-description-game {
      .description-tools {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  }
}
</style>