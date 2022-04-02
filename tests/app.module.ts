import { CACHE_MANAGER, CacheModule, DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';

import { WeChatModule, RedisCache } from '../lib';

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
                host: configService.get('REDIS_HOST') || '127.0.0.1',
                port: configService.get('REDIS_PORT') || 6379,
                // eslint-disable-next-line camelcase
                // auth_pass: configService.get('REDIS_PORT') || '',
                db: 0,
                ttl: 600,
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