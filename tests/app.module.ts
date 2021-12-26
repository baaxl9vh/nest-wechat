import { DynamicModule, Module } from '@nestjs/common';

import { WeChatModule } from '../lib';

@Module({})
export class AppModule {

  public static configAppIdAndSecret (appId: string, secret: string): DynamicModule {
    return {
      module: AppModule,
      imports: [WeChatModule.register({appId, secret})],
    };
  }
}