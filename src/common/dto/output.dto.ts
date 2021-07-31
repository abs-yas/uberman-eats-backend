import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoreOutput {
  @Field(() => Boolean)
  OK: boolean;

  @Field(() => String, { nullable: true })
  message: string;
}
