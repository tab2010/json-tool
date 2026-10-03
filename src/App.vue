<script setup>
// App.vue —— 根组件：把三个子组件组装起来，并持有核心状态和逻辑。
// 这里相当于"总指挥"：管状态、调用 json.js、把数据分发给子组件。

import { ref } from 'vue'
import Toolbar from './components/Toolbar.vue'
import JsonEditor from './components/JsonEditor.vue'
import JsonOutput from './components/JsonOutput.vue'
import { format, minify } from './utils/json.js'

// ---------- 状态（响应式数据） ----------
const input = ref('') // 用户输入的原始 JSON 文本
const indent = ref('2') // 缩进选项：'2' | '4' | 'tab'
const result = ref('') // 格式化/压缩后的结果
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
    result.value = format(input.value, indent.value)
    error.value = null
  } catch (e) {
    result.value = ''
    error.value = toError(e)
  }
}

// 执行压缩
function doMinify() {
  try {
    result.value = minify(input.value)
    error.value = null
  } catch (e) {
    result.value = ''
    error.value = toError(e)
  }
}

// 清空所有内容
function doClear() {
  input.value = ''
  result.value = ''
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
      <h1>JSON 格式化工具</h1>
      <span class="badge">🔒 隐私优先 · 数据仅在本地处理</span>
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
        <h2 class="pane-title">输入</h2>
        <JsonEditor v-model="input" />
      </section>

      <section class="pane">
        <h2 class="pane-title">输出</h2>
        <JsonOutput :result="result" :error="error" />
      </section>
    </main>
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

/* 移动端：两列变一列 */
@media (max-width: 768px) {
  .app-main {
    flex-direction: column;
  }
}
</style>
