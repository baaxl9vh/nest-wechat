import { DynamicModule, Module } from '@nestjs/common';

import { WeChatModuleOptions } from '.';
import { WeChatService } from './wechat.service';

@Module({})
export class WeChatModule {

  public static register (options: WeChatModuleOptions): DynamicModule {
    const service = new WeChatService({ appId: options.appId, secret: options.secret});
    return {
      module: WeChatModule,
      providers: [{
        provide: WeChatService,
        useValue: service,
      }],
      exports: [WeChatService],
    };
  }
}