import * as env from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import { WeChatService } from './wechat.service';

jest.setTimeout(120000);

describe('wechat service test', () => {

  let service: WeChatService;

  beforeAll(() => {
    let envPath = '';
    for (const file of ['.env.test.local', '.env.test', '.env']) {
      envPath = path.join(process.cwd(), file);
      if (fs.existsSync(envPath)) {
        break;
      }
    }
    env.config({ path: envPath });

    service = new WeChatService({
      appId: 'wxb11529c136998cb6',
      secret: 'secret',
      token: 'pamtest',
      encodingAESKey: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG',
    });

  });

  it('Should got user info', async () => {
    /**
     * 在微信开发者式具构造如下链接，得到code
     * https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx32c6fa6269c54232&redirect_uri=http%3A%2F%2F192.168.1.24%3A3000%2F&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect
     */
    const anotherAppId = process.env.TEST_APPID;
    const anotherSecret = process.env.TEST_SECRET;
    const ret = await service.getAccessTokenByCode('code/that/got/from/wechat/devtool', anotherAppId, anotherSecret);
    expect(ret.access_token.length > 0).toBeTruthy();
    expect(ret.expires_in > 0).toBeTruthy();
    const user = await service.getUserInfo(ret.access_token, ret.openid);
    expect(user.openid).toBeDefined();
  });

});