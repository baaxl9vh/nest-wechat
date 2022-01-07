# nest-wechat

微信公众号、微信程序开、微信小游戏、微信支付以及企业微信等服务端API nestjs 模块封装。也可以直接当工具类使用。

nest-wechat的目的是自用，有用到的api就会先写，如果你需要用的api还没实现，可以提 [issues](https://github.com/baaxl9vh/nest-wechat/issues) 给我，我会尽快补上。

## 快速开始

### 安装

```shell
npm i --save nest-wechat
```

### nestjs 模块引入

+ register方法注册

```javascript
import { Module } from '@nestjs/common';

import { WeChatModule } from 'nest-wechat';

@Module({
  imports: [WeChatModule.register({appId: 'your app id', secret: 'your secret'})],
})
export class AppModule {
}
```

+ forRoot配置注册

```javascript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { WeChatModule } from 'nest-wechat';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: '.env.test.local',
  })],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    appId: configService.get('TEST_APPID') || '',
    secret: configService.get('TEST_SECRET') || '',
  }),
  })],
})
export class AppModule {
}
```

### 工具类引入

```javascript
import { WeChatService } from 'nest-wechat';
const service = new WeChatService({ appId: 'your app id', secret: 'your secret'});
```

## 全局接口

### ICache

```javascript
/**
 * 缓存接口，需要自定义缓存，请实现该接口
 * 
 * cache interface, please implement this interface if you need.
 * 
 */
export interface ICache {
  get<T> (key: string): Promise<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set (key: string, value: any): void;
  remove (key: string): boolean;
  clean (): void;
}
```

## WeChatService 属性与方法

### config: WeChatModuleOptions

配置读写属性，类型：WeChatModuleOptions

### cacheAdapter: ICache

缓存适配器读写属性，类型：ICache，默认是一个Map实现的缓存

## 微信公众号API

### 网页授权

#### getAccessTokenByCode

+ 参数：
  + {string} code 微信客户端打开授权页跳转后获取到的code
+ 返回值
  + Promise&lt;AccessTokenResult&gt; 调用后返回Promise

正确时返回

```json
{
  "access_token":"ACCESS_TOKEN",
  "expires_in":7200,
  "refresh_token":"REFRESH_TOKEN",
  "openid":"OPENID",
  "scope":"SCOPE" 
}
```

错误时返回

```json
{
    "errcode": 40029,
    "errmsg": "invalid code"
}
```

> [参考文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)

### 获取Access token

#### getAccountAccessToken

+ 返回值
  + Promise&lt;AccountAccessTokenResult&gt; 调用后返回Promise

正确时返回

```json
{
  "access_token": "52_s0Mcl3E3DBKs12rthjxG8_DOvsIC4puV9A34WQR6Bhb_30TW9W9BjhUxDRkyph-hY9Ab2QS03Q8wZBe5UkA1k0q0hc17eUDZ7vAWItl4iahnhq_57dCoKc1dQ3AfiHUKGCCMJ2NcQ0BmbBRIKBEgAAAPGJ",
  "expires_in": 7200
}
```

错误时返回

```json
{
  "errcode": 40013,
  "errmsg": "invalid appid"
}
```

> [参考文档](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html)

### 获取jsapi_ticket

#### getJSApiTicket

+ 返回值
  + Promise&lt;TicketResult&gt; 调用后返回Promise

返回数据

```json
{
  "errcode": 0,
  "errmsg": "ok",
  "ticket": "bxLdikRXVbTPdHSM05e5u5sUoXNKd8-41ZO3MhKoyN5OfkWITDGgnr2fwJ0m9E8NYzWKVZvdVtaUgWvsdshFKA",
  "expires_in": 7200
}
```

> [参考文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62)

### JS-SDK使用权限签名

#### jssdkSignature

+ 参数：
  + {string} url 参与签名计算的url
+ 返回值
  + Promise&lt;SignatureResult&gt; 调用后返回Promise

> [参考文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#65)

### 发送模板消息

#### sendTemplateMessage

+ 参数：
  + {TemplateMessage} message 模板消息参数类型
+ 返回值
  + Promise&lt;DefaultRequestResult & { msgid: string }&gt; 调用后返回Promise

> [参考文档](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html#5)

### Run Test

Create .env.test.local file, and save your test appid and secret in the file.

```config
TEST_APPID=your/test/appid
TEST_SECRET=your/test/secret
TEST_JSSDK_URL=https://your/website/url
TEST_TOKEN=your/token
TEST_AESKEY=your/aeskey
```

Run test.

```shell
npm run test
```
