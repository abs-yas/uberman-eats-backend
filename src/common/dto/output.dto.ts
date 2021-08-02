import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';

@ObjectType()
export class CoreOutput {
  @IsBoolean()
  @Field(() => Boolean)
  OK: boolean;

  @IsString()
  @Field(() => String, { nullable: true })
  message: string;
}
