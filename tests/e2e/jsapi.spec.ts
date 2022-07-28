import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import axios from 'axios';
import * as env from 'dotenv';
import { existsSync } from 'fs';
import * as path from 'path';

import { AccountAccessTokenResult, TemplateMessage, TicketResult, WeChatService } from '../../lib';
import { AppModule } from '../app.module';

jest.setTimeout(20000);

describe('jsapi', () => {

  let app: INestApplication;

  beforeEach(async () => {
    const incorrectAppId = 'incorrect app id';
    const incorrectSecret = 'incorrect secret';
    const module = await Test.createTestingModule({
      imports: [AppModule.configAppIdAndSecret(incorrectAppId, incorrectSecret)],
    }).compile();
    app = module.createNestApplication();
    app.init();
  });

  it('should NOT get access token with incorrect appid or secret', async () => {
    const service = app.get(WeChatService);
    const ret = await service.getAccountAccessToken();
    expect(ret).toHaveProperty('errcode', 40013);
  });

  it('should NOT get ticket with incorrect access token', async () => {
    const service = app.get(WeChatService);
    const incorrectToken: AccountAccessTokenResult = {
      // eslint-disable-next-line camelcase
      access_token: 'incorrect access token',
      // eslint-disable-next-line camelcase
      expires_in: Date.now() / 1000 + 10000,
    };
    service.cacheAdapter.set(`${WeChatService.KEY_ACCESS_TOKEN}_${service.config.appId}`, incorrectToken);
    const ret = await service.getJSApiTicket();
    expect(ret).toHaveProperty('errcode', 40001);
  });

  it('should GOT access token and a ticket, then do anything', async () => {
    if (process.env.NODE_ENV !== 'ci') {
      let envPath;
      for (const file of ['.env.test.local', '.env.test', '.env']) {
        envPath = path.join(process.cwd(), file);
        if (existsSync(envPath)) {
          break;
        }
      }
      expect(envPath).not.toBe(undefined);
      env.config({ path: envPath });
    }
    expect(process.env.TEST_APPID).not.toBeUndefined();
    expect(process.env.TEST_SECRET).not.toBeUndefined();
    expect(process.env.TEST_JSSDK_URL).not.toBeUndefined();
    expect(process.env.TEST_APPID).not.toEqual('');
    expect(process.env.TEST_SECRET).not.toEqual('');
    expect(process.env.TEST_JSSDK_URL).not.toEqual('');

    const service = app.get(WeChatService);
    service.config = { appId: process.env.TEST_APPID || '', secret: process.env.TEST_SECRET || ''};

    jest.spyOn(axios, 'get');

    jest.spyOn(service.cacheAdapter, 'set');
    jest.spyOn(service.cacheAdapter, 'get');

    const ret = await service.getAccountAccessToken();
    // call set to cache
    expect(service.cacheAdapter.set).toBeCalledTimes(1);
    // must got access_token
    expect(ret).toHaveProperty('access_token');
    const accessToken = ret.access_token;

    const retTicket = await service.getJSApiTicket().catch((err) => err);
    expect(retTicket).not.toBeInstanceOf(Error);
    // use access from token
    expect(service.cacheAdapter.get).toBeCalledTimes(1);

    expect(retTicket).toHaveProperty('errcode', 0);
    // must got ticket
    expect(retTicket).toHaveProperty('ticket');
    const ticket = retTicket.ticket;

    // cache must be the same
    expect(accessToken).toEqual((await service.cacheAdapter.get<AccountAccessTokenResult>(`${WeChatService.KEY_ACCESS_TOKEN}_${process.env.TEST_APPID}`)).access_token);
    expect(service.cacheAdapter.get).toBeCalledTimes(2);
    expect(ticket).toEqual((await service.cacheAdapter.get<TicketResult>(`${WeChatService.KEY_TICKET}_${process.env.TEST_APPID}`)).ticket);
    expect(service.cacheAdapter.get).toBeCalledTimes(3);

    // to sign a url and use the ticket in cache
    let sign = await service.jssdkSignature(process.env.TEST_JSSDK_URL || '').catch(err => err);

    // cache get call
    expect(service.cacheAdapter.get).toBeCalledTimes(4);

    expect(sign).toHaveProperty('appId', process.env.TEST_APPID);
    expect(sign.nonceStr).toBeTruthy();
    expect(sign.nonceStr).toBeTruthy();
    expect(sign.timestamp).toBeTruthy();
    expect(sign.signature).toBeTruthy();

    // throw error when no url
    expect(service.jssdkSignature('')).rejects.toThrowError(new Error(`${WeChatService.name}: JS-SDK signature must provide url param.`));

    // request an access token and a ticket
    expect(axios.get).toBeCalledTimes(2);

    // make the ticket and the token expire
    const ticketInCache = await service.cacheAdapter.get<TicketResult>(`${WeChatService.KEY_TICKET}_${process.env.TEST_APPID}`);
    // eslint-disable-next-line camelcase
    ticketInCache.expires_in -= 10800;
    service.cacheAdapter.set(`${WeChatService.KEY_TICKET}_${process.env.TEST_APPID}`, ticketInCache);
    const tokenInCache = await service.cacheAdapter.get<AccountAccessTokenResult>(`${WeChatService.KEY_ACCESS_TOKEN}_${process.env.TEST_APPID}`);
    // eslint-disable-next-line camelcase
    tokenInCache.expires_in -= 10800;
    service.cacheAdapter.set(`${WeChatService.KEY_ACCESS_TOKEN}_${process.env.TEST_APPID}`, tokenInCache);

    // now they are expired

    // empty the sign
    sign = {
      appId: '',
      nonceStr: '',
      timestamp: 0,
      signature: '',
    };

    sign = await service.jssdkSignature(process.env.TEST_JSSDK_URL || '');

    expect(sign).toHaveProperty('appId', process.env.TEST_APPID);
    expect(sign.nonceStr).toBeTruthy();
    expect(sign.nonceStr).toBeTruthy();
    expect(sign.timestamp).toBeTruthy();
    expect(sign.signature).toBeTruthy();

    // request call twice
    expect(axios.get).toBeCalledTimes(4);

    // eslint-disable-next-line camelcase
    ticketInCache.expires_in += 10800;
    service.cacheAdapter.set(`${WeChatService.KEY_TICKET}_${process.env.TEST_APPID}`, ticketInCache);
    // eslint-disable-next-line camelcase
    tokenInCache.expires_in += 10800;
    service.cacheAdapter.set(`${WeChatService.KEY_ACCESS_TOKEN}_${process.env.TEST_APPID}`, tokenInCache);

    // now token and ticket are valid
    const message: TemplateMessage = {
      touser: 'osMyH5vmDjG3ouh2qfSm3EItWLyk',
      // eslint-disable-next-line camelcase
      template_id: 'Kr6sFcWadMfRz_rZumNbLw-mtZ5qJEeCo3X4pdcmNAQ',
      data: {
        'TITLE': {
          value: 'This is title',
        },
      },
    };
    const msgRet = await service.sendTemplateMessage(message);
    expect(msgRet).toHaveProperty('errcode', 0);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
});