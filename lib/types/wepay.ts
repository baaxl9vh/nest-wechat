
/**
 * 微信支付下单数据结构
 * WePay Transaction Order Data
 */
export interface TransactionOrder {
  /**
   * 应用ID
   * 长度32
   */
  appid: string;
  /**
   * 直连商户号
   * 长度32
   */
  mchid: string;
  /**
   * 商品描述
   * 长度127
   */
  description: string;
  /**
   * 商户订单号
   * 长度32
   */
  out_trade_no: string;
  /**
   * 交易结束时间
   * yyyy-MM-DDTHH:mm:ss+TIMEZONE
   * 例如：2015-05-20T13:29:35+08:00表示，北京时间2015年5月20日 13点29分35秒
   * 长度64
   */
  time_expire?: string;
  /**
   * 附加数据
   * 长度128
   */
  attach?: string;
  /**
   * 通知地址
   * 长度256
   */
  notify_url: string;
  /**
   * 订单优惠标记
   * 长度32
   */
  goods_tag?: string;

  /**
   * 电子发票入口开放标识
   * 传入true时，支付成功消息和支付详情页将出现开票入口。需要在微信支付商户平台或微信公众平台开通电子发票功能，传此字段才可生效。 
   */
  support_fapiao?: boolean;
  /**
   * 订单金额
   */
  amount: {
    /**
     * 总金额，单位：分
     */
    total: number
    /**
     * 货币类型，如：CNY
     * 长度16
     */
    currency: 'CNY',
  };
  /**
   * 支付者
   */
  payer: {
    /**
     * OPENID
     * 长度128
     */
    openid: string;
  }
  detail?: {
    /**
     * 订单原价
     */
    cost_price?: number;

    /**
     * 商品小票ID
     * 长度32
     */
    invoice_id?: string;
    goods_detail?: {
      /**
       * 商户侧商品编码
       * 长度32
       */
      merchant_goods_id: string;
      /**
       * 微信支付商品编码
       * 长度32
       */
      wechatpay_goods_id?: string;
      /**
       * 商品名称
       * 长度256
       */
      goods_name?: string;
      /**
       * 商品数量
       * 长度32
       */
      quantity: number;
      /**
       * 商品单价，单位分
       */
      unit_price: number;
    }[];
  };
  /**
   * 场景信息
   */
  scene_info?: {
    /**
     * 用户终端IP
     * 长度45
     */
    payer_client_ip: string;
    /**
     * 商户端设备号
     * 长度32
     */
    device_id?: string;
    /**
     * 商户门店信息
     */
    store_info?: {
      /**
       * 门店编号
       * 长度32
       */
      id: string;
      /**
       * 门店名称
       * 长度256
       */
      name?: string;
      /**
       * 地区编码
       * 长度32
       */
      area_code?: string;
      /**
       * 详细地址
       * 长度512
       */
      address?: string;
    };
  };
  /**
   * 结算信息
   */
  settle_info?: {
    /**
     * 是否指定分账
     */
    profit_sharing?: boolean;
  }
}

export interface MiniProgramPaymentParameters {
  /**
   * 时间戳，单位：秒（10位数字）
   */
  timeStamp: string;
  /**
   * 随机字符串，长度32
   */
  nonceStr: string;
  /**
   * 订单详情扩展字符串，长度：128，如：
   * prepay_id=wx201410272009395522657a690389285100
   */
  package: string;
  signType: 'RSA',
  /**
   * 签名，长度512
   */
  paySign: string;

}

export interface CallbackResource {
  original_type: string;
  algorithm: string;
  ciphertext: string;
  associated_data: string;
  nonce: string;
}

export interface CertificateResult {
  serial_no: string;
  effective_time: string;
  expire_time: string;
  encrypt_certificate: {
    algorithm: string;
    nonce: string;
    associated_data: string;
    ciphertext: string;
  };
}

/**
 * 交易状态
 */
export enum TradeStatus {
  /**
   * 支付成功
   */
  SUCCESS = 'SUCCESS',
  /**
   * 转入退款
   */
  REFUND = 'REFUND',
  /**
   * 未支付
   */
  NOTPAY = 'NOTPAY',
  /**
   * 已关闭
   */
  CLOSED = 'CLOSED',
  /**
   * 已撤销（仅付款码支付会返回）
   */
  REVOKED = 'REVOKED',
  /**
   * 用户支付中（仅付款码支付会返回）
   */
  USERPAYIN = 'USERPAYIN',
  /**
   * 支付失败（仅付款码支付会返回）
   */
  PAYERROR = 'PAYERROR',
}

