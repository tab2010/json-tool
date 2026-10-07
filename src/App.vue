<script setup>
// App.vue —— 根组件：把三个子组件组装起来，并持有核心状态和逻辑。
// 这里相当于"总指挥"：管状态、调用 json.js、把数据分发给子组件。

import { ref } from 'vue'
import Toolbar from './components/Toolbar.vue'
import JsonEditor from './components/JsonEditor.vue'
import JsonOutput from './components/JsonOutput.vue'
import { parse, stringify } from './utils/json.js'
import { t, locale, setLocale } from './i18n/index.js'

// ---------- 状态（响应式数据） ----------
const input = ref('') // 用户输入的原始 JSON 文本
const indent = ref('2') // 缩进选项：'2' | '4' | 'tab'
const result = ref('') // 格式化/压缩后的结果
const parsed = ref(null) // 解析后的值（供树形视图使用）
const error = ref(null) // 错误对象 { message, line, column }，无错误时为 null

// 示例 JSON：展示本工具特色（注释、单引号、尾逗号、大数、嵌套结构）
const sampleJson = `{
  // 支持注释：JSON5 允许 // 和 /* */ 注释
  name: '隐私优先 JSON 工具', // 支持单引号
  version: '1.0.0',
  features: [
    '格式化',
    '压缩',
    'JSON5 解析',
    '大数精度保护',
  ], // 支持尾逗号
  big_number: 123456789012345678901234567890,
  user: {
    id: 1001,
    nickname: 'tab',
    tags: ['json', 'developer'],
    active: true,
  },
}`

// ---------- 逻辑 ----------

// 把 json.js 抛出的错误转成界面可读的对象
function toError(e) {
  return { message: e.message, line: e.line, column: e.column }
}

// 执行格式化
function doFormat() {
  try {
    const value = parse(input.value) // 只解析一次，同时供文本和树形使用
    parsed.value = value
    result.value = stringify(value, indent.value)
    error.value = null
  } catch (e) {
    parsed.value = null
    result.value = ''
    error.value = toError(e)
  }
}

// 执行压缩
function doMinify() {
  try {
    const value = parse(input.value)
    parsed.value = value
    result.value = stringify(value, 0) // 0 表示压缩
    error.value = null
  } catch (e) {
    parsed.value = null
    result.value = ''
    error.value = toError(e)
  }
}

// 清空所有内容
function doClear() {
  input.value = ''
  result.value = ''
  parsed.value = null
  error.value = null
}

// 填入示例并自动格式化
function doSample() {
  input.value = sampleJson
  doFormat() // 复用格式化逻辑，让用户立刻看到效果
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>{{ t('title') }}</h1>
      <div class="header-right">
        <span class="badge">{{ t('badge') }}</span>
        <div class="lang-toggle">
          <button :class="{ active: locale === 'zh' }" @click="setLocale('zh')">中文</button>
          <button :class="{ active: locale === 'en' }" @click="setLocale('en')">EN</button>
        </div>
      </div>
    </header>

    <Toolbar
      v-model:indent="indent"
      @format="doFormat"
      @minify="doMinify"
      @sample="doSample"
      @clear="doClear"
    />

    <main class="app-main">
      <section class="pane">
        <h2 class="pane-title">{{ t('input') }}</h2>
        <JsonEditor v-model="input" />
      </section>

      <section class="pane">
        <JsonOutput :result="result" :parsed="parsed" :error="error" />
      </section>
    </main>

    <footer class="app-footer">
      <span>{{ t('footerPrivacy') }}</span>
      <a href="https://github.com/tab2010/json-tool/issues" target="_blank" rel="noopener">{{ t('feedback') }}</a>
    </footer>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.app-header h1 {
  margin: 0;
  font-size: 1.4rem;
}

.badge {
  padding: 4px 12px;
  border-radius: 999px;
  background-color: var(--color-primary);
  color: #fff;
  font-size: 0.85rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lang-toggle {
  display: flex;
  gap: 4px;
}

.lang-toggle button {
  padding: 2px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
  line-height: 1.5;
}

.lang-toggle button.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.app-main {
  display: flex;
  gap: var(--space);
  padding: var(--space);
  flex: 1; /* 占满 header/toolbar 之外的剩余高度 */
}

.pane {
  flex: 1; /* 两列各占一半 */
  display: flex;
  flex-direction: column;
  min-width: 0; /* 防止内容过宽时 flex 子元素撑破容器 */
}

.pane-title {
  margin: 0 0 8px;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
}

.app-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 12px var(--space);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.app-footer a {
  color: var(--color-primary);
  text-decoration: none;
}

.app-footer a:hover {
  text-decoration: underline;
}

/* 移动端：两列变一列 */
@media (max-width: 768px) {
  .app-main {
    flex-direction: column;
  }
}
</style>
