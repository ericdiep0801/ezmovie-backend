import { Module } from '@nestjs/common';
import { CartoonController } from './cartoon.controller';
import { CartoonService } from './cartoon.service';

@Module({
  controllers: [CartoonController],
  providers: [CartoonService],
  exports: [CartoonService],
})
export class CartoonModule {}
