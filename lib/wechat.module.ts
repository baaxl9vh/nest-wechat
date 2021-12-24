import { Module } from '@nestjs/common';
import { WeChatService } from './wechat.service';

@Module({
    providers: [WeChatService]
})
export class WeChatModule {

}