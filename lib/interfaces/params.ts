export interface TemplateMessage {
  touser: string;
  template_id: string;
  url?: string;
  miniprogram?: { appid: string, pagepath?: string };
  data: TemplateData;
  color?: string;
}

export interface TemplateData {
  [key: string]: { value: string, color?: string }
}

export interface SubmitAuditItem {
  /**
   * 小程序的页面，可通过获取小程序的页面列表接口获得
   */
  address?: string;
  /**
   * 小程序的标签，用空格分隔，标签至多 10 个，标签长度至多 20
   */
  tag?: string;
  /**
   * 一级类目名称
   */
  first_class: string;
  /**
   * 二级类目名称
   */
  second_class: string;
  /**
   * 三级类目名称
   */
  third_class?: string;
  /**
   * 一级类目的 ID
   */
  first_id: number;
  /**
   * 二级类目的 ID
   */
  second_id: number;
  /**
   * 三级类目的 ID
   */
  third_id?: number;
  /**
   * 小程序页面的标题,标题长度至多 32
   */
  title?: string;
}

export interface SubmitAuditItemList {
  /**
   * 审核项列表
   */
  item_list: SubmitAuditItem[];
  preview_info?: object;
  version_desc?: string;
  feedback_info?: string;
  feedback_stuff?: string;
  ugc_declare?: object;
}

export interface ParamRegisterWeApp {
  /**
   * 企业名（需与工商部门登记信息一致）
   * 如果是“无主体名称个体工商户”则填“个体户+法人姓名”，例如“个体户张三”
   */
  name: string;
  /**
   * 企业代码
   */
  code: string;
  /**
   * 企业代码类型 1：统一社会信用代码（18 位） 2：组织机构代码（9 位 xxxxxxxx-x） 3：营业执照注册号(15 位)
   */
  codeType: string;
  /**
   * 法人微信号
   */
  legalPersonaWechat: string;
  /**
   * 法人姓名（绑定银行卡）
   */
  legalPersonaName: string;
  /**
   * 第三方联系电话
   */
  componentPhone?: string;
}

/**
 * 创建二维码参数
 */
export interface ParamCreateQRCode {
  scene: string;
  page?: string;
  check_path?: boolean;
  env_version?: string;
  width?: number;
  auto_color?: boolean;
  line_color?: { r: number, g: number, b: number };
  is_hyaline?: boolean;
}