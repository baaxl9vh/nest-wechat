import { Controller, Post, Req, Res } from '@nestjs/common';

import { ComponentService } from '../../lib/component.service';

import type { Request, Response } from 'express';


@Controller('component')
export class ComponentController {

  constructor(private readonly service: ComponentService) {
  }

  @Post('/push_ticket')
  async pushTicket (@Req() req: Request, @Res() res: Response) {
    await this.service.pushTicket(req, res);
  }

}