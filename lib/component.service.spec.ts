import { ComponentService } from './component.service'

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

  it('Test decryptMessage()', () => {

    
    const timestamp = '1409304348';
    const nonce = 'xxxxxx';
    const text = '<xml><ToUserName><![CDATA[oia2Tj我是中文jewbmiOUlr6X-1crbLOvLw]]></ToUserName><FromUserName><![CDATA[gh_7f083739789a]]></FromUserName><CreateTime>1407743423</CreateTime><MsgType><![CDATA[video]]></MsgType><Video><MediaId><![CDATA[eYJ1MbwPRJtOvIEabaxHs7TX2D-HV71s79GUxqdUkjm6Gs2Ed1KF3ulAOA9H1xG0]]></MediaId><Title><![CDATA[testCallBackReplyVideo]]></Title><Description><![CDATA[testCallBackReplyVideo]]></Description></Video></xml>';

    

    // const signature = '';
    // const decryptXml = '<xml><AppId><![CDATA[wx20667cbc33329909]]></AppId><Encrypt><![CDATA[hmII4NKAKrzvNI5jqdknt7F+4KGz9MACIlh2MP2JQKROXJz254aikqkWHaaAnAo/q7QKrfArojMCIeguoZyquJz8+1mUZ80XegPKKaAH3qGb4+U0HNR6oCjHKP2Jpywznsa/uceQC4VL/vdfJy2qd+mXqq2+z/jR1TTfC+ouEMX4Zi8oPTcuzmHWnP7tU7A3/SGwlYYWfvrBb++KtDflzfqObOxJsu9uLFm+kF11GQfIi1xOqb9jGrGScQZ1spLEcjKvwkZriU/70wO6T/o41H/MT4ygo2fKqEiMVBW0NG6j9CB7Hpb0sSxRUA7qa3mRuXcAIpUBmcHn9xknO0nwy2uT+XBpVCXOTeHSyW/bmRBHQmw3vuJ26KXVity2jFYWmoDcQXdcgujlAvakXZj8aoRHpHdeEmze3NfbhktOyAyYv9Oe95GOSPkWL83EQFiUHGHMTFkVX7LevsBGmXq2zw==]]></Encrypt></xml>';
    // const message = component.decryptMessage(decryptXml, timestamp, nonce, signature);

  });

});