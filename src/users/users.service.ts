import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account-dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  // CREATE USER ACCOUNT
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    // return type is either user object or undefined - Sum type or discriminated union
    const user = await this.users.findOne({ email });

    switch (typeof user) {
      case 'object': // User exists in the database
        User: return {
          OK: false,
          message:
            'Account is already registered, please use a different email.',
        };

      case 'undefined': // create & save user object
        await this.users.save(this.users.create({ email, password, role }));
        return { OK: true, message: 'Account was successfully crated.' };
      default:
        return {
          OK: false,
          message: 'Something went wrong.',
        };
    }
  }
}
