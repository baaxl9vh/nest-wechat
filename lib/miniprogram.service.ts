import axios from 'axios';

import { DefaultRequestResult, ParamCreateQRCode, SessionResult } from './interfaces';
import { WeChatModuleOptions } from './types';

export class MiniProgramService {
  constructor (private options: WeChatModuleOptions) {}

  /**
   * 登录
   * @param code 临时登录凭证
   * @param appId 小程序 appId
   * @param secret 小程序 appSecret
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
   */
  public async code2Session (code: string, appId?: string, secret?: string): Promise<SessionResult> {
    appId = appId || this.options.appId;
    secret = secret || this.options.secret;
    if (!appId || !secret) {
      throw new Error(`${MiniProgramService.name}': No appId or secret.`);
    } else {
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
      return (await axios.get<SessionResult>(url)).data;
    }
  }

  /**
   * 获取小程序码，适用于需要的码数量极多的业务场景。通过该接口生成的小程序码，永久有效，数量暂无限制。
   * @param accessToken 
   * @link https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html
   */
  public async getUnlimited (accessToken: string, params: ParamCreateQRCode) {
    const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`;
    return axios.post<DefaultRequestResult>(url, params);
  }

}
