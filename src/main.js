// main.js —— 整个 Vue 应用的"启动入口"。
// 浏览器从 index.html 的 <script src="/src/main.js"> 加载到这里。

import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// 1. createApp(App)：用根组件 App 创建一个 Vue 应用实例
// 2. .mount('#app')：把这个应用"挂载"到 index.html 里的 <div id="app"> 上
// 挂载之后，<div id="app"> 里的内容就会被 App 组件渲染的界面替换掉
createApp(App).mount('#app')
