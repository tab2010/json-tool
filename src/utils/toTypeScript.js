// src/utils/toTypeScript.js —— 把解析后的 JSON 值转成 TypeScript 类型定义。
// 纯函数，不依赖 Vue，可单独用 node 测试。

import { isBigNumber } from './json.js'

// 判断 key 是否是合法的 TS 标识符（决定能否不加引号直接写）
function isValidIdentifier(key) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
}

// 生成类型字符串。indent 是当前类型"起始行"的缩进字符串，
// 多行类型（对象）会在缩进基础上再缩进一级。
function typeString(value, indent) {
  if (value === null) return 'null'
  if (Array.isArray(value)) return arrayType(value, indent)
  if (isBigNumber(value)) return 'number'
  if (typeof value === 'object') return objectType(value, indent)
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  return 'any'
}

// 对象类型：多行 { ... }
function objectType(obj, indent) {
  const keys = Object.keys(obj)
  if (keys.length === 0) return 'Record<string, unknown>'
  const childIndent = indent + '  '
  const lines = keys.map((key) => {
    const keyStr = isValidIdentifier(key) ? key : JSON.stringify(key)
    return childIndent + keyStr + ': ' + typeString(obj[key], childIndent)
  })
  return '{\n' + lines.join('\n') + '\n' + indent + '}'
}

// 数组类型：Type[]（空数组 any[]，混合类型 (A | B)[]）
function arrayType(arr, indent) {
  if (arr.length === 0) return 'any[]'
  // 数组不额外加缩进，因为 [] 附加在元素类型的同一行
  const types = arr.map((item) => typeString(item, indent))
  const unique = [...new Set(types)]
  if (unique.length === 1) return unique[0] + '[]'
  return '(' + unique.join(' | ') + ')[]'
}

// 对外：把解析后的值转成 TS 类型定义
export function jsonToTypeScript(value, rootName = 'Root') {
  // 顶层是对象（非数组、非大数）→ interface
  if (value !== null && typeof value === 'object' && !Array.isArray(value) && !isBigNumber(value)) {
    return `interface ${rootName} ${objectType(value, '')}`
  }
  // 其他（原始值、数组、大数）→ type X = ...
  return `type ${rootName} = ${typeString(value, '')}`
}
