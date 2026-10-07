<script setup>
// JsonOutput.vue —— 输出区组件：
// 展示格式化/压缩结果，或展示错误信息（含行列号），并提供复制、下载。

import { ref, computed, onBeforeUnmount } from 'vue'
import JsonTreeNode from './JsonTreeNode.vue'
import { copyText } from '../utils/clipboard.js'
import { jsonToTypeScript } from '../utils/toTypeScript.js'
import { jsonToSchema } from '../utils/toJsonSchema.js'
import { jsonToYaml } from '../utils/toYaml.js'
import { jsonToCsv } from '../utils/toCsv.js'
import { t } from '../i18n/index.js'

// 接收三个 props：
// result —— 成功时的结果字符串（文本视图用）
// parsed —— 解析后的值（树形视图用）
// error  —— 失败时的错误对象 { message, line, column }，没有错误则为 null
const props = defineProps({
  result: { type: String, default: '' },
  parsed: { default: null },
  error: { type: Object, default: null },
})

// copied 是一个临时状态：复制成功后短暂显示"已复制"，1.5 秒后恢复
const copied = ref(false)

// mode 是视图模式：'text' / 'tree' / 'ts' / 'schema' / 'yaml' / 'csv'
const mode = ref('text')

// 模式名称映射（下拉菜单显示用，随语言变化）
const modeLabel = computed(() => {
  const labels = {
    text: t('viewText'),
    tree: t('viewTree'),
    ts: t('viewTs'),
    schema: t('viewSchema'),
    yaml: t('viewYaml'),
    csv: t('viewCsv'),
  }
  return labels[mode.value] || t('viewText')
})

// 转换类模式列表（生成转换结果而非展示 JSON）
const CONVERSIONS = ['ts', 'schema', 'yaml', 'csv']
const isConversion = computed(() => CONVERSIONS.includes(mode.value))

// 转换结果（由 parsed 转换而来，随 mode 变化）
const convertedText = computed(() => {
  if (props.parsed === null || props.parsed === undefined) return ''
  if (mode.value === 'ts') return jsonToTypeScript(props.parsed)
  if (mode.value === 'schema') return jsonToSchema(props.parsed)
  if (mode.value === 'yaml') return jsonToYaml(props.parsed)
  if (mode.value === 'csv') return jsonToCsv(props.parsed)
  return ''
})

// 当前视图对应的"输出文本"（复制/下载用，转换模式用转换结果）
const outputText = computed(() => {
  return isConversion.value ? convertedText.value : props.result
})

// 下拉菜单是否打开
const modeMenuOpen = ref(false)

// 切换下拉菜单
function toggleModeMenu() {
  modeMenuOpen.value = !modeMenuOpen.value
  if (modeMenuOpen.value) {
    // 下一轮事件循环再注册，避免本次点击立刻触发关闭
    setTimeout(() => document.addEventListener('click', closeModeMenu), 0)
  } else {
    document.removeEventListener('click', closeModeMenu)
  }
}

function closeModeMenu() {
  modeMenuOpen.value = false
  document.removeEventListener('click', closeModeMenu)
}

// 选择模式并关闭菜单
function selectMode(m) {
  mode.value = m
  closeModeMenu()
}

// 组件销毁时清理全局监听
onBeforeUnmount(() => {
  document.removeEventListener('click', closeModeMenu)
})

