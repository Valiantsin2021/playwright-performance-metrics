// @ts-nocheck
import { expect, test } from '@playwright/test'
import fs from 'fs'
import { PerformanceMetricsCollector } from '../src/performance-metrics'
const results = []
for (let i = 1; i < 2; i++) {
  test.describe('Performance with one unified command ' + i, async () => {
    const url = `https://playwright.dev`
    test.beforeEach(async ({ page }) => {
      await page.goto(url, { waitUntil: 'networkidle' })
    })
    test(i + ` Should load ${url} page in less than 2 second`, async ({ page }) => {
      const collector = new PerformanceMetricsCollector(page)
      const metrics = await collector.collectMetrics()
      results.push(metrics)
      fs.appendFileSync('results.json', JSON.stringify(metrics) + '\n')
      expect(metrics.pageloadTiming).toBeLessThan(2000)
      expect(metrics.domCompleteTiming).toBeLessThan(2000)
    })
    test(i + ` Should load ${url} page with timeToFirstByte less than 500ms`, async ({ page }) => {
      const collector = new PerformanceMetricsCollector(page)
      const metrics = await collector.collectMetrics()
      results.push(metrics)
      fs.appendFileSync('results.json', JSON.stringify(metrics) + '\n')
      expect(metrics.timeToFirstByte.total, 'Time to first byte is less than 500ms').toBeLessThan(500)
      expect(metrics.timeToFirstByte.dns, 'DNS time is less than 200ms').toBeLessThan(200)
      expect(metrics.timeToFirstByte.wait, 'Wait time is less than 200ms').toBeLessThan(200)
      expect(metrics.timeToFirstByte.redirect, 'Redirect time is less than 200ms').toBeLessThan(200)
      expect(metrics.timeToFirstByte.tls, 'TLS time is less than 200ms').toBeLessThan(200)
      expect(metrics.timeToFirstByte.connection, 'Connection time is less than 200ms').toBeLessThan(200)
    })
    test(i + ` Should load ${url} page with resourceTiming less than 500ms`, async ({ page }) => {
      const collector = new PerformanceMetricsCollector(page)
      const metrics = await collector.collectMetrics()
      results.push(metrics)
      fs.appendFileSync('results.json', JSON.stringify(metrics) + '\n')
      const resourceTiming = await metrics.resourceTiming('redirection.js')
      expect(resourceTiming?.duration, 'Resource timing is less than 500ms').toBeLessThan(500)
    })
    test(i + ` Should load ${url} page with size less than 1.5 MB`, async ({ page }) => {
      const collector = new PerformanceMetricsCollector(page)
      const metrics = await collector.collectMetrics()
      results.push(metrics)
      fs.appendFileSync('results.json', JSON.stringify(metrics) + '\n')
      expect(metrics.totalBytes, 'Total bytes is less than 1.5 MB').toBeLessThan(1024 * 1024 * 1.5)
    })
    test(i + ` Should measure paint timings for ${url}`, async ({ page }) => {
      const collector = new PerformanceMetricsCollector(page)
      const metrics = await collector.collectMetrics()
      results.push(metrics)
      fs.appendFileSync('results.json', JSON.stringify(metrics) + '\n')
      expect(metrics.paint.firstContentfulPaint, 'First Contentful Paint is less than 1500ms').toBeLessThan(1500)
      expect(metrics.paint.firstPaint, 'First Paint is less than 1500ms').toBeLessThan(1500)
    })
    test(i + ` Should measure largestContentfulPaint for ${url}`, async ({ page }) => {
      const collector = new PerformanceMetricsCollector(page)
      const metrics = await collector.collectMetrics()
      results.push(metrics)
      fs.appendFileSync('results.json', JSON.stringify(metrics) + '\n')
      expect(metrics.largestContentfulPaint, `Largest Contentful Paint (${metrics.largestContentfulPaint}ms) should be less than 500ms`).toBeLessThan(500)
    })
    test(i + ` Should measure cumulativeLayoutShift for ${url}`, async ({ page }) => {
      const collector = new PerformanceMetricsCollector(page)
      const metrics = await collector.collectMetrics()
      results.push(metrics)
      fs.appendFileSync('results.json', JSON.stringify(metrics) + '\n')
      expect(metrics.cumulativeLayoutShift, `Cumulative Layout Shift (${metrics.cumulativeLayoutShift}) should be less than 0.1`).toBeLessThan(0.1)
    })
    test(i + ` Should measure totalBlockingTime for ${url}`, async ({ page }) => {
      const collector = new PerformanceMetricsCollector(page)
      const metrics = await collector.collectMetrics()
      results.push(metrics)
      fs.appendFileSync('results.json', JSON.stringify(metrics) + '\n')
      expect(metrics.totalBlockingTime, `Total Blocking Time (${metrics.totalBlockingTime}ms) should be less than 500ms`).toBeLessThan(500)
    })
  })
}
