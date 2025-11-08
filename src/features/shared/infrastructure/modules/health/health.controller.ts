import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application health status' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
  })
  @ApiResponse({
    status: 503,
    description: 'Application is unhealthy',
  })
  check() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),
      // Memory health check - heap used should not exceed 1.5GB
      () => this.memory.checkHeap('memory_heap', 1500 * 1024 * 1024),
      // Memory health check - RSS should not exceed 1.5GB
      () => this.memory.checkRSS('memory_rss', 1500 * 1024 * 1024),
      // Disk health check - storage should not exceed 90% of available space
      () =>
        this.disk.checkStorage('storage', {
          thresholdPercent: 0.9,
          path: '/',
        }),
    ]);
  }

  @Get('liveness')
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness probe for Kubernetes/container orchestration',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
  })
  liveness() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }

  @Get('readiness')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness probe for Kubernetes/container orchestration',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready to accept traffic',
  })
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 1500 * 1024 * 1024),
    ]);
  }
}
