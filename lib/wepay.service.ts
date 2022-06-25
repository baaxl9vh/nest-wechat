import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

import { createNonceStr } from './utils';

/**
 * JSAPI Order Data Interface
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

@Injectable()
export class WePayService {

  private readonly logger = new Logger(WePayService.name);

  async getPlatformCertificates (mchId: string, serialNo: string, privateKey: Buffer | string) {
    // TODO:
    const nonceStr = createNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);
    let url = '/v3/certificates';
    const signature = this.generateSignature('POST', url, timestamp, nonceStr, privateKey);
    url = 'https://api.mch.weixin.qq.com' + url;
    return await axios.get(url, {
      headers: this.generateHeader(mchId, nonceStr, timestamp, serialNo, signature),
    });
  }

  /**
   * JSAPI下单
   * @param order 下单信息
   * @param serialNo 私钥序列号
   * @param privateKey 私钥
   * @returns 
   * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_1.shtml
   */
  async transactionsJsapi (order: TransactionOrder, serialNo: string, privateKey: Buffer | string) {
    const nonceStr = createNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);
    let url = '/v3/pay/transactions/jsapi';
    const signature = this.generateSignature('POST', url, timestamp, nonceStr, privateKey, order);
    url = 'https://api.mch.weixin.qq.com' + url;
    return await axios.post(url, order, {
      headers: this.generateHeader(order.mchid, nonceStr, timestamp, serialNo, signature),
    });
  }

  /**
   * 商户订单号查询订单
   * @param id 
   * @param mchId 
   * @param serialNo 
   * @param privateKey 
   * @returns 
   */
  async getTransactionsId (id: string, mchId: string, serialNo: string, privateKey: Buffer | string) {
    const nonceStr = createNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);
    let url = `/v3/pay/transactions/id/${id}?mchid=${mchId}`;
    const signature = this.generateSignature('POST', url, timestamp, nonceStr, privateKey);
    url = 'https://api.mch.weixin.qq.com' + url;
    return await axios.get(url, {
      headers: this.generateHeader(mchId, nonceStr, timestamp, serialNo, signature),
    });
  }

  /**
   * 微信支付订单号查询订单
   * @param outTradeNo 
   * @param mchId 
   * @param serialNo 
   * @param privateKey 
   * @returns 
   */
  async getTransactionsOutTradeNo (outTradeNo: string, mchId: string, serialNo: string, privateKey: Buffer | string) {
    const nonceStr = createNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);
    let url = `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${mchId}`;
    const signature = this.generateSignature('POST', url, timestamp, nonceStr, privateKey);
    url = 'https://api.mch.weixin.qq.com' + url;
    return await axios.get(url, {
      headers: this.generateHeader(mchId, nonceStr, timestamp, serialNo, signature),
    });
  }

  /**
   * 构造小程序调起支付参数
   * @param appId String 小程序APPID
   * @param prepayId String JSAPI下单生成的prepay_id
   * @param privateKey String 微信支付私钥
   * @returns MiniProgramPaymentParameters
   * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_4.shtml
   */
  buildMiniProgramPayment (appId: string, prepayId: string, privateKey: Buffer | string): MiniProgramPaymentParameters {
    const nonceStr = createNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${appId}\n${timestamp}\n${nonceStr}\nprepay_id=${prepayId}\n`;
    const paySign = crypto.createSign('sha256WithRSAEncryption').update(message).sign(privateKey, 'base64');
    return {
      timeStamp: timestamp.toString(),
      nonceStr,
      package: `prepay_id=${prepayId}`,
      signType: 'RSA',
      paySign,
    };
  }

  generateHeader (mchId: string, nonceStr: string, timestamp: number, serialNo: string, signature: string) {
    return {
      'Authorization': `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${serialNo}"`,
    };
  }
  /**
   * 生成请求签名串
   * @param method 
   * @param url 
   * @param timestamp 
   * @param nonceStr 
   * @param privateKey 
   * @param body 
   * @returns 
   */
  generateSignature (method: 'GET' | 'POST', url: string, timestamp: number, nonceStr: string, privateKey: Buffer | string, body?: object): string {
    let message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n\n`;

    if (method === 'POST') {
      if (!body) {
        body = {};
      }
      message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${JSON.stringify(body)}\n`;
    }
    return crypto.createSign('sha256WithRSAEncryption').update(message).sign(privateKey, 'base64');
  }
}