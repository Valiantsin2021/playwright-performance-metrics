// @ts-nocheck
import { chromium, expect, test } from '@playwright/test'
import { DefaultNetworkPresets, PerformanceMetricsCollector } from '../src/performance-metrics'

test('Measure website performance default options', async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  const collector = new PerformanceMetricsCollector(page)
  await page.goto('')
  const basicMetrics = await collector.collectMetrics({
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
test('Slow Network metrics', async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('')
  const collector = new PerformanceMetricsCollector(page)
  const slowNetworkMetrics = await collector.collectMetrics({
    networkConditions: DefaultNetworkPresets.SLOW_3G,
    timeout: 30000
  })

  console.log('Slow 3G Metrics:', {
    TTFB: slowNetworkMetrics.timeToFirstByte?.total,
    'DOM Complete': slowNetworkMetrics.domCompleteTiming
  })
  const resourceTiming = await slowNetworkMetrics.resourceTiming('redirection.js')
  if (resourceTiming) {
    console.log('redirection.js Resource Timing:', {
      'Download Time': resourceTiming.duration,
      Size: resourceTiming.encodedBodySize
    })
  }
  expect(slowNetworkMetrics.timeToFirstByte?.total).toBeLessThan(900)
  expect(slowNetworkMetrics.domCompleteTiming).toBeLessThan(900)
  expect(resourceTiming.encodedBodySize).toBeGreaterThan(0)
  expect(slowNetworkMetrics.paint?.firstContentfulPaint).toBeLessThan(2000)
  expect(slowNetworkMetrics.largestContentfulPaint).toBeLessThan(2500)
  expect(slowNetworkMetrics.cumulativeLayoutShift).toBeLessThan(0.1)
  expect(slowNetworkMetrics.totalBlockingTime).toBeLessThan(500)
  expect(slowNetworkMetrics.timeToFirstByte?.total).toBeLessThan(900)
  await browser.close()
})

// Example test assertions
test('Performance requirements are met', async ({ page }) => {
  const collector = new PerformanceMetricsCollector(page)
  await page.goto('')

  const metrics = await collector.collectMetrics({
    networkConditions: DefaultNetworkPresets.REGULAR_4G
  })

  // Performance budget assertions
  expect(metrics.paint?.firstContentfulPaint).toBeLessThan(2000)
  expect(metrics.largestContentfulPaint).toBeLessThan(2500)
  expect(metrics.cumulativeLayoutShift).toBeLessThan(0.1)
  expect(metrics.totalBlockingTime).toBeLessThan(500)
  expect(metrics.timeToFirstByte?.total).toBeLessThan(900)
})
