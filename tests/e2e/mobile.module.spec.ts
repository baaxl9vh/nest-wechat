import { ConsoleLogger, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { MobileService, WeChatMobileModule } from '../../lib';

jest.setTimeout(40000);

describe('', () => {

  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        WeChatMobileModule.register(),
      ],
    })
    .setLogger(new ConsoleLogger())
    .compile();
    app = module.createNestApplication();
    // await app.init();
    await app.listen(3000);
  });

  it('invalid appid', async () => {
    const service = app.get(MobileService);
    const ret = await service.getAccessToken('this is your code', 'this is your mobile app id', 'this is your mobile app secret');
    expect(ret.data.errcode).toStrictEqual(40013);
  });

  it('invalid refresh_token', async () => {
    const service = app.get(MobileService);
    const ret = await service.refreshAccessToken('wxb11529c136998cb6', 'this is your refresh token');
    expect(ret.data.errcode).toStrictEqual(40030);
  });

  it('invalid credential', async () => {
    const service = app.get(MobileService);
    const ret = await service.checkAccessToken('this is your open id', 'this is your access token');
    expect(ret.data.errcode).toStrictEqual(40001);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});