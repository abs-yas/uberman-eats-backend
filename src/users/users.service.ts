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
import { Verification } from './entities/verification.entity';
import { VerifyEmailInput, VerifyEmailOutput } from './dto/verify-email.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // FIND USER BY ID
  async findById(userID: number): Promise<UserProfileOutput> {
    // userId is provided from ctx, and is only called once logged in
    const user = await this.users.findOne(userID);
    try {
      // perform case analysis
      switch (typeof user) {
        case 'object': // user exists in the database
          return {
            OK: Boolean(user),
            message: 'user profile successfully retrieved',
            user,
          };
        case 'undefined': // user does not exist in the database
          return {
            OK: Boolean(user),
            message: 'user not found',
          };
      }
    } catch {
      return {
        OK: false,
        message: 'something went wrong',
      };
    }
  }

  // FIND USER PROFILE BY ID
  async userProfile({ userID }: UserProfileInput): Promise<UserProfileOutput> {
    // return type is either user object or undefined - Sum type or discriminated union
    const user = await this.users.findOne(userID);
    try {
      // perform case analysis
      switch (typeof user) {
        case 'object': // user exists in the database
          return {
            OK: Boolean(user),
            message: 'user profile successfully retrieved',
            user,
          };
        case 'undefined': // user does not exist in the database
          return {
            OK: Boolean(user),
            message: 'user not found',
          };
      }
    } catch {
      return {
        OK: false,
        message: 'something went wrong',
      };
    }
  }

  // CREATE USER ACCOUNT
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    // return kind is a sum type or discriminated union
    const user = await this.users.findOne({ email });
    try {
      // perform case analysis
      switch (typeof user) {
        case 'object': // user exists in the database
          return {
            OK: false,
            message:
              'account is already registered, please try a different email',
          };
        // user does not exist in the database, hence create & save user object to db
        case 'undefined':
          const user = await this.users.save(
            this.users.create({ email, password, role }),
          );

          const verification = await this.verifications.save(
            this.verifications.create({ user }),
          );

          // send email to the user
          // this.mailService.sendVerificationEmail(
          //   user.email.split('@')[0],
          //   verification.code,
          // );
          return { OK: true, message: 'account was successfully created' };
      }
    } catch {
      return {
        OK: false,
        message: 'something went wrong',
      };
    }
  }

  // LOGIN USER
  async login({ email, password }: LoginInput) {
    // return kind is a sum type or discriminated union
    const user = await this.users.findOne(
      { email },
      { select: ['password', 'id'] },
    );
    try {
      // perform case analysis
      switch (typeof user) {
        case 'object': // user exists in the database
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
            message: `welcome to Uberman Eats`,
            token,
          };
        case 'undefined': // user does not exist in the database
          return {
            OK: false,
            message: 'wrong account, user not found',
          };
      }
    } catch {
      return {
        OK: false,
        message: 'something went wrong',
      };
    }
  }

  //  EDIT PROFILE USER
  async editProfile(
    userID: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    // return kind is a sum type or discriminated union
    const user = await this.users.findOne(userID);
    try {
      // perform case analysis
      switch (typeof user) {
        case 'object': // user exists in the database
          const emailTaken = await this.users.findOne({ email });

          if (emailTaken) {
            return {
              OK: false,
              message:
                'email is already in use, please use a different email address',
            };
          }
          if (email && !emailTaken) {
            user.email = email;
            user.isVerified = false;
            await this.verifications.delete({ user });
            const newVerification = await this.verifications.save(
              this.verifications.create({ user }),
            );

            // // send email to the user
            // this.mailService.sendVerificationEmail(
            //   user.email.split('@')[0],
            //   newVerification.code,
            // );
          }
          if (password) {
            user.password = password;
          }
          const account = await this.users.save(user);
          console.log(password);
          return {
            OK: Boolean(user),
            message: 'user profile successfully updated',
            user: account,
          };

        case 'undefined': // user does not exist in the database
          return {
            OK: Boolean(user),
            message: 'user not found',
          };
      }
    } catch {
      return {
        OK: false,
        message: 'something went wrong',
      };
    }
  }

  // VERIFY EMAIL
  async verifyEmail({ code }: VerifyEmailInput): Promise<VerifyEmailOutput> {
    // return kind is a sum type or discriminated union
    const verification = await this.verifications.findOne(
      { code },
      { relations: ['user'] },
    );
    try {
      // perform case analysis
      switch (typeof verification) {
        case 'object': // verification exists in the database & has a user entity
          verification.user.isVerified = true;
          await this.users.save(verification.user);
          await this.verifications.delete(verification.id);
          return {
            OK: true,
            message: 'account successfully verified',
          };

        case 'undefined': // verification does not exist in the database
          return {
            OK: Boolean(verification),
            message: 'wrong verification code or verification code has expired',
          };
      }
    } catch {
      return {
        OK: false,
        message: 'something went wrong',
      };
    }
  }
}
