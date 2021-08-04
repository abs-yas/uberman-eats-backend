import { Field, ObjectType } from '@nestjs/graphql';
import { IsObject, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
@ObjectType()
export class Verification extends CoreEntity {
  @IsString()
  @Field(() => String)
  @Column()
  code: string;

  @IsObject()
  @Field()
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}
