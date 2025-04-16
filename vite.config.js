import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    viteSingleFile()
  ],
  build: {
    // 确保资源内联
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    // 启用内联动态导入
    inlineDynamicImports: true,
    // 禁用源码映射
    sourcemap: false,
  },
})
