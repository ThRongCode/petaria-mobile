import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { PetModule } from './pet/pet.module';
import { ItemModule } from './item/item.module';
import { HuntModule } from './hunt/hunt.module';
import { BattleModule } from './battle/battle.module';
import { RegionModule } from './region/region.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    PetModule,
    ItemModule,
    HuntModule,
    BattleModule,
    RegionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
