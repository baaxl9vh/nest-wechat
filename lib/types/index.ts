import { ModuleMetadata } from '@nestjs/common';

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

  /**
   * 微信公众号服务器Token
   */
  token?: string;

  /**
   * 微信公众号服务器EncodingAESKey
   */
  encodingAESKey?: string;
}

export interface WeChatModuleRootOptions extends Pick<ModuleMetadata, 'imports'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => Promise<WeChatModuleOptions> | WeChatModuleOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject: any[];
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
 * JS-SDK签名结果
 * 
 * Result of signature
 * 
 */
export interface SignatureResult {
  /**
   * Official account appid
   */
  appId: string;
  /**
   * 随机字符串
   * 
   * Random string
   */
  nonceStr: string;
  timestamp: number;
  signature: string;
}