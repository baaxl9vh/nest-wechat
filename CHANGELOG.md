## [0.2.13](https://github.com/baaxl9vh/nest-wechat/compare/v0.2.12...v0.2.13) (2022-06-26)


### Features

* add query order of wechat pay ([d8d0fe6](https://github.com/baaxl9vh/nest-wechat/commit/d8d0fe6c90f4d161f459e37573ac3505058b4e09))
* add wechat pay transaction jsapi order v3 interface ([4de65d0](https://github.com/baaxl9vh/nest-wechat/commit/4de65d03b960b10c649c80e2ae381ecc7410bf9a))
* **wepay:** add wechat pay inteface of mini program ([0b0275e](https://github.com/baaxl9vh/nest-wechat/commit/0b0275e66dbe758fa0c4959b3bee035f7807a9ce))

## [0.2.12](https://github.com/baaxl9vh/nest-wechat/compare/v0.2.11...v0.2.12) (2022-05-23)


### Features

* can register wechat module and component module to global ([419bb73](https://github.com/baaxl9vh/nest-wechat/commit/419bb73b64948ba2b456b3d319981cf113f1c854))

## [0.2.11](https://github.com/baaxl9vh/nest-wechat/compare/v0.2.10...v0.2.11) (2022-05-12)

## [0.2.10](https://github.com/baaxl9vh/nest-wechat/compare/v0.2.9...v0.2.10) (2022-05-12)


### Features

* 添加小程序消息推送配置验证处理方法以及e2e测试 ([306bf58](https://github.com/baaxl9vh/nest-wechat/commit/306bf5871130828f70a3a6d206015ebd9a7fb30d))

## [0.2.9](https://github.com/baaxl9vh/nest-wechat/compare/v0.2.8...v0.2.9) (2022-05-11)

## [0.2.8](https://github.com/baaxl9vh/nest-wechat/compare/v0.2.7...v0.2.8) (2022-05-02)

## [0.2.7](https://github.com/baaxl9vh/nest-wechat/compare/v0.2.6...v0.2.7) (2022-05-02)

## [0.2.6](https://github.com/baaxl9vh/nest-wechat/compare/v0.2.5...v0.2.6) (2022-05-02)


### Bug Fixes

* 优化parseRid方法 ([841b462](https://github.com/baaxl9vh/nest-wechat/commit/841b462e5e59bedf22c97a90ad9ce6d88127c68e))
* 票据推送不catch异常,不传res时不调send ([9f8edc8](https://github.com/baaxl9vh/nest-wechat/commit/9f8edc83cb8eab156b897f7a4355c25ecf8e0a7b))

## [0.2.5](https://github.com/baaxl9vh/nest-wechat/compare/v0.2.4...v0.2.5) (2022-04-30)

## [0.2.4](https://github.com/baaxl9vh/nest-wechat/compare/v0.2.3...v0.2.4) (2022-04-30)


### Features

* component service 添加缓存接口 ([9369d44](https://github.com/baaxl9vh/nest-wechat/commit/9369d44c0644fbe7c12b88f1cfe0616f899e44fe))
* component service 添加读取token接口,添加请求预授权码接口 ([f481e2f](https://github.com/baaxl9vh/nest-wechat/commit/f481e2f124475f5fd7dcfec5c47ed6734e20aaf7))
* wechat service消息加解密方法以及单元测试 ([16390e3](https://github.com/baaxl9vh/nest-wechat/commit/16390e3690538b8b89a39e91f6a4730dcb988ce6))
* 添加微信公众平台推送ticket处理方法以及对应的e2e测试 ([396247b](https://github.com/baaxl9vh/nest-wechat/commit/396247b529e5565ce0fdd1839ebb328f32f77222))
* 添加截取rid util ([41ed91e](https://github.com/baaxl9vh/nest-wechat/commit/41ed91e603ad1abce92f5f54b570e76acbccbc68))
* 添加第三方平台接口 ([055adce](https://github.com/baaxl9vh/nest-wechat/commit/055adce7d941a4dea9090116c25846ae65a01a1e))
* 添加部分小程序基础信息接口,部分代码管理接口 ([5679253](https://github.com/baaxl9vh/nest-wechat/commit/56792533bf803fe43f345ee14c4a9621b2947553))

## [0.2.3](https://github.com/baaxl9vh/nest-wechat/compare/v0.2.2...v0.2.3) (2022-04-02)


### Bug Fixes

* 订正方法名称 ([a93037c](https://github.com/baaxl9vh/nest-wechat/commit/a93037ca72577f9d0f3f0bd45b7d380516b07d7c))

## [0.2.2](https://github.com/baaxl9vh/nest-wechat/compare/v0.2.1...v0.2.2) (2022-04-02)


### Features

* redis缓存适配器作为可选实现类添加进库 ([bda986f](https://github.com/baaxl9vh/nest-wechat/commit/bda986f5c258258d585506f619637cfbcc2bddde))

## [0.2.1](https://github.com/baaxl9vh/nest-wechat/compare/v0.2.0...v0.2.1) (2022-04-02)


### Features

* cache接口添加close方法,redis需要手动调用quit ([68b71c1](https://github.com/baaxl9vh/nest-wechat/commit/68b71c1528ed02f64e763f2bb7fa2886ff0fcb03))

# [0.2.0](https://github.com/baaxl9vh/nest-wechat/compare/v0.1.0...v0.2.0) (2022-04-01)


### Features

* add message encrypt and decrypt utils ([ace2495](https://github.com/baaxl9vh/nest-wechat/commit/ace24951ac4b01a2db0920616b042c4da999b97b))
* wechat service add crypto method ([bee5a9c](https://github.com/baaxl9vh/nest-wechat/commit/bee5a9ca7bfb3cdfc94577ccd85e42996d986766))
* 新增小程序code2session功能,支持配置缓存适配器 ([6492d09](https://github.com/baaxl9vh/nest-wechat/commit/6492d0971ba03c963c526331e6e8cae93ac4b5dc))
* 添加模块动态配置forRoot方法 ([625dbad](https://github.com/baaxl9vh/nest-wechat/commit/625dbad9109ff1c5eb0b782a3ec48ed488a24def))

# [0.1.0](https://github.com/baaxl9vh/nest-wechat/compare/v0.0.10...v0.1.0) (2022-01-06)


### Features

* 新增公众号向用户发送模板消息API ([8fe0d25](https://github.com/baaxl9vh/nest-wechat/commit/8fe0d25b4ea144da026fc424307814aa48e0253a))



## [0.0.10](https://github.com/baaxl9vh/nest-wechat/compare/v0.0.10...v0.1.0) (2022-01-03)

