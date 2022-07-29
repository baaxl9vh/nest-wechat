# nest-wechat

微信公众号、微信程序开、微信小游戏、微信支付以及企业微信等服务端API nestjs 模块封装。也可以直接当工具类使用。

nest-wechat的目的是自用，有用到的api就会先写，如果你需要用的api还没有，可以提 [issues](https://github.com/baaxl9vh/nest-wechat/issues) 给我，我会尽快补上。

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
import { CACHE_MANAGER, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { RedisCache, WeChatModule } from 'nest-wechat';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.test.local',
    }),
    WeChatModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, CACHE_MANAGER],
      useFactory: (configService: ConfigService, cache: Cache) => ({
        appId: configService.get('WX_APPID'),
        secret: configService.get('WX_SECRET'),
        token: configService.get('WX_TOKEN'),
        encodingAESKey: configService.get('WX_AESKEY'),
        cacheAdapter: new RedisCache(cache),
      }),
    }),
  ]
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
  close (): void;
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

```typescript
public async getAccessTokenByCode (code: string, _appId?: string, _secret?: string): Promise<UserAccessTokenResult>;
```

正确返回

```json
{
  "access_token":"ACCESS_TOKEN",
  "expires_in":7200,
  "refresh_token":"REFRESH_TOKEN",
  "openid":"OPENID",
  "scope":"SCOPE" 
}
```

错误返回

```json
{
    "errcode": 40029,
    "errmsg": "invalid code"
}
```

> [参考文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)

### 获取Access token

#### getAccountAccessToken

```typescript
public async getAccountAccessToken (_appId?: string, _secret?: string): Promise<AccountAccessTokenResult>;
```

正确返回

```json
{
  "access_token": "52_s0Mcl3E3DBKs12rthjxG8_DOvsIC4puV9A34WQR6Bhb_30TW9W9BjhUxDRkyph-hY9Ab2QS03Q8wZBe5UkA1k0q0hc17eUDZ7vAWItl4iahnhq_57dCoKc1dQ3AfiHUKGCCMJ2NcQ0BmbBRIKBEgAAAPGJ",
  "expires_in": 7200
}
```

错误返回

```json
{
  "errcode": 40013,
  "errmsg": "invalid appid"
}
```

> [参考文档](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html)

### 获取jsapi_ticket

#### getJSApiTicket

```typescript
public async getJSApiTicket (_appId?: string, _secret?: string): Promise<TicketResult>;
```

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

```typescript
public async jssdkSignature (url: string): Promise<SignatureResult>;
public async jssdkSignature (url: string, appId: string, secret:string): Promise<SignatureResult>;
```

> [参考文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#65)

### 发送模板消息

#### sendTemplateMessage

```typescript
public async sendTemplateMessage (message: TemplateMessage, appId?: string, secret?: string): Promise<DefaultRequestResult & { msgid: string }>;
```

> [参考文档](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html#5)

## 微信小程序

### 登录code2Session

#### mp.code2Session

```typescript
public async code2Session (code: string, appId?: string, secret?: string): Promise<SessionResult>;
```

返回数据

```json
{
  "openid": "openid",
  "session_key": "key",
  "unionid": "unionid",
  "errcode": 0,
  "errmsg": "ok",
}
```

> [参考文档](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html)

### 获取小程序码

```typescript
public async getUnlimited (accessToken: string, params: ParamCreateQRCode);
```

> [参考文档](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html)

### 获取手机号码

```javascript
public async getPhoneNumber (code: string, accessToken: string);
```

> [参考文档](https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-info/phone-number/getPhoneNumber.html)

## 微信支付

### 小程序

#### JSAPI下单

```javascript
pay.jsapi (order: TransactionOrder, serialNo: string, privateKey: Buffer | string): Promise<{prepay_id: string}>;
```

#### 商户订单号查询订单

```javascript
pay.getTransactionById (id: string, mchId: string, serialNo: string, privateKey: Buffer | string): Promise<Trade>;
```

#### 微信支付订单号查询订单

```javascript
pay.getTransactionByOutTradeNo (outTradeNo: string, mchId: string, serialNo: string, privateKey: Buffer | string): Promise<Trade>;
```

#### 关闭订单

```javascript
pay.close (outTradeNo: string, mchId: string, serialNo: string, privateKey: Buffer | string);
```

#### 申请请退

```javascript
pay.refund (refund: RequireOnlyOne<RefundParameters, 'transaction_id' | 'out_trade_no'>, mchId: string, serialNo: string, privateKey: Buffer | string): Promise<RefundResult>;
```

#### 查询单笔退款

```javascript
pay.getRefund (outRefundNo: string, mchId: string, serialNo: string, privateKey: Buffer | string): Promise<RefundResult>;
```

#### 构造小程序调起支付参数

```javascript
pay.buildMiniProgramPayment (appId: string, prepayId: string, privateKey: Buffer | string): MiniProgramPaymentParameters;
```

#### 支付通知处理程序

```javascript
pay.paidCallback (publicKey: Buffer | string, apiKey: string, req: Request, res: Response): Promise<Trade>;
```

### Run Test

Create .env.test.local file, and save your test appid and secret in the file.

```config
TEST_APPID=your/test/appid
TEST_SECRET=your/test/secret
TEST_JSSDK_URL=https://your/website/url
TEST_TOKEN=your/token
TEST_AESKEY=your/aeskey

REDIS_HOST=your/redis/host
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=600
```

Run test.

```shell
npm run test:e2e
```
