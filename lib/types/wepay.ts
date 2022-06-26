
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
