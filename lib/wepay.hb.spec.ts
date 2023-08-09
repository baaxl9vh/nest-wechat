import * as fs from 'fs';
import * as path from 'path';

import { AxiosError } from 'axios';
import { GroupRedPackData, RedPackData } from './types';
import { WePayService } from './wepay.service';
import { XMLParser } from 'fast-xml-parser';

jest.setTimeout(20000);

describe('WePayService Test(Unit)', () => {

  // 绑定的公众号appid
  const appId = 'your/appid';
  // 商户
  const mchId = 'your/mch/id';

  // 微信支付apiv2 key， important: v2
  const apiKey = 'your/v2/apikey';

  let service: WePayService;
  let privateKey: Buffer;
  let publicKey: Buffer;

  const xmlParse = new XMLParser();

  const SUCCESS = 'SUCCESS';
  const FAIL = 'FAIL';

  const NO = '20230809012611915';

  beforeAll(() => {
    service = new WePayService(true);
    privateKey = fs.readFileSync(path.join(__dirname, '..', 'apiclient_key.pem'));
    publicKey = fs.readFileSync(path.join(__dirname, '..', 'apiclient_cert.pem'));
  });

  it('Should send red pack', async () => {
    try {
      const dataObj: RedPackData = {
        billNO: NO,
        sendName: '测试发送者',
        recipientOpenId: 'recipient/openid',
        totalAmount: 1,
        totalNum: 1,
        wishing: '测试祝福',
        clientIp: 'client/ip',
        actName: '测试活动',
        remark: '测试备注',
        sceneId: 'PRODUCT_4',
      }
      const ret = await service.sendRedPack(dataObj, appId, mchId, apiKey, publicKey, privateKey);
      expect(ret.status).toStrictEqual(200);
      const data = xmlParse.parse(ret.data);
      expect(data.xml.return_code).toStrictEqual(SUCCESS);
      expect(data.xml.result_code).toStrictEqual(FAIL);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data || error.status);
      } else {
        console.log('error =', error);
      }
      expect(error).toBeUndefined();
    }

  });

  it('Should send group red pack', async () => {

    try {
      const dataObj: GroupRedPackData = {
        billNO: NO,
        sendName: '测试发送者',
        recipientOpenId: 'recipient/openid',
        totalAmount: 1000,
        totalNum: 3,
        wishing: '测试祝福',
        clientIp: 'client/ip',
        actName: '测试活动',
        remark: '测试备注',
        sceneId: 'PRODUCT_4',
        amtType: 'ALL_RAND',
      }
      const ret = await service.sendGroupRedPack(dataObj, appId, mchId, apiKey, publicKey, privateKey);
      expect(ret.status).toStrictEqual(200);
      const data = xmlParse.parse(ret.data);
      expect(data.xml.return_code).toStrictEqual(SUCCESS);
      expect(data.xml.result_code).toStrictEqual(FAIL);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data || error.status);
      } else {
        console.log('error =', error);
      }
      expect(error).toBeUndefined();
    }
  });

  it('Should get hb info', async () => {
    try {
      const ret = await service.getHbInfo(NO, appId, mchId, apiKey, publicKey, privateKey);
      expect(ret.status).toStrictEqual(200);
      const data = xmlParse.parse(ret.data);
      expect(data.xml.return_code).toStrictEqual(SUCCESS);
      expect(data.xml.result_code).toStrictEqual(FAIL);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data || error.status);
      } else {
        console.log('error =', error);
      }
      expect(error).toBeUndefined();
    }
  });

});