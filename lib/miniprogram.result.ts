import { DefaultRequestResult } from './interfaces';

/**
 * 获取接口调用凭据参数
 * 
 * 错误码
 * + -1	system error 系统繁忙，此时请开发者稍候再试
 * + 40001 invalid credential  access_token isinvalid or not latest	获取 access_token 时 AppSecret 错误，或者 access_token 无效。请开发者认真比对 AppSecret 的正确性，或查看是否正在为恰当的公众号调用接口
 * + 40013 invalid appid	不合法的 AppID ，请开发者检查 AppID 的正确性，避免异常字符，注意大小写
 */
export interface AccessTokenResult extends DefaultRequestResult {
  /**
   * 获取到的凭证
   */
  access_token?: string;
  /**
   * 凭证有效时间，单位：秒。目前是7200秒之内的值。
   */
  expires_in?: number;
}

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

export interface ActivityIdResult extends DefaultRequestResult {
  /**
   * 动态消息的 ID
   */
  activity_id: string;
  /**
   * activity_id 的过期时间戳。默认24小时后过期。
   */
  expiration_time: number;
}

export interface PubTemplateKeyWords extends DefaultRequestResult {
  /**
   * 模版标题列表总数
   */
  count: number;
  data: {
    /**
     * 关键词 id，选用模板时需要
     */
    kid: number;
    /**
     * 关键词内容
     */
    name: string;
    /**
     * 关键词内容对应的示例
     */
    example: string;
    /**
     * 参数类型
     */
    rule: string;
  }[];
}

export interface PubTemplateTitleListResult extends DefaultRequestResult {
  /**
   * 模版标题列表总数
   */
  count: number;
  /**
   * 模板标题列表
   */
  data: {
    /**
     * 模版标题 id
     */
    tid: string;
    /**
     * 模版标题
     */
    title: string;
    /**
     * 模版类型，2 为一次性订阅，3 为长期订阅
     */
    type: string;
    /**
     * 模版所属类目 id
     */
    categoryId: string;
  }[];
}

export interface MessageTemplateListResult extends DefaultRequestResult {
  data: {
    /**
     * 添加至帐号下的模板 id，发送小程序订阅消息时所需
     */
    priTmplId: string;
    /**
     * 模版标题
     */
    title: string;
    /**
     * 模版内容
     */
    content: string;
    /**
     * 模板内容示例
     */
    example: string;
    /**
     * 模版类型，2 为一次性订阅，3 为长期订阅
     */
    type: number;
    /**
     * 枚举参数值范围
     */
    keywordEnumValueList: {
      /**
       * 枚举参数的 key
       */
      keywordCode: string;
      /**
       * 枚举参数值范围列表
       */
      enumValueList: string[];
    }[];
  }[];
}

export interface ExpressLocalResult {
  /**
   * 运力返回的错误码
   */
  resultcode: number;
  /**
   * 运力返回的错误描述
   */
  resultmsg: string;
}

export interface ExpressLocalPreAddOrderResult extends ExpressLocalResult {
  /**
   * 实际运费(单位：元)，运费减去优惠券费用
   */
  fee: number;
  /**
   * 运费(单位：元)
   */
  deliverfee: number;
  /**
   * 优惠券费用(单位：元)
   */
  couponFee: number;
  /**
   * 小费(单位：元)
   */
  tips: number;
  /**
   * 保价费(单位：元)
   */
  insurancefee: number;
  /**
   * 配送距离(单位：米)预计骑手接单时间，单位秒，比如5分钟，就填300, 无法预计填0
   */
  distance: number;
  /**
   * 配送公司可以返回此字段，当用户下单时候带上这个字段，保证在一段时间内运费不变
   */
  delivery_token: string;
  /**
   * 预计骑手接单时间，单位秒，比如5分钟，就填300, 无法预计填0
   */
  dispatch_duration: number;
}

export interface ExpressLocalGetBindAccountResult extends ExpressLocalResult {

  /**
   * 绑定的商家签约账号列表
   */
  shop_list: {
    shopid: string;
    delivery_id: string;
    /**
     * 审核状态.0表示审核通过；1表示审核中；2表示审核不通过。
     */
    audit_result: number;
  }[]
}

export interface ExpressLocalPreCancelOrderResult extends ExpressLocalResult {
  /**
   * 预计扣除的违约金(单位：元)，精确到分
   */
  deduct_fee: number;
  /**
   * 说明
   */
  desc: string;
}

export interface ExpressLocalGetLocalOrderResult extends ExpressLocalResult {
  /**
   * 配送状态 [详见](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/immediate-delivery/order_status.html)
   */
  order_status: number;
  /**
   * 配送单号
   */
  waybill_id: string;
  /**
   * 骑手姓名
   */
  rider_name: string;
  /**
   * 骑手电话
   */
  rider_phone: string;
  /**
   * 骑手位置经度, 配送中时返回
   */
  rider_lng?: number;
  /**
   * 骑手位置纬度, 配送中时返回
   */
  rider_lat?: number;
  /**
   * 预计还剩多久送达时间, 配送中时返回，单位秒， 已取货配送中需返回，比如5分钟后送达，填300
   */
  reach_time?: number;
}

export interface ExpressLocalCancelOrderResult extends ExpressLocalResult {
  /**
   * 实际扣除的违约金(单位：元)，精确到分
   */
  deduct_fee: number;
  /**
   * 说明
   */
  desc: string;
}

export interface ExpressLocalAddLocalOrderResult extends ExpressLocalResult {
  /**
   * 实际运费(单位：元)，运费减去优惠券费用
   */
  fee: number;
  /**
   * 运费(单位：元)
   */
  deliverfee: number;
  /**
   * 优惠券费用(单位：元)
   */
  couponfee: number;
  /**
   * 小费(单位：元)
   */
  tips: number;
  /**
   * 保价费(单位：元)
   */
  insurancefee: number;
  /**
   * 配送距离(整数单位：米)
   */
  distance: number;
  /**
   * 配送单号
   */
  waybill_id: string;
  /**
   * 配送状态 [详见](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/immediate-delivery/order_status.html)
   */
  order_status: number;
  /**
   * 收货码
   */
  finish_code: number;
  /**
   * 取货码
   */
  pickup_code: number;
  /**
   * 预计骑手接单时间，单位秒，比如5分钟，就填300, 无法预计填0
   */
  dispatch_duration: number;

}