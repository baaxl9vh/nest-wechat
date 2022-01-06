import { DynamicModule, Module, Provider } from '@nestjs/common';

import { WeChatModuleOptions, WeChatModuleRootOptions } from '.';
import { WECHAT_MODULE_OPTIONS } from './wechat.constants';
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

  public static forRoot (options: WeChatModuleRootOptions): DynamicModule {
    const providers: Provider[] = [];
    if (options.useFactory) {
      providers.push({
        provide: WECHAT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      });
    }
    providers.push({
      provide: WeChatService,
      inject: [WECHAT_MODULE_OPTIONS],
      useFactory: (opt: WeChatModuleOptions) => {
        return new WeChatService({ appId: opt.appId, secret: opt.secret});
      },
    });
    return {
      module: WeChatModule,
      imports: options.imports,
      providers,
      exports: [WeChatService],
    };
  }
}