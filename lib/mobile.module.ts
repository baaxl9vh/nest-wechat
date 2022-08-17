import { DynamicModule, Module } from '@nestjs/common';

import { MobileService } from './mobile.service';
import { WeChatMobileModuleOptions } from './mobile.types';

@Module({})
export class WeChatMobileModule {

  public static register (options?: WeChatMobileModuleOptions): DynamicModule {
    return {
      global: options?.isGlobal,
      module: WeChatMobileModule,
      providers: [{
        provide: MobileService,
        useValue: new MobileService(),
      }],
      exports: [MobileService],
    };
  }

}