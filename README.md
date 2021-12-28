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

```config
TEST_APPID=your/test/appid
TEST_SECRET=your/test/secret
```

Run test.

```shell
npm run test
```

## Service API

```typescript
getAccessTokenByCode (code: string): Promise<AccessTokenResult>;
getAccountAccessToken (): Promise<AccountAccessTokenResult>;
getJSApiTicket (accessToken?: string): Promise<TicketResult>;
jssdkSignature (url: string): Promise<SignatureResult>;
```
