// src/utils/json.js —— 核心逻辑
// 负责：解析（含 JSON5 扩展）、格式化、压缩、错误定位、大数精度保护。
// 这个文件是纯 JS，不依赖 Vue，可以单独用 node 测试。

import JSON5 from 'json5'
import JSONbig from 'json-bigint'

// ---------- 工具函数 ----------

// 判断一个值是否是 bignumber.js 的 BigNumber 实例。
// json-bigint 会把超出安全范围的大整数解析成 BigNumber，从而保住精度。
// 导出供树形视图等外部模块识别大数使用。
export function isBigNumber(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.toFixed === 'function' &&
    Array.isArray(value.c) &&
    typeof value.e === 'number'
  )
}

// 把用户选择的缩进选项转成实际的缩进字符串。
// 数字 → 对应数量的空格；'tab'/'\t' → Tab；0 → 空字符串（即压缩）。
function resolveIndent(indent) {
  if (indent === 'tab' || indent === '\t') return '\t'
  const n = Number(indent)
  if (Number.isInteger(n) && n >= 0) return ' '.repeat(n)
  return '  ' // 默认 2 空格
}

// 把数字格式化成字符串。
function formatNumber(value) {
  if (Number.isFinite(value)) return JSON.stringify(value) // 42 -> "42"，1.5 -> "1.5"
  if (Number.isNaN(value)) return 'NaN' // JSON5 允许 NaN
  if (value === Infinity) return 'Infinity' // JSON5 允许 Infinity
  if (value === -Infinity) return '-Infinity'
  return 'null'
}

// ---------- 序列化（递归核心） ----------

// 把解析后的 JS 值递归地转成 JSON 字符串。
// indentStr 是缩进字符串；level 是当前嵌套层级（决定缩进多少）。
function serialize(value, indentStr, level) {
  const compact = indentStr === '' // 压缩模式（缩进为空字符串）
  const pad = indentStr.repeat(level) // 当前层级缩进
  const padNext = indentStr.repeat(level + 1) // 子层级缩进

  // 原始值
  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return formatNumber(value)
  if (typeof value === 'string') return JSON.stringify(value) // JSON.stringify 负责转义
  if (isBigNumber(value)) return value.toFixed() // 大数精确输出

  // 数组
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map((item) => serialize(item, indentStr, level + 1))
    if (compact) return '[' + items.join(',') + ']'
    const indented = items.map((item) => padNext + item)
    return '[\n' + indented.join(',\n') + '\n' + pad + ']'
  }

  // 对象
  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 0) return '{}'
    const items = keys.map((key) => {
      const keyStr = JSON.stringify(key) // key 也需要转义（自带引号）
      return keyStr + (compact ? ':' : ': ') + serialize(value[key], indentStr, level + 1)
    })
    if (compact) return '{' + items.join(',') + '}'
    const indented = items.map((item) => padNext + item)
    return '{\n' + indented.join(',\n') + '\n' + pad + '}'
  }

  // undefined、function 等 JSON 不支持的值 → 输出 null
  return 'null'
}

// ---------- 对外 API ----------

// 解析：优先 json-bigint（保留大数精度），失败则用 json5（支持 JSON5 扩展语法）。
// 出错时抛出的 SyntaxError 带有 .line 和 .column 属性，供界面做错误定位。
export function parse(text) {
  if (typeof text !== 'string') throw new TypeError('输入必须是字符串')
  if (text.trim() === '') throw new SyntaxError('内容为空')

  // 1. 先按标准 JSON 解析（大数保留为 BigNumber，精度不丢失）
  try {
    return JSONbig.parse(text)
  } catch (_bigIntError) {
    // 2. 失败可能是 JSON5 扩展语法（注释/单引号/尾逗号），也可能是真的语法错误
    try {
      return JSON5.parse(text)
    } catch (json5Error) {
      // 3. 用 json5 的错误（自带行列号）作为最终错误
      const err = new SyntaxError(json5Error.message)
      err.line = json5Error.lineNumber
      err.column = json5Error.columnNumber
      throw err
    }
  }
}

// 序列化：把值转成 JSON 字符串。indent 为数字（空格数）或 'tab'；0 表示压缩。
export function stringify(value, indent = 2) {
  return serialize(value, resolveIndent(indent), 0)
}

// 格式化：解析 + 美化输出
export function format(text, indent = 2) {
  return stringify(parse(text), indent)
}

// 压缩：解析 + 去除所有多余空白
export function minify(text) {
  return stringify(parse(text), 0)
}
