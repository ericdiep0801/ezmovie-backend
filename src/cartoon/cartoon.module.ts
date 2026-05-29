import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartoonController } from './cartoon.controller';
import { CartoonService } from './cartoon.service';
import { CartoonHistory } from './entities/cartoon-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartoonHistory])],
  controllers: [CartoonController],
  providers: [CartoonService],
  exports: [CartoonService],
})
export class CartoonModule {}
