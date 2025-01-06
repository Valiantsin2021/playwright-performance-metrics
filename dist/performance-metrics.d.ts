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
  private page
  private cdpSession
  /**
   * Create a new PerformanceMetricsCollector.
   * @param page - Playwright Page instance to collect metrics from.
   */
  constructor(page: Page)
  /**
   * Initialize the collector with optional network conditions.
   * @param networkConditions - Network conditions to emulate.
   * @throws Error if CDP session creation fails.
   */
  initialize(networkConditions?: NetworkConditions): Promise<void>
  /**
   * Clean up collector resources.
   */
  cleanup(): Promise<void>
  /**
   * Collect performance metrics from the page.
   * @param options - Options for metric collection.
   * @returns Collected performance metrics.
   */
  collectMetrics(options?: PerformanceOptions): Promise<PerformanceMetrics>
  /**
   * Validate collected metrics to ensure completeness.
   * @param results - Collected performance metrics.
   * @returns True if metrics are valid, otherwise false.
   */
  private hasValidMetrics
}
