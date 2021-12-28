import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { createHash } from 'crypto';

import { AccessTokenResult, AccountAccessTokenResult, createNonceStr, SignatureResult, TicketResult, WeChatServiceOptions } from '.';

@Injectable()
export class WeChatService {

  constructor (private options: WeChatServiceOptions) {
    this._accessToken = '';
    this._jssdkTicket = '';
  }

  public get config () {
    return this.options;
  }
  public set config (options: WeChatServiceOptions) {
    this.options = options;
  }

  protected _accessToken: string;

  public get accessToken () {
    return this._accessToken;
  }

  public set accessToken (token: string) {
    if (token) {
      this._accessToken = token;
    }
  }
  
  protected _jssdkTicket: string;

  public get jssdkTicket () {
    return this._jssdkTicket;
  }

  public set jssdkTicket (ticket: string) {
    if (ticket) {
      this._jssdkTicket = ticket;
    }
  }

  /**
   * 
   * 获取公众号或者小程序Access token
   * 
   * 正确返回
   * 
   * {"access_token": "52_s0Mcl3E3DBKs12rthjxG8_DOvsIC4puV9A34WQR6Bhb_30TW9W9BjhUxDRkyph-hY9Ab2QS03Q8wZBe5UkA1k0q0hc17eUDZ7vAWItl4iahnhq_57dCoKc1dQ3AfiHUKGCCMJ2NcQ0BmbBRIKBEgAAAPGJ", "expires_in": 7200}
   * 
   * 错误返回
   * {"errcode":40013,"errmsg":"invalid appid"}
   * 
   * @tutorial https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html
   * @returns 
   */
  public async getAccountAccessToken (): Promise<AccountAccessTokenResult> {
    if (!this.options.appId || !this.options.secret) {
      throw new Error(WeChatService.name + ': No appId or secret.');
    }
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.options.appId}&secret=${this.options.secret}`;
    return new Promise((resolve, reject) => {
      axios.get(url).then((res) => {
        resolve(res.data);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * 
   * 获取jsapi_ticket
   * 
   * 成功返回
   * {"errcode":0, "errmsg":"ok", "ticket":"bxLdikRXVbTPdHSM05e5u5sUoXNKd8-41ZO3MhKoyN5OfkWITDGgnr2fwJ0m9E8NYzWKVZvdVtaUgWvsdshFKA", "expires_in":7200}
   * 错误返回
   * 
   * @tutorial https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
   * @param accessToken 
   * @returns 
   */
  public async getJSApiTicket (accessToken?: string): Promise<TicketResult> {
    if (!accessToken && this.accessToken) {
      accessToken = this.accessToken;
    }
    if (!accessToken) {
      throw new Error(WeChatService.name + ': No access token of official account.');
    }
    const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
    return new Promise((resolve, reject) => {
      axios.get(url).then((res) => {
        resolve(res.data);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  public async jssdkSignature (url: string): Promise<SignatureResult> {
    return new Promise((resolve, reject) => {     
      if (!url) {
        return reject(new Error(`${WeChatService.name}: JS-SDK signature must provide url param.`));
      }
      if (!this.jssdkTicket) {
        return reject(new Error(`${WeChatService.name}: JS-SDK ticket NOT found.`));
      }
      const timestamp = Math.floor(Date.now() / 1000);
      const nonceStr = createNonceStr(16);
      const signStr = 'jsapi_ticket=' + this.jssdkTicket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + url;
      const signature = createHash('sha1').update(signStr).digest('hex');
      resolve({
        appId: this.options.appId,
        nonceStr,
        timestamp,
        signature,
      });
    });
  }

  /**
   * 
   * 通过code换取网页授权access_token
   * 
   * 正确返回
   * 
   * {
   * 
   *   "access_token":"ACCESS_TOKEN",
   * 
   *   "expires_in":7200,
   * 
   *   "refresh_token":"REFRESH_TOKEN",
   * 
   *   "openid":"OPENID",
   * 
   *   "scope":"SCOPE" 
   * 
   * }
   * 
   * 错误返回
   * 
   * {"errcode":40029,"errmsg":"invalid code"}
   * 
   * {"errcode":40013,"errmsg":"iinvalid appid, rid: 61c82e61-2e62fb72-467cb9ec"}
   * 
   * @param code 
   * @param code 
   * @returns 
   * @tutorial https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#1
   */
  public async getAccessTokenByCode (code: string): Promise<AccessTokenResult> {
    if (!this.options.appId || !this.options.secret) {
      throw new Error(WeChatService.name + ': No appId or secret.');
    }
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.options.appId}&secret=${this.options.secret}&code=${code}&grant_type=authorization_code`;
    return new Promise((resolve, reject) => {
      axios.get(url).then((res) => {
        resolve(res.data);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}
