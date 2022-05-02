import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import getRawBody from 'raw-body';

import { AuthorizationResult, AuthorizerInfo, AuthorizerListResult, DefaultRequestResult, SubmitAuditItemList } from './interfaces';
import { ComponentModuleOptions } from './types';
import { ICache } from './types/utils';
import { MapCache, MessageCrypto } from './utils';

import type { Request, Response } from 'express';

@Injectable()
export class ComponentService {

  private readonly logger = new Logger(ComponentService.name);

  public static KEY_TICKET = 'key_component_ticket';
  public static KEY_TOKEN = 'key_component_access_token';

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
   * 对微信第三方平台推送ticket的请求进行处理，
   * 收到请求后，直接返回success，并从请求URL
   * 参数和text body读取ticket加密数据进行解
   * 密，解密后返回ticket并将其保存至cache。
   * 
   * @param req 
   * @param res 
   * @returns 
   * @throws
   */
  public async pushTicket (req: Request, res?: Response): Promise<string> {

    const timestamp = req.query && req.query.timestamp;
    const nonce = req.query && req.query.nonce;
    const signature = req.query && req.query.msg_signature;

    const rawBody = await getRawBody(req);

    let ticket = '';

    if (timestamp && nonce && signature && rawBody) {
      const decrypt = this.decryptMessage(signature as string, timestamp as string, nonce as string, rawBody.toString());
      const parser = new XMLParser();
      const xml = parser.parse(decrypt).xml;
      const componentVerifyTicket = xml.ComponentVerifyTicket;
      this.setTicket(componentVerifyTicket);
      ticket = componentVerifyTicket;
    }

    if (res && typeof res.send === 'function') {
      res.send('success');
    }
    return ticket;
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
    return axios.post<DefaultRequestResult>(url, {
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
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/component_access_token.html
   */
  public async requestComponentToken () {
    const ticket = await this.getTicket();
    const url = 'https://api.weixin.qq.com/cgi-bin/component/api_component_token';
    return axios.post<DefaultRequestResult & { component_access_token: string, expires_in: number }>(url, {
      // eslint-disable-next-line camelcase
      component_appid: this.options.componentAppId,
      // eslint-disable-next-line camelcase
      component_appsecret: this.options.componentSecret,
      // eslint-disable-next-line camelcase
      component_verify_ticket: ticket,
    });
  }

  /**
   * 
   * 获取预授权码
   * 
   * @returns 
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/pre_auth_code.html
   */
  public async createPreAuthCode () {
    const token = await this.getComponentAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/component/api_create_preauthcode?component_access_token=${token.componentAccessToken}`;
    return axios.post<DefaultRequestResult & { pre_auth_code: string, expires_in: number }>(url, {
      // eslint-disable-next-line camelcase
      component_appid: this.options.componentAppId,
    });
  }

  /**
   * 
   * 使用授权码获取授权信息
   * 
   * 管理员授权确认之后，授权页会自动跳转进入回调 URI，并在 URL 参数中返回授权码和过期时间(redirect_url?auth_code=xxx&expires_in=600)。
   * 
   * @param authCode 
   * @returns 
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/authorization_info.html
   */
  public async queryAuth (authCode: string) {
    const token = await this.getComponentAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/component/api_query_auth?component_access_token=${token.componentAccessToken}`;
    return axios.post<DefaultRequestResult & AuthorizationResult>(url, {
      // eslint-disable-next-line camelcase
      component_appid: this.options.componentAppId,
      // eslint-disable-next-line camelcase
      authorization_code: authCode,
    });
  }

  /**
   * 获取/刷新接口调用令牌
   * @param authorizerAppId 
   * @param authorizerRefreshToken 
   * @returns 
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/api_authorizer_token.html
   */
  public async requestAuthorizerToken (authorizerAppId: string, authorizerRefreshToken: string) {
    const token = await this.getComponentAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/component/api_authorizer_token?component_access_token=${token.componentAccessToken}`;
    return axios.post<DefaultRequestResult & { authorizer_access_token: string, expires_in: number, authorizer_refresh_token: string }>(url, {
      // eslint-disable-next-line camelcase
      component_appid: this.options.componentAppId,
      // eslint-disable-next-line camelcase
      authorizer_appid: authorizerAppId,
      // eslint-disable-next-line camelcase
      authorizer_refresh_token: authorizerRefreshToken,
    });
  }

  /**
   * 获取授权帐号详情
   * @param authorizerAppId 
   * @returns 
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/api_get_authorizer_info.html
   */
  public async requestAuthorizerInfo (authorizerAppId: string) {
    const token = await this.getComponentAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/component/api_get_authorizer_info?component_access_token=${token.componentAccessToken}`;
    return axios.post<DefaultRequestResult & AuthorizerInfo>(url, {
      // eslint-disable-next-line camelcase
      component_appid: this.options.componentAppId,
      // eslint-disable-next-line camelcase
      authorizer_appid: authorizerAppId,
    });
  }

  /**
   * 
   * 授权变更通知推送
   * 
   * @param req 
   * @param res 
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/authorize_event.html
   */
  public async authChangedPush<T> (req: Request, res: Response): Promise<T> {
    const timestamp = req.query && req.query.timestamp;
    const nonce = req.query && req.query.nonce;
    const signature = req.query && req.query.msg_signature;
    const rawBody = await getRawBody(req);
    let xml;
    if (timestamp && nonce && signature && rawBody) {
      try {
        const decrypt = this.decryptMessage(signature as string, timestamp as string, nonce as string, rawBody.toString());
        const parser = new XMLParser();
        xml = parser.parse(decrypt).xml;
      } catch (error) {
        this.logger.error((error as Error).message);
      }
    }
    res.send('success');
    return xml;
  }

  /**
   * 
   * 清空api的调用quota
   * errcode = 0, ok, 查询成功
   * errcode = 48006, forbid to clear quota because of reaching the limit, 一个月10次的机会用完了
   * errcode = 400130, invalid appid, appid写错了；或者填入的appid与access_token代表的账号的appid不一致
   * @param authorizerAppId 
   * @param authorizerAccessToken 
   * @returns DefaultRequestResult
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/openApi/clear_quota.html
   */
  public async clearQuota (authorizerAppId: string, authorizerAccessToken: string) {
    const url = `https://api.weixin.qq.com/cgi-bin/clear_quota?access_token=${authorizerAccessToken}`;
    return axios.post<DefaultRequestResult>(url, {
      // eslint-disable-next-line camelcase
      appid: authorizerAppId,
    });
  }

  /**
   * 查询rid信息
   * @param rid 
   * @param authorizerAccessToken 
   * @returns 
   * @linkc https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/openApi/get_rid_info.html
   */
  public async getRid (rid: string, authorizerAccessToken: string) {
    const url = `https://api.weixin.qq.com/cgi-bin/openapi/rid/get?access_token=${authorizerAccessToken}`;
    return axios.post<DefaultRequestResult>(url, {
      rid,
    });
  }

  // ========== 授权方账号管理 ==========

  public async getAuthorizerList (offset = 0, count = 100) {
    const token = await this.getComponentAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/openapi/rid/get?access_token=${token.componentAccessToken}`;
    return axios.post<DefaultRequestResult & AuthorizerListResult>(url, {
      // eslint-disable-next-line camelcase
      component_appid: this.options.componentAppId,
      offset,
      count,
    });
  }

  // ========== 授权方账号管理 ==========

  // ========== 小程序基础信息设置 ==========

  public async getAccountBasicInfo (authorizerAccessToken: string) {
    const url = `https://api.weixin.qq.com/cgi-bin/account/getaccountbasicinfo?access_token=${authorizerAccessToken}`;
    return axios.get<DefaultRequestResult>(url);
  }

  // ========== 小程序基础信息设置 ==========

  // ========== 小程序代码管理 ==========

  /**
   * 上传小程序代码并生成体验版
   * @param authorizerAccessToken 
   * @param templateId 
   * @param extJson 
   * @param userVersion 
   * @param userDesc 
   * @returns 
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/code/commit.html
   */
  public async codeCommit (authorizerAccessToken: string, templateId: string, extJson: string, userVersion: string, userDesc: string) {
    const url = `https://api.weixin.qq.com/wxa/commit?access_token=${authorizerAccessToken}`;
    return axios.post<DefaultRequestResult>(url, {
      // eslint-disable-next-line camelcase
      template_id: templateId,
      // eslint-disable-next-line camelcase
      ext_json: extJson,
      // eslint-disable-next-line camelcase
      user_version: userVersion,
      // eslint-disable-next-line camelcase
      user_desc: userDesc,
    });
  }

  /**
   * 提交审核
   * @param authorizerAccessToken 
   * @param itemList 
   * @returns 
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/code/submit_audit.html
   */
  public async codeSubmitAudit (authorizerAccessToken: string, itemList: SubmitAuditItemList) {
    const url = `https://api.weixin.qq.com/wxa/submit_audit?access_token=${authorizerAccessToken}`;
    return axios.post<DefaultRequestResult & { auditid: number }>(url, {
      // eslint-disable-next-line camelcase
      item_list: itemList,
    });
  }
  
  /**
   * 查询指定发布审核单的审核状态
   * @param authorizerAccessToken 
   * @param auditId 
   * @returns 
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/code/get_auditstatus.html
   */
  public async codeAuditStatus (authorizerAccessToken: string, auditId: number) {
    const url = `https://api.weixin.qq.com/wxa/get_auditstatus?access_token=${authorizerAccessToken}`;
    return axios.post<DefaultRequestResult & { status: number, reason: string, screenshot: string }>(url, {
      // eslint-disable-next-line camelcase
      auditid: auditId,
    });
  }

  // ========== 小程序代码管理 ==========

  public getTicket () {
    return this.cacheAdapter.get<string>(ComponentService.KEY_TICKET);
  }

  public setTicket (ticket: string) {
    this.cacheAdapter.set(ComponentService.KEY_TICKET, ticket);
  }

  public async getComponentAccessToken () {
    const token = await this.cacheAdapter.get<{ componentAccessToken: string, expiresAt: number}>(ComponentService.KEY_TOKEN);
    if (token && token.expiresAt >= Date.now()) {
      return token;
    } else {
      const ret = await this.requestComponentToken();
      if (ret && ret.data) {
        if (ret.data.component_access_token) {
          const token = {
            componentAccessToken: ret.data.component_access_token,
            expiresAt: Date.now() + (ret.data.expires_in - 100) * 1000,
          };
          this.cacheAdapter.set(ComponentService.KEY_TOKEN, token, ret.data.expires_in - 100);
          return token;
        } else {
          throw new Error('no token in request result');
        }
      } else {
        throw new Error('http request error');
      }
    }
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
    return MessageCrypto.decryptMessage(this.options.componentToken || '', this.options.componentEncodingAESKey || '', signature, timestamp, nonce, encryptXml);
  }

}