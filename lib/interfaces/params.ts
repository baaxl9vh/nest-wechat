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