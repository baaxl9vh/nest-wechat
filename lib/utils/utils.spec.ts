import { parseRid } from './index';

describe('Test utils', () => {

  it('test parse rid', () => {
    const rid = '626d1edb-0ff6bf1f-3bc3f260';
    const errMsg = `invalid credential, access_token is invalid or not latest rid: ${rid}`;
    const result = parseRid(errMsg);
    expect(result).toStrictEqual(rid);
  });

});