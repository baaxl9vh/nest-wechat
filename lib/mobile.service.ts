import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { DefaultRequestResult } from './interfaces';
import { MobileAppAccessTokenResult } from './mobile.types';

/**
 * 移动用应Service
 */
@Injectable()
export class MobileService {

  /**
   * 通过 code 获取 access_token
   * 
   * @param {string} code 
   * @param {string} appId 
   * @param {string} secret 
   * @returns 
   * @link https://developers.weixin.qq.com/doc/oplatform/Mobile_App/WeChat_Login/Authorized_API_call_UnionID.html
   */
  public getAccessToken (code: string, appId: string, secret: string) {
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${secret}&code=${code}&grant_type=authorization_code`;
    return axios.get<MobileAppAccessTokenResult>(url);
  }

  /**
   * 刷新或续期 access_token 使用
   * @param appId 
   * @param refreshToken 
   * @returns 
   * @link https://developers.weixin.qq.com/doc/oplatform/Mobile_App/WeChat_Login/Authorized_API_call_UnionID.html
   */
  public refreshAccessToken (appId: string, refreshToken: string) {
    const url = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${appId}&grant_type=refresh_token&refresh_token=${refreshToken}`;
    return axios.get<MobileAppAccessTokenResult>(url);
  }

  /**
   * 检验授权凭证（access_token）是否有效
   * @param openId 
   * @param accessToken 
   * @returns 
   * @link https://developers.weixin.qq.com/doc/oplatform/Mobile_App/WeChat_Login/Authorized_API_call_UnionID.html
   */
  public checkAccessToken (openId: string, accessToken: string) {
    const url = `https://api.weixin.qq.com/sns/auth?access_token=${accessToken}&openid=${openId}`;
    return axios.get<DefaultRequestResult>(url);
  }

}