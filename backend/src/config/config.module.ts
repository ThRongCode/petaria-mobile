import { Module, Global } from '@nestjs/common';
import { ConfigLoaderService } from './config-loader.service';
import { GameConfigController } from './game-config.controller';
import { GameConfigService } from './game-config.service';

@Global()
@Module({
  controllers: [GameConfigController],
  providers: [ConfigLoaderService, GameConfigService],
  exports: [ConfigLoaderService, GameConfigService],
})
export class GameConfigModule {}
