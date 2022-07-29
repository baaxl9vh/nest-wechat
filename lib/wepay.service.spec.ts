import * as fs from 'fs';
import * as path from 'path';

import { RefundParameters, RequireOnlyOne, TransactionOrder } from './types';
import { WePayService } from './wepay.service';

jest.setTimeout(20000);

describe('WePayService Test(Unit)', () => {

  const appId = 'your mini program app id';
  const mchId = 'your wechat mch id';
  const openId = 'your open id in app id above';
  let serial: string;
  const apiKey = 'your wechat pay api key v3';
  const notifyUrl = 'https://your/path/to/callback';

  let service: WePayService;
  let prepayId: string;
  let privateKey: Buffer;
  let publicKey: Buffer;

  let outTradeNo = '';

  beforeAll(() => {
    outTradeNo = mchId + Math.random().toString().slice(3);
    service = new WePayService();
    privateKey = fs.readFileSync(path.join(__dirname, '..', 'apiclient_key.pem'));
    publicKey = fs.readFileSync(path.join(__dirname, '..', 'apiclient_cert.pem'));
  });

  it('Should get the certificate serial number', () => {
    serial = service.getCertificateSn(publicKey);
    expect(serial).toBeDefined();
  });

  it('Should return prepay_id', async () => {
    const order: TransactionOrder = {
      appid: appId,
      mchid: mchId,
      description: '测试商品',
      out_trade_no: outTradeNo,
      notify_url: notifyUrl,
      amount: {
        total: 1,
        currency: 'CNY',
      },
      payer: {
        openid: openId,
      },
    }

    try {
      const ret = await service.jsapi(order, serial, privateKey);
      expect(ret.data).toBeDefined();
      expect(ret.data.prepay_id).toBeDefined();
      prepayId = ret.data.prepay_id;
    } catch (error) {
    }
  });

  it('Should build the wechat pay parameters', () => {
    const params = service.buildMiniProgramPayment(appId, prepayId, privateKey);
    expect(params).toBeDefined();
    expect(params.paySign).toBeDefined();
  });

  it('Should get platform certificates', async () => {
    const certs = await service.getPlatformCertificates(mchId, serial, privateKey, apiKey);
    expect(certs).toBeDefined();
    expect(Array.isArray(certs)).toStrictEqual(true);
    expect(certs[0].sn).toBeDefined();
  });

  it('Should get one trade by out trade no', async () => {
    const ret = await service.getTransactionByOutTradeNo(outTradeNo, mchId, serial, privateKey);
    expect(ret.data).toBeDefined();
    expect(ret.data.out_trade_no).toStrictEqual(outTradeNo);
  });

  it('Should refund fail', async () => {
    const refundParameters: RequireOnlyOne<RefundParameters, 'transaction_id' | 'out_trade_no'> = {
      out_trade_no: outTradeNo,
      out_refund_no: outTradeNo,
      amount: {
        refund: 1,
        total: 1,
        currency: 'CNY',
      },
    };
    try {
      const ret = await service.refund(refundParameters, mchId, serial, privateKey);
      expect(ret).toBeUndefined();
    } catch (error) {
      const response = (error as any).response;
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.code).toStrictEqual('RESOURCE_NOT_EXISTS');
    }
  });

  it('Should close one trade', async () => {
    const ret = await service.close(outTradeNo, mchId, serial, privateKey);
    expect(ret.status).toStrictEqual(204);
  });

  it('Should get one refund by refund no', async () => {
    const no = '2022062819392033311872879963';
    const ret = await service.getRefund(no, mchId, serial, privateKey);
    expect(ret.data).toBeDefined();
    expect(ret.data.out_refund_no).toStrictEqual(no);
  });

});