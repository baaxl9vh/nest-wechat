# nest-wechat

NestJS Module for WeChat

## Description

NestJS Module for WeChat

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
