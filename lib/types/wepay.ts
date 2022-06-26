
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
    currency: string,
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