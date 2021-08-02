import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtModuleOptions } from './jwt.interface';

@Injectable()
export class JwtService {
  constructor(
    @Inject('CONFIG_OPTIONS')
    private readonly options: JwtModuleOptions,
  ) {}

  sign(userId: number) {
    const ok = jwt.sign({ id: userId }, this.options.privateKey);
    return ok;
  }

  verify(token: string) {
    const decoded = jwt.verify(token, this.options.privateKey);
    return decoded;
  }
}
