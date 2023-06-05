import { Controller, Get, Logger, Post, Req, Res } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { WeChatService } from '../../lib';

import type { Request, Response } from 'express';
@Controller('wechat')
export class WeChatController {

  private readonly logger = new Logger(WeChatController.name);

  constructor (private readonly service: WeChatService) {
  }

  /**
   * 公众号配置服务器时推送签名验证
   */
  @Get('push')
  async pushTest (@Req() req: Request, @Res() res: Response) {
    this.service.checkSignatureExpress(req, res);
  }

  /**
   * 公众号推送消息
   */
  @Post('push')
  async officialPushTest (@Req() req: Request, @Res() res: Response) {
    this.logger.debug('officialPushTest()');
    const decrypt = await this.service.messagePushExpressHandler(req, res);
    this.logger.debug('decrypt =', decrypt);
  }

  @Get('/mp_push')
  async messagePush (@Req() req: Request, @Res() res: Response) {
    const ret = this.service.mp.verifyMessagePush(req, res);
    this.logger.debug(`messagePush() ret = ${ret}`);
  }

  @Post('notify')
  async payCallback (@Req() req: Request, @Res() res: Response) {
    const privateKey = fs.readFileSync(path.join(process.cwd(), 'apiclient_key.pem'));
    const publicKey = fs.readFileSync(path.join(process.cwd(), 'apiclient_cert.pem'));
    const sn = this.service.pay.getCertificateSn(publicKey);
    const certs = await this.service.pay.getPlatformCertificates('your/mch/id', sn, privateKey, 'your/apiv3');
    this.service.pay.paidCallback(certs, 'your/apiv3', req, res);
  }

}