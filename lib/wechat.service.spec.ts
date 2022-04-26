import { XMLParser } from 'fast-xml-parser';
import { WeChatService } from './wechat.service'

describe('wechat service test', () => {

  let service: WeChatService;

  beforeAll(() => {
    service = new WeChatService({
      appId: 'wxb11529c136998cb6',
      secret: '',
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

});