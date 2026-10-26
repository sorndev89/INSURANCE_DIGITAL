import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
    include: ['tests/unit/**/*.spec.js'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'app/components/base/**/*.vue',
        'app/components/ui/**/*.vue',
        'app/composables/**/*.js',
        'app/utils/**/*.js',
      ],
      thresholds: {
        lines: 25,
        functions: 24,
        statements: 24,
        branches: 19,
      },
    },
  },
})
