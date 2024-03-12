<div>
  <div align='center'>
    <h1>nest-wechat</h1>
  </div>
  <div>
    <p>微信公众号、微信程序开、微信小游戏、微信支付以及企业微信等服务端API nestjs 模块封装。也可以直接当工具类使用。</p>
    <p>nest-wechat是自用业务的封装，如果你需要用到的api还没有，可以提 <a href='https://github.com/baaxl9vh/nest-wechat/issues'>issues</a> 给我，我会尽快补上。</p>
    <div align='center'>
      <br />
      <sub><a href='https://baaxl9vh.github.io/nest-wechat/'>中文文档<a/></sub>
    </div>
  </div>
  <br />
</div>

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
        debug: true,
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

#### getUserInfo

公众号拉取用户信息

```typescript
public async getUserInfo (accessToken: string, openid: string, lang: 'zh_CN' | 'zh_TW' | 'en' = 'zh_CN'): Promise<UserInfoResult>;
```

正确返回

```json
{   
  "openid": "OPENID",
  "nickname": NICKNAME,
  "sex": 1,
  "province":"PROVINCE",
  "city":"CITY",
  "country":"COUNTRY",
  "headimgurl":"https://thirdwx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
  "privilege":[ "PRIVILEGE1" "PRIVILEGE2"     ],
  "unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL"
}
```

错误返回

```json
{
  "errcode":40003,
  "errmsg":" invalid openid "
}
```

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

### 获取稳定版接口调用凭据

#### getStableAccessToken

```typescript
public async getStableAccessToken (_appId?: string, _secret?: string, force = false): Promise<AccountAccessTokenResult>;
```

> [参考文档](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/getStableAccessToken.html)

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

### 生成带参数的二维码

#### createQRCode

```typescript
public async createQRCode (data: AccountCreateQRCode, appId?: string, secret?: string): Promise<AccountCreateQRCodeResult>;
```

