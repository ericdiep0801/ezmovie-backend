import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AddFavoriteDto {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Movie slug cannot be empty' })
  movieSlug: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  movieName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  moviePoster?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  movieType?: string;
}