/**
 * 交易类型
 */
export enum TradeType {
  /**
   * 公从号支付
   */
  JSAPI = 'JSAPI',
  /**
   * 扫码支付
   */
  NATIVE = 'NATIVE',
  /**
   * APP支付
   */
  APP = 'APP',
  /**
   * 付款码支付
   */
  MICROPAY = 'MICROPAY',
  /**
   * H5支付
   */
  MWEB = 'MWEB',
  /**
   * 刷脸支付
   */
  FACEPAY = 'FACEPAY',
}

/**
 * 微信支付订单
 */
export interface Trade extends Omit<TransactionOrder, 'scene_info' | 'amount'> {
  /**
   * 微信支付订单号
   */
  transaction_id?: string;
  /**
   * 交易类型
   */
  trade_type?: TradeType;
  /**
   * 交易状态
   */
  trade_state: TradeStatus;
  /**
   * 交易状态描述
   */
  trade_state_desc: string;
  /**
   * 付款银行
   */
  bank_type?: string;
  /**
   * 支付完成时间
   * yyyy-MM-DDTHH:mm:ss+TIMEZONE
   * 2018-06-08T10:34:56+08:00
   */
  success_time?: string;
  /**
   * 订单金额
   */
  amount?: {
    /**
     * 总金额，单位分
     */
    total?: number;
    /**
     * 用户支付金额
     * 用户支付金额，单位为分。（指使用优惠券的情况下，这里等于总金额-优惠券金额）
     */
    payer_total?: number;
    /**
     * 货币类型
     * CNY：人民币，境内商户号仅支持人民币。
     */
    currency?: 'CNY';
    /**
     * 用户支付币种
     */
    payer_currency?: string;
  };
  /**
   * 场景信息
   */
  scene_info?: {
    /**
     * 商户端设备号
     * 商户端设备号（发起扣款请求的商户服务器设备号）。
     */
    device_id?: string;
  };
  promotion_detail?: {
    /**
     * 券ID
     */
    coupon_id: string;
    /**
     * 优惠名称
     */
    name?: string;
    /**
     * 优惠范围
     * GLOBAL：全场代金券 SINGLE：单品优惠
     */
    scope?: 'GLOBAL' | 'SINGLE';
    /**
     * 优惠类型
     * CASH：充值型代金券 NOCASH：免充值型代金券
     */
    type?: 'CASH' | 'NOCASH';
    /**
     * 优惠券面额
     */
    amount: number;
    /**
     * 活动ID
     */
    stock_id?: string;
    /**
     * 微信出资，单位为分
     */
    wechatpay_contribute?: number;
    /**
     * 商户出资，单位为分
     */
    merchant_contribute?: number;
    /**
     * 其他出资，单位为分
     */
    other_contribute?: number;
    /**
     * 优惠币种
     */
    currency?: 'CNY';
    /**
     * 单品列表
     */
    goods_detail?: TradeGood[];
  };
}

export interface TradeGood {
  /**
   * 商品编码
   */
  goods_id: string;
  /**
   * 商品数量
   */
  quantity: number;
  /**
   * 商品单价，单位为分
   */
  unit_price: number;
  /**
   * 商品优惠金额
   */
  discount_amount: number;
  /**
   * 商品备注信息 
   */
  goods_remark?: string;
}

/**
 * 申请退款参数
 */
export interface RefundParameters {
  /**
   * 微信支付订单号
   */
  transaction_id: string;
  /**
   * 商户订单号
   */
  out_trade_no: string;
  /**
   * 商户退款单号
   * 商户系统内部的退款单号，商户系统内部唯一，只能是数字、大小写字母_-|*@ ，同一退款单号多次请求只退一笔。示例值：1217752501201407033233368018
   * 长度64
   */
  out_refund_no: string;
  /**
   * 退款原因
   * 若商户传入，会在下发给用户的退款消息中体现退款原因
   */
  reason?: string;
  /**
   * 退款结果回调url
   */
  notify_url?: string;
  /**
   * 退款资金来源
   */
  funds_account?: 'AVAILABLE';
  /**
   * 金额信息
   */
  amount: {
    /**
     * 退款金额，单位为分，只能为整数，不能超过原订单支付金额。
     */
    refund: number;
    /**
     * 退款出资账户及金额
     */
    from?: {
      /**
       * 出资账户类型
       */
      account: 'AVAILABLE' | 'UNAVAILABLE';
      /**
       * 对应账户出资金额
       */
      amount: number;
    }[];
    /**
     * 原订单金额
     */
    total: number;
    currency: 'CNY';
  };
  /**
   * 退款商品
   * 指定商品退款需要传此参数，其他场景无需传递
   */
  goods_detail?: RefundGoodDetail[];
}

