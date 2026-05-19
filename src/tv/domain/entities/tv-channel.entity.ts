import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Entity('tv_channels')
export class TvChannel {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  logo: string;

  @Field()
  @Column({ type: 'text' })
  streamUrl: string;

  @Field()
  @Column({ default: 'General' })
  category: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  groupTitle: string;

  @Field()
  @Column({ default: false })
  isCustom: boolean;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
