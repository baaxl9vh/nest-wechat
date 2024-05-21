export interface LineColor {
  r: number | string;
  g: number | string;
  b: number | string;
}

export interface QRCode {
  path: string;
  width?: number;
  auto_color?: boolean;
  line_color?: LineColor,
  is_hyaline?: boolean;
}

export interface CreateQRCode {
  path: string;
  width?: number;
}

/**
 * 获取不限制的小程序码参数
 */
export interface GetUnlimitedQRCode {
  scene: string;
  page?: string;
  check_path?: boolean;
  env_version?: string;
  width?: number;
  auto_color?: boolean;
  line_color?: { r: number, g: number, b: number };
  is_hyaline?: boolean;
}

export interface JumpTarget {
  /**
   * 通过 scheme 码进入的小程序页面路径，必须是已经发布的小程序存在的页面，不可携带 query。path 为空时会跳转小程序主页。
   */
  path?: string;

  /**
   * 通过 scheme 码进入小程序时的 query，最大1024个字符，只支持数字，大小写英文以及部分特殊字符：`!#$&'()*+,/:;=?@-._~%``
   */
  query?: string;
  /**
   * 默认值"release"。要打开的小程序版本。正式版为"release"，体验版为"trial"，开发版为"develop"，仅在微信外打开时生效。
   */
  env_version?: string;
}

/**
 * 获取 scheme 码参数
 */
export interface GenerateScheme {
  jump_wxa?: JumpTarget;
  is_expire?: boolean;
  expire_time?: number;
  expire_type?: number;
  expire_interval?: number;
}

/**
 * 获取 NFC scheme 码参数
 */
export interface GenerateNFCScheme {
  jump_wxa?: JumpTarget;
  model_id: string;
  sn?: string;
}

/**
 * 获取 URL Link参数
 */
export interface GenerateUrlLink {
  path?: string;
  query?: string;
  is_expire?: boolean;
  expire_type?: number;
  expire_time?: number;
  expire_interval?: number;
  env_version?: string;
}

export interface GenerateShortLink {
  /**
   * 通过 Short Link 进入的小程序页面路径，必须是已经发布的小程序存在的页面，可携带 query，最大1024个字符
   */
  page_url: string;
  /**
   * 页面标题，不能包含违法信息，超过20字符会用... 截断代替
   */
  page_title?: string;
  /**
   * 默认值false。生成的 Short Link 类型，短期有效：false，永久有效：true
   */
  is_permanent?: boolean;
}

/**
 * 小程序模板消息
 */
export interface WeAppTemplateMsg {
  /**
   * 小程序模板ID
   */
  template_id: string;
  /**
   * 小程序页面路径
   */
  page: string;
  /**
   * 小程序模板消息formid
   */
  form_id: string;
  /**
   * 小程序模板放大关键词
   */
  emphasis_keyword: string;
  /**
   * 小程序模板数据
   */
  data: string;
}

/**
 * 公众号模板消息
 */
export interface MpTemplateMsg {
  /**
   * 公众号appid，要求与小程序有绑定且同主体
   */
  appid: string;
  /**
   * 公众号模板id
   */
  template_id: string;
  /**
   * 公众号模板消息所要跳转的url
   */
  url: string;
  /**
   * 公众号模板消息所要跳转的小程序，小程序的必须与公众号具有绑定关系
   */
  miniprogram: string;
  /**
   * 公众号模板消息的数据
   */
  data: string;
}

export interface SendUniformMessage {
  /**
   * 用户openid，可以是小程序的openid，也可以是mp_template_msg.appid对应的公众号的openid
   */
  touser: string;
  /**
   * 小程序模板消息相关的信息，可以参考小程序模板消息接口; 有此节点则优先发送小程序模板消息；（小程序模板消息已下线，不用传此节点）
   */
  weapp_template_msg: WeAppTemplateMsg;
  /**
   * 公众号模板消息相关的信息，可以参考公众号模板消息接口；有此节点并且没有weapp_template_msg节点时，发送公众号模板消息
   */
  mp_template_msg: string;
}

export interface CreateActivityId {
  /**
   * 为私密消息创建activity_id时，指定分享者为 unionid 用户。其余用户不能用此activity_id分享私密消息。openid与 unionid 填一个即可。私密消息暂不支持云函数生成activity id。
   */
  unionid?: string;
  /**
   * 为私密消息创建activity_id时，指定分享者为 openid 用户。其余用户不能用此activity_id分享私密消息。openid与 unionid 填一个即可。私密消息暂不支持云函数生成activity id。
   */
  openid?: string;
}

export interface UpdatableMsgParameterList {
  name: 'member_count' | 'room_limit';
  value: string;
}

