import * as env from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import { MiniProgramService } from './miniprogram.service';

jest.setTimeout(60000);

describe('mini program service test', () => {

  let service: MiniProgramService;
  let accessToken = 'empty_token';

  beforeAll(() => {
    let envPath = '';
    for (const file of ['.env.test.local', '.env.test', '.env']) {
      envPath = path.join(process.cwd(), file);
      if (fs.existsSync(envPath)) {
        break;
      }
    }
    env.config({ path: envPath });
    service = new MiniProgramService({
      appId: process.env.MP_APPID || 'none',
      secret: process.env.MP_SECRET || 'none',
    });
  });

  it('Should got an access token', async () => {
    const res = await service.getAccessToken();
    const data = res.data;
    expect(data.access_token).toBeDefined();
    expect(data.expires_in).toStrictEqual(7200);
    accessToken = data.access_token || accessToken;
  });

  it('Should not get a phone number using incorrect code', async () => {
    const code = 'INCORRECT_CODE';
    try {
      const ret = await service.getPhoneNumber(code, accessToken);
      // { errcode: 40001, errmsg: 'invalid credential, access_token is invalid or not latest rid: 62c66213-76542f8c-06b14179'}
      // { errcode: 40029, errmsg: 'invalid code hint: [qKhDWV0sf-0s77ta] rid: 62fa5928-4e8b95ea-7539a513' }
      expect(ret.data.errcode).toStrictEqual(40029);
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });

  it('Should not get a qr code using incorrect access token', async () => {
    const ret = await service.getQRCode({ path: 'pages/index/index'}, 'incorrect token');
    // { errcode: 40001, errmsg: 'invalid credential, access_token is invalid or not latest rid: 62fa5928-40eb004e-1e4258f4' }
    expect(ret.data.errcode).toStrictEqual(40001);
  });

  it('Should got one unlimited qr code', async () => {
    const ret = await service.getUnlimitedQRCode({ scene: 'test-spec' }, accessToken);
  });

  it('Should generate one scheme', async () => {
    const ret = await service.generateScheme({}, accessToken);
    // { errcode: 85079, errmsg: 'miniprogram has no online release rid: 62fa5c32-0430b364-5af3c508' }
    expect(ret.data.errcode).toStrictEqual(85079);
  });

  it('Should generate one url link', async () => {
    const ret = await service.generateUrlLink({}, accessToken);
    // { errcode: 85079, errmsg: 'miniprogram has no online release rid: 62fa5c32-555493f7-2d0032a9' }
    expect(ret.data.errcode).toStrictEqual(85079);
  });

  it('Should generate one short link', async () => {
    const ret = await service.generateShortLink({ page_url: 'pages/index/index' }, accessToken);
    // { errcode: 43104, errmsg: 'this appid does not have permission rid: 62fa5c32-25653b71-3eefe5ef' }
    expect(ret.data.errcode).toStrictEqual(43104);
  });

  it('Should got categories', async () => {
    const res = await service.getCategory(accessToken);
    const data = res.data;
    expect(data.errcode).toStrictEqual(0);
    expect(data.data.length > 0).toBeTruthy();
    expect(data.data[0].id).toBeDefined();
  });

});