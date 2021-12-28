import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as env from 'dotenv';
import { existsSync } from 'fs';
import * as path from 'path';

import { AccountAccessTokenResult, WeChatService } from '../../lib';
import { AppModule } from '../app.module';

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
    const ret = await service.getJSApiTicket('incorrect access token');
    expect(ret).toHaveProperty('errcode', 40001);
  });

  it('should got access token, and a ticket', async () => {
    let envPath;

    for (const file of ['.env.test.local', '.env.test', '.env']) {
      envPath = path.join(process.cwd(), file);
      if (existsSync(envPath)) {
        break;
      }
    }
    expect(envPath).not.toBe(undefined);
    env.config({ path: envPath });
    expect(process.env.TEST_APPID).not.toBeUndefined();
    expect(process.env.TEST_SECRET).not.toBeUndefined();
    expect(process.env.TEST_APPID).not.toEqual('');
    expect(process.env.TEST_SECRET).not.toEqual('');

    const service = app.get(WeChatService);
    service.config = { appId: process.env.TEST_APPID || '', secret: process.env.TEST_SECRET || ''};
    const ret = await service.getAccountAccessToken();
    expect(ret).toHaveProperty('access_token');
    expect(ret).toHaveProperty('expires_in', 7200);
    const retTicket = await service.getJSApiTicket((ret as AccountAccessTokenResult).access_token);
    expect(retTicket).toHaveProperty('errcode', 0);
    expect(retTicket).toHaveProperty('ticket');
    expect(retTicket).toHaveProperty('expires_in', 7200);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
});