// 复制当前视图的内容到剪贴板（复用 clipboard.js 的工具函数）
async function copyResult() {
  await copyText(outputText.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

// 不同模式对应的下载文件名
const FILENAMES = {
  ts: 'types.ts',
  schema: 'schema.json',
  yaml: 'output.yaml',
  csv: 'output.csv',
}

// 把当前视图的内容下载为文件（转换模式下载对应格式，其余下载 .json）
function downloadResult() {
  const text = outputText.value
  if (!text) return
  // Blob 把字符串变成"文件内容"，URL.createObjectURL 生成一个临时的本地下载地址
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = FILENAMES[mode.value] || 'formatted.json'
  a.click() // 触发下载
  URL.revokeObjectURL(url) // 释放临时地址，避免内存泄漏
}
</script>

<template>
  <div class="output">
    <!-- 头部：标题 + 操作按钮（与输入区的标题行对齐，避免两列内容错位） -->
    <div class="header">
      <h2 class="title">{{ t('output') }}</h2>
      <template v-if="result">
        <div class="view-toggle" @click.stop>
          <button class="btn" @click="toggleModeMenu">{{ modeLabel }} ▾</button>
          <div v-if="modeMenuOpen" class="mode-menu">
            <button class="menu-item" @click="selectMode('text')">{{ t('viewText') }}</button>
            <button class="menu-item" @click="selectMode('tree')">{{ t('viewTree') }}</button>
            <button class="menu-item" @click="selectMode('ts')">{{ t('viewTs') }}</button>
            <button class="menu-item" @click="selectMode('schema')">{{ t('viewSchema') }}</button>
            <button class="menu-item" @click="selectMode('yaml')">{{ t('viewYaml') }}</button>
            <button class="menu-item" @click="selectMode('csv')">{{ t('viewCsv') }}</button>
          </div>
        </div>
        <span class="spacer"></span>
        <button class="btn" @click="copyResult">{{ copied ? t('copied') : t('copy') }}</button>
        <button class="btn" @click="downloadResult">{{ t('download') }}</button>
      </template>
    </div>

    <!-- 错误状态：显示错误信息 + 行列号 -->
    <div v-if="error" class="error">
      <div class="error-title">{{ t('errorTitle') }}</div>
      <p class="error-message">{{ error.message }}</p>
      <p v-if="error.line" class="error-location">
        {{ t('errorLocation', { line: error.line, column: error.column }) }}
      </p>
    </div>

    <!-- 文本视图 -->
    <pre v-else-if="result && mode === 'text'" class="result">{{ result }}</pre>

    <!-- 树形视图 -->
    <div v-else-if="result && mode === 'tree'" class="tree">
      <JsonTreeNode :value="parsed" />
    </div>

    <!-- 转换视图（TS / Schema / YAML / CSV） -->
    <pre v-else-if="result && isConversion" class="result">{{ convertedText }}</pre>

    <p v-else class="hint">{{ t('hint') }}</p>
  </div>
</template>

<style scoped>
.output {
  flex: 1; /* 填满所在容器剩余高度 */
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  min-height: 24px; /* 与输入区标题行高度一致，保证两列内容对齐 */
}

.title {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
}

.btn {
  padding: 2px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background-color: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  font-size: 12px;
  line-height: 1.5;
}

.btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 视图切换下拉菜单 */
.view-toggle {
  position: relative;
}

.mode-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 20;
  margin-top: 4px;
  min-width: 120px;
  padding: 4px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.menu-item {
  display: block;
  width: 100%;
  padding: 6px 10px;
  border: none;
  background: none;
  text-align: left;
  font-size: 12px;
  color: var(--color-text);
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
}

.menu-item:hover {
  background-color: var(--color-bg);
  color: var(--color-primary);
}

.spacer {
  flex: 1;
}

.tree {
  flex: 1;
  overflow: auto;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background-color: var(--color-surface);
}

.result {
  flex: 1;
  overflow: auto; /* 内容过长时出现滚动条 */
  margin: 0;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background-color: var(--color-surface);
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.5;
  white-space: pre; /* 保留空格和换行，否则 HTML 会折叠空白 */
}

.error {
  padding: 12px;
  border: 1px solid var(--color-error);
  border-radius: var(--radius);
  background-color: var(--color-surface);
}

.error-title {
  font-weight: bold;
  color: var(--color-error);
}

.error-message {
  margin: 8px 0 0;
}

.error-location {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
}

.hint {
  margin: 0;
  color: var(--color-text-secondary);
}
</style>
