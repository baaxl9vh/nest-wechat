import { Injectable } from '@nestjs/common';
import { ComponentModuleOptions } from './types';

@Injectable()
export class ComponentService {

  constructor (private options: ComponentModuleOptions) {}

  // 解密推送ticket
  // https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/component_verify_ticket.html

  public decryptMessage (encryptXml: string, timestamp: string, nonce: string, signature: string) {
    console.log(encryptXml);
    console.log(timestamp);
    console.log(nonce);
    console.log(signature);
  }

  public encryptMessage () {
    console.log();
  }

  // ticket
  // $timeStamp = $request->input('timestamp');
  //           $nonce = $request->input('nonce');
  //           $msg_sign = $request->input('msg_signature');
  //           $simxml = str2xml2arr($text);
  //           $format = "<xml><ToUserName><![CDATA[toUser]]></ToUserName><Encrypt><![CDATA[%s]]></Encrypt></xml>";
  //           $from_xml = sprintf($format, $simxml['Encrypt']);
  //           @$wxBizMsgCrypt = new \wxBizMsgCrypt(self::TOKEN, self::ENCODING_AES_KEY, self::APP_ID);
  //           $msg = '';
  //           $errCode = $wxBizMsgCrypt->decryptMsg($msg_sign, $timeStamp, $nonce, $from_xml, $msg);

  // 获取令牌
  // https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/component_access_token.html

  // 获取预授权码
  // https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/pre_auth_code.html

  // 使用授权码获取授权信息
  // https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/authorization_info.html
  // 步骤五、管理员授权确认之后，授权页会自动跳转进入回调 URI，并在 URL 参数中返回授权码和过期时间(redirect_url?auth_code=xxx&expires_in=600)。
  
  // 获取/刷新接口调用令牌
  // https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/api_authorizer_token.html

  // 获取授权帐号详情
  // https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/api_get_authorizer_info.html



}