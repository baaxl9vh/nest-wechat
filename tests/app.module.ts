import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { WeChatModule } from '../lib';

@Module({})
export class AppModule {

  public static configAppIdAndSecret (appId: string, secret: string): DynamicModule {
    return {
      module: AppModule,
      imports: [WeChatModule.register({appId, secret})],
    };
  }

  public static injectConfigModule (): DynamicModule {
    return {
      module: AppModule,
      imports: [
        WeChatModule.forRoot({
          imports: [ConfigModule.forRoot({
            envFilePath: '.env.test.local',
          })],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            appId: configService.get('TEST_APPID') || '',
            secret: configService.get('TEST_SECRET') || '',
          }),
        }),
      ],
    };
  }

}