import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/service/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { saltRounds } from '../../lib/bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    const isValid = user && (await bcrypt.compare(password, user.password));

    if (!isValid) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.username };

    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(username: string, password: string): Promise<any> {
    const hashPassword = await bcrypt.hash(password, saltRounds);
    await this.usersService.create(username, hashPassword);
  }
}
