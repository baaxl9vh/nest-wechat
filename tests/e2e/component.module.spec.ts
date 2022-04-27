import { CACHE_MANAGER, CacheModule, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import axios from 'axios';
import { Cache } from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { XMLParser } from 'fast-xml-parser';

import { RedisCache } from '../../lib';
import { WeChatComponentModule } from '../../lib/component.module';
import { ComponentService } from '../../lib/component.service';
import { ComponentController } from './component.controller.spec';


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
      controllers: [ComponentController],
    }).compile();
    app = module.createNestApplication();
    // await app.init();
    await app.listen(3000);
  });

  it('has service', () => {
    service = app.get(ComponentService);
    expect(service).not.toBeUndefined();
  });

  it('push a ticket', async () => {
    const timestamp = '1409304348';
    const nonce = 'xxxxxx';
    const ticket = 'ticket_for_test';
    const text = `<xml><AppId>some_appid</AppId><CreateTime>1413192605</CreateTime><InfoType>component_verify_ticket</InfoType><ComponentVerifyTicket>${ticket}</ComponentVerifyTicket></xml>`;
    service = app.get(ComponentService);
    const encryptXml = service.encryptMessage(text, timestamp, nonce);
    const parser = new XMLParser();
    const signature = parser.parse(encryptXml).xml.MsgSignature;

    // push ticket
    await axios.request({
      url: `http://localhost:3000/component/push_ticket?timestamp=${timestamp}&nonce=${nonce}&msg_signature=${signature}`,
      method: 'POST',
      headers: {
        'Content-Type' : 'text/plain'
      },
      data: encryptXml,
    });

    const saveTicket = await service.getTicket();
    expect(ticket).toEqual(saveTicket);

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