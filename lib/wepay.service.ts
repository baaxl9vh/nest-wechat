import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import forge from 'node-forge';
import getRawBody from 'raw-body';

import {
  CallbackResource,
  CertificateResult,
  MiniProgramPaymentParameters,
  RefundParameters,
  RefundResult,
  Trade,
  TransactionOrder,
} from './types';
import { createNonceStr } from './utils';

import type { Request, Response } from 'express';
@Injectable()
export class WePayService {

  private readonly logger = new Logger(WePayService.name);

  /**
   * 获取平台证书列表
   * @param mchId 
   * @param serialNo 
   * @param privateKey 
   * @param apiKey 
   * @returns 
   * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/wechatpay5_1.shtml
   */
  async getPlatformCertificates (mchId: string, serialNo: string, privateKey: Buffer | string, apiKey: string) {
    const certs: { sn: string, publicKey: string}[] = [];
    const nonceStr = createNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);
    let url = '/v3/certificates';
    const signature = this.generateSignature('GET', url, timestamp, nonceStr, privateKey);
    url = 'https://api.mch.weixin.qq.com' + url;
    const ret = await axios.get<{ data: CertificateResult[] }>(url, { headers: this.generateHeader(mchId, nonceStr, timestamp, serialNo, signature) });
    // console.log('ret.data.data =', ret.data.data);
    if (ret && ret.status === 200 && ret.data) {
      const certificates = ret.data.data;
      for (const cert of certificates) {
        const publicKey = this.decryptCipherText(apiKey, cert.encrypt_certificate.ciphertext, cert.encrypt_certificate.associated_data, cert.encrypt_certificate.nonce) as string;
        const sn = this.getCertificateSn(publicKey);
        certs.push({ sn, publicKey });
      }
    }
    return certs;
  }

  /**
   * JSAPI下单
   * @param order 下单信息
   * @param serialNo 私钥序列号
   * @param privateKey 私钥
   * @returns 
   * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_1.shtml
   */
  async jsapi (order: TransactionOrder, serialNo: string, privateKey: Buffer | string) {
    const nonceStr = createNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);
    let url = '/v3/pay/transactions/jsapi';
    const signature = this.generateSignature('POST', url, timestamp, nonceStr, privateKey, order);
    url = 'https://api.mch.weixin.qq.com' + url;
    return axios.post<{ prepay_id: string }>(url, order, {
      headers: this.generateHeader(order.mchid, nonceStr, timestamp, serialNo, signature),
    });
  }

  async h5 () {
    // H5下单
    // https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_1.shtml
    // https://api.mch.weixin.qq.com/v3/pay/transactions/h5
  }

  /**
   * 商户订单号查询订单
   * @param id 
   * @param mchId 
   * @param serialNo 
   * @param privateKey 
   * @returns 
   */
  async getTransactionById (id: string, mchId: string, serialNo: string, privateKey: Buffer | string) {
    const nonceStr = createNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);
    let url = `/v3/pay/transactions/id/${id}?mchid=${mchId}`;
    const signature = this.generateSignature('GET', url, timestamp, nonceStr, privateKey);
    url = 'https://api.mch.weixin.qq.com' + url;
    return axios.get<Trade>(url, {
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
  async getTransactionByOutTradeNo (outTradeNo: string, mchId: string, serialNo: string, privateKey: Buffer | string) {
    const nonceStr = createNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);
    let url = `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${mchId}`;
    const signature = this.generateSignature('GET', url, timestamp, nonceStr, privateKey);
    url = 'https://api.mch.weixin.qq.com' + url;
    return axios.get<Trade>(url, {
      headers: this.generateHeader(mchId, nonceStr, timestamp, serialNo, signature),
    });
  }

  /**
   * 关闭订单
   * @param outTradeNo 
   * @param mchId 
   * @param serialNo 
   * @param privateKey 
   * @returns 
   * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_3.shtml
   */
  async close (outTradeNo: string, mchId: string, serialNo: string, privateKey: Buffer | string) {
    const data = { mchid: mchId };
    const nonceStr = createNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);
    let url = `/v3/pay/transactions/out-trade-no/${outTradeNo}/close`;
    const signature = this.generateSignature('POST', url, timestamp, nonceStr, privateKey, data);
    url = 'https://api.mch.weixin.qq.com' + url;
    return axios.post(url, data, {
      headers: this.generateHeader(mchId, nonceStr, timestamp, serialNo, signature),
    });
  }

  /**
   * 申请退款
   * @param refund 
   * @param mchId 
   * @param serialNo 
   * @param privateKey 
   * @returns 
   * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_9.shtml
   */
  async refund (refund: RefundParameters, mchId: string, serialNo: string, privateKey: Buffer | string) {
    const nonceStr = createNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);
    let url = '/v3/refund/domestic/refunds';
    const signature = this.generateSignature('POST', url, timestamp, nonceStr, privateKey, refund);
    url = 'https://api.mch.weixin.qq.com' + url;
    return axios.post<RefundResult>(url, refund, {
      headers: this.generateHeader(mchId, nonceStr, timestamp, serialNo, signature),
    });
  }

  private async getRefund () {
    // 查询单笔退款
    // https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_10.shtml
    // https://api.mch.weixin.qq.com/v3/refund/domestic/refunds/{out_refund_no}
    // GET
  }

  private async refundedCallback () {
    // 退款结果通知
    // https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_11.shtml
    // 
  }

  private async getTradeBill () {
    // 申请交易账单
    // https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_6.shtml
    // https://api.mch.weixin.qq.com/v3/bill/tradebill
    // get
  }

  private async getFlowBill () {
    // 申请资金账单
    // https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_7.shtml
    // https://api.mch.weixin.qq.com/v3/bill/fundflowbill
    // get

  }

  /**
   * 支付通知处理程序
   * @param publicKey 
   * @param apiKey 
   * @param req 
   * @param res 
   * @returns 
   * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_5.shtml
   */
  async paidCallback (publicKey: Buffer | string, apiKey: string, req: Request, res: Response) {
    const signature = req.headers['Wechatpay-Signature'];
    const platformSerial = req.headers['Wechatpay-Serial'];
    const timestamp = req.headers['Wechatpay-Timestamp'];
    const nonce = req.headers['Wechatpay-Nonce'];
    const rawBody = await getRawBody(req);
    let verified = false;
    const responseData = { code: 'FAIL', message: '' };
    let result = {};
    const serial = this.getCertificateSn(publicKey);
    if (serial === platformSerial) {
      verified = this.verifySignature(publicKey, timestamp as string, nonce as string, rawBody, signature as string);
      if (verified) {
        const resource: CallbackResource = JSON.parse(rawBody.toString());
        result = this.decryptCipherText(apiKey, resource.ciphertext, resource.associated_data, resource.nonce);
      } else {
        responseData.message = 'verify signature fail';
      }
    } else {
      responseData.message = 'serial incorrect';
    }

    if (verified && res && typeof res.send === 'function') {
      res.status(200).send();
    } else {
      res.status(401).json(responseData);
    }
    return result;
  }

  /**
   * 报文解密
   * @param apiKey 
   * @param cipher 
   * @param associatedData 
   * @param nonce 
   * @returns 
   * @link https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay4_2.shtml
   */
  private decryptCipherText<T> (apiKey: string, cipher: string, associatedData: string, nonce: string): T {
    // algorithm: AEAD_AES_256_GCM
    const buff = Buffer.from(cipher, 'base64');
    const authTag = buff.slice(buff.length - 16);
    const data = buff.slice(0, buff.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', apiKey, nonce);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(associatedData));
    const decoded = decipher.update(data, undefined, 'utf8');
    decipher.final();
    try {
      return JSON.parse(decoded);
    } catch (e) {
      return decoded as unknown as T;
    }
  }

  /**
   * 回调或者通知签名验证方法
   * @param publicKey 
   * @param timestamp 
   * @param nonce 
   * @param body 
   * @param signature 
   * @returns 
   */
  private verifySignature (publicKey: Buffer | string, timestamp: string, nonce: string, body: string | object, signature: string): boolean {
    const message = `${timestamp}\n${nonce}\n${typeof body === 'string' ? body : JSON.stringify(body)}\n`;
    const verify = crypto.createVerify('RSA-SHA256').update(Buffer.from(message));
    return verify.verify(publicKey, signature, 'base64');
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

  /**
   * 构建请求签名
   * @param mchId 
   * @param nonceStr 
   * @param timestamp 
   * @param serialNo 
   * @param signature 
   * @returns 
   */
  private generateHeader (mchId: string, nonceStr: string, timestamp: number, serialNo: string, signature: string) {
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
  private generateSignature (method: 'GET' | 'POST', url: string, timestamp: number, nonceStr: string, privateKey: Buffer | string, body?: object): string {
    let message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n\n`;

    if (method === 'POST') {
      if (!body) {
        body = {};
      }
      message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${typeof body === 'string' ? body : JSON.stringify(body)}\n`;
    }
    return crypto.createSign('sha256WithRSAEncryption').update(message).sign(privateKey, 'base64');
  }

  /**
   * 读取x509证书序列号
   * @param publicKey 
   * @returns 
   */
  getCertificateSn (publicKey: Buffer | string): string {
    return forge.pki.certificateFromPem(publicKey.toString()).serialNumber.toUpperCase();
  }
}