import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 的配置文件。
// 当你运行 `npm run dev` 或 `npm run build` 时，Vite 会读取这个文件，
// 决定"怎么启动开发服务器"和"怎么打包"。
export default defineConfig({
  // plugins：插件列表。@vitejs/plugin-vue 的作用是让 Vite
  // 能够识别和编译 .vue 单文件组件（SFC）。
  plugins: [vue()],

  // server：开发服务器的配置（只在 `npm run dev` 时生效）。
  server: {
    port: 5173, // 开发服务器端口，默认就是 5173
    open: true, // 启动后自动在浏览器打开页面
  },

  // build：生产构建的配置（只在 `npm run build` 时生效）。
  // 这里暂时留空，后面讲部署时如果需要再补充（例如 base、输出目录等）。
})
