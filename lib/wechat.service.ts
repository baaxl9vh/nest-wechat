import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createHash } from 'crypto';

import {
  AccountAccessTokenResult,
  AccountCreateQRCode,
  AccountCreateQRCodeResult,
  createNonceStr,
  DefaultRequestResult,
  MessageCrypto,
  SignatureResult,
  TemplateMessage,
  TicketResult,
  UserAccessTokenResult,
  WeChatModuleOptions,
} from '.';
import { MiniProgramService } from './miniprogram.service';
import { ICache } from './types/utils';
import { MapCache } from './utils/cache';
import { WePayService } from './wepay.service';

@Injectable()
export class WeChatService {

  private readonly logger = new Logger(WeChatService.name);

  /**
   * key_access_token
   * @static
   * @memberof WeChatService
   */
  public static KEY_ACCESS_TOKEN = 'key_access_token';
  /**
   * key_ticket
   * @static
   * @memberof WeChatService
   */
  public static KEY_TICKET = 'key_ticket';

  protected _cacheAdapter: ICache = new MapCache();

  /**
   * MiniProgram Service Namespace
   *
   * @type {MiniProgramService}
   * @memberof WeChatService
   */
  public mp: MiniProgramService;

  /**
   * WePay Service Namespace
   * @type {WePayService}
   * @memberof WeChatService
   */
  public pay: WePayService;

  public set cacheAdapter (adapter: ICache) {
    if (adapter) {
      this._cacheAdapter = adapter;
    }
  }
  public get cacheAdapter (): ICache {
    return this._cacheAdapter;
  }

  constructor (private options: WeChatModuleOptions) {
    this.mp = new MiniProgramService(options);
    this.pay = new WePayService();
    if (options && options.cacheAdapter) {
      this.cacheAdapter = options.cacheAdapter as ICache;
    }
  }

  /**
   *
   * @deprecated
   * @memberof WeChatService
   */
  public get config () {
    return this.options;
  }
  
