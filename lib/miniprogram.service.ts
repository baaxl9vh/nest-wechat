import { Logger, Req, Res } from '@nestjs/common';
import axios from 'axios';

import { DefaultRequestResult, ParamCreateQRCode, PhoneNumberResult, SessionResult } from './interfaces';
import { WeChatModuleOptions } from './types';

import type { Request, Response } from 'express';
import { MessageCrypto } from './utils';

export class MiniProgramService {

  private readonly logger = new Logger(MiniProgramService.name);

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
    appId = appId || this.options?.appId;
    secret = secret || this.options?.secret;
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

  /**
   * 获取手机号
   * @param {string} accessToken 小程序调用token，第三方可通过使用authorizer_access_token代商家进行调用
   * @param {string} code 手机号获取凭证，小程序端获取
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-info/phone-number/getPhoneNumber.html
   * @link https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html
   */
  public async getPhoneNumber (code: string, accessToken: string) {
    const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
    return axios.post<PhoneNumberResult>(url, { code });
  }

  /**
   * 小程序消息推送配置时，推送处理方法
   * @param req Express.Request
   * @param res Express.Response，当res有传时，会调用send响应微信服务器
   * @param token 小程序token，默认使用service实例化时的token，
   * @returns string | false 验证通过时，返回echostr，验证不通过时，返回false
   * @link https://developers.weixin.qq.com/miniprogram/dev/framework/server-ability/message-push.html
   */
  public verifyMessagePush (@Req() req: Request, @Res() res: Response, token?: string) {
    token = token || this.options?.token;
    this.logger.debug(`verifyMessagePush() token = ${token}`);
    this.logger.debug(`verifyMessagePush() query = ${JSON.stringify(req.query)}`);
    const signature = (req.query && req.query.signature) || '';
    const timestamp = (req.query && req.query.timestamp) || '';
    const nonce = (req.query && req.query.nonce) || '';
    const echostr = (req.query && req.query.echostr) || '';
    const my = MessageCrypto.sha1(token || '', timestamp as string, nonce as string);
    if (my === signature) {
      if (res && typeof res.send === 'function') {
        res.send(echostr);
      }
      return echostr;
    } else {
      if (res && typeof res.send === 'function') {
        res.send('fail');
      }
      return false;
    }
  }
}
