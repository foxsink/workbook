// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui'],

  css: ['~/assets/css/main.css'],

  app: {
    pageTransition: false,
    layoutTransition: false,
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      title: 'Workbook',
      meta: [
        { name: 'description', content: 'Конспекты по видео и текстовым материалам' },
        { name: 'theme-color', content: '#1e40af' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'mobile-web-app-capable', content: 'yes' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
      ],
    },
  },

  // FSD: auto-import shared utilities
  imports: {
    dirs: [
      'shared/lib',
      'shared/api',
      'shared/config',
    ],
  },

  vite: {
    optimizeDeps: {
      include: [
        '@milkdown/kit/core',
        '@milkdown/kit/preset/commonmark',
        '@milkdown/kit/plugin/history',
        '@milkdown/kit/plugin/listener',
        '@milkdown/theme-nord',
        '@milkdown/vue',
        'plyr',
      ],
    },
  },
})
