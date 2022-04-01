import { Test } from '@nestjs/testing';
import axios from 'axios';

import { AccountAccessTokenResult, TemplateMessage, TicketResult, WeChatService } from '../../lib';
import { AppModule } from '../app.module';

describe('Test module register', () => {

  it('Should register module with config', async () => {

    const module = await Test.createTestingModule({
      imports: [AppModule.injectConfigModule()],
    }).compile();

    const app = module.createNestApplication();
    const service = app.get(WeChatService);

    jest.spyOn(axios, 'get');

    jest.spyOn(service.cacheAdapter, 'set');
    jest.spyOn(service.cacheAdapter, 'get');

    const ret = await service.getAccountAccessToken();
    // call set to cache
    expect(service.cacheAdapter.set).toBeCalledTimes(1);
    // must got access_token
    expect(ret).toHaveProperty('access_token');
    const accessToken = ret.access_token;

    const retTicket = await service.getJSApiTicket().catch((err) => err);
    expect(retTicket).not.toBeInstanceOf(Error);
    // use access from token
    expect(service.cacheAdapter.get).toBeCalledTimes(1);

    expect(retTicket).toHaveProperty('errcode', 0);
    // must got ticket
    expect(retTicket).toHaveProperty('ticket');
    const ticket = retTicket.ticket;

    // cache must be the same
    expect(accessToken).toEqual((await service.cacheAdapter.get<AccountAccessTokenResult>(WeChatService.KEY_ACCESS_TOKEN)).access_token);
    expect(service.cacheAdapter.get).toBeCalledTimes(2);
    expect(ticket).toEqual((await service.cacheAdapter.get<TicketResult>(WeChatService.KEY_TICKET)).ticket);
    expect(service.cacheAdapter.get).toBeCalledTimes(3);

    // to sign a url and use the ticket in cache
    let sign = await service.jssdkSignature(process.env.TEST_JSSDK_URL || '').catch(err => err);

    // cache get call
    expect(service.cacheAdapter.get).toBeCalledTimes(4);

    expect(sign).toHaveProperty('appId', process.env.TEST_APPID);
    expect(sign.nonceStr).toBeTruthy();
    expect(sign.nonceStr).toBeTruthy();
    expect(sign.timestamp).toBeTruthy();
    expect(sign.signature).toBeTruthy();

    // throw error when no url
    expect(service.jssdkSignature('')).resolves.toThrow();

    // request an access token and a ticket
    expect(axios.get).toBeCalledTimes(2);

    // make the ticket and the token expire
    const ticketInCache = await service.cacheAdapter.get<TicketResult>(WeChatService.KEY_TICKET);
    // eslint-disable-next-line camelcase
    ticketInCache.expires_in -= 10800;
    service.cacheAdapter.set(WeChatService.KEY_TICKET, ticketInCache);
    const tokenInCache = await service.cacheAdapter.get<AccountAccessTokenResult>(WeChatService.KEY_ACCESS_TOKEN);
    // eslint-disable-next-line camelcase
    tokenInCache.expires_in -= 10800;
    service.cacheAdapter.set(WeChatService.KEY_ACCESS_TOKEN, tokenInCache);

    // now they are expired

    // empty the sign
    sign = {
      appId: '',
      nonceStr: '',
      timestamp: 0,
      signature: '',
    };

    sign = await service.jssdkSignature(process.env.TEST_JSSDK_URL || '');

    expect(sign).toHaveProperty('appId', process.env.TEST_APPID);
    expect(sign.nonceStr).toBeTruthy();
    expect(sign.nonceStr).toBeTruthy();
    expect(sign.timestamp).toBeTruthy();
    expect(sign.signature).toBeTruthy();

    // request call twice
    expect(axios.get).toBeCalledTimes(4);

    // eslint-disable-next-line camelcase
    ticketInCache.expires_in += 10800;
    service.cacheAdapter.set(WeChatService.KEY_TICKET, ticketInCache);
    // eslint-disable-next-line camelcase
    tokenInCache.expires_in += 10800;
    service.cacheAdapter.set(WeChatService.KEY_ACCESS_TOKEN, tokenInCache);

    // now token and ticket are valid
    const message: TemplateMessage = {
      touser: 'osMyH5vmDjG3ouh2qfSm3EItWLyk',
      // eslint-disable-next-line camelcase
      template_id: 'Kr6sFcWadMfRz_rZumNbLw-mtZ5qJEeCo3X4pdcmNAQ',
      data: {
        'TITLE': {
          value: 'This is title',
        },
      },
    };
    const msgRet = await service.sendTemplateMessage(message);
    expect(msgRet).toHaveProperty('errcode', 0);

    await app.close();
  });

});