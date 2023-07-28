import * as fs from 'fs';
import * as path from 'path';

import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { CreateCardTemplateRequest, FapiaoEntity, GetUserTitleParams, IssueFapiaoRequest, ReverseFapiaoRequest, Trade, UserTitleEntity } from './types';
import { WePayService } from './wepay.service';

jest.setTimeout(20000);

describe('WePayService Test(Unit)', () => {

  // 绑定的公众号appid
  const appId = 'your/official/account/id';
  // 发票模板logo
  const logo = 'your/logo';
  // 商户
  const mchId = 'your/mch/id';
  let serial: string;
  // 微信支付api key
  const apiKey = 'your/mch/api/key';
  // 发票通知URL
  const notifyUrl = `your/fapiao/callback/url`;
  // 待测微信支付订单
  const transactionId = 'your/test/transaction/id';
  // 订单购买方名称
  const taxpayer_name = 'your/buyer/company/name';
  // 订单纳税人识别号
  const taxpayer_id = 'your/buyer/company/tax/id';

  let fapiaoId = '20230727165252812';
  let issuedFapiao: FapiaoEntity;

  let service: WePayService;
  let privateKey: Buffer;
  let publicKey: Buffer;
  beforeAll(() => {
    service = new WePayService();
    privateKey = fs.readFileSync(path.join(__dirname, '..', 'apiclient_key_1637426819.pem'));
    publicKey = fs.readFileSync(path.join(__dirname, '..', 'apiclient_cert_1637426819.pem'));
  });

  it('Should get the certificate serial number', () => {
    serial = service.getCertificateSn(publicKey);
    expect(serial).toBeDefined();
  });

  it('Should get platform certificates', async () => {
    const certs = await service.getPlatformCertificates(mchId, serial, privateKey, apiKey);
    expect(certs).toBeDefined();
    expect(certs.size).toBeGreaterThan(0);
  });

  it('Should get set fapiao dev config', async () => {
    const ret = await service.fapiaoDevConfig({ callback_url: notifyUrl, show_fapiao_cell: true }, mchId, serial, privateKey);
    expect(ret.data.callback_url).toStrictEqual(notifyUrl);
    expect(ret.data.show_fapiao_cell).toStrictEqual(true);
  });

  it('Should get created fapiao card template', async () => {
    const template: CreateCardTemplateRequest = {
      card_appid: appId,
      card_template_information: {
        logo_url: logo,
      },
    };
    try {
      const ret = await service.createCardTemplate(template, mchId, serial, privateKey);
      expect(ret.data.card_appid).toStrictEqual(appId);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data);
      } else {
        console.log(error);
      }
      expect(error).toBeUndefined();
    }
  });

  it('Should get get user fapiao title and issue', async () => {
    let order: Trade;
    let total = 1000;
    try {
      const ret = await service.getTransactionById(transactionId, mchId, serial, privateKey);
      expect(ret.data.transaction_id).toStrictEqual(transactionId);
      order = ret.data;
      total = order.amount?.payer_total || 1000;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data);
      } else {
        console.log(error);
      }
      expect(error).toBeUndefined();
    }
    const params: GetUserTitleParams = {
      fapiao_apply_id: transactionId,
      scene: 'WITH_WECHATPAY',
    }
    let title: UserTitleEntity | undefined = undefined;
    try {
      const ret = await service.getUserTitle(params, mchId, serial, privateKey);
      console.log('title =', ret.data);
      title = ret && ret.data;
      expect(title.name).toStrictEqual(taxpayer_name);
      expect(title.taxpayer_id).toStrictEqual(taxpayer_id);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data);
      } else {
        console.log(error);
      }
      expect(error).toBeUndefined();
    }

    if (title) {
      fapiaoId = dayjs().format('YYYYMMDDHHmmssSSS');
      console.log('fapiaoId =', fapiaoId);
      const fapiao: IssueFapiaoRequest = {
        scene: 'WITH_WECHATPAY',
        fapiao_apply_id: transactionId,
        buyer_information: {
          type: 'ORGANIZATION',
          name: taxpayer_name,
          taxpayer_id: taxpayer_id,
        },
        fapiao_information: [
          {
            fapiao_id: fapiaoId,
            total_amount: total,
            items: [
              {
                tax_code: '3040502000000000000',
                goods_category: '经营租赁',
                goods_name: '停车费',
                unit: '次',
                quantity: 100000000,
                total_amount: total,
                tax_rate: 500,
                tax_prefer_mark: 'NO_FAVORABLE',
                discount: false,
              },
            ],
          },
        ],
      };
  
      if (title.taxpayer_id) fapiao.buyer_information.taxpayer_id = title.taxpayer_id;
      if (title.address) fapiao.buyer_information.address = title.address;
      if (title.telephone) fapiao.buyer_information.telephone = title.telephone;
      if (title.bank_name) fapiao.buyer_information.bank_name = title.bank_name;
      if (title.bank_account) fapiao.buyer_information.bank_account = title.bank_account;

      const certs = await service.getPlatformCertificates(mchId, serial, privateKey, apiKey);
      let platformSn = '';
      if (certs && certs.size > 0) {
        platformSn = certs.keys().next().value;
      }

      if (title.phone) {
        let phone = service.rsaDecryptOAEP(title.phone, privateKey).toString();
        phone = service.rsaEncryptOAEP(phone, certs.get(platformSn) as string).toString('base64');
        fapiao.buyer_information.phone = phone;
      }
      if (title.email) {
        let email = service.rsaDecryptOAEP(title.email, privateKey).toString();
        email = service.rsaEncryptOAEP(email, certs.get(platformSn) as string).toString('base64');
        fapiao.buyer_information.email = email;
      }

      console.log('psn =', platformSn);
      try {
        const ret = await service.issueFapiao(fapiao, mchId, serial, privateKey, platformSn);
        expect(ret.status).toStrictEqual(202);
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log(error.response?.data);
        } else {
          console.log(error);
        }
        expect(error).toBeUndefined();
      }
    } else {
      expect(title).toBeDefined();
    }    
  });

  it('Should get issued fapiao', async () => {
    try {
      const ret = await service.getIssueFapiao(transactionId, fapiaoId, mchId, serial, privateKey);
      console.log('ret =', JSON.stringify(ret.data));
      expect(ret.data.total_count).toStrictEqual(1);
      expect(ret.data.fapiao_information.length).toBeGreaterThan(0);
      const fapiao = ret.data.fapiao_information.pop();
      expect(fapiao?.buyer_information.name).toStrictEqual(taxpayer_name);
      issuedFapiao = fapiao as FapiaoEntity;      
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data);
      } else {
        console.log(error);
      }
    }
  });

  it('Should get reverse fapiao', async () => {
    const data: ReverseFapiaoRequest = {
      reverse_reason: 'refund',
      fapiao_information: [
        {
          fapiao_id: issuedFapiao.fapiao_id,
          fapiao_code: issuedFapiao.blue_fapiao.fapiao_code,
          fapiao_number: issuedFapiao.blue_fapiao.fapiao_number,
        },
      ]
    }
    try {
      const ret = await service.reverseFapiao(transactionId, data, mchId, serial, privateKey);
      expect(ret.status).toStrictEqual(202);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data);
      } else {
        console.log(error);
      }
      expect(error).toBeUndefined();
    }
  });

  it('Should encrypt and decrypt text', () => {
    const email = '123110@qq.com';
    const encryptBuf = service.rsaEncryptOAEP(email, publicKey);
    const decryptBuf = service.rsaDecryptOAEP(encryptBuf.toString('base64'), privateKey);
    expect(decryptBuf.toString()).toStrictEqual(email);
  });

});