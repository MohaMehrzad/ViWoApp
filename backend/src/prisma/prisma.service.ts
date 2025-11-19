import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'query', emit: 'event' },
      ],
      errorFormat: 'pretty',
    });

    // Log slow queries (> 1 second)
    this.$on('query' as never, (e: any) => {
      if (e.duration > 1000) {
        console.warn(`⚠️  Slow query detected (${e.duration}ms):`, {
          query: e.query,
          params: e.params,
          duration: `${e.duration}ms`,
        });
      }
    });

    // Log database errors
    this.$on('error' as never, (e: any) => {
      console.error('❌ Database error:', e);
    });

    // Log warnings
    this.$on('warn' as never, (e: any) => {
      console.warn('⚠️  Database warning:', e);
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected with connection pooling');
    
    // Log connection pool info in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('📊 Database connection info:', {
        datasource: this.$queryRaw`SELECT version()`,
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('👋 Database disconnected');
  }

  /**
   * Enable query logging for debugging
   */
  enableQueryLogging() {
    this.$on('query' as never, (e: any) => {
      console.log('Query:', e.query);
      console.log('Params:', e.params);
      console.log('Duration:', e.duration + 'ms');
    });
  }

  /**
   * Execute raw query with logging
   */
  async executeRaw(query: string, ...values: any[]) {
    const start = Date.now();
    try {
      const result = await this.$executeRawUnsafe(query, ...values);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        console.warn(`⚠️  Slow raw query (${duration}ms):`, query);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Raw query failed:', { query, error });
      throw error;
    }
  }

  /**
   * Check database health
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }
}