export interface UpdatableMsg {
  activity_id: string;
  target_state: 0 | 1;
  template_info: {
    parameter_list: UpdatableMsgParameterList[];
  };
}

export interface PubTemplateTitleList {
  /**
   * 类目 id，多个用逗号隔开
   */
  ids: string;
  /**
   * 用于分页，表示从 start 开始。从 0 开始计数
   */
  start: number;
  /**
   * 用于分页，表示拉取 limit 条记录。最大为 30
   */
  limit: number;
}

export interface MiniProgramTemplateData {
  [key: string]: { value: string }
}

export interface SendMessage {
  /**
   * 所需下发的订阅模板id
   */
  template_id: string;
  /**
   * 点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,（示例index?foo=bar）。该字段不填则模板无跳转
   */
  page: string;
  /**
   * 接收者（用户）的 openid
   */
  touser: string;
  /**
   * 模板内容，格式形如 { "key1": { "value": any }, "key2": { "value": any } }的object
   */
  data: MiniProgramTemplateData;
  /**
   * 跳转小程序类型：developer为开发版；trial为体验版；formal为正式版；默认为正式版
   */
  miniprogram_state: string;
  /**
   * 进入小程序查看”的语言类型，支持zh_CN(简体中文)、en_US(英文)、zh_HK(繁体中文)、zh_TW(繁体中文)，默认为zh_CN
   */
  lang: string;
}

export interface MessageTemplate {
  /**
   * 模板标题 id，可通过接口获取，也可登录小程序后台查看获取
   */
  tid: string;
  /**
   * 开发者自行组合好的模板关键词列表，关键词顺序可以自由搭配（例如 [3,5,4] 或 [4,5,3]），最多支持5个，最少2个关键词组合
   */
  kidList: number[];
  /**
   * 服务场景描述，15个字以内
   */
  sceneDesc: string;
}


