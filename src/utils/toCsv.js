// src/utils/toCsv.js —— 把解析后的 JSON 值转成 CSV 字符串。
// 纯函数，不依赖 Vue，可单独用 node 测试。

import { isBigNumber, stringify } from './json.js'

// 判断是否是"普通对象"（非数组、非大数）
function isObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v) && !isBigNumber(v)
}

// 单元格转文本，并按 CSV 规则转义
function csvCell(value) {
  if (value === null || value === undefined) return ''
  let text
  if (typeof value === 'string') text = value
  else if (typeof value === 'boolean') text = value ? 'true' : 'false'
  else if (typeof value === 'number') text = String(value)
  else if (isBigNumber(value)) text = value.toFixed()
  else text = stringify(value, 0) // 嵌套对象/数组 → 紧凑 JSON

  // 含逗号/引号/换行时加引号，内部引号翻倍（"" 转义）
  if (/[",\n\r]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"'
  }
  return text
}

// 对象数组 → 表格（表头 = 所有 key 的并集，保持首次出现顺序）
function objectTable(rows) {
  const headers = []
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!headers.includes(key)) headers.push(key)
    }
  }
  const lines = [headers.map(csvCell).join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => csvCell(row[h])).join(','))
  }
  return lines.join('\n')
}

// 对外：把值转成 CSV 字符串
export function jsonToCsv(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return ''
    if (value.every(isObject)) return objectTable(value)
    // 标量数组 → 单列
    return ['value', ...value.map((v) => csvCell(v))].join('\n')
  }
  if (isObject(value)) return objectTable([value])
  // 单个标量 → 单列
  return 'value\n' + csvCell(value)
}
