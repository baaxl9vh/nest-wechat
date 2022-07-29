import * as env from 'dotenv';
import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';

import { WeChatService } from './wechat.service';

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

  it('Test encrypt & decrypt message', () => {

    const timestamp = '1409304348';
    const nonce = 'xxxxxx';
    const text = '<xml><ToUserName><![CDATA[oia2Tj我是中文jewbmiOUlr6X-1crbLOvLw]]></ToUserName><FromUserName><![CDATA[gh_7f083739789a]]></FromUserName><CreateTime>1407743423</CreateTime><MsgType><![CDATA[video]]></MsgType><Video><MediaId><![CDATA[eYJ1MbwPRJtOvIEabaxHs7TX2D-HV71s79GUxqdUkjm6Gs2Ed1KF3ulAOA9H1xG0]]></MediaId><Title><![CDATA[testCallBackReplyVideo]]></Title><Description><![CDATA[testCallBackReplyVideo]]></Description></Video></xml>';

    const encryptMessage = service.encryptMessage(text, timestamp, nonce);

    const parser = new XMLParser();
    const xml = parser.parse(encryptMessage).xml;

    const encryptXml = `<xml><ToUserName><![CDATA[toUser]]></ToUserName><Encrypt><![CDATA[${xml.Encrypt}]]></Encrypt></xml>`;
    const signature = xml.MsgSignature;

    const decrypt = service.decryptMessage(signature, timestamp, nonce, encryptXml);

    expect(decrypt).toStrictEqual(text);
  });

  it('Can not get an access token', async () => {
    let ret = await service.getAccountAccessToken();
    // 40125, invalid app secret
    expect(ret.errcode).toStrictEqual(40125)
    ret = await service.getAccountAccessToken('appid', undefined);
    expect(ret.errcode).toStrictEqual(40125)
    ret = await service.getAccountAccessToken(undefined, 'secret');
    expect(ret.errcode).toStrictEqual(40125)
  });

  it('Can not get a jsapi ticket', async () => {
    expect(async () => {
      await service.getJSApiTicket();
    }).rejects.toThrowError(new Error(`${WeChatService.name}: No access token of official account.`));
  });

  it('Can not sign jsapi', async () => {
    expect(async () => {
      await service.jssdkSignature('https://www.baidu.com')
    }).rejects.toThrowError(new Error(`${WeChatService.name}: No access token of official account.`));
  });

  it('Should got an access token', async () => {
    const anotherAppId = process.env.TEST_APPID;
    const anotherSecret = process.env.TEST_SECRET;
    const ret = await service.getAccountAccessToken(anotherAppId, anotherSecret);
    expect(ret.access_token.length > 0).toBeTruthy();
    expect(ret.expires_in > 0).toBeTruthy();
  });

  it('Should got a jsapi ticket', async () => {
    const anotherAppId = process.env.TEST_APPID;
    const anotherSecret = process.env.TEST_SECRET;
    const ret = await service.getJSApiTicket(anotherAppId, anotherSecret);
    expect(ret.errcode).toStrictEqual(0);
    expect(ret.errmsg).toStrictEqual('ok');
    expect(ret.ticket.length > 0).toBeTruthy();
    expect(ret.expires_in > 0).toBeTruthy();
  });

  it('Should sign jsapi', async () => {
    const anotherAppId = process.env.TEST_APPID || '';
    const anotherSecret = process.env.TEST_SECRET || '';
    const ret = await service.jssdkSignature('https://www.baidu.com', anotherAppId, anotherSecret);
    expect(ret.appId).toStrictEqual(anotherAppId);
    expect(ret.signature.length > 0).toBeTruthy();
  });

});