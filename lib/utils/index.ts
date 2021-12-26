import axios from 'axios';

import { AccessTokenErrorResult, AccessTokenResult } from '..';

/**
 * 微信公众号API
 * 
 * WeChat Official Account API
 */
export class OfficialAccountApi {

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
   * {"errcode":40013,"errmsg":"iinvalid appid, rid: 61c82e61-2e62fb72-467cb9ec"}
   * 
   * @param appId 
   * @param secret 
   * @param code 
   * @returns 
   */
  public static getAccessTokenCode (appId: string, secret: string, code: string): Promise<AccessTokenResult | AccessTokenErrorResult> {
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${secret}&code=${code}&grant_type=authorization_code`;
    return new Promise((resolve, reject) => {
      axios.get(url).then((res) => {
        resolve(res.data);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}