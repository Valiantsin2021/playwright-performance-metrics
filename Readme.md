# Playwright Performance Metrics

A comprehensive performance metrics collector for Playwright tests. Collect and analyze web vital metrics, network timing, and resource usage in your Playwright tests.

## Features

- Collect Web Vitals (LCP, FID, CLS)
- Network timing metrics (TTFB, resource timing)
- Network condition emulation (3G, 4G, WiFi)
- Resource usage tracking
- TypeScript support
- Easy integration with Playwright tests

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
- `startMark`: Performance mark to use as start time
- `endMark`: Performance mark to use as end time
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