export interface ExpressLocalSenderOrReveiver {
  /**
     * 姓名，最长不超过256个字符
     */
  name: string;
  /**
   * 城市名称，如广州市
   */
  city: string;
  /**
   * 地址(街道、小区、大厦等，用于定位)
   */
  address: string;
  /**
   * 地址详情(楼号、单元号、层号)
   */
  address_detail: string;
  /**
   * 电话/手机号，最长不超过64个字符
   */
  phone: string;
  /**
   * 经度（火星坐标或百度坐标，和 coordinate_type 字段配合使用，确到小数点后6位
   */
  lng: number;
  /**
   * 纬度（火星坐标或百度坐标，和 coordinate_type 字段配合使用，精确到小数点后6位）
   */
  lat: number;
  /**
   * 坐标类型，0：火星坐标（高德，腾讯地图均采用火星坐标） 1：百度坐标
   */
  coordinate_type?: number;
}
export interface ExpressLocalCargo {
  /**
   * 货物价格，单位为元，精确到小数点后两位（如果小数点后位数多于两位，则四舍五入保留两位小数），范围为(0-5000]
   */
  goods_value: number;
  /**
   * 货物高度，单位为cm，精确到小数点后两位（如果小数点后位数多于两位，则四舍五入保留两位小数），范围为(0-45]
   */
  goods_height?: number;
  /**
   * 货物宽度，单位为cm，精确到小数点后两位（如果小数点后位数多于两位，则四舍五入保留两位小数），范围为(0-50]
   */
  goods_width?: number;
  /**
   * 货物长度，单位为cm，精确到小数点后两位（如果小数点后位数多于两位，则四舍五入保留两位小数），范围为(0-65]
   */
  goods_length?: number;
  /**
   * 货物重量，单位为kg，精确到小数点后两位（如果小数点后位数多于两位，则四舍五入保留两位小数），范围为(0-50]
   */
  goods_weight: number;
  /**
   * 货物详情，最长不超过10240个字符
   */
  goods_detail?: {
    /**
     * 货物列表
     */
    goods: {
      /**
       * 货物数量
       */
      good_count: number;
      /**
       * 货品名称
       */
      good_name: string;
      /**
       * 货品单价，精确到小数点后两位（如果小数点后位数多于两位，则四舍五入保留两位小数）
       */
      good_price?: number;
      /**
       * 货品单位，最长不超过20个字符
       */
      good_unit?: string;
    }[],
    /**
     * 货物取货信息，用于骑手到店取货，最长不超过100个字符
     */
    goods_pickup_info?: string;
    /**
     * [品类一级类目, 详见](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/immediate-delivery/category.html)
     */
    cargo_first_class: string;
    /**
     * 品类二级类目
     */
    cargo_second_class: string;
  }
}
export interface ExpressLocalOrderInfo {
  /**
   * 配送服务代码 不同配送公司自定义, 顺丰和达达不填
   */
  delivery_service_code?: string;
  /**
   * 期望派单时间(达达支持，表示达达系统调度时间, 到那个时间才会有状态更新的回调通知)，unix-timestamp, 比如1586342180
   */
  expected_delivery_time?: number;
  /**
   * 订单类型, 0: 即时单 1 预约单，如预约单，需要设置expected_delivery_time或expected_finish_time或expected_pick_time
   */
  order_type?: number;
  /**
   * 门店订单流水号，建议提供，方便骑手门店取货，最长不超过32个字符
   */
  poi_seq?: string;
  /**
   * 备注，最长不超过200个字符
   */
  note?: string;
  /**
   * 用户下单付款时间, 顺丰必填, 比如1555220757
   */
  order_time?: number;
  /**
   * 是否保价，0，非保价，1.保价
   */
  is_insured?: number;
  /**
   * 保价金额，单位为元，精确到分
   */
  declared_value: number;
  /**
   * 小费，单位为元, 下单一般不加小费
   */
  tips?: number;
  /**
   * 是否选择直拿直送（0：不需要；1：需要。选择直拿直送后，同一时间骑手只能配送此订单至完成，配送费用也相应高一些，闪送必须选1，达达可选0或1，其余配送公司不支持直拿直送）
   */
  is_direct_delivery?: number;
  /**
   * 骑手应付金额，单位为元，精确到分
   */
  cash_on_delivery?: number;
  /**
   * 骑手应收金额，单位为元，精确到分
   */
  cash_on_pickup?: number;
  /**
   * 物流流向，1：从门店取件送至用户；2：从用户取件送至门店
   */
  rider_pick_method?: number;
  /**
   * 收货码（0：不需要；1：需要。收货码的作用是：骑手必须输入收货码才能完成订单妥投）
   */
  is_finish_code_needed?: number;
  /**
   * 取货码（0：不需要；1：需要。取货码的作用是：骑手必须输入取货码才能从商家取货）
   */
  is_pickup_code_needed?: number;
  /**
   * 期望送达时间(美团、顺丰同城急送支持），unix-timestamp, 比如1586342180
   */
  expected_finish_time?: number;
  /**
   * 期望取件时间（闪送、顺丰同城急送支持，闪送需要设置两个小时后的时间，顺丰同城急送只需传expected_finish_time或expected_pick_time其中之一即可，同时都传则以expected_finish_time为准），unix-timestamp, 比如1586342180
   */
  expected_pick_time?: number;
}
export interface ExpressLocalShop {
  /**
      * 商家小程序的路径，建议为订单页面
      */
  wxa_path?: string;
  /**
   * 商品缩略图 url；shop.detail_list为空则必传，shop.detail_list非空可不传。
   */
  img_url?: string;
  /**
   * 商品名称, 不超过128字节；shop.detail_list为空则必传，shop.detail_list非空可不传。
   */
  goods_name?: string;
  /**
   * 商品数量；shop.detail_list为空则必传。shop.detail_list非空可不传，默认取shop.detail_list的size
   */
  goods_count?: number;
  /**
   * 该参数在【即使配送】的 addOrder 接口才生效。若结算方式为：第三方向配送公司统一结算，商户后续和第三方结算，则该参数必填；在该结算模式下，第三方用自己的开发小程序替授权商户发起下单，并将授权小程序的 appid 给平台，后续配送通知中可回流授权商户小程序。
   */
  wxa_appid?: string;
  /**
   * 商品列表
   */
  detail_list?: {
    /**
     * 商品名称
     */
    goods_name: string;
    /**
     * 商品图片url
     */
    goods_img_url: string;
  }[]
}
export interface ExpressLocalPreAddOrder {
  /**
   * 商家id， 由配送公司分配的appkey
   */
  shopid: string;
  /**
   * 唯一标识订单的 ID，由商户生成, 不超过128字节
   */
  shop_order_id: string;
  /**
   * 配送公司ID
   */
  delivery_id: string;
  /**
   * 下单用户的openid
   */
  openid: string;

  /**
   * 发件人信息，闪送、顺丰同城急送必须填写，美团配送、达达，若传了shop_no的值可不填该字段
   */
  sender?: ExpressLocalSenderOrReveiver,
  receiver: ExpressLocalSenderOrReveiver,
  cargo: ExpressLocalCargo,
  /**
     * 订单信息
     */
  order_info: ExpressLocalOrderInfo,
  /**
   * 商品信息，会展示到物流通知消息中
   */
  shop: ExpressLocalShop,
  /**
   * 用配送公司提供的 appSecret 加密的校验串说明
   */
  delivery_sign: string;
  /**
   * 商家门店编号，在配送公司登记，美团、闪送必填
   */
  shop_no: string;
  /**
   * 子商户id，区分小程序内部多个子商户
   */
  sub_biz_id: string;
  order_source?: string;
  order_sequence?: string;
}

