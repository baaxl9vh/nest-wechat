
export interface DefaultRequestResult {
  errcode: number;
  errmsg: number;
}

/**
 * 用户网页授权access_token返回结果
 * 
 * Result of get access_token which is use by user auth.
 * 
 */
export interface UserAccessTokenResult {
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
  errcode?: number;
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
  errcode: number;
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