import { CACHE_MANAGER, CacheModule, INestApplication, ConsoleLogger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import axios from 'axios';
import { Cache } from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { XMLParser } from 'fast-xml-parser';

import { AuthorizationResult, createNonceStr, RedisCache } from '../../lib';
import { WeChatComponentModule } from '../../lib/component.module';
import { ComponentService } from '../../lib/component.service';
import { ComponentController } from './component.controller';

jest.setTimeout(20000);

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
          inject: [ConfigService, CACHE_MANAGER],
          useFactory: (config: ConfigService, cache: Cache) => ({
            componentAppId: config.get('COMPONENT_APPID') || '',
            componentSecret: config.get('COMPONENT_APPSECRET') || '',
            componentToken: config.get('COMPONENT_TOKEN'),
            componentEncodingAESKey: config.get('COMPONENT_AESKEY'),
            cacheAdapter: new RedisCache(cache),
          }),
        }),
      ],
      controllers: [ComponentController],
    })
    .setLogger(new ConsoleLogger())
    .compile();
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
    const ticket = 'ticket_for_test_' + createNonceStr();
    const text = `<xml><AppId>some_appid</AppId><CreateTime>1413192605</CreateTime><InfoType>component_verify_ticket</InfoType><ComponentVerifyTicket>${ticket}</ComponentVerifyTicket></xml>`;
    service = app.get(ComponentService);
    const encryptXml = service.encryptMessage(text, timestamp, nonce);
    const parser = new XMLParser();
    const signature = parser.parse(encryptXml).xml.MsgSignature;

    // push ticket
    const ret = await axios.request({
      url: `http://localhost:3000/component/push_ticket?timestamp=${timestamp}&nonce=${nonce}&msg_signature=${signature}`,
      method: 'POST',
      headers: {
        'Content-Type' : 'text/plain'
      },
      data: encryptXml,
    });
    expect(ret.data).toEqual('success');

    const saveTicket = await service.getTicket();
    expect(ticket).toEqual(saveTicket);

  });

  it('auth event push', async () => {
    const timestamp = '1409304348';
    const nonce = 'xxxxxx';
    const authCode = 'code_for_test_' + createNonceStr();
    const text = `<xml><AppId>第三方平台appid</AppId><CreateTime>1413192760</CreateTime><InfoType>authorized</InfoType><AuthorizerAppid>公众号appid</AuthorizerAppid><AuthorizationCode>${authCode}</AuthorizationCode><AuthorizationCodeExpiredTime>过期时间</AuthorizationCodeExpiredTime><PreAuthCode>预授权码</PreAuthCode><xml>`;
    service = app.get(ComponentService);
    const encryptXml = service.encryptMessage(text, timestamp, nonce);
    const parser = new XMLParser();
    const signature = parser.parse(encryptXml).xml.MsgSignature;

    // push ticket
    const ret = await axios.request({
      url: `http://localhost:3000/component/auth_event?timestamp=${timestamp}&nonce=${nonce}&msg_signature=${signature}`,
      method: 'POST',
      headers: {
        'Content-Type' : 'text/plain'
      },
      data: encryptXml,
    });
    expect(ret.data).toEqual('success');

  });

  it('create pre auth code', async () => {
    // this must after push a ticket
    const mockToken = 'my_mock_token';
    const spy = jest.spyOn(axios, 'post');
    service = app.get(ComponentService);
    // remove cache first
    service.cacheAdapter.remove(ComponentService.KEY_TOKEN);
    // mock request access token
    (spy as any).mockResolvedValueOnce({ data: { component_access_token: mockToken, expires_in: 7200 } });
    // create pre auth code will request access token first, and save token to cache
    const ret = await service.createPreAuthCode();
    // 40001 access token invalid
    expect(ret.data.errcode).toEqual(40001);
    // token cached
    const token = await service.cacheAdapter.get<{ componentAccessToken: string, expiresAt: number}>(ComponentService.KEY_TOKEN);
    expect(token.componentAccessToken).toEqual(mockToken);
  });

  it('query auth', async () => {
    // this must after push a ticket
    const mockToken = 'my_mock_token';
    const spy = jest.spyOn(axios, 'post');
    service = app.get(ComponentService);
    // remove cache first
    service.cacheAdapter.remove(ComponentService.KEY_TOKEN);
    // mock request access token
    (spy as any).mockResolvedValueOnce({ data: { component_access_token: mockToken, expires_in: 7200 } });

    let ret = await service.queryAuth('my_mock_auth_code');
    // 40001 access token invalid
    expect(ret.data.errcode).toEqual(40001);
    // token cached
    const data: AuthorizationResult = {
      authorization_info: {
        authorizer_appid: 'wxf8b4f85f3a794e77',
        authorizer_access_token: 'QXjUqNqfYVH0yBE1iI_7vuN_9gQbpjfK7hYwJ3P7xOa88a89-Aga5x1NMYJyB8G2yKt1KCl0nPC3W9GJzw0Zzq_dBxc8pxIGUNi_bFes0qM',
        expires_in: 7200,
        authorizer_refresh_token: 'dTo-YCXPL4llX-u1W1pPpnp8Hgm4wpJtlR6iV0doKdY',
        func_info: [
          { funcscope_category: { id: 1 } },
          { funcscope_category: { id: 1 } },
          { funcscope_category: { id: 1 } },
        ],
      },
    };
    (spy as any).mockResolvedValueOnce({ data });
    ret = await service.queryAuth('my_mock_auth_code');
    expect(ret.data.authorization_info.authorizer_appid).toEqual(data.authorization_info.authorizer_appid);
  });

  it('get account basic info', async () => {
    service = app.get(ComponentService);
    const authorizerAccessToken = 'app_invalid_token';
    const ret = await service.getAccountBasicInfo(authorizerAccessToken);
    expect(ret.data.errcode).toEqual(40001);
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