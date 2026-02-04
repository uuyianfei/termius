import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: {
        // 可選：如果 renderer 需要額外配置
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // 關鍵修復：排除 Node native modules，避免 renderer build 解析它們
  build: {
    minify: false,  // 你原有的
    rollupOptions: {
      // external 告訴 Rollup 不要 bundling 這些，留給 Node runtime
      external: [
        'ssh2',
        'ssh2-promise',  // 如果你用了 wrapper
        'ssh2/lib/protocol/crypto/build/Release/sshcrypto.node',  // 精準匹配問題檔
        /^node:/,  // 所有 Node built-in
        'electron',
      ],
    },
  },

  // 防止 Vite 在 dev/optimize 階段也掃到 ssh2
  optimizeDeps: {
    esbuildOptions: {
      // esbuild 是 Vite 的 bundler，排除 binary
      target: 'es2020',
    },
    exclude: [
      'ssh2',
      'ssh2/**',  // 更廣泛排除
    ],
  },

  // 如果 preload/main 有 commonjs 問題，可加
  esbuild: {
    // optional: logLevel: 'info' for more debug
  },
})
