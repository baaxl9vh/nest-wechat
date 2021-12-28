# nest-wechat

NestJS Module for WeChat

## Description

NestJS Module for WeChat official account API.

微信公众号网页开发 nestjs 模块封装。

## Installation

```shell
npm i --save nest-wechat
```

## Quick Start

```typescript
import { Module } from '@nestjs/common';

import { WeChatModule } from 'nest-wechat';

@Module({
  imports: [WeChatModule.register({appId: 'your app id', secret: 'your secret'})],
})
export class AppModule {
}
```

## Run Test

Create .env.test.local file, and save your test appid and secret in the file.
