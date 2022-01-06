import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { createHash } from 'crypto';

import {
  AccountAccessTokenResult,
  createNonceStr,
  DefaultRequestResult,
  MessageCrypto,
  SignatureResult,
  TemplateMessage,
  TicketResult,
  UserAccessTokenResult,
  WeChatModuleOptions,
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

  constructor (private options: WeChatModuleOptions) {
  }

  public get config () {
    return this.options;
  }
  public set config (options: WeChatModuleOptions) {
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
  public async getAccountAccessToken (): Promise<AccountAccessTokenResult> {
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
   * 实例读取access token的逻辑封装
   * 
   * @returns 
   */
  private async getToken (): Promise<string | undefined> {
    let accessToken;

    // get token from cache
    const cache = await this.cacheAdapter.get<AccountAccessTokenResult>(WeChatService.KEY_ACCESS_TOKEN);

    if (!this.checkAccessToken(cache)) {
      // expire, request a new one.
      const ret = await this.getAccountAccessToken();
      if (!(ret instanceof Error) && ret.access_token) {
        // got
        accessToken = ret.access_token;
      }
    } else {
      accessToken = cache.access_token;
    }
    return accessToken;
  }

  private async getTicket (): Promise<string | undefined> {
    let ticket;
    const cache = await this.cacheAdapter.get<TicketResult>(WeChatService.KEY_TICKET);
    if (!this.checkTicket(cache)) {
      // expire, request a new ticket
      const ret = await this.getJSApiTicket();
      if (!(ret instanceof Error) && ret.errcode === 0) {
        ticket = ret.ticket;
      }
    } else {
      ticket = cache.ticket;
    }
    return ticket;
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
  public async getJSApiTicket (): Promise<TicketResult | Error> {
    const accessToken = await this.getToken();
    if (!accessToken) {
      // finally, there was no access token.
      return new Error(`${WeChatService.name}: No access token of official account.`);
    }
    try {
      const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
      const ret = await axios.get<TicketResult>(url);
      if (ret.data.errcode === 0) {
        // eslint-disable-next-line camelcase
        (ret.data as TicketResult).expires_in += (Date.now() / 1000 - 120);
        this.cacheAdapter.set(WeChatService.KEY_TICKET, ret.data);
      }
      return ret.data;
    } catch (error) {
      return (error as Error);
    }
  }

  /**
   * 
   * 对URL进行签名
   * 
   * sign a url
   * 
   * @param url url for signature
   * @returns 
   */
  public async jssdkSignature (url: string): Promise<SignatureResult | Error> {

    if (!url) {
      return new Error(`${WeChatService.name}: JS-SDK signature must provide url param.`);
    }

    const ticket = await this.getTicket();

    if (!ticket) {
      // finally, there waw no ticket.
      return new Error(`${WeChatService.name}: JS-SDK could NOT get a ticket.`);
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = createNonceStr(16);
    const signStr = 'jsapi_ticket=' + ticket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + url;
    const signature = createHash('sha1').update(signStr).digest('hex');
    return {
      appId: this.options.appId,
      nonceStr,
      timestamp,
      signature,
    };
  }

  /**
   * 
   * Check token saved in the cache
   * 
   * @param token 
   * @returns 
   */
  private checkAccessToken (token: AccountAccessTokenResult): boolean {
    return token && token.expires_in > (Date.now() / 1000);
  }

  /**
   * 
   * Check ticket saved in the cache
   * 
   * @param ticket 
   * @returns 
   */
  private checkTicket (ticket: TicketResult): boolean {
    return ticket && ticket.expires_in > (Date.now() / 1000);
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
  public async getAccessTokenByCode (code: string): Promise<UserAccessTokenResult | Error> {
    if (!this.options.appId || !this.options.secret) {
      return new Error(`${WeChatService.name}': No appId or secret.`);
    } else {
      const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.options.appId}&secret=${this.options.secret}&code=${code}&grant_type=authorization_code`;
      try {
        const ret = await axios.get<UserAccessTokenResult>(url);
        return ret.data;
      } catch (error) {
        return (error as Error);
      }
    }
  }

  /**
   * 
   * 公众号向用户发送模板消息
   * 
   * @param message 
   * @returns 
   * @tutorial https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html#5
   */
  public async sendTemplateMessage (message: TemplateMessage): Promise<DefaultRequestResult & { msgid: string } | Error> {
    const token = await this.getToken();
    const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`;
    try {
      const ret = await axios.post<DefaultRequestResult & { msgid: string }>(url, message);
      return ret.data;
    } catch (error) {
      return (error as Error);
    }
  }

  public encryptMessage (msg: string): string {
    const aesKey = MessageCrypto.getAESKey(this.config.encodingAESKey || '');
    const iv = MessageCrypto.getAESKeyIV(aesKey);
    return MessageCrypto.encrypt(aesKey, iv, msg, this.config.appId);
  }

  public decryptMessage (encryptMsg: string) {
    const aesKey = MessageCrypto.getAESKey(this.config.encodingAESKey || '');
    const iv = MessageCrypto.getAESKeyIV(aesKey);
    return MessageCrypto.decrypt(aesKey, iv, encryptMsg, this.config.appId);
  }
}
