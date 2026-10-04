// clipboard.js —— 剪贴板操作工具（带降级方案）。
// "复制"在多个组件里都要用，抽成公共函数避免重复代码（DRY 原则）。

export async function copyText(text) {
  if (!text) return
  try {
    // 现代浏览器的剪贴板 API
    await navigator.clipboard.writeText(text)
  } catch {
    // 兜底：非 https 环境等不支持 clipboard API 时，用隐藏文本框模拟
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}
