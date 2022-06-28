import { ModuleMetadata } from '@nestjs/common';

export * from './utils';
export * from './wepay';

/**
 * At least one property required of keys of type T，e.g.
 * 指定类型 T 的属性中最少要有一个，比如:
 * RequireOnlyOne<RefundParameters, 'transaction_id' | 'out_trade_no'>
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>}[Keys]
/**
 * Only one property required of keys of type T，e.g.
 * 指定类型 T 的属性中只选一，比如:
 * RequireOnlyOne<RefundParameters, 'transaction_id' | 'out_trade_no'>
 */
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & { [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>}[Keys]

/**
 * WeChatModule 配置项
 * WeChatModule Options
 */
export interface WeChatModuleOptions {
  isGlobal?: boolean;
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

  /**
   * 缓存适配器
   */
  cacheAdapter?: object;
}

/**
 * WeChatComponentModule 配置项
 * WeChatComponentModule Options
 */
export interface ComponentModuleOptions {
  isGlobal?: boolean;
  /**
   * 第三方平台APP ID
   * WeChat official account APP ID
   */
  componentAppId: string;
  /**
   * 第三方平台secret
   * WeChat 第三方平台 secret
   */
   componentSecret: string;

  /**
   * 第三方平台Token
   */
   componentToken?: string;

  /**
   * 第三方平台EncodingAESKey
   */
   componentEncodingAESKey?: string;

  /**
   * 缓存适配器
   */
  cacheAdapter?: object;
}

export interface WeChatModuleRootOptions extends Pick<ModuleMetadata, 'imports'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => Promise<WeChatModuleOptions> | WeChatModuleOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject: any[];
  isGlobal?: boolean;
}

export interface ComponentModuleRootOptions extends Pick<ModuleMetadata, 'imports'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => Promise<ComponentModuleOptions> | ComponentModuleOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject: any[];
  isGlobal?: boolean;
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