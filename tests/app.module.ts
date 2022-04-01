import { CACHE_MANAGER, CacheModule, DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';

import { WeChatModule } from '../lib';
import RedisCache from './utils/redis.cache';

@Module({})
export class AppModule {

  public static configAppIdAndSecret (appId: string, secret: string): DynamicModule {
    return {
      module: AppModule,
      imports: [WeChatModule.register({appId, secret})],
    };
  }

  public static injectConfigModule (): DynamicModule {
    return {
      module: AppModule,
      imports: [
        WeChatModule.forRoot({
          imports: [
            ConfigModule.forRoot({
              envFilePath: '.env.test.local',
            }),
            CacheModule.registerAsync({
              isGlobal: true,
              imports: [ConfigModule],
              useFactory: async (configService: ConfigService) => ({
                store: redisStore,
                host: configService.get('REDIS_HOST'),
                port: configService.get('REDIS_PORT'),
                // eslint-disable-next-line camelcase
                auth_pass: configService.get('REDIS_PASSWORD'),
                db: configService.get('REDIS_DB'),
                ttl: configService.get('REDIS_TTL'),
              }),
              inject: [ConfigService],
            }),
          ],
          inject: [ConfigService, CACHE_MANAGER],
          useFactory: (configService: ConfigService, cache: Cache) => ({
            appId: configService.get('TEST_APPID') || '',
            secret: configService.get('TEST_SECRET') || '',
            token: configService.get('TEST_TOKEN'),
            encodingAESKey: configService.get('TEST_AESKEY'),
            cacheAdapter: new RedisCache(cache),
          }),
        }),
      ],
    };
  }

}