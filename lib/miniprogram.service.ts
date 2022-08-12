import { Logger, Req, Res } from '@nestjs/common';
import axios from 'axios';

import { DefaultRequestResult, ParamCreateQRCode, PhoneNumberResult, SessionResult } from './interfaces';
import {
  CreateActivityId,
  CreateQRCode,
  GenerateNFCScheme,
  GenerateScheme,
  GenerateShortLink,
  GenerateUrlLink,
  MessageTemplate,
  PubTemplateTitleList,
  QRCode,
  SendMessage,
  SendUniformMessage,
  UpdatableMsg,
} from './miniprogram.params';
import {
  ActivityIdResult,
  MessageTemplateListResult,
  PubTemplateKeyWords,
  PubTemplateTitleListResult,
  RidInfo,
  SchemeInfo,
  SchemeQuota,
  UrlLinkResult,
} from './miniprogram.result';
import { WeChatModuleOptions } from './types';
import { MessageCrypto } from './utils';

import type { Request, Response } from 'express';
export class MiniProgramService {

  private readonly logger = new Logger(MiniProgramService.name);

  constructor (private options: WeChatModuleOptions) {}

  /**
   * 查询rid信息
   * @param {string} rid 
   * @param {string} accessToken 
   * @returns 
   * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/openApi/get_rid_info.html
   */
  public async getRid (rid: string, accessToken: string) {
    const url = `https://api.weixin.qq.com/cgi-bin/openapi/rid/get?access_token=${accessToken}`;
    return axios.post<RidInfo>(url, {
      rid,
    });
  }

  /**
   * 获取插件用户openpid
   * 
   * 通过 wx.pluginLogin 接口获得插件用户标志凭证 code 后传到开发者服务器，开发者服务器调用此接口换取插件用户的唯一标识 openpid。
   * 
   * @param {string} code
   * @param {string} accessToken
   * @returns
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-info/basic-info/getPluginOpenPId.html
   */
  public async getPluginOpenPId (code: string, accessToken: string) {
    const url = `https://api.weixin.qq.com/wxa/getpluginopenpid?access_token=${accessToken}`;
    return axios.post<DefaultRequestResult & { openpid: string }>(url, {
      code,
    });
  }

