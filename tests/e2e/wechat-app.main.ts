import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import WeChatAppModule from './wechat-app.module';


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
