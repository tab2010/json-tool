// src/utils/toJsonSchema.js —— 把解析后的 JSON 值转成 JSON Schema。
// 纯函数，不依赖 Vue，可单独用 node 测试。

import { isBigNumber, stringify } from './json.js'

// 生成单个值的 schema（递归）
function schemaOf(value) {
  if (value === null) return { type: 'null' }
  if (Array.isArray(value)) {
    // 简化：用第一个元素推断 items（假设数组元素同构）
    return { type: 'array', items: value.length ? schemaOf(value[0]) : {} }
  }
  if (isBigNumber(value)) return { type: 'integer' }
  if (typeof value === 'object') {
    const properties = {}
    for (const key of Object.keys(value)) {
      properties[key] = schemaOf(value[key])
    }
    return { type: 'object', properties }
  }
  if (typeof value === 'string') return { type: 'string' }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' }
  }
  if (typeof value === 'boolean') return { type: 'boolean' }
  return {}
}

// 对外：把值转成 JSON Schema 字符串
export function jsonToSchema(value, indent = 2) {
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    ...schemaOf(value),
  }
  return stringify(schema, indent)
}