  /**
   * @deprecated
   * @memberof WeChatService
   */
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
   * @param _appId 
   * @param _secret 
   * @tutorial https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html
   * @returns 
   */
  public async getAccountAccessToken (_appId?: string, _secret?: string): Promise<AccountAccessTokenResult> {
    const { appId, secret } = this.chooseAppIdAndSecret(_appId, _secret);
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`;
    const res = await axios.get<AccountAccessTokenResult>(url);
    const ret = res && res.data;
    this.logger.debug(`请求公众号或者小程序access_token:[errcode=${ret.errcode}][errmsg=${ret.errmsg}]`);
    if (ret.access_token) {
      // eslint-disable-next-line camelcase
      ret.expires_in += (Math.floor(Date.now() / 1000) - 120);
      if (this.cacheAdapter) {
        this.logger.debug(`保存access_token到缓存[${WeChatService.KEY_ACCESS_TOKEN}_${appId}]`);
        this.cacheAdapter.set(`${WeChatService.KEY_ACCESS_TOKEN}_${appId}`, ret, 7100);
      }
    }
    return ret;
  }

  /**
   * 
   * # 获取稳定版接口调用凭据
   * 
   * ## 功能描述
   * 
   * + 获取公众号全局后台接口调用凭据，有效期最长为7200s，开发者需要进行妥善保存；
   * + 有两种调用模式: 1. 普通模式，access_token 有效期内重复调用该接口不会更新 access_token，绝大部分场景下使用该模式；2. 强制刷新模式，会导致上次获取的 access_token 失效，并返回新的 access_token；
   * + 该接口调用频率限制为 1万次 每分钟，每天限制调用 50w 次；
   * + 与获取Access token获取的调用凭证完全隔离，互不影响。该接口仅支持 POST JSON 形式的调用；
   * 
   * @param _appId 
   * @param _secret 
   * @tutorial https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/getStableAccessToken.html
   * @returns 
   */
  public async getStableAccessToken (_appId?: string, _secret?: string, force = false): Promise<AccountAccessTokenResult> {
    const { appId, secret } = this.chooseAppIdAndSecret(_appId, _secret);
    const url = 'https://api.weixin.qq.com/cgi-bin/stable_token';
    const data = {
      // eslint-disable-next-line camelcase
      grant_type: 'client_credential',
      appid: appId,
      secret,
      // eslint-disable-next-line camelcase
      force_refresh: force,
    };
    const res = await axios.post<AccountAccessTokenResult>(url, data);
    const ret = res && res.data;
    this.logger.debug(`请求公众号或者小程序access_token:[errcode=${ret.errcode}][errmsg=${ret.errmsg}]`);
    if (ret.access_token) {
      // eslint-disable-next-line camelcase
      ret.expires_in += (Math.floor(Date.now() / 1000) - 120);
      if (this.cacheAdapter) {
        this.logger.debug(`保存access_token到缓存[${WeChatService.KEY_ACCESS_TOKEN}_${appId}]`);
        this.cacheAdapter.set(`${WeChatService.KEY_ACCESS_TOKEN}_${appId}`, ret, 7100);
      }
    }
    return ret;
  }

  /**
   * 读取access token的逻辑封装
   * 
   * @param _appId 
   * @param _secret 
   * @returns 
   */
  private async getToken (_appId?: string, _secret?: string): Promise<string | undefined> {
    let accessToken;
    const { appId, secret } = this.chooseAppIdAndSecret(_appId, _secret);
    const cache = await this.cacheAdapter.get<AccountAccessTokenResult>(`${WeChatService.KEY_ACCESS_TOKEN}_${appId}`);
    if (!this.checkAccessToken(cache)) {
      const ret = await this.getStableAccessToken(appId, secret);
      if (ret && ret.access_token) {
        accessToken = ret.access_token;
      }
    } else {
      accessToken = cache.access_token;
    }
    return accessToken;
  }

  /**
   * 
   * 读取JS-SDK Ticket逻辑封装
   * 
   * @param _appId 
   * @param _secret 
   * @returns 
   */
  private async getTicket (_appId?: string, _secret?: string): Promise<string> {
    let ticket = '';
    const { appId, secret } = this.chooseAppIdAndSecret(_appId, _secret);
    const cache = await this.cacheAdapter.get<TicketResult>(`${WeChatService.KEY_TICKET}_${appId}`);
    if (!this.checkTicket(cache)) {
      // expire, request a new ticket
      const ret = await this.getJSApiTicket(appId, secret);
      if (ret && ret.errcode === 0) {
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
   * @param _appId 
   * @param _secret 
   * @returns 
   */
  public async getJSApiTicket (_appId?: string, _secret?: string): Promise<TicketResult> {

    const { appId, secret } = this.chooseAppIdAndSecret(_appId, _secret);
    const accessToken = await this.getToken(appId, secret);

    if (!accessToken) {
      // finally, there was no access token.
      throw new Error(`${WeChatService.name}: No access token of official account.`);
    }

    const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
    const ret = await axios.get<TicketResult>(url);
    if (ret.data.errcode === 0) {
      // eslint-disable-next-line camelcase
      ret.data.expires_in += (Math.floor(Date.now() / 1000) - 120);
      if (this.cacheAdapter) {
        this.cacheAdapter.set(`${WeChatService.KEY_TICKET}_${appId}`, ret.data, 7100);
      }
    }
    return ret.data;
  }

  /**
   * 
   * 对URL进行权限签名
   * sign a url
   * 
   * @param {String} url url for signature
   * @throws {Error}
   * @link https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
   */
  public async jssdkSignature (url: string): Promise<SignatureResult>;
  /**
   * 
   * 对URL进行权限签名
   * sign a url
   * 
   * @param {String} url 
   * @param {String} appId 
   * @param {String} secret 
   * @throws {Error}
   * @link https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
   */
  public async jssdkSignature (url: string, appId: string, secret:string): Promise<SignatureResult>;
  public async jssdkSignature (url: string, _appId?: string, _secret?: string): Promise<SignatureResult> {

    if (!url) {
      throw new Error(`${WeChatService.name}: JS-SDK signature must provide url param.`);
    }

    const { appId, secret } = this.chooseAppIdAndSecret(_appId, _secret);
    const ticket = await this.getTicket(appId, secret);

    if (!ticket) {
      // finally, there waw no ticket.
      throw new Error(`${WeChatService.name}: JS-SDK could NOT get a ticket.`);
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = createNonceStr(16);
    const signStr = 'jsapi_ticket=' + ticket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + url;
    const signature = createHash('sha1').update(signStr).digest('hex');
    return {
      appId,
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

  private chooseAppIdAndSecret (appId?: string, secret?: string): { appId: string, secret: string} {
    let ret;
    if (!appId || !secret) {
      ret = { appId: this.options?.appId, secret: this.options?.secret };
    } else {
      ret = { appId, secret };
    }
    if (!ret.appId || !ret.secret) {
      throw new Error(`${WeChatService.name}: No appId or secret.`);
    }
    return ret;
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
   * @param {String} code 
   * @param {String} appId 
   * @param {String} secret 
   * @returns 
   * @tutorial https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#1
   */
  public async getAccessTokenByCode (code: string, _appId?: string, _secret?: string): Promise<UserAccessTokenResult> {
    const { appId, secret } = this.chooseAppIdAndSecret(_appId, _secret);
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${secret}&code=${code}&grant_type=authorization_code`;
    const ret = await axios.get<UserAccessTokenResult>(url);
    return ret.data;
  }

