import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  private readonly dbTimeout: number;

  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly configService: ConfigService,
  ) {
    // Get database health check timeout from environment variable (default: 10000ms)
    this.dbTimeout = this.configService.get<number>(
      'HEALTH_CHECK_DB_TIMEOUT',
      10000,
    );
  }

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
      // Database health check with configurable timeout
      () =>
        this.db.pingCheck('database', {
          timeout: this.dbTimeout,
        }),
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
    return this.health.check([
      () =>
        this.db.pingCheck('database', {
          timeout: this.dbTimeout,
        }),
    ]);
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
      () =>
        this.db.pingCheck('database', {
          timeout: this.dbTimeout,
        }),
      () => this.memory.checkHeap('memory_heap', 1500 * 1024 * 1024),
    ]);
  }
}
