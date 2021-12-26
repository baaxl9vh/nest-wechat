export * from './utils';

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