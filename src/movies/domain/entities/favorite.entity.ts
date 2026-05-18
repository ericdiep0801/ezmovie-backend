import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../../users/domain/entities/user.entity';

@ObjectType()
@Entity('favorites')
export class Favorite {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field()
  @Column()
  movieSlug: string;

  @Field()
  @Column()
  movieName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  moviePoster: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  movieType: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
