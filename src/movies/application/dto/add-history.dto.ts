import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AddHistoryDto {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Movie slug cannot be empty' })
  movieSlug: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Movie name cannot be empty' })
  movieName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  moviePoster?: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Episode name cannot be empty' })
  episodeName: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Episode slug cannot be empty' })
  episodeSlug: string;
}
