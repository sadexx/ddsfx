import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { typeOrmConfig } from 'typeorm.config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { loadEnv } from 'src/config/env';
import { MetricsMiddleware } from 'src/common/middlewares/metrics.middleware';
import { GlobalExceptionFilter } from 'src/common/filters';
import { HttpLoggingInterceptor, HttpRequestDurationInterceptor } from 'src/common/interceptors';
import { AppInitializerModule } from 'src/libs/app-initializer/app-initializer.module';
import { RedisModule } from 'src/libs/redis/redis.module';
import { TokensModule } from 'src/libs/tokens/tokens.module';
import { GuardsModule } from 'src/libs/guards/guards.module';
import { HashingModule } from 'src/libs/hashing/hashing.module';
import { TemporalStateModule } from 'src/libs/temporal-state/temporal-state.module';
import { CustomPrometheusModule } from 'src/libs/prometheus/prometheus.module';
import { HealthModule } from 'src/libs/health/health.module';
import { HttpClientModule } from 'src/libs/http-client/http-client.module';
import { QueueConsumerBridgeModule } from 'src/libs/queues/queue-consumer-bridge/queue-consumer-bridge.module';
import { QueueModule } from 'src/libs/queues/queue/queues.module';
import { QueueConsumerModule } from 'src/libs/queues/queue-consumer/queue-consumer.module';
import { QueueProducerModule } from 'src/libs/queues/queue-producer/queue-producer.module';
import { OpenSearchModule } from 'src/libs/opensearch/opensearch.module';
import { AwsConfigModule } from 'src/libs/aws/config/aws-config.module';
import { AwsEndUserMessagingModule } from 'src/libs/aws/end-user-messaging/aws-end-user-messaging.module';
import { WebSocketGatewayModule } from 'src/modules/web-socket-gateway/web-socket-gateway.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { OtpModule } from 'src/modules/otp/otp.module';
import { SettingsModule } from 'src/modules/settings/settings.module';
import { SearchEngineLogicModule } from 'src/modules/search-engine-logic/search-engine-logic.module';
import { UsersModule } from 'src/modules/users/users.module';

const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  ignoreEnvFile: false,
  ignoreEnvVars: true,
  envFilePath: ['.env'],
  load: [loadEnv],
};

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    TypeOrmModule.forRoot(typeOrmConfig as TypeOrmModuleOptions),
    AppInitializerModule,
    RedisModule,
    TokensModule,
    GuardsModule,
    HashingModule,
    TemporalStateModule,
    QueueConsumerBridgeModule,
    QueueModule,
    QueueConsumerModule,
    QueueProducerModule,
    CustomPrometheusModule,
    HealthModule,
    HttpClientModule,
    WebSocketGatewayModule,
    OpenSearchModule,
    AwsConfigModule,
    AwsEndUserMessagingModule,
    AuthModule,
    OtpModule,
    SettingsModule,
    SearchEngineLogicModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpRequestDurationInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MetricsMiddleware).forRoutes('*splat');
  }
}