export interface RefundGoodDetail {
  /**
   * 商户侧商品编码
   */
  merchant_goods_id: string;
  /**
   * 微信支付商品编码
   */
  wechatpay_goods_id?: string;
  goods_name?: string;
  /**
   * 商品单价金额，单位为分
   */
  unit_price: number;
  /**
   * 商品退款金额，单位为分
   */
  refund_amount: number;
  /**
   * 单品的退款数量
   */
  refund_quantity: number;
}

export interface RefundResult {
  /**
   * 微信支付退款单号
   */
  refund_id: string;
  /**
   * 商户退款单号
   */
  out_refund_no: string;
  /**
   * 微信支付订单号
   */
  transaction_id: string;
  /**
   * 商户订单号
   */
  out_trade_no: string;
  /**
   * 退款渠道
   */
  channel: RefundChannel;
  /**
   * 退款入账账户
   * 取当前退款单的退款入账方，有以下几种情况：
   * 1）退回银行卡：{银行名称}{卡类型}{卡尾号}
   * 2）退回支付用户零钱:支付用户零钱
   * 3）退还商户:商户基本账户商户结算银行账户
   * 4）退回支付用户零钱通:支付用户零钱通
   * 示例值：招商银行信用卡0403
   */
  user_received_account: string;
  /**
   * 退款成功时间，当退款状态为退款成功时有返回。
   * 示例值：2020-12-01T16:18:12+08:00
   */
  success_time?: string;
  /**
   * 退款创建时间
   * 示例值：2020-12-01T16:18:12+08:00
   */
  create_time: string;
  /**
   * 退款状态
   */
  status: RefundStatus;
  /**
   * 资金账户
   */
  funds_account?: FundsAccount;
  /**
   * 金额信息
   */
  amount: {
    /**
     * 订单金额
     */
    total: number;
    /**
     * 退款金额
     */
    refund: number;
    /**
     * 退款出资账户及金额
     */
    from?: {
      /**
       * 出资账户类型
       */
      account: 'AVAILABLE' | 'UNAVAILABLE';
      /**
       * 对应账户出资金额
       */
      amount: number;
    }[];
    /**
     * 用户支付金额
     */
    payer_total: number;
    /**
     * 用户退款金额
     */
    payer_refund: number;
    /**
     * 应结退款金额
     */
    settlement_refund: number;
    /**
     * 应结订单金额
     */
    settlement_total: number;
    /**
     * 优惠退款金额
     */
    discount_refund: number;
    /**
     * 退款币种
     */
    currency: 'CNY';
  };
  /**
   * 优惠退款信息
   */
  promotion_detail?: {
    /**
     * 券ID
     */
    promotion_id: string;
    /**
     * 优惠范围
     */
    scope: 'GLOBAL' | 'SINGLE';
    /**
     * 优惠类型
     */
    type: string;
    /**
     * 优惠券面额
     */
    amount: number;
    /**
     * 优惠退款金额
     */
    refund_amount: number;
    /**
     * 商品列表
     */
    goods_detail?: RefundGoodDetail[];
  }[];

}

/**
 * 退款状态
 */
export enum RefundStatus {
  /**
   * 退款成功
   */
  SUCCESS = 'SUCCESS',
  /**
   * 退款关闭
   */
  CLOSED = 'CLOSED',
  /**
   * 退款处理中
   */
  PROCESSING = 'PROCESSING',
  /**
   * 退款异常
   */
  ABNORMAL = 'ABNORMAL',
}

/**
 * 资金账户
 */
