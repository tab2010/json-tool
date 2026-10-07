<script setup>
// JsonEditor.vue —— 输入区组件：一个供用户粘贴 JSON 的文本框。
// 它自己不处理 JSON，只负责"收集输入"，把内容交给父组件去处理。
// 这体现了组件的"单一职责"：本组件只管输入，解析逻辑在 json.js，结果展示在别的组件。

import { t } from '../i18n/index.js'

// defineProps：声明父组件可以传进来的属性（props）。
// 这里声明 modelValue，配合下面的 defineEmits 实现 v-model 双向绑定。
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

// defineEmits：声明这个组件会向外"发射"的事件。
// update:modelValue 是 Vue 里 v-model 的约定事件名（固定写法）。
const emit = defineEmits(['update:modelValue'])

// 当文本框内容变化时，把新值发射给父组件。
// 事件对象 event 的 target 是文本框，target.value 是当前内容。
function onInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <textarea
    class="editor"
    :value="modelValue"
    :placeholder="t('placeholder')"
    spellcheck="false"
    @input="onInput"
  ></textarea>
</template>

<style scoped>
.editor {
  width: 100%;
  flex: 1; /* 填满所在容器剩余高度 */
  min-height: 320px;
  resize: vertical; /* 允许用户垂直拉伸 */
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-mono); /* JSON 必须等宽字体 */
  font-size: 14px;
  line-height: 1.5;
  outline: none;
}

/* 聚焦时高亮边框，提示用户当前正在这里输入 */
.editor:focus {
  border-color: var(--color-primary);
}
</style>
