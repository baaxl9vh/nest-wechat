import { Injectable } from '@nestjs/common';

import { AccessTokenErrorResult, AccessTokenResult, OfficialAccountApi, WeChatServiceOptions } from '.';

@Injectable()
export class WeChatService {

  constructor (private readonly options: WeChatServiceOptions) {
  }

  public get config () {
    return this.options;
  }

  public async getAccessTokenByCode (code: string): Promise<AccessTokenResult | AccessTokenErrorResult> {
    if (!this.options.appId || !this.options.secret) {
      throw new Error(WeChatService.name + ': No appId or secret.');
    }
    return OfficialAccountApi.getAccessTokenCode(this.options.appId, this.options.secret, code);
  }
}
