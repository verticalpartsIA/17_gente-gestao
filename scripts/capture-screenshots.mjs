import { chromium } from '@playwright/test'
import { mkdirSync } from 'fs'

const BASE = 'http://localhost:5199'
const OUT  = 'docs/images'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const ctx     = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page    = await ctx.newPage()

// Login page
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 10000 })
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/login.png` })
console.log('✓ login.png')

// Register page
await page.goto(`${BASE}/register`, { waitUntil: 'networkidle', timeout: 10000 })
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/register.png` })
console.log('✓ register.png')

// Forgot password page
await page.goto(`${BASE}/forgot-password`, { waitUntil: 'networkidle', timeout: 10000 })
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/forgot-password.png` })
console.log('✓ forgot-password.png')

// Reset password page
await page.goto(`${BASE}/reset-password`, { waitUntil: 'networkidle', timeout: 10000 })
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/reset-password.png` })
console.log('✓ reset-password.png')

// Showcase page — topo (header + cores)
await page.goto(`${BASE}/showcase`, { waitUntil: 'networkidle', timeout: 10000 })
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/showcase-topo.png` })
console.log('✓ showcase-topo.png')

// Showcase page — página inteira
await page.screenshot({ path: `${OUT}/showcase-completo.png`, fullPage: true })
console.log('✓ showcase-completo.png')

// Showcase page — seção de botões/badges (scroll 900px)
await page.evaluate(() => window.scrollTo(0, 900))
await page.waitForTimeout(300)
await page.screenshot({ path: `${OUT}/showcase-componentes.png` })
console.log('✓ showcase-componentes.png')

// Showcase page — KPI cards (scroll 1600px)
await page.evaluate(() => window.scrollTo(0, 1600))
await page.waitForTimeout(300)
await page.screenshot({ path: `${OUT}/showcase-kpi.png` })
console.log('✓ showcase-kpi.png')

await browser.close()
console.log('\nTodas as capturas salvas em docs/images/')
