import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // يمنع فشل الاتصال بـ localhost عندما يحلّ Node عنوان IPv6 فقط
    host: '127.0.0.1',
  },
  build: {
    // كل صورة صغيرة تتحوّل إلى inline لتقليل عدد الطلبات وزيادة السرعة
    assetsInlineLimit: 8192,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // مكتبات الطرف الثالث في ملف منفصل يبقى مخزّناً في المتصفح بين التحديثات
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-router') || id.includes('@remix-run')) return 'router'
          if (id.includes('react-dom') || id.includes('scheduler') || /node_modules[\\/]react[\\/]/.test(id)) {
            return 'react'
          }
        },
      },
    },
  },
})
