import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../../users/domain/entities/user.entity';

@ObjectType()
@Entity('comments')
export class Comment {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field()
  @Column()
  movieSlug: string;

  @Field()
  @Column('text')
  content: string;

  @Field(() => Int)
  @Column({ default: 0 })
  likesCount: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  likedUserIds: string; // Stored as a JSON string: "[12, 13, ...]"

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
