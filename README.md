# JSON 格式化工具（隐私优先）

一个纯前端、隐私优先的 JSON 格式化与转换工具。**所有数据处理都在浏览器本地完成，数据不上传服务器。**

🔗 在线使用：https://jsonfmt.net

## 功能特性

- **JSON5 解析**：支持注释、单引号、尾逗号
- **格式化 / 压缩**：2/4 空格、Tab 缩进
- **大数精度保护**：超出 `2^53-1` 的整数不丢失精度
- **树形折叠视图**：可折叠的层级浏览，适合大 JSON
- **JSONPath 路径复制**：点节点复制路径（如 `$.user.tags[0]`）
- **节点复制菜单**：复制 key / value / key: value
- **转 TypeScript / JSON Schema / YAML / CSV**：JSON → TS `interface` / JSON Schema / YAML / CSV 表格
- **错误定位**：报错显示第几行第几列
- **暗色主题 + 移动端响应式**
- **隐私优先**：零网络请求、无统计埋点、数据只在本地处理

## 技术栈

- [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- [json5](https://www.npmjs.com/package/json5) —— JSON5 解析（注释/单引号/尾逗号）
- [json-bigint](https://www.npmjs.com/package/json-bigint) —— 大数精度保护

## 本地开发

```bash
npm install
npm run dev       # 启动开发服务器
npm run build     # 生产构建（输出到 dist/）
npm run preview   # 本地预览构建产物
```

## 部署

部署在 **Cloudflare Pages**（Git 连接，`git push` 自动部署）。

- 构建命令：`npm run build`
- 输出目录：`dist`
- 环境变量：`NODE_VERSION=22`

## 项目结构

```
src/
├── utils/
│   ├── json.js          # 核心逻辑：解析/格式化/压缩/大数保护/错误定位
│   ├── toTypeScript.js  # JSON → TypeScript 类型
│   ├── toJsonSchema.js  # JSON → JSON Schema
│   ├── toYaml.js        # JSON → YAML
│   ├── toCsv.js         # JSON → CSV
│   └── clipboard.js     # 剪贴板工具
├── components/
│   ├── Toolbar.vue      # 工具栏（格式化/压缩/示例/缩进）
│   ├── JsonEditor.vue   # 输入区
│   ├── JsonOutput.vue   # 输出区（文本/树形/转换切换）
│   └── JsonTreeNode.vue # 树节点（递归组件）
├── App.vue              # 根组件
└── main.js              # 入口
```

## 许可证

[MIT](./LICENSE)

