// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

const themeBootScript = `(function () {
  try {
    var match = document.cookie.match(/(?:^|; )saiyfon_theme=([^;]*)/)
    var theme = match ? decodeURIComponent(match[1]) : null
    if (theme !== 'light' && theme !== 'dark') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  } catch (error) {
    document.documentElement.classList.remove('dark')
  }
})()`

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  modules: ['@pinia/nuxt', '@nuxtjs/device', '@vueuse/nuxt', '@nuxt/eslint'],

  ignore: process.env.NODE_ENV === 'production' ? ['**/pages/dev/**'] : [],

  components: [
    { path: '~/components/base', pathPrefix: false },
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components/shell', pathPrefix: false },
    { path: '~/components/feature', pathPrefix: false },
  ],

  runtimeConfig: {
    public: {
      useMock: true,
      apiBase: 'http://localhost:5055/api',
      mockDelay: 220,
      mockFailureRate: 0,
      tenantMode: 'mock',
      defaultTenantSlug: 'saiyfon',
      defaultTenantName: 'ສາຍຝົນ ປະກັນໄພ',
      defaultBrandColor: '#047857',
      platformUrl: 'http://localhost:3001',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'lo' },
      title: 'ສາຍຝົນ ບຣອກເກີ ດິຈິຕອນ',
      titleTemplate: '%s · ສາຍຝົນ ປະກັນໄພ',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
        { name: 'theme-color', content: '#047857' },
        {
          name: 'description',
          content: 'ລະບົບຄຸ້ມຄອງການປະກັນໄພດິຈິຕອນ ສຳລັບຕົວແທນ ແລະ ລູກຄ້າ.',
        },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      script: [{ innerHTML: themeBootScript, tagPosition: 'head' }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  css: ['~/assets/css/main.css'],

  build: {
    transpile: ['konsta'],
  },

  vite: {
    optimizeDeps: {
      include: ['konsta', 'konsta/vue', 'material-icons'],
    },
    plugins: [tailwindcss()],
  },

  compatibilityDate: '2024-11-01',
})
