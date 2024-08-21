import { RequireOnlyOne } from '.';
import { CreateCardTemplateRequest, DevelopmentConfigRequest, FapiaoNotifyResult, IssueFapiaoRequest, RefundNotifyResult, RefundParameters, ReverseFapiaoRequest, Trade, TransactionOrder } from './wepay';

/**
 * 微信支付服务务下单数据结构
 * WePay Transaction Order Data
 */
export interface TransactionOrderOfPartner extends Omit<TransactionOrder, 'appid' | 'mchid' | 'payer'> {

  /**
   * 【服务商应用ID】 由微信生成的应用ID，全局唯一。请求基础下单接口时请注意AppID的应用属性，例如公众号场景下，需使用应用属性为公众号的服务号AppID
   * 
   * 长度：32位
   */
  sp_appid: string;

  /**
   * 【服务商户号】 服务商户号，由微信支付生成并下发
   * 
   * 长度：32位
   */
  sp_mchid: string;
  /**
   * 【子商户/二级商户应用ID】 子商户/二级商户在开放平台申请的应用AppID，全局唯一。
   * 请求基础下单接口时请注意AppID的应用属性，例如公众号场景下，需使用应用属性为公众号的APPID若sub_openid有传的情况下，sub_appid必填，且sub_appid需与sub_openid对应
   * 
   * 长度：32位
   */
  sub_appid?: string;
  /**
   * 【子商户号/二级商户号】 子商户/二级商户的商户号，由微信支付生成并下发。
   * 
   * 长度：32位
   */
  sub_mchid: string;

  /**
   * 【支付者 】 支付者信息。
   * sp_openid 和 sub_openid 两个字段必须要填一个
   */
  payer: RequireOnlyOne<{
    /**
     * 【用户服务标识】 用户在服务商AppID下的唯一标识。 下单前需获取到用户的OpenID，
     */
    sp_openid: string;
    /**
     * 【用户子标识】 用户在子商户AppID下的唯一标识。若传sub_openid，那sub_appid必填。
     */
    sub_openid: string;
  }>;
}

/**
 * 微信支付服务商订单数据结构
 */
export interface TradeOfPartner extends Omit<Trade, 'payer' | 'appid' | 'mchid'> {
  sp_appid: string;
  sp_mchid: string;
  sub_appid: string;
  sub_mchid: string;
  payer: {
    sp_openid: string;
    sub_openid: string;
  };
}

/**
 * 服务端退款请求参数
 */
export interface RefundParametersOfPartner extends RefundParameters {
  /**
   * 【子商户号】 子商户的商户号，由微信支付生成并下发。服务商模式下必须传递此参数
   * 长度：32位
   */
  sub_mchid: string;
}

/**
 * 服务商退款通知数据结构
 */
export interface RefundNotifyResultOfPartner extends Omit<RefundNotifyResult, 'mchid'> {
  /**
   * 服务商户号，由微信支付生成并下发
   */
  sp_mchid: string;
  /**
   * 子商户的商户号，由微信支付生成并下发
   */
  sub_mchid: string;
}

/** 电子发票 **/

/**
 * 配置开发选项
 */
export interface DevelopmentConfigRequestOfPartner extends DevelopmentConfigRequest {
  /**
   * 【子商户号】 微信支付分配的子商户号，服务商为子商户设置全部账单展示发票入口开关时必填
   */
  sub_mch_code?: string;
}

export interface FapiaoNotifyResultOfPartner extends FapiaoNotifyResult {
  /**
   * 微信支付分配的子商户号，服务商模式下存在
   */
  sub_mchid: string;
}

export interface IssueFapiaoRequestOfPartner extends IssueFapiaoRequest {
  sub_mchid: string;
}

export interface ReverseFapiaoRequestOfPartner extends ReverseFapiaoRequest {
  sub_mchid: string;
}

export interface CreateCardTemplateRequestOfPartner extends CreateCardTemplateRequest {
  sub_mchid: string;
}

/** 电子发票 **/