export interface ExpressLocalPreCancelOrder {
  shopid: string;
  shop_order_id: string;
  delivery_id: string;
  waybill_id: string;
  cancel_reason_id?: number;
  cancel_reason?: string;
  shop_no: string;
  devery_sign: string;
}

export interface ExpressLocalGetLocalOrder {
  /**
   * 商家id， 由配送公司分配的appkey
   */
  shopid: string;
  /**
   * 唯一标识订单的 ID，由商户生成
   */
  shop_order_id: string;
  /**
   * 商家门店编号， 在配送公司登记，如果只有一个门店，可以不填
   */
  shop_no: string;
  /**
   * 用配送公司提供的 appSecret [加密的校验串说明](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/immediate-delivery/read_first.html)
   */
  devery_sign: string;
}

export interface ExpressLocalAbnormalConfirm {
  /**
   * 商家id，由配送公司分配的appkey
   */
  shopid: string;
  /**
   * 唯一标识订单的 ID，由商户生成
   */
  shop_order_id: string;
  /**
   * 配送单id
   */
  waybill_id: string;
  /**
   * 用配送公司提供的 appSecret 加密的校验串
   */
  delivery_sign: string;
  /**
   * 商家门店编号，在配送公司登记，闪送必填，值为店铺id
   */
  shop_no: string;
  /**
   * 备注
   */
  remark?: string;
}

export interface ExpressLocalCancelOrder {
  /**
   * 商家id， 由配送公司分配的appkey
   */
  shopid: string;
  /**
   * 唯一标识订单的 ID，由商户生成
   */
  shop_order_id: string;
  /**
   * 快递公司ID
   */
  delivery_id: string;
  /**
   * 配送单id（顺丰同城必填）
   */
  waybill_id?: string;
  /**
   * 取消原因Id。1表示暂时不需要邮寄；2表示价格不合适；3表示订单信息有误，重新下单；4表示骑手取货不及时；5表示骑手配送不及时；6表示其他原因( 如果选择6，需要填写取消原因，否则不需要填写 )
   */
  cancel_reason_id: number;
  /**
   * 取消原因
   */
  cancel_reason: string;
  /**
   * 商家门店编号，如果只有一个门店，闪送shop_no必填，值为店铺id
   */
  shop_no: string;
  /**
   * 用配送公司提供的 appSecret 加密的校验串说明
   */
  delivery_sign: string;
}

export interface ExpressLocalAddTips {
  /**
   * 商家id， 由配送公司分配的appkey
   */
  shopid: string;
  /**
   * 唯一标识订单的 ID，由商户生成
   */
  shop_order_id: string;
  /**
   * 配送单id
   */
  waybill_id: string;
  /**
   * 小费金额(单位：元) 各家配送公司最大值不同
   */
  tips: number;
  /**
   * 备注
   */
  remark: string;
  /**
   * 商家门店编号，在配送公司登记，如果只有一个门店，闪送shop_no必填，值为店铺id
   */
  shop_no: string;
  /**
   * 用配送公司提供的 appSecret 加密的校验串说明
   */
  delivery_sign: string;
}


export interface ExpressLocalAddLocalOrder {
  /**
   * 商家id，由配送公司分配的appkey
   */
  shopid: string;
  /**
   * 唯一标识订单的 ID，由商户生成, 不超过128字节
   */
  shop_order_id: string;
  /**
   * 配送公司ID
   */
  delivery_id: string;
  /**
   * 下单用户的openid
   */
  openid: string;
  /**
   * 发件人信息，顺丰同城急送必须填写，美团配送、达达、闪送，若传了shop_no的值可不填该字段
   */
  sender?: ExpressLocalSenderOrReveiver,
  /**
   * 收件人信息
   */
  receiver: ExpressLocalSenderOrReveiver,
  /**
   * 货物信息
   */
  cargo: ExpressLocalCargo,
  /**
   * 订单信息
   */
  order_info: ExpressLocalOrderInfo,
  /**
   * 商品信息
   */
  shop: ExpressLocalShop,
  /**
   * 预下单接口返回的参数，配送公司可保证在一段时间内运费不变
   */
  delivery_token: string;
  /**
   * 用配送公司提供的 appSecret 加密的校验串说明
   */
  delivery_sign: string;
  /**
   * 商家门店编号，在配送公司登记，如果只有一个门店，美团闪送必填, 值为店铺id
   */
  shop_no: string;
  /**
   * 子商户id，区分小程序内部多个子商户
   */
  sub_biz_id?: string;
  order_source?: string;
  order_sequence?: string;
}
