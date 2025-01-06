<h1 align="center">playwright-performance-metrics</h1>
</p>
<p align="center">
   <a href="https://github.com/Valiantsin2021/playwright-performance-metrics/tags/"><img src="https://img.shields.io/github/tag/Valiantsin2021/playwright-performance-metrics" alt="playwwright-performance versions" /></a>
   <a href="https://www.npmjs.com/package/playwright-performance-metrics"><img alt="playwright-performance-metrics available on NPM" src="https://img.shields.io/npm/dy/playwright-performance-metrics"></a>
   <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs are welcome" /></a>
   <a href="https://github.com/Valiantsin2021/playwright-performance-metrics/issues/"><img src="https://img.shields.io/github/issues/Valiantsin2021/playwright-performance-metrics" alt="playwright-performance-metrics issues" /></a>
   <img src="https://img.shields.io/github/stars/Valiantsin2021/playwright-performance-metrics" alt="playwright-performance-metrics stars" />
   <img src="https://img.shields.io/github/forks/Valiantsin2021/playwright-performance-metrics" alt="playwright-performance-metrics forks" />
   <img src="https://img.shields.io/github/license/Valiantsin2021/playwright-performance-metrics" alt="playwright-performance-metrics license" />
   <a href="https://GitHub.com/Valiantsin2021/playwright-performance-metrics/graphs/commit-activity"><img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="playwright-performance-metrics is maintained" /></a>
   <a href="https://github.com/Valiantsin2021/playwright-performance-metrics"><img src="https://img.shields.io/badge/Author-Valentin%20Lutchanka-blue" alt="playwright-performance-metrics author" /></a>
   <a href="https://github.com/Valiantsin2021/playwright-performance-metrics/actions/workflows/ci.yml"><img src="https://github.com/Valiantsin2021/playwright-performance-metrics/actions/workflows/ci.yml/badge.svg?branch=main" alt="playwright-performance-metrics ci tests" /></a>
</p>

---

A comprehensive performance metrics collector for Playwright tests. Collect and analyze web vital metrics, network timing, and resource usage in your Playwright tests.

## Features

- Collect Web Vitals (LCP, FID, CLS)
- Network timing metrics (TTFB, resource timing)
- Network condition emulation (3G, 4G, WiFi)
- Resource usage tracking
- TypeScript support
- Easy integration with Playwright tests

## Concept

The playwright-performance-metrics plugin introduces a powerful way to measure and assert on web performance metrics directly in your Playwright tests. Unlike traditional end-to-end testing that focuses on functionality, this plugin enables teams to catch performance regressions early and maintain high performance standards through automated testing.

This plugin does not have external dependencies.

**Comparison with playwright-lighthouse**

Both plugins focus on performance testing, but they serve different purposes:

**playwright-performance-metrics**

- **Real-time metrics** during test execution
- **Lower overhead** - no need for separate Lighthouse runs
- **Less configuration** - minimal setup required for basic usage
- **Specific metric focus** - [Core Web Vitals](https://www.hostinger.com/tutorials/core--web-vitals) and key timings
- **Test integration** - natural fit in existing test flows
- **Retry capability** - built-in retriability mechanisms to ensure the metrics are collected
- **Resource timing** - detailed resource-level metrics
- **Total bytes** - size of all resources
- **Time to first byte** - detailed time to first byte metrics

**playwright-lighthouse**

- **Comprehensive audits** including SEO, accessibility
- **Scoring system** aligned with Lighthouse
- **Static analysis** of best practices
- **Recommendations** for improvements
- **Performance simulation** under various conditions
- **Broader metrics** beyond just performance

**Key Features**

- Real-time performance metrics collection during test execution
- Built-in retry mechanisms for reliable measurements
- Support for Core Web Vitals and other key performance indicators
- Seamless integration with existing Playwright tests
- Type definitions for TypeScript support
- Configurable thresholds and timing options

The collectMetrics returns the object containing the collected performance metrics:

```
  PerformanceMetrics {
      pageloadTiming: number
      domCompleteTiming: number | null
      resourceTiming: (resource: string) => PerformanceResourceTiming | undefined
      largestContentfulPaint: number
      totalBlockingTime: number
      paint: { firstContentfulPaint: number; firstPaint: number }
      cumulativeLayoutShift: number
      totalBytes: number
      timeToFirstByte: {
        total: number
        redirect: number
        dns: number
        connection: number
        tls: number
        wait: number
      }
    }
```

**Available Metrics**

| **Metric** | **Description** | **Typical Threshold** |
| --- | --- | --- |
| largestContentfulPaint | Time until largest content element is visible | < 2500ms |
| totalBlockingTime | Sum of blocking time for long tasks | < 300ms |
| cumulativeLayoutShift | Measure of visual stability | < 0.1 |
| paint.firstContentfulPaint | Time until first meaningful content appears | < 1800ms |
| paint.firstPaint | Time until first pixel is painted | < 1000ms |
| pageloadTiming | Total page load time | < 3000ms |
| domCompleteTiming | Time until DOM is fully loaded | < 2500ms |
| resourceTiming | Time until resource is fully loaded | < 500ms |
| totalBytes | Size of all resources | < 1.5 MB |
| timeToFirstByte.total | Time to first byte | < 500ms |
| timeToFirstByte.dns | DNS time | < 20ms |
| timeToFirstByte.wait | Wait time | < 50ms |
| timeToFirstByte.redirect | Redirect time | < 50ms |
| timeToFirstByte.tls | TLS time | < 50ms |
| timeToFirstByte.connection | Connection time | < 50ms |

## Installation

```bash
npm install -D playwright-performance-metrics
```

## Usage

Basic usage:

```typescript
import { test } from '@playwright/test';
import { PerformanceMetricsCollector } from 'playwright-performance-metrics';

test('measure page performance', async ({ page }) => {
  const collector = new PerformanceMetricsCollector(page);
  
  await page.goto('https://example.com');
  
  const metrics = await collector.collectMetrics({
    timeout: 10000,
    initialDelay: 1000
  });
  
  console.log('Performance metrics:', {
    'First Paint': metrics.paint?.firstPaint,
    'First Contentful Paint': metrics.paint?.firstContentfulPaint,
    'Largest Contentful Paint': metrics.largestContentfulPaint,
    'Cumulative Layout Shift': metrics.cumulativeLayoutShift
  });
});
```

With network emulation:

```typescript
import { DefaultNetworkPresets } from 'playwright-performance-metrics';

test('measure performance with slow 3G', async ({ page }) => {
  const collector = new PerformanceMetricsCollector(page);
  
  const metrics = await collector.collectMetrics({
    networkConditions: DefaultNetworkPresets.SLOW_3G,
    timeout: 30000
  });
  
  console.log('Slow 3G metrics:', metrics);
});
```

## API Reference

### PerformanceMetricsCollector

Main class for collecting performance metrics.

#### Constructor

```typescript
constructor(page: Page)
```

#### Methods

##### collectMetrics(options?: PerformanceOptions): Promise<PerformanceMetrics>

Collects performance metrics from the page.

Options:
- `timeout`: Collection timeout in milliseconds
- `initialDelay`: Initial delay before starting collection
- `retryTimeout`: Maximum time to retry collecting metrics
- `networkConditions`: Network conditions to emulate

### Network Presets

Available network presets:
- `REGULAR_4G`
- `SLOW_3G`
- `FAST_WIFI`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details