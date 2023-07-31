import { resolve } from 'path'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  root: 'src',
  server: {
    port: 3000,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.html'),
        task01: resolve(__dirname, 'src/task01/index.html'),
        task02: resolve(__dirname, 'src/task02/index.html'),
        task03: resolve(__dirname, 'src/task03/index.html'),
        task04: resolve(__dirname, 'src/task04/index.html'),
        task05: resolve(__dirname, 'src/task05/index.html'),
        task06: resolve(__dirname, 'src/task06/index.html'),
        task07: resolve(__dirname, 'src/task07/index.html'),
        task08: resolve(__dirname, 'src/task08/index.html'),
      },
    },
  },
  plugins: [
    glsl(),
    checker({
      typescript: true,
    }),
  ],
})
