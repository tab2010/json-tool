<script setup>
// JsonOutput.vue —— 输出区组件：
// 展示格式化/压缩结果，或展示错误信息（含行列号），并提供复制、下载。

import { ref } from 'vue'

// 接收两个 props：
// result —— 成功时的结果字符串
// error  —— 失败时的错误对象 { message, line, column }，没有错误则为 null
const props = defineProps({
  result: { type: String, default: '' },
  error: { type: Object, default: null },
})

// copied 是一个临时状态：复制成功后短暂显示"已复制"，1.5 秒后恢复
const copied = ref(false)

// 复制结果到剪贴板（全程在本地完成，符合隐私优先）
async function copyResult() {
  const text = props.result
  if (!text) return
  try {
    // navigator.clipboard 是现代浏览器的剪贴板 API
    await navigator.clipboard.writeText(text)
  } catch {
    // 兜底方案：某些环境（如非 https）不支持 clipboard API，用隐藏文本框模拟
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
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
    <!-- 错误状态：显示错误信息 + 行列号 -->
    <div v-if="error" class="error">
      <div class="error-title">⚠️ JSON 解析失败</div>
      <p class="error-message">{{ error.message }}</p>
      <p v-if="error.line" class="error-location">
        位置：第 {{ error.line }} 行，第 {{ error.column }} 列
      </p>
    </div>

    <!-- 正常状态：显示结果 + 操作按钮 -->
    <template v-else>
      <div v-if="result" class="actions">
        <button class="btn" @click="copyResult">{{ copied ? '已复制 ✓' : '复制' }}</button>
        <button class="btn" @click="downloadResult">下载 .json</button>
      </div>
      <pre v-if="result" class="result">{{ result }}</pre>
      <p v-else class="hint">格式化结果会显示在这里</p>
    </template>
  </div>
</template>

<style scoped>
.output {
  flex: 1; /* 填满所在容器剩余高度 */
  display: flex;
  flex-direction: column;
}

.actions {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.btn {
  padding: 6px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background-color: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
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
