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
