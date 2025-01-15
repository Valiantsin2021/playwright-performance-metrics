// @ts-nocheck
import { test as baseTest, chromium, expect } from '@playwright/test'
import { DefaultNetworkPresets, PerformanceMetricsCollector } from '../src/performance-metrics'

const test = baseTest.extend<{ collector: PerformanceMetricsCollector }>({
  collector: async ({}, use) => {
    const collector = new PerformanceMetricsCollector()
    await use(collector)
  }
})
test('Measure website performance default options', async ({ collector }) => {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('')
  const basicMetrics = await collector.collectMetrics(page, {
    timeout: 15000,
    retryTimeout: 500
  })
  console.log('Basic Metrics:', {
    'Time to First Byte': basicMetrics.timeToFirstByte?.total,
    'DOM Complete': basicMetrics.domCompleteTiming,
    'Page Load': basicMetrics.pageloadTiming,
    'All TTFB': basicMetrics.timeToFirstByte,
    'First Paint': basicMetrics.paint?.firstPaint,
    'First Contentful Paint': basicMetrics.paint?.firstContentfulPaint,
    'Largest Contentful Paint': basicMetrics.largestContentfulPaint,
    'Cumulative Layout Shift': basicMetrics.cumulativeLayoutShift,
    'Total Blocking Time': basicMetrics.totalBlockingTime,
    'Total Bytes': basicMetrics.totalBytes
  })
  expect(basicMetrics.timeToFirstByte?.total).toBeLessThan(900)
  expect(basicMetrics.domCompleteTiming).toBeLessThan(900)
  expect(basicMetrics.paint?.firstContentfulPaint).toBeLessThan(2000)
  expect(basicMetrics.largestContentfulPaint).toBeLessThan(2500)
  expect(basicMetrics.cumulativeLayoutShift).toBeLessThan(0.1)
  expect(basicMetrics.totalBlockingTime).toBeLessThan(500)
  expect(basicMetrics.timeToFirstByte?.total).toBeLessThan(900)
  await browser.close()
})
test('Slow Network metrics example - SLOW_3G preset', async ({ collector }) => {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  await collector.initialize(page, DefaultNetworkPresets.SLOW_3G)
  await page.goto('')
  const slowNetworkMetrics = await collector.collectMetrics(page, {
    timeout: 30000
  })
  await collector.cleanup()
  console.log('Slow 3G Metrics:', {
    TTFB: slowNetworkMetrics.timeToFirstByte?.total,
    'DOM Complete': slowNetworkMetrics.domCompleteTiming
  })
  console.log(slowNetworkMetrics)
  const resourceTiming = await slowNetworkMetrics.resourceTiming('redirection.js')
  if (resourceTiming) {
    console.log('redirection.js Resource Timing:', {
      'Download Time': resourceTiming.duration,
      Size: resourceTiming.encodedBodySize
    })
  }
  expect(slowNetworkMetrics.domCompleteTiming).toBeLessThan(25000)
  expect(resourceTiming.encodedBodySize).toBeGreaterThan(0)
  expect(slowNetworkMetrics.paint?.firstContentfulPaint).toBeGreaterThan(2000)
  expect(slowNetworkMetrics.largestContentfulPaint).toBeGreaterThan(2000)
  expect(slowNetworkMetrics.cumulativeLayoutShift).toBeLessThan(0.1)
  expect(slowNetworkMetrics.totalBlockingTime).toBeLessThan(500)
  expect(slowNetworkMetrics.timeToFirstByte?.total).toBeLessThan(900)
  await browser.close()
})
test('Slow Network metrics example - custom options setup', async ({ page, collector }) => {
  await collector.initialize(page, {
    offline: false,
    downloadThroughput: (250 * 1024) / 8, // 250 Kbps
    uploadThroughput: (250 * 1024) / 8, // 250 Kbps
    latency: 200 // ms
  })
  await page.goto('')
  const metrics = await collector.collectMetrics(page)
  await collector.cleanup()
  console.log(metrics)
  expect(metrics.domCompleteTiming).toBeGreaterThan(25000)
  expect(metrics.pageloadTiming).toBeGreaterThan(25000)
  expect(metrics.paint?.firstContentfulPaint).toBeGreaterThan(2000)
  expect(metrics.largestContentfulPaint).toBeGreaterThan(2500)
  expect(metrics.cumulativeLayoutShift).toBeLessThan(0.1)
  expect(metrics.totalBlockingTime).toBeLessThan(500)
  expect(metrics.timeToFirstByte?.total).toBeLessThan(900)
})
test('Performance requirements are met', async ({ page, collector }) => {
  await page.goto('')
  const metrics = await collector.collectMetrics(page)
  // Performance budget assertions
  expect(metrics.paint?.firstContentfulPaint).toBeLessThan(2000)
  expect(metrics.largestContentfulPaint).toBeLessThan(2500)
  expect(metrics.cumulativeLayoutShift).toBeLessThan(0.1)
  expect(metrics.totalBlockingTime).toBeLessThan(500)
  expect(metrics.timeToFirstByte?.total).toBeLessThan(900)
})