  /**
   * 登录
   * @param code 临时登录凭证
   * @param appId 小程序 appId
   * @param secret 小程序 appSecret
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
   */
  public async code2Session (code: string, appId?: string, secret?: string): Promise<SessionResult> {
    if (!appId || !secret) {
      appId = this.options?.appId;
      secret = this.options?.secret;
    }
    
    if (!appId || !secret) {
      throw new Error(`${MiniProgramService.name}': No appId or secret.`);
    } else {
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
      return (await axios.get<SessionResult>(url)).data;
    }
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
   * 
   * 获取小程序码
   * 
   * 该接口用于获取小程序码，适用于需要的码数量较少的业务场景。通过该接口生成的小程序码，永久有效，有数量限制，详见获取小程序码。
   * 
   * + 如果调用成功，会直接返回图片二进制内容，如果请求失败，会返回 JSON 格式的数据。
   * + POST 参数需要转成 JSON 字符串，不支持 form 表单提交。
   * + 接口只能生成已发布的小程序码
   * + 与 createQRCode 总共生成的码数量限制为 100,000，请谨慎调用。
   * 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/qrcode-link/qr-code/getQRCode.html
   */
  public async getQRCode (params: QRCode, accessToken: string) {
    const url = `https://api.weixin.qq.com/wxa/getwxacode?access_token=${accessToken}`;
    return axios.post<DefaultRequestResult & { contentType: string, buffer: Buffer }>(url, params);
  }

  /**
   * 
   * 获取不限制的小程序码
   * 
   * 获取小程序码，适用于需要的码数量极多的业务场景。通过该接口生成的小程序码，永久有效，数量暂无限制。
   * @param accessToken 
   * @link https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html
   */
  public async getUnlimited (accessToken: string, params: ParamCreateQRCode) {
    const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`;
    return axios.post<DefaultRequestResult>(url, params);
  }

  /**
   * 获取小程序二维码
   * 
   * 获取小程序二维码，适用于需要的码数量较少的业务场景。通过该接口生成的小程序码，永久有效，有数量限制，详见获取二维码。
   * 
   * 注意事项
   * 
   * + POST 参数需要转成 JSON 字符串，不支持 form 表单提交。
   * + 接口只能生成已发布的小程序的二维码。开发版的带参二维码可以在开发者工具预览时生成。
   * + 与 wxacode.get 总共生成的码数量限制为 100,000，请谨慎调用。
   *
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/qrcode-link/qr-code/createQRCode.html
   */
  public async createQRCode (params: CreateQRCode, accessToken: string) {
    const url = `https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=n=${accessToken}`;
    return axios.post<DefaultRequestResult & { contentType: string, buffer: Buffer }>(url, params);
  }

  /**
   * 查询 scheme 码
   * 
   * 该接口用于查询小程序 scheme 码，及长期有效 quota。
   * 
   * @param scheme 
   * @param accessToken 
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/qrcode-link/url-scheme/queryScheme.html
   */
  public async queryScheme (scheme: string, accessToken: string) {
    const url = `https://api.weixin.qq.com/wxa/queryscheme?access_token=${accessToken}`;
    return axios.post<DefaultRequestResult & { scheme_info: SchemeInfo, scheme_quota: SchemeQuota }>(url, { scheme });
  }

  /**
   * 获取 scheme 码
   * 
   * 该接口用于获取小程序 scheme 码，适用于短信、邮件、外部网页、微信内等拉起小程序的业务场景。通过该接口，可以选择生成到期失效和永久有效的小程序码，有数量限制，目前仅针对国内非个人主体的小程序开放，详见获取 URL scheme。
   * 
   * 调用上限
   * 
   * Scheme 将根据是否为到期有效与失效时间参数，分为短期有效 Scheme 与长期有效Scheme：
   * + 单个小程序每日生成 Scheme 上限为50万个（包含短期有效 Scheme 与长期有效 Scheme）
   * + 有效时间超过180天的 Scheme 或永久有效的 Scheme 为长期有效Scheme，单个小程序总共可生成长期有效 Scheme 上限为10万个，请谨慎调用
   * + 有效时间不超过180天的 Scheme 为短期有效Scheme，单个小程序生成短期有效 Scheme 不设上限
   * 
   * 其他注意事项
   * + 微信内的网页如需打开小程序请使用微信开放标签 - 小程序跳转按钮，无公众号也可以直接使用小程序身份开发网页并免鉴权跳转小程序，见云开发静态网站跳转小程序。符合开放范围的小程序可以下发支持打开小程序的短信
   * + 该功能基本覆盖当前用户正在使用的微信版本，开发者无需进行低版本兼容
   * + 只能生成已发布的小程序的 URL Scheme
   * + 通过 URL Scheme 跳转到微信时，可能会触发系统弹框询问，若用户选择不跳转，则无法打开小程序。请开发者妥善处理用户选择不跳转的场景
   * + 部分浏览器会限制打开网页直接跳转，可参考示例网页设置跳转按钮
   * 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/qrcode-link/url-scheme/generateScheme.html
   */
  public async generateScheme (params: GenerateScheme, accessToken: string) {
    const url = `https://api.weixin.qq.com/wxa/generatescheme?access_token=${accessToken}`;
    return axios.post<DefaultRequestResult & { openlink: string }>(url, params);
  }

  /**
   * 获取 NFC 的小程序 scheme
   * 
   * 该接口用于获取用于 NFC 的小程序 scheme 码，适用于 NFC 拉起小程序的业务场景。目前仅针对国内非个人主体的小程序开放，详见 NFC 标签打开小程序。
   * 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/qrcode-link/url-scheme/generateNFCScheme.html
   */
  public async generateNFCScheme (params: GenerateNFCScheme, accessToken: string) {
    const url = `https://api.weixin.qq.com/wxa/generatenfcscheme?access_token=${accessToken}`;
    return axios.post<DefaultRequestResult & { openlink: string }>(url, params);
  }
  
  /**
   * 获取 URL Link
   * 
   * 获取小程序 URL Link，适用于短信、邮件、网页、微信内等拉起小程序的业务场景。通过该接口，可以选择生成到期失效和永久有效的小程序链接，有数量限制，目前仅针对国内非个人主体的小程序开放，详见获取 URL Link
   * 
   * 调用上限
   * 
   * Link 将根据是否为到期有效与失效时间参数，分为短期有效Link 与 长期有效Link：
   * + 单个小程序每日生成 Link 上限为50万个（包含短期有效 Link 与长期有效 Link ）
   * + 有效时间超过180天的 Link 或永久有效的 Link 为长期有效Link，单个小程序总共可生成长期有效 Link 上限为10万个，请谨慎调用
   * + 有效时间不超过180天的 Link 为短期有效Link，单个小程序生成短期有效 Link 不设上限
   * 
   * 返回值说明
   * + 如果调用成功，会直接返回生成的小程序 URL Link。如果请求失败，会返回 JSON 格式的数据。
   * 
   * 其他注意事项
   * + 只能生成已发布的小程序的 URL Link。
   * + 在微信内或者安卓手机打开 URL Link 时，默认会先跳转官方 H5 中间页，如果需要定制 H5 内容，可以使用云开发静态网站。
   * 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/qrcode-link/url-link/generateUrlLink.html
   */
  public async generateUrlLink (params: GenerateUrlLink, accessToken: string) {
    const url = `https://api.weixin.qq.com/wxa/generate_urllink?access_token=${accessToken}`;
    return axios.post<DefaultRequestResult & { url_link: string }>(url, params);
  }

  /**
   * 查询 URL Link
   * 
   * 该接口用于查询小程序 url_link 配置，及长期有效 quota
   * 
   * @param urlLink 
   * @param accessToken 
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/qrcode-link/url-link/queryUrlLink.html
   */
  public queryUrlLink (urlLink: string, accessToken: string) {
    const url = `https://api.weixin.qq.com/wxa/query_urllink?access_token=${accessToken}`;
    // eslint-disable-next-line camelcase
    return axios.post<UrlLinkResult>(url, { url_link: urlLink });
  }

  /**
   * 获取 Short Link
   * 
   * 获取小程序 Short Link，适用于微信内拉起小程序的业务场景。目前只开放给电商类目(具体包含以下一级类目：电商平台、商家自营、跨境电商)。通过该接口，可以选择生成到期失效和永久有效的小程序短链，详见获取 Short Link。
   * 
   * 调用上限
   * 
   * Link 将根据是否为到期有效与失效时间参数，分为**短期有效ShortLink ** 与 **永久有效ShortLink **：
   * 
   * + 单个小程序每日生成 ShortLink 上限为50万个（包含短期有效 ShortLink 与长期有效 ShortLink ）
   * + 单个小程序总共可生成永久有效 ShortLink 上限为10万个，请谨慎调用。
   * + 短期有效ShortLink 有效时间为30天，单个小程序生成短期有效ShortLink 不设上限。
   * 
   * @param params 
   * @param accessToken 
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/qrcode-link/short-link/generateShortLink.html
   */
  public generateShortLink (params: GenerateShortLink, accessToken: string) {
    const url = `https://api.weixin.qq.com/wxa/genwxashortlink?access_token=${accessToken}`;
    return axios.post<DefaultRequestResult & { link: string }>(url, params);
  }

  /**
   * 下发统一消息
   * 
   * 该接口用于下发小程序和公众号统一的服务消息。
   * 
   * @param params 
   * @param accessToken 
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/uniform-message/sendUniformMessage.html
   */
  public sendUniformMessage (params: SendUniformMessage, accessToken: string) {
    const url = `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/uniform_send?access_token=${accessToken}`;
    return axios.post<DefaultRequestResult>(url, params);
  }

  /**
   * 创建activity_id
   * 
   * 该接口用于创建被分享动态消息或私密消息的 activity_id。详见动态消息。
   * 
   * @param params 
   * @param accessToken 
   * @returns
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/updatable-message/createActivityId.html
   */
  public createActivityId (params: CreateActivityId, accessToken: string) {
    const url = `https://api.weixin.qq.com/cgi-bin/message/wxopen/activityid/create?access_token=${accessToken}`;
    return axios.post<ActivityIdResult>(url, params);
  }

  /**
   * 修改动态消息
   * 
   * 该接口用于修改被分享的动态消息。详见动态消息。
   * 
   * @param params 
   * @param accessToken 
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/updatable-message/setUpdatableMsg.html
   */
  public setUpdatableMsg (params: UpdatableMsg, accessToken: string) {
    const url = `https://api.weixin.qq.com/cgi-bin/message/wxopen/updatablemsg/send?access_token=${accessToken}`;
    return axios.post<DefaultRequestResult>(url, params);
  }

  /**
   * 删除模板
   * 
   * 该接口用于删除帐号下的个人模板。
   * 
   * @param priTmplId 
   * @param accessToken 
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/deleteMessageTemplate.html
   */
  public deleteMessageTemplate (priTmplId: string, accessToken: string) {
    const url = `https://api.weixin.qq.com/wxaapi/newtmpl/deltemplate?access_token=${accessToken}`;
    return axios.post<DefaultRequestResult>(url, { priTmplId });
  }

  /**
   * 获取类目
   * 
   * 该接口用于获取小程序账号的类目。
   * 
   * @param accessToken 
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/getCategory.html
   */
  public getCategory (accessToken: string) {
    const url = `https://api.weixin.qq.com/wxaapi/newtmpl/getcategory?access_token=${accessToken}`;
    return axios.get<DefaultRequestResult & { data: {id: number, name: string}[] }>(url);
  }

  /**
   * 获取关键词列表
   * 
   * 该接口用于获取模板标题下的关键词列表。
   * 
   * @param tid 
   * @param accessToken 
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/getPubTemplateKeyWordsById.html
   */
  public getPubTemplateKeyWordsById (tid: number, accessToken: string) {
    const url = `https://api.weixin.qq.com/wxaapi/newtmpl/getpubtemplatekeywords?access_token=${accessToken}&tid=${tid}`;
    return axios.get<PubTemplateKeyWords>(url);
  }

  /**
   * 获取所属类目下的公共模板
   * 
   * 该接口用于获取帐号所属类目下的公共模板标题。
   * 
   * @param params 
   * @param accessToken 
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/getPubTemplateTitleList.html
   */
  public getPubTemplateTitleList (params: PubTemplateTitleList, accessToken: string) {
    const url = `https://api.weixin.qq.com/wxaapi/newtmpl/getpubtemplatetitles?access_token=${accessToken}&ids=${params.ids}&start=${params.start}&limit=${params.limit}`;
    return axios.get<PubTemplateTitleListResult>(url);
  }

  /**
   * 获取个人模板列表
   * 
   * 该接口用于获取当前帐号下的个人模板列表。
   * 
   * @param accessToken 
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/getMessageTemplateList.html
   */
  public getMessageTemplateList (accessToken: string) {
    const url = `https://api.weixin.qq.com/wxaapi/newtmpl/gettemplate?access_token=${accessToken}`;
    return axios.get<MessageTemplateListResult>(url);
  }
  /**
   * 发送订阅消息
   * 
   * 该接口用于发送订阅消息。
   * @param params 
   * @param accessToken 
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/sendMessage.html
   */
  public sendMessage (params: SendMessage, accessToken: string) {
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`;
    return axios.post<DefaultRequestResult>(url, params);
  }
  /**
   * 添加模板
   * 
   * 该接口用于组合模板并添加至帐号下的个人模板库。
   * 
   * @param params 
   * @param accessToken 
   * @returns 
   * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-message-management/subscribe-message/addMessageTemplate.html
   */
  public addMessageTemplate (params: MessageTemplate, accessToken: string) {
    const url = `https://api.weixin.qq.com/wxaapi/newtmpl/addtemplate?access_token=${accessToken}`;
    return axios.post<DefaultRequestResult & { priTmplId: string }>(url, params);
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