export enum FundsAccount {
  /**
   * 未结算资金
   */
  UNSETTLED = 'UNSETTLED',
  /**
   * 可用余额
   */
  AVAILABLE = 'AVAILABLE',
  /**
   * 不可用余额
   */
  UNAVAILABLE = 'UNAVAILABLE',
  /**
   * 运营户
   */
  OPERATION = 'OPERATION',
  /**
   * 基本账户（含可用余额和不可用余额）
   */
  BASIC = 'BASIC',
}

/**
 * 退款渠道
 */
export enum RefundChannel {
  /**
   * 原路退款
   */
  ORIGINAL = 'ORIGINAL',
  /**
   * 退回到余额 
   */
  BALANCE = 'BALANCE',
  /**
   * 原账户异常退到其他余额账户
   */
  OTHER_BALANCE = 'OTHER_BALANCE',
  /**
   * 原银行卡异常退到其他银行卡
   */
  OTHER_BANKCARD = 'OTHER_BANKCARD'
}

export interface RefundNotifyResult {
  mchid: string;
  out_trade_no: string;
  transaction_id: string;
  out_refund_no: string;
  refund_id: string;
  refund_status: 'SUCCESS' | 'ABNORMAL' | 'CLOSED';
  success_time: string;
  amount: {
    total: number;
    refund: number;
    payer_total: number;
    payer_refund: number;
  };
  user_received_account: string;
}

/** 电子发票 **/

/**
 * 配置开发选项
 */
export interface DevelopmentConfigRequest {
  /** 商户回调地址 **/
  callback_url: string;
  /** 全部账单展示开发票入口开关 **/
  show_fapiao_cell?: boolean;
}

export interface CustomCell {
  /** 【cell位文字】 展示在卡券详情页自定义cell位上的文字 */
  words: string;
  /** 【cell位描述】 展示在卡券详情页自定义cell位右侧的描述 */
  description: string;
  /** 【点击cell位跳转的地址】 点击卡券详情页自定义cell位后跳转的页面链接，用户跳转时会自动在链接后加上参数encrypt_code与card_id，商户需要调用code解码接口解码encrypt_code得到真实的code */
  jump_url?: string;
  /** 【点击cell位跳转的小程序的用户名】 用于指定点击卡券详情页自定义cell位后跳转的小程序，该小程序必须与商户插卡的AppID绑定 */
  miniprogram_user_name?: string;
  /** 【点击cell位跳转的小程序的页面路径】 用于指定点击卡券详情页自定义cell位后跳转的小程序页面路径，跳转小程序后，开发者可以通过页面onShow方法的query中获取到发起跳转的card_id、encrypt_code和用户的公众号OpenID，商户需要调用code解码接口解码encrypt_code得到真实的code */
  miniprogram_path?: string;
}

export interface CardTemplateInfo {
  /** 收款方名称】 收款方名称，显示在电子发票卡券信息中，若不传则默认取商户名称  **/
  payee_name?: string;
  /** 【卡券logo地址】 卡券logo地址，请参考 */
  logo_url: string;
  /** 【卡券自定义cell位配置】 卡券自定义cell位配置，需要在卡券详情中增加 */
  custom_cell?: CustomCell;
}

export interface CreateCardTemplateRequest {
  /** 【插卡公众号AppID】 插卡公众号AppID。若是服务商模式，则可以是服务商申请的AppId，也可以是子商户申请的AppId；若是直连模式，则是直连商户申请的AppId */
  card_appid: string;
  card_template_information: CardTemplateInfo;
}

export interface CreateCardTemplateResponse {
  card_appid: string;
  card_id: string;
}

export interface FapiaoNotifyResult {
  mchid: string;
  fapiao_apply_id: string;
  apply_time: string;
}

export interface UserTitleEntity {
  /** 【购买方类型】 购买方类型， INDIVIDUAL: 个人, ORGANIZATION: 单位 */
  type: 'INDIVIDUAL' | 'ORGANIZATION';
  /** 【名称】 购买方名称 */
  name: string;
  /** 【纳税人识别号】 购买方纳税人识别号，购买方类型为ORGANIZATION时必须存在 */
  taxpayer_id?: string;
  /** 【地址】 购买方地址 */
  address?: string;
  /** 【电话】 购买方电话 */
  telephone?: string;
  /** 【开户银行】 购买方开户银行 */
  bank_name?: string;
  /** 【银行账号】 购买方银行账号 */
  bank_account?: string;
  /**【手机号】 用户手机号。注意：该字段为密文字段，加解密算法请参见《微信支付V3版规范》 */
  phone?: string;
  /** 【邮箱地址】 用户邮箱地址。注意：该字段为密文字段，加解密算法请参见《微信支付V3版规范》 */
  email?: string;
}

