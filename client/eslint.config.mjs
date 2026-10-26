import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off',
    'vue/no-v-html': 'error',
    'vue/html-self-closing': 'off',
  },
})
