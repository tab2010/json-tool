<script setup>
// Toolbar.vue —— 工具栏组件：放操作按钮和缩进选项。
// 它自己不执行格式化逻辑，只是"发号施令"，让父组件去执行。
// 这体现了"子组件不干重活，只上报意图"的分层思想。

defineProps({
  // 当前缩进选项：'2' | '4' | 'tab'
  indent: { type: String, default: '2' },
})

const emit = defineEmits([
  'update:indent', // v-model 事件：缩进选项变化（传数据）
  'format', // 命令：执行格式化
  'minify', // 命令：执行压缩
  'clear', // 命令：清空
])

// 缩进下拉框变化时，把新值传给父组件
function onIndentChange(event) {
  emit('update:indent', event.target.value)
}
</script>

<template>
  <div class="toolbar">
    <button class="btn primary" @click="emit('format')">格式化</button>
    <button class="btn" @click="emit('minify')">压缩</button>

    <label class="indent">
      缩进
      <select class="select" :value="indent" @change="onIndentChange">
        <option value="2">2 空格</option>
        <option value="4">4 空格</option>
        <option value="tab">Tab</option>
      </select>
    </label>

    <!-- spacer 占满剩余空间，把"清空"推到最右边 -->
    <span class="spacer"></span>

    <button class="btn danger" @click="emit('clear')">清空</button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: var(--space);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.btn {
  padding: 6px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background-color: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 主要按钮：填充主色 */
.btn.primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.btn.primary:hover {
  opacity: 0.9;
}

/* 危险按钮：清空用红色提示 */
.btn.danger {
  color: var(--color-error);
}

.btn.danger:hover {
  border-color: var(--color-error);
}

.indent {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.select {
  padding: 5px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 14px;
}

.spacer {
  flex: 1; /* 弹性占满剩余空间 */
}
</style>
