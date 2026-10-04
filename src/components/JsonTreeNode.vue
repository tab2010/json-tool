<script setup>
// JsonTreeNode.vue —— 树形视图的单个节点（递归组件）。
// 这是 Vue 进阶的重要概念：组件在自己的 template 里引用自己，
// 从而递归渲染任意深度的嵌套结构。

import { ref, computed } from 'vue'
import { isBigNumber } from '../utils/json.js'
import { copyText } from '../utils/clipboard.js'

const props = defineProps({
  // 当前节点的 key 名。根节点传 null（不显示 key）；对象属性传字符串；数组元素传索引数字
  keyName: { type: [String, Number], default: null },
  // 当前节点的值（任意类型）
  value: { required: true },
  // 当前节点的 JSONPath（根节点为 '$'）
  path: { type: String, default: '$' },
})

const expanded = ref(true) // 默认展开
const copied = ref(false) // 复制路径后的临时反馈

// 判断值的类型（BigNumber 归为 number）
const type = computed(() => {
  if (props.value === null) return 'null'
  if (Array.isArray(props.value)) return 'array'
  if (isBigNumber(props.value)) return 'number'
  if (typeof props.value === 'object') return 'object'
  return typeof props.value // 'string' | 'number' | 'boolean'
})

// 是否可展开（对象或数组）
const isExpandable = computed(() => type.value === 'object' || type.value === 'array')

// 折叠时的预览文本：{3 键} / [5 项]
const preview = computed(() => {
  if (Array.isArray(props.value)) return `[${props.value.length} 项]`
  return `{${Object.keys(props.value).length} 键}`
})

// 原始值的显示文本（对象/数组不在这里显示，由子节点负责）
const displayText = computed(() => {
  if (props.value === null) return 'null'
  if (typeof props.value === 'string') return JSON.stringify(props.value) // 带引号 + 转义
  if (typeof props.value === 'boolean') return props.value ? 'true' : 'false'
  if (typeof props.value === 'number') return String(props.value)
  if (isBigNumber(props.value)) return props.value.toFixed()
  return ''
})

// 计算子节点的 JSONPath
function childPath(parentPath, key) {
  if (typeof key === 'number') return parentPath + '[' + key + ']' // 数组索引
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) return parentPath + '.' + key // 简单标识符
  return parentPath + "['" + key.replace(/'/g, "\\'") + "']" // 含特殊字符的 key
}

// 子节点列表：[{ key, value, path }]
const children = computed(() => {
  if (Array.isArray(props.value)) {
    return props.value.map((item, index) => ({ key: index, value: item, path: childPath(props.path, index) }))
  }
  if (type.value === 'object') {
    return Object.keys(props.value).map((key) => ({ key, value: props.value[key], path: childPath(props.path, key) }))
  }
  return []
})

// 点击切换展开/收起（只有可展开节点才响应）
function toggle() {
  if (isExpandable.value) expanded.value = !expanded.value
}

// 复制当前节点的 JSONPath
async function copyPath() {
  await copyText(props.path)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div class="node">
    <div class="node-line" @click="toggle">
      <span class="arrow">{{ isExpandable ? (expanded ? '▾' : '▸') : '' }}</span>
      <span v-if="keyName !== null" class="key">{{ keyName }}</span>
      <span v-if="keyName !== null" class="colon">:</span>
      <!-- 原始值：直接显示 -->
      <span v-if="!isExpandable" class="value" :class="type">{{ displayText }}</span>
      <!-- 可展开但折叠：显示预览 -->
      <span v-else-if="!expanded" class="value preview">{{ preview }}</span>
      <!-- 复制路径按钮（hover 时显示） -->
      <button
        v-if="keyName !== null"
        class="copy-btn"
        :title="path"
        @click.stop="copyPath"
      >{{ copied ? '已复制' : '复制' }}</button>
    </div>

    <!-- 展开时递归渲染子节点 -->
    <div v-if="isExpandable && expanded" class="children">
      <JsonTreeNode
        v-for="child in children"
        :key="child.key"
        :key-name="child.key"
        :value="child.value"
        :path="child.path"
      />
    </div>
  </div>
</template>

<style scoped>
.node {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
}

.node-line {
  display: flex;
  align-items: baseline;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  padding: 0 4px;
}

.node-line:hover {
  background-color: var(--color-bg);
}

/* 复制路径按钮：默认隐藏，hover 该行时显示 */
.copy-btn {
  display: none;
  margin-left: auto;
  padding: 0 6px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
}

.copy-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.node-line:hover .copy-btn {
  display: inline-block;
}

.arrow {
  display: inline-block;
  width: 16px;
  flex-shrink: 0;
  color: var(--color-text-secondary);
  user-select: none;
}

.key {
  color: var(--color-text);
  font-weight: 500;
}

.colon {
  color: var(--color-text-secondary);
  margin-right: 4px;
}

.value {
  word-break: break-all;
}

.value.string { color: #16a34a; }
.value.number { color: #2563eb; }
.value.boolean { color: #9333ea; }
.value.null { color: #9ca3af; font-style: italic; }
.value.preview { color: var(--color-text-secondary); }

.children {
  padding-left: 16px;
  border-left: 1px solid var(--color-border);
  margin-left: 6px;
}

@media (prefers-color-scheme: dark) {
  .value.string { color: #4ade80; }
  .value.number { color: #60a5fa; }
  .value.boolean { color: #c084fc; }
  .value.null { color: #9ca3af; }
}
</style>
