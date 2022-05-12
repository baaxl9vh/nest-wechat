import { Controller, Get, Logger, Req, Res } from '@nestjs/common';

import { WeChatService } from '../../lib';

import type { Request, Response } from 'express';

@Controller('wechat')
export class WeChatController {

  private readonly logger = new Logger(WeChatController.name);

  constructor (private readonly service: WeChatService) {
  }

  @Get('/message_push')
  async messagePush (@Req() req: Request, @Res() res: Response) {
    const ret = this.service.mp.verifyMessagePush(req, res);
    this.logger.debug(`messagePush() ret = ${ret}`);
  }

}