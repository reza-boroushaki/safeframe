import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        base: resolve(__dirname, 'src/base.js'),
        host: resolve(__dirname, 'src/host.js'),
        boot: resolve(__dirname, 'src/boot.js'),
        index: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: '[name].js'
      }
    },
    outDir: 'dist'
  }
})