  /**
   * 
   * 公众号向用户发送模板消息
   * 
   * @param message 
   * @returns 
   * @tutorial https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html#5
   */
  public async sendTemplateMessage (message: TemplateMessage, appId?: string, secret?: string): Promise<DefaultRequestResult & { msgid: string }> {
    const token = await this.getToken(appId, secret);
    const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`;
    const ret = await axios.post<DefaultRequestResult & { msgid: string }>(url, message);
    return ret.data;
  }

  /**
   * 生成带参数的二维码
   * @param data 
   * @param appId 
   * @param secret 
   * @returns 
   * @tutorial https://developers.weixin.qq.com/doc/offiaccount/Account_Management/Generating_a_Parametric_QR_Code.html
   */
  public async createQRCode (data: AccountCreateQRCode, appId?: string, secret?: string): Promise<AccountCreateQRCodeResult> {
    const token = await this.getToken(appId, secret);
    const url = `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${token}`;
    const ret = await axios.post<AccountCreateQRCodeResult>(url, data);
    return ret.data;
  }

  /**
   * 通过ticket换取二维码
   * 
   * 参数TICKET记得进行UrlEncode
   * 
   * @param ticket 需要UrlEncode
   * @returns 
   */
  public showQRCode (ticket: string) {
    const url = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${ticket}`;
    return axios.get<Buffer>(url, { responseType: 'arraybuffer' });
  }

  /**
   * 
   * 消息加密
   * 
   * @param message 明文消息
   * @param timestamp 时间戳
   * @param nonce 随机字符串
   * @returns XML格式字符串 <xml><Encrypt></Encrypt><MsgSignature></MsgSignature><TimeStamp></TimeStamp><Nonce></Nonce></xml>
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Technical_Plan.html
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Message_encryption_and_decryption.html
   */
  public encryptMessage (message: string, timestamp: string, nonce: string): string {
    return MessageCrypto.encryptMessage(this.config.appId, this.config.token || '', this.config.encodingAESKey || '', message, timestamp, nonce);
  }

  /**
   * 
   * 消息解密
   * 
   * @param signature 签名
   * @param timestamp 时间戳
   * @param nonce 随机字符串
   * @param encryptXml 加密消息XML字符串
   * @returns 消息明文内容
   * @see WeChatService#encryptMessage
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Technical_Plan.html
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Message_encryption_and_decryption.html
   * 
   */
  public decryptMessage (signature: string, timestamp: string, nonce: string, encryptXml: string) {
    return MessageCrypto.decryptMessage(this.config.token || '', this.config.encodingAESKey || '', signature, timestamp, nonce, encryptXml);
  }
}
