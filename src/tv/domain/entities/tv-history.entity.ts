import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../../users/domain/entities/user.entity';
import { TvChannel } from './tv-channel.entity';

@ObjectType()
@Entity('tv_history')
export class TvHistory {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => Int)
  @Column()
  channelId: number;

  @Field(() => TvChannel)
  @ManyToOne(() => TvChannel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channelId' })
  channel: TvChannel;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
