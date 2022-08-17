export interface WeChatMobileModuleOptions {
  isGlobal: boolean;
}

export interface MobileAppAccessTokenResult {
  /**
   * 接口调用凭证
   */
  access_token: string;
  /**
   * access_token 接口调用凭证超时时间，单位（秒）
   */
  expires_in: number;
  /**
   * 用户刷新 access_token
   */
  refresh_token: string;
  /**
   * 授权用户唯一标识
   */
  openid: string;
  /**
   * 用户授权的作用域，使用逗号（,）分隔
   */
  scope: string;
  errcode: number;
  errmsg: string;
}