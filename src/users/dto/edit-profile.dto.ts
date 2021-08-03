import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['password', 'email'], InputType),
) {}

@ObjectType()
export class EditProfileOutput extends CoreOutput {
  @Field(() => User, { nullable: true })
  user?: User;
}
