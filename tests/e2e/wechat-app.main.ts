import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import WeChatAppModule from './wechat-app.module';

/**
 * 测试接收微信公众号服务器配置等推送
 * 
 * 需要运行在公网环境，或者穿透内网环境
 * 
 * 运行命令：npx cross-env TEST_TOKEN=your/token TEST_AESKEY=your/aeskey ts-node tests/e2e/wechat-app.main.ts
 */
async function bootstrap () {
  const app = await NestFactory.create(WeChatAppModule);

  app.enableShutdownHooks();

  await app.listen(3000, async () => {
    Logger.log(`process.env.NODE_ENV = ${process.env.NODE_ENV}`);
    Logger.log(`process.env.APP_ENV = ${process.env.APP_ENV}`);
    Logger.log(`process.env.TZ = ${process.env.TZ}`);
    Logger.log(`Application is running on: ${await app.getUrl()}`);
  });
  process.on('uncaughtException', function (err) {
    Logger.error('Caught exception: ' + err);
  });
}
bootstrap();
