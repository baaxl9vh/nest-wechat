import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { createHash } from 'crypto';

import {
  AccessTokenResult,
  AccountAccessTokenResult,
  createNonceStr,
  SignatureResult,
  TicketResult,
  WeChatServiceOptions,
} from '.';
import { ICache } from './types/utils';
import { MapCache } from './utils/cache';

@Injectable()
export class WeChatService {

  public static KEY_ACCESS_TOKEN = 'key_access_token';
  public static KEY_TICKET = 'key_ticket';

  protected _cacheAdapter: ICache = new MapCache();

  public set cacheAdapter (adapter: ICache) {
    if (adapter) {
      this._cacheAdapter = adapter;
    }
  }
  public get cacheAdapter (): ICache {
    return this._cacheAdapter;
  }

  constructor (private options: WeChatServiceOptions) {
  }

  public get config () {
    return this.options;
  }
  public set config (options: WeChatServiceOptions) {
    this.options = options;
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
  public getAccountAccessToken (): Promise<AccountAccessTokenResult> {
    return new Promise((resolve, reject) => {
      if (!this.options.appId || !this.options.secret) {
        return reject(new Error(`${WeChatService.name}: No appId or secret.`));
      }
      const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.options.appId}&secret=${this.options.secret}`;
      axios.get(url).then((res) => {
        const ret = res && res.data;

        if ((ret as AccountAccessTokenResult).access_token) {
          // 正确返回
          // eslint-disable-next-line camelcase
          (ret as AccountAccessTokenResult).expires_in += (Date.now() / 1000 - 120);
          
          this.cacheAdapter.set(WeChatService.KEY_ACCESS_TOKEN, ret);
        }
        resolve(ret);
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
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (!accessToken) {
        // no param, get from cache
        const cache = await this.cacheAdapter.get<AccessTokenResult>(WeChatService.KEY_ACCESS_TOKEN);
        accessToken = cache && cache.access_token;
      }
      if (!accessToken) {
        // finally, there was no access token.
        return reject(new Error(`${WeChatService.name}: No access token of official account.`));
      }
      const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
      axios.get(url).then((res) => {
        const ret = res && res.data;
        if ((ret as TicketResult).errcode === 0) {
          // 正确返回
          // eslint-disable-next-line camelcase
          (ret as TicketResult).expires_in += (Date.now() / 1000 - 120);
          this.cacheAdapter.set(WeChatService.KEY_TICKET, ret);
        }
        resolve(ret);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  public jssdkSignature (url: string, ticket?: string): Promise<SignatureResult> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (!url) {
        return reject(new Error(`${WeChatService.name}: JS-SDK signature must provide url param.`));
      }

      if (!ticket) {
        // no ticket, get from cache
        const cache = await this.cacheAdapter.get<TicketResult>(WeChatService.KEY_TICKET);
        ticket = cache && cache.ticket;
      }

      if (!ticket) {
        // finally, there waw no ticket.
        return reject(new Error(`${WeChatService.name}: JS-SDK ticket NOT found.`));
      }
      const timestamp = Math.floor(Date.now() / 1000);
      const nonceStr = createNonceStr(16);
      const signStr = 'jsapi_ticket=' + ticket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + url;
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
    return new Promise((resolve, reject) => {
      if (!this.options.appId || !this.options.secret) {
        return reject(new Error(`${WeChatService.name}': No appId or secret.`));
      }
      const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.options.appId}&secret=${this.options.secret}&code=${code}&grant_type=authorization_code`;
      axios.get(url).then((res) => {
        resolve(res.data);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}
