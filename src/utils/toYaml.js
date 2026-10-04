// src/utils/toYaml.js —— 把解析后的 JSON 值转成 YAML 字符串。
// 纯函数，不依赖 Vue，可单独用 node 测试。

import { isBigNumber } from './json.js'

// 判断是否是"标量"（非对象/数组，可直接写在一行）
function isScalar(v) {
  return (
    v === null ||
    typeof v === 'string' ||
    typeof v === 'number' ||
    typeof v === 'boolean' ||
    isBigNumber(v)
  )
}

// 标量值转 YAML 文本
function scalarYaml(v) {
  if (v === null) return 'null'
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'number') return String(v)
  if (isBigNumber(v)) return v.toFixed()
  return yamlString(v) // 字符串
}

// 字符串转 YAML：含特殊字符时加引号，避免解析歧义
function yamlString(s) {
  if (s === '') return '""'
  const needsQuote =
    /[:#&*!|>%@`"'[\]{},\n\t]/.test(s) ||
    /^\s|\s$/.test(s) ||
    /^(true|false|null|~|yes|no|on|off|[-+]?\d|\.)/i.test(s)
  return needsQuote ? JSON.stringify(s) : s
}

// key 转 YAML：合法标识符不加引号，否则加引号
function yamlKey(key) {
  return /^[A-Za-z_][A-Za-z0-9_-]*$/.test(key) ? key : JSON.stringify(key)
}

// 生成 YAML。indent 是当前层级的缩进字符串。
function toYaml(value, indent) {
  if (isScalar(value)) return scalarYaml(value)
  if (Array.isArray(value)) return yamlArray(value, indent)
  return yamlObject(value, indent)
}

// 对象：key: value 逐行
function yamlObject(obj, indent) {
  const keys = Object.keys(obj)
  if (keys.length === 0) return '{}'
  const lines = keys.map((key) => {
    const keyStr = yamlKey(key)
    const v = obj[key]
    if (isScalar(v)) {
      return indent + keyStr + ': ' + scalarYaml(v)
    }
    // 对象/数组：换行后缩进
    return indent + keyStr + ':\n' + toYaml(v, indent + '  ')
  })
  return lines.join('\n')
}

// 数组：- item 逐行
function yamlArray(arr, indent) {
  if (arr.length === 0) return '[]'
  const lines = []
  for (const item of arr) {
    if (isScalar(item)) {
      lines.push(indent + '- ' + scalarYaml(item))
    } else if (Array.isArray(item)) {
      lines.push(indent + '-\n' + toYaml(item, indent + '  '))
    } else {
      // 对象项：字段与 '- ' 后对齐
      const objStr = toYaml(item, indent + '  ')
      const objLines = objStr.split('\n')
      lines.push(indent + '- ' + objLines[0].slice((indent + '  ').length))
      lines.push(...objLines.slice(1))
    }
  }
  return lines.join('\n')
}

// 对外：把值转成 YAML 字符串
export function jsonToYaml(value) {
  return toYaml(value, '')
}
