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
import { UserProfileInput, UserProfileOutput } from './dto/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // FIND USER BY ID
  async findById(userID: number): Promise<User> {
    const user = await this.users.findOne(userID);
    return user;
  }

  // FIND USER PROFILE BY ID

  async userProfile({ userID }: UserProfileInput): Promise<UserProfileOutput> {
    // return type is either user object or undefined - Sum type or discriminated union
    const user = await this.users.findOne(userID);

    switch (typeof user) {
      case 'undefined':
        return {
          OK: Boolean(user),
          message: 'user not found',
        };

      case 'object':
        return {
          OK: Boolean(user),
          message: 'user profile successfully retrieved',
          user,
        };
    }
  }

  // CREATE USER ACCOUNT
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    const user = await this.users.findOne({ email });

    switch (typeof user) {
      case 'object': // User exists in the databaseUser:
        return {
          OK: false,
          message:
            'account is already registered, please try a different email',
        };

      case 'undefined': // create & save user object
        await this.users.save(this.users.create({ email, password, role }));
        return { OK: true, message: 'account was successfully created' };
    }
  }

  // LOGIN USER
  async login({ email, password }: LoginInput) {
    const user = await this.users.findOne({ email });

    switch (typeof user) {
      case 'undefined':
        return {
          OK: false,
          message: 'wrong account, user not found',
        };
      case 'object':
        const correctPassword = await user.checkPassword(password);
        if (!correctPassword) {
          return {
            OK: false,
            message: 'wrong password',
          };
        }
        // generate token for authentication
        const token = this.jwtService.sign(user.id);
        return {
          OK: true,
          message: 'logged in successfully',
          token,
        };
    }
  }

  //  EDIT PROFILE USER
  async editProfile(
    userID: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    const user = await this.users.findOne(userID);

    switch (typeof user) {
      case 'undefined':
        return {
          OK: Boolean(user),
          message: 'user not found',
        };

      case 'object':
        if (email) {
          user.email = email;
        }
        if (password) {
          user.password = password;
        }
        const updatedUser = await this.users.save(user);

        return {
          OK: Boolean(user),
          message: 'user profile successfully updated',
          user: updatedUser,
        };
    }
  }
}
