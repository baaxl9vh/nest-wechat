import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import axios from 'axios';

import { WeChatService } from '../../lib';
import { AppModule } from '../app.module';

describe('Test module register', () => {

  let app: INestApplication;
  let service: WeChatService;

  it('Should register module with config', async () => {

    const module = await Test.createTestingModule({
      imports: [AppModule.injectConfigModule()],
    }).compile();

    app = module.createNestApplication();
    service = app.get(WeChatService);

    // spy 几个关键方法
    jest.spyOn(axios, 'get');
    jest.spyOn(service.cacheAdapter, 'set');
    jest.spyOn(service.cacheAdapter, 'get');

    expect(service.cacheAdapter.remove(`${WeChatService.KEY_TICKET}_${service.config.appId}`)).toBeTruthy();
    expect(service.cacheAdapter.remove(`${WeChatService.KEY_ACCESS_TOKEN}_${service.config.appId}`)).toBeTruthy();

    // to sign a url and use the ticket in cache
    let sign = await service.jssdkSignature(process.env.TEST_JSSDK_URL || '').catch(err => err);

    // cache get call
    expect(sign).toHaveProperty('appId', process.env.TEST_APPID);
    expect(sign.nonceStr).toBeTruthy();
    expect(sign.nonceStr).toBeTruthy();
    expect(sign.timestamp).toBeTruthy();
    expect(sign.signature).toBeTruthy();

    expect(service.cacheAdapter.get).toBeCalledTimes(2);
    expect(service.cacheAdapter.set).toBeCalledTimes(2);
    expect(axios.get).toBeCalledTimes(1);

    // 再次签名，读缓存，不再发请求，只读一次ticket缓存
    sign = await service.jssdkSignature(process.env.TEST_JSSDK_URL || '').catch(err => err);
    expect(service.cacheAdapter.get).toBeCalledTimes(3);
    expect(service.cacheAdapter.set).toBeCalledTimes(2);
    expect(axios.get).toBeCalledTimes(1);


    await app.close();
  });

  afterEach(async () => {
    if (app) {
      if (service) {
        service.cacheAdapter.close();
      }
      await app.close();
    }
  });

});