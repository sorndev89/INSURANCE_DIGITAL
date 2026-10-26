import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },

  future: {
    compatibilityVersion: 4,
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: '/api',
      rootDomain: 'saiyfon.app',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'lo' },
      title: 'Insurance SaaS Console',
      titleTemplate: '%s · Insurance SaaS',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'noindex' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  compatibilityDate: '2024-11-01',
})
