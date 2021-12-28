/**
 * WeChatModule 配置项
 * WeChatModule Options
 */
export interface WeChatModuleOptions {
  /**
   * 微信公众号APP ID
   * WeChat official account APP ID
   */
  appId: string;
  /**
   * 微信公众号secret
   * WeChat official account secret
   */
  secret: string;
}

/**
 * WeChatService 配置项
 * WeChatService Options
 */
export interface WeChatServiceOptions {
  /**
   * 微信公众号APP ID
   * WeChat official account APP ID
   */
   appId: string;
   /**
    * 微信公众号secret
    * WeChat official account secret
    */
   secret: string;
}

/**
 * 获取公众号API access_token 返回结果封装
 * 
 * Result of getting official account access_token
 * 
 */
export interface AccountAccessTokenResult {
  /**
   * access_token
   */
  access_token: string;
  /**
   * access_token 有效期
   * seconde that access_token will expires in
   */
  expires_in: number;
  /**
   * 正确返回没有该字段
   * There is no this property when success.
   */
  errcode?: string;
  /**
   * 正确返回没有该字段
   * There is no this property when success.
   */
  errmsg?: string;
}

/**
 * 用户网页授权access_token返回结果
 * 
 * Result of get access_token which is use by user auth.
 * 
 */
export interface AccessTokenResult {
  /**
   * access_token
   */
  access_token: string;
  /**
   * access_token 有效期
   * seconde that access_token will expires in
   */
  expires_in: number;
  /**
   * 刷新token
   * 
   * Use to refresh the access_token. Expires in 30 days.
   */
  refresh_token: string;
  /**
   * 用户openid
   * 
   * user's openid
   */
  openid: string;
  /**
   * access_token's scope
   */
  scope: string;
  /**
   * 正确返回没有该字段
   * There is no this property when success.
   */
  errcode?: string;
  /**
   * 正确返回没有该字段
   * There is no this property when success.
   */
  errmsg?: string;
}

/**
 * 获取签名票据返回结果
 * 
 * Result of get ticket
 */
export interface TicketResult {
  /**
   * 返回代码，正确结果是0
   * 
   * response code, code = 0 when success
   */
  errcode: string;
  /**
   * 响应消息
   * response message
   */
  errmsg: string;
  /**
   * 票据
   * 
   * ticket
   */
  ticket: string;

  /**
   * ticket 有效期
   * seconde that ticket will expires in
   */
  expires_in: number;
}

export interface SignatureResult {
  appId: string;
  nonceStr: string;
  timestamp: number;
  signature: string;
}