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
  data: string;
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
