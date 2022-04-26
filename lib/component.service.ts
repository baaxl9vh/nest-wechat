import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { DefaultRequestResult } from './interfaces';

import { ComponentModuleOptions } from './types';
import { ICache } from './types/utils';
import { MapCache, MessageCrypto } from './utils';

@Injectable()
export class ComponentService {

  public static KEY_TICKET = 'key_component_ticket';

  protected _cacheAdapter: ICache = new MapCache();

  public set cacheAdapter (adapter: ICache) {
    if (adapter) {
      this._cacheAdapter = adapter;
    }
  }
  public get cacheAdapter (): ICache {
    return this._cacheAdapter;
  }

  constructor (private options: ComponentModuleOptions) {
    if (options && options.cacheAdapter) {
      this.cacheAdapter = options.cacheAdapter as ICache;
    }
  }

  /**
   * 
   * 启动ticket推送服务
   * 
   * @returns 
   * @throws
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/component_verify_ticket_service.html
   */
  public async startPushTicket () {
    const url = 'https://api.weixin.qq.com/cgi-bin/component/api_start_push_ticket';
    return axios.post<DefaultRequestResult & { msgid: string }>(url, {
      // eslint-disable-next-line camelcase
      component_appid: this.options.componentAppId,
      // eslint-disable-next-line camelcase
      component_secret: this.options.componentSecret,
    });
  }

  /**
   * 
   * 请求获取令牌
   * 
   * @returns {component_access_token: '', expires_in: 7200}
   * @throws
   */
  public async requestComponentToken () {
    const ticket = await this.getTicket();
    if (!ticket) {
      throw new Error('component ticket not found');
    }
    const url = 'https://api.weixin.qq.com/cgi-bin/component/api_component_token';
    return axios.post<DefaultRequestResult & { msgid: string }>(url, {
      // eslint-disable-next-line camelcase
      component_appid: this.options.componentAppId,
      // eslint-disable-next-line camelcase
      component_appsecret: this.options.componentSecret,
      // eslint-disable-next-line camelcase
      component_verify_ticket: ticket,
    });
  }

  public getTicket () {
    return this.cacheAdapter.get<string>(ComponentService.KEY_TICKET);
  }

  public setTicket (ticket: string) {
    this.cacheAdapter.set(ComponentService.KEY_TICKET, ticket);
  }

  // 解密推送ticket
  // https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/component_verify_ticket.html

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
    return MessageCrypto.encryptMessage(this.options.componentAppId, this.options.componentToken || '', this.options.componentEncodingAESKey || '', message, timestamp, nonce);
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
    return MessageCrypto.decryptMessage(this.options.componentAppId, this.options.componentToken || '', this.options.componentEncodingAESKey || '', signature, timestamp, nonce, encryptXml);
  }



}