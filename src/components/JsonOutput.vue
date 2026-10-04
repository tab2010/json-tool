<script setup>
// JsonOutput.vue —— 输出区组件：
// 展示格式化/压缩结果，或展示错误信息（含行列号），并提供复制、下载。

import { ref } from 'vue'
import JsonTreeNode from './JsonTreeNode.vue'
import { copyText } from '../utils/clipboard.js'

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

// mode 是视图模式：'text'（文本）或 'tree'（树形）
const mode = ref('text')

// 复制结果到剪贴板（复用 clipboard.js 的工具函数）
async function copyResult() {
  await copyText(props.result)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

// 把结果下载为 .json 文件
function downloadResult() {
  const text = props.result
  if (!text) return
  // Blob 把字符串变成"文件内容"，URL.createObjectURL 生成一个临时的本地下载地址
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'formatted.json'
  a.click() // 触发下载
  URL.revokeObjectURL(url) // 释放临时地址，避免内存泄漏
}
</script>

<template>
  <div class="output">
    <!-- 头部：标题 + 操作按钮（与输入区的标题行对齐，避免两列内容错位） -->
    <div class="header">
      <h2 class="title">输出</h2>
      <template v-if="result">
        <div class="view-toggle">
          <button class="btn" :class="{ active: mode === 'text' }" @click="mode = 'text'">文本</button>
          <button class="btn" :class="{ active: mode === 'tree' }" @click="mode = 'tree'">树形</button>
        </div>
        <span class="spacer"></span>
        <button class="btn" @click="copyResult">{{ copied ? '已复制 ✓' : '复制' }}</button>
        <button class="btn" @click="downloadResult">下载</button>
      </template>
    </div>

    <!-- 错误状态：显示错误信息 + 行列号 -->
    <div v-if="error" class="error">
      <div class="error-title">⚠️ JSON 解析失败</div>
      <p class="error-message">{{ error.message }}</p>
      <p v-if="error.line" class="error-location">
        位置：第 {{ error.line }} 行，第 {{ error.column }} 列
      </p>
    </div>

    <!-- 文本视图 -->
    <pre v-else-if="result && mode === 'text'" class="result">{{ result }}</pre>

    <!-- 树形视图 -->
    <div v-else-if="result" class="tree">
      <JsonTreeNode :value="parsed" />
    </div>

    <p v-else class="hint">格式化结果会显示在这里</p>
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

/* 视图切换按钮组 */
.view-toggle {
  display: flex;
  gap: 4px;
}

.view-toggle .btn.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
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
