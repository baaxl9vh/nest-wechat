import { CACHE_MANAGER, CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';

import { RedisCache, WeChatModule } from '../../lib';
import { WeChatController } from './wechat.controller';

@Module({
  imports: [
    WeChatModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.test.local', '.env.test'],
        }),
        CacheModule.registerAsync({
          isGlobal: true,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            store: redisStore,
            host: configService.get('REDIS_HOST') || '127.0.0.1',
            port: configService.get('REDIS_PORT') || 6379,
            db: 0,
            ttl: 600,
          }),
        }),
      ],
      inject: [ConfigService, CACHE_MANAGER],
      useFactory: (config: ConfigService, cache: Cache) => ({
        appId: config.get('TEST_APPID') || '',
        secret: config.get('TEST_SECRET') || '',
        token: config.get('TEST_TOKEN'),
        encodingAESKey: config.get('TEST_AESKEY'),
        cacheAdapter: new RedisCache(cache),
        debug: true,
      }),
    }),
  ],
  controllers: [WeChatController],
})
export default class WeChatAppModule {

}