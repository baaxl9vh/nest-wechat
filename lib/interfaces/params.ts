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