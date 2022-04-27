import { XMLParser } from 'fast-xml-parser';

import { ComponentService } from './component.service';

describe('component service test', () => {

  let component: ComponentService;

  beforeAll(() => {
    component = new ComponentService({
      componentAppId: 'wxb11529c136998cb6',
      componentSecret: '',
      componentToken: 'pamtest',
      componentEncodingAESKey: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG',
    });

  });

  it('Test encrypt & decrypt message', () => {

    const timestamp = '1409304348';
    const nonce = 'xxxxxx';
    const text = '<xml><ToUserName><![CDATA[oia2Tj我是中文jewbmiOUlr6X-1crbLOvLw]]></ToUserName><FromUserName><![CDATA[gh_7f083739789a]]></FromUserName><CreateTime>1407743423</CreateTime><MsgType><![CDATA[video]]></MsgType><Video><MediaId><![CDATA[eYJ1MbwPRJtOvIEabaxHs7TX2D-HV71s79GUxqdUkjm6Gs2Ed1KF3ulAOA9H1xG0]]></MediaId><Title><![CDATA[testCallBackReplyVideo]]></Title><Description><![CDATA[testCallBackReplyVideo]]></Description></Video></xml>';

    const encryptMessage = component.encryptMessage(text, timestamp, nonce);

    const parser = new XMLParser();
    const xml = parser.parse(encryptMessage).xml;

    const encryptXml = `<xml><ToUserName><![CDATA[toUser]]></ToUserName><Encrypt><![CDATA[${xml.Encrypt}]]></Encrypt></xml>`;
    const signature = xml.MsgSignature;

    const decrypt = component.decryptMessage(signature, timestamp, nonce, encryptXml);

    expect(decrypt).toStrictEqual(text);
  });

  it('Test start push ticket', async () => {
    const service = new ComponentService({
      componentAppId: 'wxb11529c136998cb6',
      componentSecret: '',
      componentToken: 'pamtest',
      componentEncodingAESKey: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG',
    });
    const ret = await service.startPushTicket();
    expect(ret.data).toBeDefined();
    // 41004 no secret
    expect(ret.data.errcode).toEqual(41004);
  });

  it('Test get access token', async () => {
    const service = new ComponentService({
      componentAppId: 'wxb11529c136998cb6',
      componentSecret: 'xxxxxx',
      componentToken: 'pamtest',
      componentEncodingAESKey: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG',
    });
    service.setTicket('ticket');
    const ret = await service.requestComponentToken();
    expect(ret.data).toBeDefined();
    // 40125 invalid appsecret rid
    expect(ret.data.errcode).toEqual(40125);
  });

});