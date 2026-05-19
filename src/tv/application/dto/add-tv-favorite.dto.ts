import { IsNotEmpty, IsNumber } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class AddTvFavoriteDto {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty({ message: 'Channel ID cannot be empty' })
  channelId: number;
}
