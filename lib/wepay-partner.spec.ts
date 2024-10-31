import * as fs from 'fs';
import * as path from 'path';

import { RefundParameters, RequireOnlyOne, TransactionOrder } from './types';
import { WePayService } from './wepay.service';
import { RefundParametersOfPartner, TransactionOrderOfPartner } from './types/wepay-partner';
import { AxiosError } from 'axios';

jest.setTimeout(20000);

/**
 * 
 * npm run test lib/wepay-partner.spec.ts
 * 
 */

describe('WePayService Partner Test(Unit)', () => {

  const spAppId = 'your/sp/appid';
  const spMchId = 'your/sp/mch';
  const subAppId = 'your/sub/appid';
  const subMchId = 'your/sub/mch';
  const openId = 'the/sub/appid/user/openid';
  let serial: string;
  const apiKey = 'your/apiv3/key';
  const notifyUrl = `your/paid/callback/url`;

  let service: WePayService;
  let prepayId: string;
  let privateKey: Buffer;
  let publicKey: Buffer;

  let outTradeNo = '';

  beforeAll(() => {
    outTradeNo = spMchId + Math.random().toString().slice(3);
    service = new WePayService();
    privateKey = fs.readFileSync(path.join(process.cwd(), `apiclient_key_${spMchId}.pem`));
    publicKey = fs.readFileSync(path.join(process.cwd(), `apiclient_cert_${spMchId}.pem`));
  });

  it('Should get the certificate serial number', () => {
    serial = service.getCertificateSn(publicKey);
    console.log('serial:', serial);
    expect(serial).toBeDefined();
  });

  it('Should return prepay_id', async () => {
    const order: TransactionOrderOfPartner = {
      sp_appid: spAppId,
      sp_mchid: spMchId,
      sub_appid: subAppId,
      sub_mchid: subMchId,
      description: '测试商品',
      out_trade_no: outTradeNo,
      notify_url: notifyUrl,
      amount: {
        total: 1,
        currency: 'CNY',
      },
      payer: {
        sub_openid: openId,
      },
    }

    try {
      const ret = await service.jsapiOfPartner(order, serial, privateKey);
      expect(ret.data).toBeDefined();
      expect(ret.data.prepay_id).toBeDefined();
      prepayId = ret.data.prepay_id;
      console.log('prepayId:', prepayId);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(JSON.stringify(error?.response?.data));
      } else {
        console.log('error: ', (error as any)?.message);
      }
      expect(error).toBeUndefined();
    }
  });

  it('Should build the wechat pay parameters', () => {
    const params = service.buildJSAPIParameters(subAppId, prepayId, privateKey);
    expect(params).toBeDefined();
    expect(params.paySign).toBeDefined();
    console.log('paySign:', params.paySign);
  });

  it('Should get platform certificates', async () => {
    const certs = await service.getPlatformCertificates(spMchId, serial, privateKey, apiKey);
    expect(certs).toBeDefined();
    expect(certs.size).toBeGreaterThan(0);
  });

  it('Should get one trade by out trade no', async () => {
    const ret = await service.getTransactionByOutTradeNoOfPartner(outTradeNo, spMchId, subMchId, serial, privateKey);
    expect(ret.data).toBeDefined();
    expect(ret.data.out_trade_no).toStrictEqual(outTradeNo);
  });

  it('Should get one trade by transaction id', async () => {
    const id = 'your/transaction/id';
    const ret = await service.getTransactionByIdOfPartner(id, spMchId, subMchId, serial, privateKey);
    expect(ret.data).toBeDefined();
    expect(ret.data.transaction_id).toStrictEqual(id);
  });

  it('Should refund success', async () => {
    const no = 'your/out/trade/no'
    const refundParameters: RequireOnlyOne<RefundParametersOfPartner, 'transaction_id' | 'out_trade_no'> = {
      sub_mchid: subMchId,
      out_trade_no: no,
      out_refund_no: no,
      amount: {
        refund: 1, // how much
        total: 1, // how much
        currency: 'CNY',
      },
    };
    const ret = await service.refundOfPartner(refundParameters, spMchId, serial, privateKey);
    console.log(ret.data);
    expect(ret.data.out_refund_no).toStrictEqual(no);
  });

  it('Should refund fail', async () => {
    const refundParameters: RequireOnlyOne<RefundParametersOfPartner, 'transaction_id' | 'out_trade_no'> = {
      sub_mchid: subMchId,
      out_trade_no: outTradeNo,
      out_refund_no: outTradeNo,
      amount: {
        refund: 1,
        total: 1,
        currency: 'CNY',
      },
    };
    try {
      const ret = await service.refundOfPartner(refundParameters, spMchId, serial, privateKey);
      expect(ret).toBeUndefined();
    } catch (error) {
      const response = (error as any).response;
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.code).toStrictEqual('RESOURCE_NOT_EXISTS');
    }
  });

  it('Should close one trade', async () => {
    const ret = await service.closeOfPartner(outTradeNo, spMchId, subMchId, serial, privateKey);
    expect(ret.status).toStrictEqual(204);
  });

  it('Should get one refund by refund no', async () => {
    // const no = 'your/out/refund/no';
    const no = '2024062819392033311872879963';
    try {
      const ret = await service.getRefundOfPartner(no, spMchId, subMchId, serial, privateKey);
      expect(ret.data).toBeDefined();
      expect(ret.data.out_refund_no).toStrictEqual(no);      
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(JSON.stringify(error?.response?.data));
      } else {
        console.log('error: ', (error as any)?.message);
      }
      expect(error).toBeUndefined();
    }
  });

  it('Should decrypt ciphertext', async () => {
    const ciphertext = 'your/ciphertext';
    const plain = service.decryptCipherText(apiKey, ciphertext, 'the/associated/data', 'the/nonce');
    expect(plain).toBeDefined();
  });

});