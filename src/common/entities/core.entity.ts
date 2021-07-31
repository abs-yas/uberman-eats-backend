import { Field, ObjectType } from '@nestjs/graphql';
import { IsDate, IsNumber } from 'class-validator';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
export class CoreEntity {
  @IsNumber()
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @IsDate()
  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @IsDate()
  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;
}
