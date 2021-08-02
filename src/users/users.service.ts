import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account-dto';
import { LoginInput } from './dto/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
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
      case 'object': // User exists in the databaseUser:
        return {
          OK: false,
          message:
            'account is already registered, please try a different email.',
        };

      case 'undefined': // create & save user object
        await this.users.save(this.users.create({ email, password, role }));
        return { OK: true, message: 'account was successfully created.' };
      default:
        return {
          OK: false,
          message: 'something went wrong.',
        };
    }
  }

  // LOGIN USER
  async login({ email, password }: LoginInput) {
    // return type is either user object or undefined - Sum type or discriminated union
    const user = await this.users.findOne({ email });

    switch (typeof user) {
      case 'undefined':
        return {
          OK: false,
          message: 'wrong account, user not found.',
        };
      case 'object':
        const correctPassword = await user.checkPassword(password);
        if (!correctPassword) {
          return {
            OK: false,
            message: 'wrong password.',
          };
        }
        // generate token for authentication
        const token = this.jwtService.sign(user.id);
        return {
          OK: true,
          message: 'logged in successfully',
          token,
        };
      default:
        return {
          OK: false,
          message: 'something went wrong, could not login',
        };
    }
  }
}
