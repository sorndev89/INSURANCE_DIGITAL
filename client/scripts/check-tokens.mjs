#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const baselinePath = join(root, 'scripts', 'token-baseline.json')
const updateBaseline = process.argv.includes('--update-baseline')
const scanRoots = ['app']
const extensions = new Set(['.vue', '.js', '.css'])

const rules = [
  {
    id: 'raw-tailwind-color',
    pattern:
      /(?:^|[\s"'`])(?:bg|text|border|ring|from|via|to|fill|stroke|shadow|decoration|outline|divide|placeholder|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)\b/g,
  },
  { id: 'font-black', pattern: /\bfont-black\b/g },
  { id: 'tiny-text', pattern: /\btext-\[(?:10|11)px\]/g },
  { id: 'animate-pulse', pattern: /\banimate-pulse\b/g },
  { id: 'external-url', pattern: /https?:\/\/[^\s"'`<>)]+/g },
  { id: 'console-log', pattern: /\bconsole\.log\s*\(/g },
  { id: 'debugger', pattern: /\bdebugger\b/g },
  { id: 'nuxt-layout-wrapper', pattern: /<NuxtLayout\b/g },
  { id: 'layout-false', pattern: /\blayout\s*:\s*false\b/g },
  { id: 'v-html', pattern: /\bv-html\s*=/g },
]

const allowedExternalUrls = ['www.w3.org']

function walk(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) return walk(fullPath)
    const extension = fullPath.slice(fullPath.lastIndexOf('.'))
    return extensions.has(extension) ? [fullPath] : []
  })
}

function toRelative(filePath) {
  return relative(root, filePath).split('\\').join('/')
}

function countMatches(content, rule) {
  const matches = content.match(rule.pattern) || []
  if (rule.id !== 'external-url') return matches.length
  return matches.filter((url) => !allowedExternalUrls.some((allowed) => url.includes(allowed)))
    .length
}

const files = scanRoots.flatMap((scanRoot) => walk(join(root, scanRoot)))
const current = {}

for (const filePath of files) {
  const relativePath = toRelative(filePath)
  const content = readFileSync(filePath, 'utf8')
  for (const rule of rules) {
    if (rule.id === 'nuxt-layout-wrapper' && relativePath === 'app/app.vue') continue
    const count = countMatches(content, rule)
    if (count > 0) {
      current[relativePath] ??= {}
      current[relativePath][rule.id] = count
    }
  }
}

const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : {}

if (updateBaseline) {
  writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`)
  const total = Object.values(current).reduce(
    (sum, fileRules) =>
      sum + Object.values(fileRules).reduce((fileSum, count) => fileSum + count, 0),
    0,
  )
  console.log(
    `Token baseline updated: ${total} legacy violation(s) in ${Object.keys(current).length} file(s).`,
  )
  process.exit(0)
}

const regressions = []
const improvements = []

for (const [filePath, fileRules] of Object.entries(current)) {
  for (const [ruleId, count] of Object.entries(fileRules)) {
    const allowed = baseline[filePath]?.[ruleId] ?? 0
    if (count > allowed) {
      regressions.push({ filePath, ruleId, count, allowed })
    } else if (count < allowed) {
      improvements.push({ filePath, ruleId, count, allowed })
    }
  }
}

for (const [filePath, fileRules] of Object.entries(baseline)) {
  for (const [ruleId, allowed] of Object.entries(fileRules)) {
    if (!current[filePath]?.[ruleId]) {
      improvements.push({ filePath, ruleId, count: 0, allowed })
    }
  }
}

if (improvements.length > 0) {
  console.log(`Token baseline can be tightened in ${improvements.length} place(s).`)
}

if (regressions.length === 0) {
  console.log('Token check passed: no new violations.')
  process.exit(0)
}

console.error('Token check failed: new violations found.')
for (const { filePath, ruleId, count, allowed } of regressions) {
  console.error(`  ${filePath}: ${ruleId} ${count} (baseline ${allowed})`)
}
process.exit(1)
