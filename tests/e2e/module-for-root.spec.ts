import { Test } from '@nestjs/testing';

import { WeChatService } from '../../lib';
import { AppModule } from '../app.module';

describe('Test module register', () => {

  it('Should register module with config', async () => {

    const module = await Test.createTestingModule({
      imports: [AppModule.injectConfigModule()],
    }).compile();

    const app = module.createNestApplication();
    const service = app.get(WeChatService);

    expect(service.config.appId).toBeTruthy();
    expect(service.config.token).toBeTruthy();

    await app.close();
  });

});