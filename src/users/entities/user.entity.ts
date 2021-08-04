import { InternalServerErrorException } from '@nestjs/common';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsBoolean, IsEnum } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';

// type UserRole = 'client' | 'owner' | 'delivery';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field(() => String)
  @Column()
  email: string;

  @Field(() => String, { nullable: true })
  @Column({ select: false })
  password: string;

  @Field(() => UserRole)
  @IsEnum(UserRole)
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @IsBoolean()
  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  isVerified: boolean;

  /***
   ** hash password before inserting into the database
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    // only hash if there is a password on the User object type when we call save method on
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException();
      }
    }
  }

  /***
   ** Check if input password is same as entity password
   */
  async checkPassword(pass: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(pass, this.password);
      return ok;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
