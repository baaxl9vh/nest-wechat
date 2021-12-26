export interface AccessTokenResult {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
}

export interface AccessTokenErrorResult {
  errcode: string;
  errmsg: string;
}
