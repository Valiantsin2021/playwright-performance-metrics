/**
 * Network condition configuration options
 * @property offline - Whether to emulate offline mode
 * @property downloadThroughput - Download speed in bytes/second
 * @property uploadThroughput - Upload speed in bytes/second
 * @property latency - Network latency in milliseconds
 */
export interface NetworkConditions {
  /** Whether to emulate offline mode */
  offline?: boolean
  /** Download speed in bytes/second */
  downloadThroughput?: number
  /** Upload speed in bytes/second */
  uploadThroughput?: number
  /** Network latency in milliseconds */
  latency?: number
}

/**
 * Configuration options for performance metrics collection
 * @property timeout - Maximum time to wait for metrics collection
 * @property retryTimeout - Maximum time to retry collecting metrics
 * @property networkConditions - Network emulation settings
 */
export interface PerformanceOptions {
  /** Maximum time to wait for metrics collection (ms) */
  timeout?: number
  /** Maximum time to retry collecting metrics (ms) */
  retryTimeout?: number
  /** Network emulation settings */
  networkConditions?: NetworkConditions
}

/**
 * Time to First Byte (TTFB) metrics breakdown
 */
export interface TimeToFirstByte {
  /** Total time until first byte received */
  total: number
  /** Time spent in redirects */
  redirect: number
  /** Time spent in DNS lookup */
  dns: number
  /** Time spent establishing connection */
  connection: number
  /** Time spent in TLS negotiation */
  tls: number
  /** Time spent waiting for server response */
  wait: number
}

/**
 * Paint timing metrics
 */
export interface PaintMetrics {
  /** Time until first paint (ms) */
  firstPaint: number
  /** Time until first contentful paint (ms) */
  firstContentfulPaint: number
}

/**
 * Complete performance metrics collection
 */
export interface PerformanceMetrics {
  /** Time to First Byte metrics */
  timeToFirstByte?: TimeToFirstByte
  /** Total page load time (ms) */
  pageloadTiming?: number
  /** Time until DOM is complete (ms) */
  domCompleteTiming?: number
  /** Function to get timing for specific resources */
  resourceTiming?: ResourceTimingFunction
  /** Total bytes transferred */
  totalBytes?: number
  /** Largest Contentful Paint timing (ms) */
  largestContentfulPaint?: number
  /** Total Blocking Time (ms) */
  totalBlockingTime?: number
  /** Paint timing metrics */
  paint?: PaintMetrics
  /** Cumulative Layout Shift score */
  cumulativeLayoutShift?: number
}

/**
 * Preset network configurations
 */
export interface NetworkPresets {
  /** 4G network conditions */
  REGULAR_4G: NetworkConditions
  /** 3G network conditions */
  SLOW_3G: NetworkConditions
  /** Fast WiFi network conditions */
  FAST_WIFI: NetworkConditions
}

/**
 * Performance metrics collector class interface
 */
export interface IPerformanceMetricsCollector {
  /** Initialize the collector */
  initialize(networkConditions?: NetworkConditions): Promise<void>
  /** Cleanup resources */
  cleanup(): Promise<void>
  /** Collect performance metrics */
  collectMetrics(options?: PerformanceOptions): Promise<PerformanceMetrics>
}
/**
 * Custom type for resource timing function
 */
export type ResourceTimingFunction = (resource: string) => Promise<PerformanceResourceTiming | undefined>
