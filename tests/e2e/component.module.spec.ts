import { CacheModule, CACHE_MANAGER, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';

import { RedisCache } from '../../lib';
import { WeChatComponentModule } from '../../lib/component.module';
import { ComponentService } from '../../lib/component.service';


describe('Component module Test', () => {

  let service: ComponentService;
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        WeChatComponentModule.forRootAsync({
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
          inject: [CACHE_MANAGER],
          useFactory: (cache: Cache) => ({
            componentAppId: 'wxb11529c136998cb6',
            componentSecret: '',
            componentToken: 'pamtest',
            componentEncodingAESKey: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG',
            cacheAdapter: new RedisCache(cache),
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('has service', () => {
    service = app.get(ComponentService);
    expect(service).not.toBeUndefined();
  });

  afterAll(async () => {
    if (app) {
      if (service) {
        service.cacheAdapter.close();
      }
      await app.close();
    }
  });
});