import { CACHE_MANAGER, CacheModule, ConsoleLogger, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import axios, { AxiosError } from 'axios';
import { Cache } from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';

import { createNonceStr, MessageCrypto, RedisCache, WeChatModule, WeChatService } from '../../lib';
import { WeChatController } from './wechat.controller';
import { XMLParser } from 'fast-xml-parser';

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

  it('checkSignatureExpress:signature', async () => {
    service = app.get(WeChatService);
    const token = service.config.token;
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = createNonceStr(16);
    const signature = MessageCrypto.sha1(token || 'no_token', timestamp.toString(), nonce);
    const echostr = createNonceStr(16);
    const ret = await axios.get('http://localhost:3000/wechat/push', { params: { signature, timestamp, nonce, echostr }});
    expect(ret.data).toStrictEqual(echostr);
  });

  it('messagePushExpressHandler:msg_signature', async () => {
    const appId = 'wx32c6fa6269c54232';
    const token = 'a5sVBWaQBXCqG2dovPI4eEyclPckuuFg';
    const aes = 'zVxrPPDLVhsxOrH7M7CroV5oboPWvhakGtYaj20aqJs';
    service = app.get(WeChatService);
    service.config.token = token;
    service.config.encodingAESKey = aes;
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = createNonceStr(16);
    const text = `<xml><ToUserName><![CDATA[test]]></ToUserName><FromUserName><![CDATA[test]]></FromUserName><CreateTime>1710344037408</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[test]]></Content><MsgId>1</MsgId></xml>`;
    const encryptMessage = service.encryptMessage(text, timestamp.toString(), nonce);
    const parser = new XMLParser();
    const xml = parser.parse(encryptMessage).xml;
    const signature = xml.MsgSignature;
    const encryptXml = `<xml><ToUserName><![CDATA[toUser]]></ToUserName><Encrypt><![CDATA[${xml.Encrypt}]]></Encrypt></xml>`;
    const ret = await axios.post(`http://localhost:3000/wechat/push?msg_signature=${signature}&timestamp=${timestamp}&nonce=${nonce}`, encryptXml, {
      headers: {
        "Content-Type": "text/plain"
      },
    });
    expect(ret.data).toStrictEqual('');
  });

  it('messagePushExpressHandler:signature', async () => {
    const appId = 'wx32c6fa6269c54232';
    const token = 'a5sVBWaQBXCqG2dovPI4eEyclPckuuFg';
    const aes = 'zVxrPPDLVhsxOrH7M7CroV5oboPWvhakGtYaj20aqJs';
    service = app.get(WeChatService);
    service.config.token = token;
    service.config.encodingAESKey = aes;
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = createNonceStr(16);
    const text = `<xml><ToUserName><![CDATA[test]]></ToUserName><FromUserName><![CDATA[test]]></FromUserName><CreateTime>1710344037408</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[test]]></Content><MsgId>1</MsgId></xml>`;
    const encryptMessage = service.encryptMessage(text, timestamp.toString(), nonce);
    const parser = new XMLParser();
    const xml = parser.parse(encryptMessage).xml;
    const signature = xml.MsgSignature;
    const encryptXml = `<xml><ToUserName><![CDATA[toUser]]></ToUserName><Encrypt><![CDATA[${xml.Encrypt}]]></Encrypt></xml>`;
    const ret = await axios.post(`http://localhost:3000/wechat/push?signature=${signature}&timestamp=${timestamp}&nonce=${nonce}`, encryptXml, {
      headers: {
        "Content-Type": "text/plain"
      },
    });
    expect(ret.data).toStrictEqual('');
  });

  it('messagePushExpressHandler:signature incorrect', async () => {
    const appId = 'wx32c6fa6269c54232';
    const token = 'a5sVBWaQBXCqG2dovPI4eEyclPckuuFg';
    const aes = 'zVxrPPDLVhsxOrH7M7CroV5oboPWvhakGtYaj20aqJs';
    service = app.get(WeChatService);
    service.config.token = token;
    service.config.encodingAESKey = aes;
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = createNonceStr(16);
    const text = `<xml><ToUserName><![CDATA[test]]></ToUserName><FromUserName><![CDATA[test]]></FromUserName><CreateTime>1710344037408</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[test]]></Content><MsgId>1</MsgId></xml>`;
    const encryptMessage = service.encryptMessage(text, timestamp.toString(), nonce);
    const parser = new XMLParser();
    const xml = parser.parse(encryptMessage).xml;
    // const signature = xml.MsgSignature;
    const signature = 'incorrect';
    const encryptXml = `<xml><ToUserName><![CDATA[toUser]]></ToUserName><Encrypt><![CDATA[${xml.Encrypt}]]></Encrypt></xml>`;
    try {
      const ret = await axios.post(`http://localhost:3000/wechat/push?signature=${signature}&timestamp=${timestamp}&nonce=${nonce}`, encryptXml, {
        headers: {
          "Content-Type": "text/plain"
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      expect((error as AxiosError).response?.status).toStrictEqual(500);
    }
  });

  it('messagePushExpressHandler:no signature', async () => {
    const appId = 'wx32c6fa6269c54232';
    const token = 'a5sVBWaQBXCqG2dovPI4eEyclPckuuFg';
    const aes = 'zVxrPPDLVhsxOrH7M7CroV5oboPWvhakGtYaj20aqJs';
    service = app.get(WeChatService);
    service.config.token = token;
    service.config.encodingAESKey = aes;
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = createNonceStr(16);
    const text = `<xml><ToUserName><![CDATA[test]]></ToUserName><FromUserName><![CDATA[test]]></FromUserName><CreateTime>1710344037408</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[test]]></Content><MsgId>1</MsgId></xml>`;
    const encryptMessage = service.encryptMessage(text, timestamp.toString(), nonce);
    const parser = new XMLParser();
    const xml = parser.parse(encryptMessage).xml;
    const encryptXml = `<xml><ToUserName><![CDATA[toUser]]></ToUserName><Encrypt><![CDATA[${xml.Encrypt}]]></Encrypt></xml>`;
    try {
      const ret = await axios.post(`http://localhost:3000/wechat/push?timestamp=${timestamp}&nonce=${nonce}`, encryptXml, {
        headers: {
          "Content-Type": "text/plain"
        },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      expect((error as AxiosError).response?.status).toStrictEqual(500);
    }
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