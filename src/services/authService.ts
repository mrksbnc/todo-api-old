'use strict';

import services from '.';
import bcrypt from 'bcrypt';
import config from '../config';
import { createToken } from '../utils/token';
import PartialUser from '../data/types/partialUser';
import { ITokenPayload } from '../data/types/token';
import NotFoundError from '../data/errors/resourceNotFoundError';
import IncorrectUserDataError from '../data/errors/incorrectUserDataError';

class AuthService {
  public async generatePasswordHash(plainTextPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt(config.auth.salt_rounds);
    const hash = await bcrypt.hash(plainTextPassword, salt);
    return hash;
  }

  public async comparePasswordWithHash(plainTextPassword: string, hash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(plainTextPassword, hash);
    return isMatch;
  }

  public async login(email: string, password: string): Promise<{ token: string; user: PartialUser }> {
    const user = await services.user.getUserByEmail(email);
    if (!user) throw NotFoundError;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw IncorrectUserDataError;

    const jwtPayload: ITokenPayload = {
      userId: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    };
    const token = createToken(jwtPayload);
    const partialUser = services.user.createPartialUser(user);

    return {
      token,
      user: partialUser,
    };
  }
}

export default AuthService;
