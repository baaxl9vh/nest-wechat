import { CACHE_MANAGER, CacheModule, ConsoleLogger, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import axios from 'axios';
import { Cache } from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';

import { createNonceStr, MessageCrypto, RedisCache, WeChatModule, WeChatService } from '../../lib';
import { WeChatController } from './wechat.controller';

jest.setTimeout(120000);

describe('WeChat Module Test', () => {

  let service: WeChatService;
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
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
          }),
        }),
      ],
      controllers: [WeChatController],
    })
    .setLogger(new ConsoleLogger('', { logLevels: ['debug', 'warn', 'error']}))
    .compile();
    app = module.createNestApplication();
    // await app.init();
    await app.listen(3000);
  });

  it('verifyMessagePush', async () => {
    service = app.get(WeChatService);
    const token = service.config.token;
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = createNonceStr(16);
    const signature = MessageCrypto.sha1(token || 'no_token', timestamp.toString(), nonce);
    const echostr = createNonceStr(16);
    const ret = await axios.get('http://localhost:3000/wechat/mp_push', { params: { signature, timestamp, nonce, echostr }});
    expect(ret.data).toStrictEqual(echostr);
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