> [参考文档](https://developers.weixin.qq.com/doc/offiaccount/Account_Management/Generating_a_Parametric_QR_Code.html)

### 通过ticket换取二维码

#### showQRCode

```typescript
public showQRCode (ticket: string): Promis<Buffer>;
```

> [参考文档](https://developers.weixin.qq.com/doc/offiaccount/Account_Management/Generating_a_Parametric_QR_Code.html)

### 填写服务器配置

#### checkSignatureExpress

```typescript
WeChatService.checkSignatureExpress (req: Request, res: Response);
```

Usage:

```typescript
@Get('push')
async pushTest (@Req() req: Request, @Res() res: Response) {
  this.service.checkSignatureExpress(req, res);
}
```

> [参考文档](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html)

### 接收事件推送

#### messagePushExpressHandler

```typescript
WeChatService.messagePushExpressHandler (req: Request, res?: Response, resText?: string);
```

Usage:

```typescript
@Post('push')
async officialPushTest (@Req() req: Request, @Res() res: Response) {
  const decrypt = await this.service.messagePushExpressHandler(req, res);
}
```

> [参考文档](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html)

## 微信小程序

### 获取接口调用凭据

```typescript
public getAccessToken (appId?: string, secret?: string): Promise<AccessTokenResult>;
```

```typescript
const service = new WeChatService({ appId: 'your app id', secret: 'your secret'});
const res = await service.mp.getAccessToken();
console.log(res.data.access_token);
```

### 查询rid信息

```typescript
public async getRid (rid: string, accessToken: string): Promise<RidInfo>;
```

### 获取插件用户openpid

```typescript
public async getPluginOpenPId (code: string, accessToken: string): Promise<DefaultRequestResult & { openpid: string }>;
```

### 登录code2Session

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

### 获取手机号码

```javascript
public async getPhoneNumber (code: string, accessToken: string);
```

> [参考文档](https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-info/phone-number/getPhoneNumber.html)

### 获取小程序码

```typescript
public async getQRCode (params: QRCode, accessToken: string): Promise<DefaultRequestResult & { contentType: string, buffer: Buffer }>;
```

### 获取不限制的小程序码

```typescript
public getUnlimitedQRCode (params: GetUnlimitedQRCode, accessToken: string): Promise<DefaultRequestResult & { buffer: Buffer }>;
```

### 获取小程序二维码

```typescript
public async createQRCode (params: CreateQRCode, accessToken: string): Promise<DefaultRequestResult & { contentType: string, buffer: Buffer }>;
```

### 查询scheme码

```typescript
public async queryScheme (scheme: string, accessToken: string): Promise<DefaultRequestResult & { scheme_info: SchemeInfo, scheme_quota: SchemeQuota }>;
```

### 获取scheme码

```typescript
public generateScheme (params: GenerateScheme, accessToken: string): Promise<DefaultRequestResult & { openlink: string >;
```

### 获取NFC的小程序scheme

```typescript
public generateNFCScheme (params: GenerateNFCScheme, accessToken: string): Promise<DefaultRequestResult & { openlink: string }>;
```

### 获取URLLink

```typescript
public generateUrlLink (params: GenerateUrlLink, accessToken: string): Promise<DefaultRequestResult & { url_link: string }>;
```

### 查询URLLink

```typescript
public queryUrlLink (urlLink: string, accessToken: string): Promise<UrlLinkResult>;
```

### 获取ShortLink

```typescript
public generateShortLink (params: GenerateShortLink, accessToken: string): Promise<DefaultRequestResult & { link: string }>;
```

### 下发统一消息

```typescript
public sendUniformMessage (params: SendUniformMessage, accessToken: string): Promise<DefaultRequestResult>;
```

### 创建activity_id

```typescript
public createActivityId (params: CreateActivityId, accessToken: string): Promise<ActivityIdResult>;
```

### 修改动态消息

```typescript
public setUpdatableMsg (params: UpdatableMsg, accessToken: string): Promise<DefaultRequestResult>;
```

### 删除模板

```typescript
public deleteMessageTemplate (priTmplId: string, accessToken: string): Promise<DefaultRequestResult>;
```

### 获取类目

```typescript
public getCategory (accessToken: string): Promise<DefaultRequestResult & { data: {id: number, name: string}[] }>;
```

### 获取关键词列表

```typescript
public getPubTemplateKeyWordsById (tid: number, accessToken: string): Promise<PubTemplateKeyWords>;
```

### 获取所属类目下的公共模板

```typescript
public getPubTemplateTitleList (params: PubTemplateTitleList, accessToken: string): Promise<PubTemplateTitleListResult>;
```

### 获取个人模板列表

```typescript
public getMessageTemplateList (accessToken: string): Promise<MessageTemplateListResult>;
```

### 发送订阅消息

```typescript
public sendMessage (params: SendMessage, accessToken: string): Promise<DefaultRequestResult>;
```

### 添加模板

```typescript
public addMessageTemplate (params: MessageTemplate, accessToken: string): Promise<DefaultRequestResult & { priTmplId: string }>;
```

## 移动应用

Module导入

```typescript
import { Module } from '@nestjs/common';

import { WeChatMobileModule } from 'nest-wechat';

@Module({
  imports: [WeChatMobileModule.register()],
})
export class AppModule {
}
```

工具类引入

```typescript
import { MobileService } from 'nest-wechat';
const service = new MobileService();
```

### 通过code获取access_token

```typescript
public getAccessToken (code: string, appId: string, secret: string): Promise<AxiosResponse<MobileAppAccessTokenResult, any>>;
```

### 刷新或续期access_token

```typescript
public refreshAccessToken (appId: string, refreshToken: string): Promise<AxiosResponse<MobileAppAccessTokenResult, any>>;
```

### 检验access_token

```typescript
public checkAccessToken (openId: string, accessToken: string): Promise<AxiosResponse<DefaultRequestResult, any>>;
```

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

#### 退款通知处理程序

```javascript
pay.refundedCallback (certs: Map<string, string>, apiKey: string, req: Request, res: Response): Promise<RefundNotifyResult>;
```

### 电子发票

#### 配置开发选项

```javascript
pay.fapiaoDevConfig (data: DevelopmentConfigRequest, mchId: string, serialNo: string, privateKey: Buffer | string);
```

#### 创建电子发票卡券模板

```javascript
pay.createCardTemplate (data: CreateCardTemplateRequest, mchId: string, serialNo: string, privateKey: Buffer | string);
```

#### 微信发票通知

```javascript
pay.fapiaoCallback (certs: Map<string, string>, apiKey: string, req: Request, res: Response): Promise<FapiaoNotifyResult>;
```

#### 获取用户填写的抬头

```javascript
pay.getUserTitle (params: GetUserTitleParams, mchId: string, serialNo: string, privateKey: Buffer | string);
```

#### 开具电子发票

```javascript
pay.issueFapiao (data: IssueFapiaoRequest, mchId: string, serialNo: string, privateKey: Buffer | string);
```

#### 查询电子发票

```javascript
pay.getIssueFapiao (fapiaoApplyId: string, fapiaoId: string, mchId: string, serialNo: string, privateKey: Buffer | string);
```

#### 冲红电子发票

```javascript
pay.reverseFapiao (fapiaoApplyId: string, data: ReverseFapiaoRequest, mchId: string, serialNo: string, privateKey: Buffer | string);
```

### 敏感信息加解密

#### 加密

```javascript
pay.rsaEncryptOAEP (text: string, publicKey: Buffer | string);
```

#### 解密

```javascript
pay.rsaDecryptOAEP (cipherText: string, privateKey: Buffer | string);
```

### 现金红包

没有可用测试商户，未做成功测试，请自行测试，有问题请提issue。

测试可自行执行单元测试（需要修改配置）

```bash
npm run test lib/wepay.hb.spec.ts
```

#### 发放红包

```javascript
pay.sendRedPack(redPack: RedPackData, appId: string, mchId: string, apiKey: string, publicKey: Buffer | string, privateKey: Buffer | string, group = false): Promise<AxiosResponse<string, any>>;
```

#### 发放裂变红包

```javascript
pay.sendGroupRedPack(redPack: GroupRedPackData, appId: string, mchId: string, apiKey: string, publicKey: Buffer | string, privateKey: Buffer | string): Promise<AxiosResponse<string, any>>;
```

#### 查询红包记录

```javascript
pay.getHbInfo(billNO: string, appId: string, mchId: string, apiKey: string, publicKey: Buffer | string, privateKey: Buffer | string): Promise<AxiosResponse<string, any>>;
```

## 微信消息加解密签名工具类

```typescript
import { MessageCrypto } from 'nest-wechat';
const sha1 = MessageCrypto.sha1('string to hash');
```

静态方法：

+ sha1 (...args: string[]): string;
+ md5 (text: string): string;
+ getAESKey (encodingAESKey: string): Buffer;
+ getAESKeyIV (aesKey: Buffer): Buffer;
+ PKCS7Encoder (buff: Buffer): Buffer;
+ PKCS7Decoder (buff: Buffer): Buffer;
+ decrypt (aesKey: Buffer, iv: Buffer, str: string): string;
+ encrypt (aesKey: Buffer, iv: Buffer, msg: string, appId: string): string;
+ createNonceStr (length = 16): string;
+ encryptMessage (appId: string, token: string, encodingAESKey: string, message: string, timestamp: string, nonce: string): string;
+ decryptMessage (token: string, encodingAESKey: string, signature: string, timestamp: string, nonce: string, encryptXml: string);
+ decryptMessage (token: string, encodingAESKey: string, signature: string, timestamp: string, nonce: string, encryptXml: string);
+ checkSignature (signature: string, timestamp: string, nonce: string, token: string);

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

Run e2e test.

```shell
npm run test:e2e
```

Run unit test.

```shell
npm run test wechat.service.userinfo.spec.ts
```
