
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