export type TAX_PREFER_MARK = 'NO_FAVORABLE' | 'OUTSIDE_VAT' | 'VAT_EXEMPT' | 'NORMAL_ZERO_RATED' | 'EXPORT_ZERO_RATED';
export type FAPIAO_SCENE = 'WITH_WECHATPAY' | 'WITHOUT_WECHATPAY';

export interface IssueItem {
  /** 【税局侧规定的货物或应税劳务、服务税收分类编码】 税局侧规定的货物或应税劳务、服务税收分类编码。可自行指定符合税务部门规定的货物或应税劳务、服务编码；若使用在电子发票商户平台配置的商品类型，需要从接口【获取商户可开具的商品和服务税收分类编码对照表】获得商户已配置的编码；若该行为折扣行，必须与被折扣行的编码相同。 */
  tax_code: string;
  /**
   * 【税局侧规定的货物或应税劳务、服务分类名称】 税局侧规定的货物或应税劳务、服务分类名称。
   * 若使用在电子发票商户平台配置的商品类型进行开票时，无需传该参数。可从接口【获取商户可开具的商品和服务税收分类编码对照表】获得商户已配置的商品信息，请确认配置信息是否正确。
   * 若该行为折扣行，则不设置
   */
  goods_category?: string;
  /**
   * 【货物或应税劳务、服务名称】 由商户自定义的货物或应税劳务、服务名称。
   * 若使用在电子发票商户平台配置的商品类型进行开票时，无需传该参数。可从接口【获取商户可开具的商品和服务税收分类编码对照表】获得商户已配置的商品信息，请确认配置信息是否正确。
   * 若该行为折扣行，则不设置
   */
  goods_name?: string;
  /** 【企业侧维护的货物或应税劳务、服务编码】 企业侧维护的货物或应税劳务、服务编码。若使用在电子发票商户平台配置的商品类型进行开票时，需要传该编号，可从接口【获取商户可 开具的商品和服务税收分类编码对照表】获得商户已配置的编码 */
  goods_id?: string;
  /**
   * 【规格型号】 规格型号，展示在发票中间的规格型号列。
   * 若使用在电子发票商户平台配置的商品类型进行开票时，无需传该参数。可从接口【获取商户可开具的商品和服务税收分类编码对照表】获得商户已配置的商品信息，请确认配置信息是否正确
   */
  specification?: string;
  /** 【单位】 单位，展示在发票中间的单位列 */
  unit?: string;
  /** 【数量】 数量，展示在发票中间的数量列，单位为10^-8^，100000000表示数量为1。若是折扣行或者没有数量概念，则默认为100000000 */
  quantity: number;
  /** 【单行金额合计】 单行金额和税费的和，折扣行的金额为负数，非折扣行的金额为正数，单位:分 */
  total_amount: number;
  /** 
   * 税率】 税率，单位为万分之一，如1300代表13%。
   * 若使用在电子发票商户平台配置的商品类型进行开票时，无需传该参数。可从接口【获取商户可开具的商品和服务税收分类编码对照表】获得商户已配置的商品信息，请确认配置信息是否正确。
   * 现在支持的税率为0、1%、1.5%、3%、5%、6%、9%、10%、11%、13%、16%、17%
   */
  tax_rate?: number;
  /**
   * 【税收优惠政策标识】 若使用在电子发票商户平台配置的商品类型进行开票时，无需传该参数。可从接口【获取商户可开具的商品和服务税收分类编码对照表】获得商户已配置的商品信息，请确认配置信息是否正确。若该行为折扣行，则不设置可选取值： 
   * 
   * + NO_FAVORABLE: 无优惠
   * + OUTSIDE_VAT: 不征税
   * + VAT_EXEMPT: 免税
   * + NORMAL_ZERO_RATED: 普通零税率
   * + EXPORT_ZERO_RATED: 出口零税率
   */
  tax_prefer_mark?: TAX_PREFER_MARK;
  /** 【是否折扣行】 指定该发票行是否折扣行，折扣行必须是被折扣行的下一行 */
  discount: boolean;
}

