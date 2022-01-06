import { Test } from '@nestjs/testing';
import { WeChatService } from '../../lib';
import { MessageCrypto } from '../../lib/utils';
import { AppModule } from '../app.module';

describe('Test Message Crypto', () => {

  it('Should get a sha1 signature', () => {

    const token = 'this_a_test_token_this_a_test_token';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = MessageCrypto.createNonceStr();
    const echo = 'echo string';
    const sha1 = MessageCrypto.sha1(token, timestamp, nonce, echo);
    expect(sha1).toBeTruthy();
    expect(sha1.length).toEqual(40);
  });

  it('Should origin text equal to the decrypt text', async () => {

    const module = await Test.createTestingModule({
      imports: [AppModule.injectConfigModule()],
    }).compile();

    const app = module.createNestApplication();
    const service = app.get(WeChatService);

    service.config.appId = 'wxb11529c136998cb6';
    const text = '<xml><ToUserName><![CDATA[oia2Tj我是中文jewbmiOUlr6X-1crbLOvLw]]></ToUserName><FromUserName><![CDATA[gh_7f083739789a]]></FromUserName><CreateTime>1407743423</CreateTime><MsgType><![CDATA[video]]></MsgType><Video><MediaId><![CDATA[eYJ1MbwPRJtOvIEabaxHs7TX2D-HV71s79GUxqdUkjm6Gs2Ed1KF3ulAOA9H1xG0]]></MediaId><Title><![CDATA[testCallBackReplyVideo]]></Title><Description><![CDATA[testCallBackReplyVideo]]></Description></Video></xml>'

    const decryptText = service.decryptMessage(service.encryptMessage(text));

    expect(text).toEqual(decryptText);


    await app.close();

  });

});