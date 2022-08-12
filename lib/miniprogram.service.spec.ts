import { MiniProgramService } from './miniprogram.service';

describe('mini program service test', () => {

  let service: MiniProgramService;

  beforeAll(() => {
    service = new MiniProgramService({
      appId: 'your/mini/app/id',
      secret: 'your/mini/app/secret',
    });
  });

  it('Should not got a phone number use incorrect token', async () => {
    const accessToken = 'INCORRECT_TOKEN';
    const code = 'INCORRECT_CODE';
    try {
      const ret = await service.getPhoneNumber(code, accessToken);
      // { errcode: 40001, errmsg: 'invalid credential, access_token is invalid or not latest rid: 62c66213-76542f8c-06b14179'}
      expect(ret.data.errcode).toStrictEqual(40001);
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });

  it('Should get a short link', async () => {
    const token = '';
    const ret = await service.generateShortLink({ page_url: 'pages/index/index' }, token);
    console.log(ret.data.link);
  });

});