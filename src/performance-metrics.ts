import { ChromiumBrowserContext, Page } from '@playwright/test'
import { IPerformanceMetricsCollector, NetworkConditions, NetworkPresets, PerformanceMetrics, PerformanceOptions } from './types'

/**
 * Default network condition presets for performance testing
 */
export const DefaultNetworkPresets: NetworkPresets = {
  REGULAR_4G: {
    offline: false,
    downloadThroughput: (4 * 1024 * 1024) / 8, // 4 Mbps
    uploadThroughput: (3 * 1024 * 1024) / 8, // 3 Mbps
    latency: 20 // ms
  },
  SLOW_3G: {
    offline: false,
    downloadThroughput: (500 * 1024) / 8, // 500 Kbps
    uploadThroughput: (500 * 1024) / 8, // 500 Kbps
    latency: 100 // ms
  },
  FAST_WIFI: {
    offline: false,
    downloadThroughput: (400 * 1024 * 1024) / 8, // 400 Mbps
    uploadThroughput: (200 * 1024 * 1024) / 8, // 200 Mbps
    latency: 2 // ms
  }
} as const

/**
 * Collector for gathering web performance metrics using Playwright.
 */
export class PerformanceMetricsCollector implements IPerformanceMetricsCollector {
  private page: Page
  private cdpSession: any

  /**
   * Create a new PerformanceMetricsCollector.
   * @param page - Playwright Page instance to collect metrics from.
   */
  constructor(page: Page) {
    this.page = page
  }

  /**
   * Initialize the collector with optional network conditions.
   * @param networkConditions - Network conditions to emulate.
   * @throws Error if CDP session creation fails.
   */
  async initialize(networkConditions?: NetworkConditions): Promise<void> {
    if (networkConditions) {
      const context = this.page.context() as ChromiumBrowserContext
      this.cdpSession = await context.newCDPSession(this.page)
      await this.cdpSession.send('Network.enable')
      await this.cdpSession.send('Network.emulateNetworkConditions', networkConditions)
    }
  }

  /**
   * Clean up collector resources.
   */
  async cleanup(): Promise<void> {
    if (this.cdpSession) {
      await this.cdpSession.detach()
    }
  }

  /**
   * Collect performance metrics from the page.
   * @param options - Options for metric collection.
   * @returns Collected performance metrics.
   */
  async collectMetrics(options: PerformanceOptions = {}): Promise<PerformanceMetrics> {
    const { timeout = 10000, initialDelay = 1000, retryTimeout = 5000, networkConditions } = options

    // Initialize network conditions if provided
    if (networkConditions) {
      await this.initialize(networkConditions)
    }

    // Wait for initial delay
    await this.page.waitForTimeout(initialDelay)

    const results: PerformanceMetrics = {}

    // Collect navigation timing metrics
    const navigationTiming = await this.page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (timing) {
        return {
          timeToFirstByte: {
            total: timing.responseStart - timing.startTime,
            redirect: timing.redirectEnd - timing.redirectStart,
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            connection: timing.connectEnd - timing.connectStart,
            tls: timing.secureConnectionStart > 0 ? timing.connectEnd - timing.secureConnectionStart : 0,
            wait: timing.responseStart - timing.requestStart
          },
          domComplete: timing.domComplete,
          pageloadTiming: timing.loadEventEnd - timing.startTime
        }
      }
      return null
    })

    if (navigationTiming) {
      results.timeToFirstByte = navigationTiming.timeToFirstByte
      results.domCompleteTiming = navigationTiming.domComplete
      results.pageloadTiming = navigationTiming.pageloadTiming
    }

    // Collect resource timing data
    results.resourceTiming = (resource: string) => {
      return this.page.evaluate(resourceName => {
        return performance.getEntriesByType('resource').find(entry => entry.name.includes(resourceName))
      }, resource) as Promise<PerformanceResourceTiming | undefined>
    }

    // Calculate total bytes
    results.totalBytes = await this.page.evaluate(() => {
      /// @ts-ignore
      return performance.getEntriesByType('resource').reduce((acc, entry) => acc + entry.encodedBodySize, 0)
    })

    // Collect performance observer metrics
    const observerMetrics = await this.page.evaluate(
      ({ timeout }) => {
        return new Promise(resolve => {
          const metrics: any = {}
          const timeoutId = setTimeout(() => resolve(metrics), timeout)

          if (!('PerformanceObserver' in window)) {
            clearTimeout(timeoutId)
            resolve(metrics)
            return
          }

          const entryTypes = ['largest-contentful-paint', 'longtask', 'paint', 'layout-shift']

          const observer = new PerformanceObserver(list => {
            for (const type of entryTypes) {
              const entries = list.getEntriesByType(type)

              if (type === 'largest-contentful-paint') {
                metrics.largestContentfulPaint = entries[entries.length - 1]?.startTime
              } else if (type === 'longtask') {
                let totalBlockingTime = 0
                entries.forEach(entry => {
                  const blockingTime = Math.max(entry.duration - 50, 0)
                  totalBlockingTime += blockingTime
                })
                metrics.totalBlockingTime = totalBlockingTime
              } else if (type === 'paint') {
                metrics.paint = {
                  firstPaint: entries.find(entry => entry.name === 'first-paint')?.startTime,
                  firstContentfulPaint: entries.find(entry => entry.name === 'first-contentful-paint')?.startTime
                }
              } else if (type === 'layout-shift') {
                let CLS = 0
                entries.forEach((entry: any) => {
                  if (!entry.hadRecentInput) {
                    CLS += entry.value
                  }
                })
                metrics.cumulativeLayoutShift = CLS
              }
            }

            observer.disconnect()
            clearTimeout(timeoutId)
            resolve(metrics)
          })

          try {
            for (const type of entryTypes) {
              observer.observe({ type, buffered: true })
            }
          } catch (err) {
            console.log(err)
            clearTimeout(timeoutId)
            resolve(metrics)
          }
        })
      },
      { timeout }
    )

    Object.assign(results, observerMetrics)

    // Retry until we have valid metrics or timeout
    const startTime = Date.now()
    while (Date.now() - startTime < retryTimeout) {
      if (this.hasValidMetrics(results)) {
        break
      }
      await this.page.waitForTimeout(100)
    }

    // Cleanup if we initialized network conditions
    if (networkConditions) {
      await this.cleanup()
    }

    return results
  }

  /**
   * Validate collected metrics to ensure completeness.
   * @param results - Collected performance metrics.
   * @returns True if metrics are valid, otherwise false.
   */
  private hasValidMetrics(results: PerformanceMetrics): boolean {
    return Boolean(results.largestContentfulPaint !== undefined && results.paint?.firstContentfulPaint !== undefined && results.paint?.firstPaint !== undefined)
  }
}
