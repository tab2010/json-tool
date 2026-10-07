// src/i18n/index.js —— 轻量国际化（i18n）
// 原理：把所有文案抽离到"语言字典"，用一个响应式 locale 控制当前语言，
// 组件通过 t('key') 读取文案，切换 locale 时所有用到 t 的地方自动更新。

import { ref } from 'vue'

// 语言字典：zh / en 两套文案
const messages = {
  zh: {
    // 全局
    title: 'JSON 格式化工具',
    badge: '🔒 隐私优先 · 数据仅在本地处理',
    input: '输入',
    output: '输出',
    footerPrivacy: '🔒 数据仅在本地处理，不上传服务器',
    feedback: '反馈 / 问题',
    // 工具栏
    format: '格式化',
    minify: '压缩',
    sample: '示例',
    indent: '缩进',
    indent2: '2 空格',
    indent4: '4 空格',
    indentTab: 'Tab',
    clear: '清空',
    // 输入区
    placeholder: '在这里粘贴你的 JSON...（支持注释、单引号、尾逗号）',
    // 输出区视图
    viewText: '文本',
    viewTree: '树形',
    viewTs: 'TS 类型',
    viewSchema: 'Schema',
    viewYaml: 'YAML',
    viewCsv: 'CSV',
    copy: '复制',
    download: '下载',
    copied: '已复制 ✓',
    hint: '格式化结果会显示在这里',
    errorTitle: '⚠️ JSON 解析失败',
    errorLocation: '位置：第 {line} 行，第 {column} 列',
    // 树节点
    copyBtn: '复制 ▾',
    copiedShort: '已复制',
    copyPath: '复制路径',
    copyKey: '复制 key',
    copyValue: '复制 value',
    copyKv: '复制 key: value',
    keys: '键',
    items: '项',
  },
  en: {
    title: 'JSON Formatter',
    badge: '🔒 Privacy-first · Data stays local',
    input: 'Input',
    output: 'Output',
    footerPrivacy: '🔒 Data is processed locally, never uploaded',
    feedback: 'Feedback / Issues',
    format: 'Format',
    minify: 'Minify',
    sample: 'Sample',
    indent: 'Indent',
    indent2: '2 spaces',
    indent4: '4 spaces',
    indentTab: 'Tab',
    clear: 'Clear',
    placeholder: 'Paste your JSON here... (supports comments, single quotes, trailing commas)',
    viewText: 'Text',
    viewTree: 'Tree',
    viewTs: 'TS Type',
    viewSchema: 'Schema',
    viewYaml: 'YAML',
    viewCsv: 'CSV',
    copy: 'Copy',
    download: 'Download',
    copied: 'Copied ✓',
    hint: 'Formatted result will appear here',
    errorTitle: '⚠️ JSON parse failed',
    errorLocation: 'Line {line}, Column {column}',
    copyBtn: 'Copy ▾',
    copiedShort: 'Copied',
    copyPath: 'Copy path',
    copyKey: 'Copy key',
    copyValue: 'Copy value',
    copyKv: 'Copy key: value',
    keys: 'keys',
    items: 'items',
  },
}

// 检测浏览器语言：中文开头 → zh，否则 → en
function detectLocale() {
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'en'
  return nav.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

// localStorage 存储的 key
const STORAGE_KEY = 'jsonfmt-locale'

// 读取初始语言：优先用户之前的选择（localStorage），否则按浏览器语言
function getInitialLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && messages[saved]) return saved
  } catch {
    // localStorage 不可用（隐私模式等），忽略
  }
  return detectLocale()
}

// 当前语言（响应式）
const locale = ref(getInitialLocale())

// 翻译函数：t('key') 或 t('key', { line: 1, column: 2 })
export function t(key, params) {
  const dict = messages[locale.value] || messages.en
  let text = dict[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }
  return text
}

// 切换语言（并持久化到 localStorage，下次访问记住选择）
export function setLocale(lang) {
  if (!messages[lang]) return
  locale.value = lang
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // localStorage 不可用，忽略（不影响本次切换）
  }
}

export { locale }