export interface IssueFapiaoInfo {
  /** 【商户发票单号】 商户发票单号，唯一标识一张要开具的发票。只能是字母、数字、中划线-、下划线_、竖线|、星号*这些英文半角字符，且该单号在每个商户下必须唯一 */
  fapiao_id: string;
  /** 【总价税合计】 总价税合计，所有发票行单行金额合计的累加，展示在发票的价税合计处，单位：分 注意：若是微信支付后开票，所有发票的总价税合计之和不能超过对应的微信支付单总金额；若是非微信支付开票，所有发票的总价税合计之和不能超过【获取用户授权链接】接口中指定的总金额 */
  total_amount: number;
  /** 【是否以清单形式开具发票】 若商户使用的是区块链电子发票产品，则不支持以清单形式开具发票，该字段不需要传值 */
  need_list?: boolean;
  /** 【发票备注】 发票备注 */
  remark?: string;
  /** 【发票行信息】 发票行信息，单张发票的发票行不能超过8行 */
  items: IssueItem[];
}

export interface IssueFapiaoRequest {
  /** 【开票场景】 开票场景， WITH_WECHATPAY: 微信支付场景， WITHOUT_WECHATPAY: 非微信支付场景 */
  scene: FAPIAO_SCENE;
  /** 【发票申请单号】 发票申请单号，唯一标识一次开票行为。当开票场景为WITHOUT_WECHATPAY时，为调用【获取用户授权链接】接口时指定的发票申请单号；当开票场景为WITH_WECHATPAY时，为与本次开票关联的微信支付订单号，且必须是属于相应商户的订单（服务商模式下该订单必须属于子商户；直连模式下该订单必须属于直连商户） */
  fapiao_apply_id: string;
  /** 【购买方信息】 购买方信息，即发票抬头。若商户使用微信官方抬头，可从【获取用户授权信息】接口获取用户填写的抬头；也可自行收集发票抬头 */
  buyer_information: UserTitleEntity;
  /** 【需要开具的发票信息】 需要开具的发票信息。注意：同一个开票申请单最多申请5张发票 */
  fapiao_information: IssueFapiaoInfo[];
}

export interface GetUserTitleParams {
  fapiao_apply_id: string;
  scene: FAPIAO_SCENE;
}

export interface FapiaoItem {
  tax_code: string;
  goods_name: string;
  specification?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  amount: number;
  tax_amount: number;
  total_amount: number;
  tax_rate: number;
  tax_prefer_mark: TAX_PREFER_MARK;
  discount: boolean;
}
export interface ExtraInformation {
  payee: string;
  reviewer: string;
  drawer: string;
}

export interface SellerInfo {
  name: string;
  taxpayer_id: string;
  address: string;
  telephone?: string;
  bank_name?: string;
  bank_account?: string;
}
export interface CardInfo {
  card_appid: string;
  card_openid: string;
  card_id?: string;
  card_code?: string;
  card_status: 'INSERT_ACCEPTED' | 'INSERTED' | 'DISCARD_ACCEPTED' | 'DISCARDED';
}

export interface FapiaoInfo {
  fapiao_code: string;
  fapiao_number: string;
  check_code: string;
  password: string;
  fapiao_time: string;
}

export interface FapiaoEntity {
  fapiao_id: string;
  status: 'ISSUE_ACCEPTED' | 'ISSUED' | 'REVERSE_ACCEPTED' | 'REVERSED';
  blue_fapiao: FapiaoInfo;
  red_fapiao: FapiaoInfo;
  card_information: CardInfo;
  total_amount: number;
  tax_amount: number;
  amount: number;
  seller_information: SellerInfo;
  buyer_information: UserTitleEntity;
  extra_information: ExtraInformation;
  items?: FapiaoItem[];
  /** 【备注信息】 备注信息 */
  remark?: string;
}

export interface GetIssueFapiaoResponse {
  total_count: number;
  fapiao_information: FapiaoEntity[];
}

export interface ReverseFapiaoInfo {
  fapiao_id: string;
  fapiao_code: string;
  fapiao_number: string;
}

export interface ReverseFapiaoRequest {
  reverse_reason: string;
  fapiao_information?: ReverseFapiaoInfo[];
}

/** 电子发票 **/
