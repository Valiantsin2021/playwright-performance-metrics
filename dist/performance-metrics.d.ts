import { Page } from '@playwright/test'
import { IPerformanceMetricsCollector, NetworkConditions, NetworkPresets, PerformanceMetrics, PerformanceOptions } from './types'
/**
 * Default network condition presets for performance testing
 */
export declare const DefaultNetworkPresets: NetworkPresets
/**
 * Collector for gathering web performance metrics using Playwright.
 */
export declare class PerformanceMetricsCollector implements IPerformanceMetricsCollector {
  private cdpSession
  /**
   * Create a new PerformanceMetricsCollector.
   */
  constructor()
  /**
   * Initialize the collector with optional network conditions.
   * @param page - Playwright Page instance to collect metrics from.
   * @param networkConditions - Network conditions to emulate.
   * @throws Error if CDP session creation fails.
   * @example
   * const collector = new PerformanceMetricsCollector()
   * await collector.initialize(page, DefaultNetworkPresets.SLOW_3G)
   * await page.goto('')
   * const slowNetworkMetrics = await collector.collectMetrics(page, {
   * timeout: 30000
   * })
   * @example
   * const collector = new PerformanceMetricsCollector()
   */
  initialize(page: Page, networkConditions?: NetworkConditions): Promise<void>
  /**
   * Closes cdp session.
   */
  cleanup(): Promise<void>
  /**
   * Collect performance metrics from the page.
   * @param page - Playwright Page instance to collect metrics from.
   * @param options - Options for metric collection.
   * @returns Collected performance metrics.
   * @example
   * const collector = new PerformanceMetricsCollector()
   * await page.goto('')
   * const metrics = await collector.collectMetrics(page)
   * expect(metrics.paint?.firstContentfulPaint).toBeLessThan(2000)
   * expect(metrics.largestContentfulPaint).toBeLessThan(2500)
   * expect(metrics.cumulativeLayoutShift).toBeLessThan(0.1)
   * expect(metrics.totalBlockingTime).toBeLessThan(500)
   * expect(metrics.timeToFirstByte?.total).toBeLessThan(900)
   */
  collectMetrics(page: Page, options?: PerformanceOptions): Promise<PerformanceMetrics>
  /**
   * Validate collected metrics to ensure completeness.
   * @param results - Collected performance metrics.
   * @returns True if metrics are valid, otherwise false.
   */
  private hasValidMetrics
}
