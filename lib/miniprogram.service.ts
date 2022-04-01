import { WeChatModuleOptions } from './types';
import axios from 'axios';
import { SessionResult } from './interfaces';

export class MiniProgramService {
  constructor (private options: WeChatModuleOptions) {}

  public async code2Session (code: string): Promise<SessionResult> {
    if (!this.options.appId || !this.options.secret) {
      throw new Error(`${MiniProgramService.name}': No appId or secret.`);
    } else {
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${this.options.appId}&secret=${this.options.secret}&js_code=${code}&grant_type=authorization_code`;
      return (await axios.get<SessionResult>(url)).data;
    }
  }

}
