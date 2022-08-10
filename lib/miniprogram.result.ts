import { DefaultRequestResult } from './interfaces';

/**
 * rid请求详情
 */
export interface RequestInfo {
  /**
   * 发起请求的时间戳
   */
  invoke_time: number;
  /**
   * 请求毫秒级耗时
   */
  cost_in_ms: number;
  /**
   * 请求的 URL 参数
   */
  request_url: string;
  /**
   * post请求的请求参数
   */
  request_body: string;
  /**
   * 接口请求返回参数
   */
  response_body: string;
  /**
   * 接口请求的客户端ip
   */
  client_ip: string;
}

/**
 * 微信接口调用rid查询
 */
export interface RidInfo extends DefaultRequestResult {
  /**
   * 该 rid 对应的请求详情
   */
  request: RequestInfo;
}

export interface SchemeInfo {
  /**
   * 小程序 appid
   */
  appid: string;
  /**
   * 小程序页面路径
   */
  path: string;
  /**
   * 小程序页面query
   */
  query: string;
  /**
   * 创建时间，为 Unix 时间戳
   */
  create_time: number;
  /**
   * 到期失效时间，为 Unix 时间戳，0 表示永久生效
   */
  expire_time: number;
  /**
   * 要打开的小程序版本。正式版为"release"，体验版为"trial"，开发版为"develop"
   */
  env_version: string;

}

export interface SchemeQuota {
  /**
   * 长期有效 scheme 已生成次数
   */
  long_time_used: number;
  /**
   * 长期有效 scheme 生成次数上限
   */
  long_time_limit: number;
}

export interface UrlLinkInfo {
  appid: string;
  path: string;
  query: string;
  create_time: number;
  expire_time: number;
  env_version: string;
}

export interface UrlLinkQuota {
  /**
   * 长期有效 url_link 已生成次数
   */
  long_time_used: number;
  /**
   * 长期有效 url_link 生成次数上限
   */
  long_time_limit: number;
}

export interface UrlLinkResult extends DefaultRequestResult {
  url_link_info: UrlLinkInfo;
  url_link_quota: UrlLinkQuota;
  visit_openid: string;
}