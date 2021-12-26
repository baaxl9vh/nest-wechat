import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WeChatService } from '../../lib';

import { AppModule } from '../app.module';

describe('Official Account', () => {
  
  let app: INestApplication;

  const appId = 'appId-test';
  const secret = 'secret-test';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule.configAppIdAndSecret(appId, secret)],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('should appId equal to appId which provided by user', () => {
    const service = app.get(WeChatService);
    expect(typeof service).not.toBe(undefined);
    expect(service.config.appId).toEqual(appId);
    expect(service.config.secret).toEqual(secret);
  });

  it('should used a invalid appid', async () => {
    const service = app.get(WeChatService);
    const ret = await service.getAccessTokenByCode('code');
    expect(ret).toHaveProperty('errcode', 40013);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

});