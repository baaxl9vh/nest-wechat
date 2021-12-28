import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { AccessTokenErrorResult, AccessTokenResult, AccountAccessTokenResult, OfficialAccountApi, WeChatErrorResult, WeChatServiceOptions } from '.';

@Injectable()
export class WeChatService {

  constructor (private options: WeChatServiceOptions) {
    this._accessToken = '';
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
    this._accessToken = token;
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
  public async getAccountAccessToken (): Promise<AccountAccessTokenResult | WeChatErrorResult> {
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
  public getJSApiTicket (accessToken?: string) {
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

  public async getAccessTokenByCode (code: string): Promise<AccessTokenResult | AccessTokenErrorResult> {
    if (!this.options.appId || !this.options.secret) {
      throw new Error(WeChatService.name + ': No appId or secret.');
    }
    return OfficialAccountApi.getAccessTokenByCode(this.options.appId, this.options.secret, code);
  }
}
