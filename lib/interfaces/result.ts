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

/**
 * 登录凭证校验
 *
 * Result of auth.code2Session
 */
export interface SessionResult {
  /**
   * 用户唯一标识
   */
  openid: string;
  /**
   * 会话密钥
   */
  session_key: string;
  /**
   * 用户在开放平台的唯一标识符，若当前小程序已绑定到微信开放平台帐号下会返回，详见 UnionID 机制说明。
   */
  unionid?: string;
  /**
   * 错误码
   */
  errcode?: number;
  /**
   * 错误信息
   */
  errmsg?: string;
}

// =============================== 第三方开放平台 ===============================

/**
 * 使用授权码获取授权信息授回结果
 */
export interface AuthorizationResult {
  authorization_info: {
    authorizer_appid: string;
    authorizer_access_token: string;
    expires_in: number;
    authorizer_refresh_token: string;
    func_info: {[key: string]: { id: number }}[];
  }
}

/**
 * 获取授权帐号详情返回结果
 */
export interface AuthorizerInfo {
  authorizer_info: {
    nick_name: string;
    head_img: string;
    service_type_info: {
      id: string;
    };
    verify_type_info: {
      id: string;
    };
    user_name: string;
    principal_name: string;
    business_info: {
      open_store: number;
      open_scan: number;
      open_pay: number;
      open_card: number;
      open_shake: number;
    };
    alias: string;
    qrcode_url: string;
    account_status: number;
  }
}
