import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../../users/domain/entities/user.entity';

@ObjectType()
@Entity('watch_history')
export class WatchHistory {
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

  @Field()
  @Column()
  episodeName: string;

  @Field()
  @Column()
  episodeSlug: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
