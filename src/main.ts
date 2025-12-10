import { NestFactory, Reflector } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from 'src/app.module';
import {
  createFastifyAdapter,
  fastifyCookieOptions,
  fastifyCorsOptions,
  fastifyListenOptions,
  fastifyMultipartOptions,
  fastifyStaticOptions,
} from 'src/config/fastify';
import { ConfigService } from '@nestjs/config';
import { SingleLokiLogger } from 'src/libs/logger';
import { EnvConfig } from 'src/config/common/types';
import { API_PREFIX, ENVIRONMENT, IS_LOCAL } from 'src/common/constants';
import { FastifySerializerInterceptor } from 'src/common/interceptors';
import { setupGracefulShutdown } from 'src/common/lifecycle';
import fastifyStatic from '@fastify/static';
import { IoAdapter } from '@nestjs/platform-socket.io';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';

export let httpServer: NestFastifyApplication;

async function bootstrap(): Promise<void> {
  httpServer = await NestFactory.create<NestFastifyApplication>(AppModule, createFastifyAdapter());
  const configService = httpServer.get(ConfigService<EnvConfig>);

  httpServer.enableCors(fastifyCorsOptions());
  httpServer.enableShutdownHooks();
  httpServer.useGlobalInterceptors(new FastifySerializerInterceptor(httpServer.get(Reflector)));
  httpServer.setGlobalPrefix(API_PREFIX);
  await httpServer.register(fastifyStatic, fastifyStaticOptions());
  await httpServer.register(fastifyMultipart, {
    ...fastifyMultipartOptions(),
  });
  await httpServer.register(fastifyCookie, fastifyCookieOptions());

  httpServer.useWebSocketAdapter(new IoAdapter(httpServer));

  await httpServer.listen({
    port: configService.getOrThrow<number>('APP_PORT'),
    ...fastifyListenOptions(),
  });

  SingleLokiLogger.log(
    `You can access server on "${configService.getOrThrow<string>('APP_URL')}:${configService.getOrThrow<number>('APP_PORT')}/${API_PREFIX}"` +
      `\nCurrent Environment: ${ENVIRONMENT}`,
  );

  if (!IS_LOCAL) {
    setupGracefulShutdown(httpServer);
  }
}

void bootstrap();
