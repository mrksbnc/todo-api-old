'use strict';

import jwt from 'jsonwebtoken';
import config from '../../config';
import { Request, Response, NextFunction } from 'express';
import InvalidTokenError from '../../data/errors/invalidTokenError';
import TokenNotFoundError from '../../data/errors/tokenNotFoundError';
import { checkExpirationStatus, createToken, decodeJwtToken } from '../../utils/token';

function authenticationMiddleware(request: Request, response: Response, next: NextFunction) {
  if (request.path.includes('register') || request.path.includes('login')) {
    next();
    return;
  }

  const bearerToken = request.headers['authorization'];
  if (!bearerToken) {
    response
      .status(TokenNotFoundError.httpException.status)
      .json({ success: false, message: TokenNotFoundError.httpException.message });
    return;
  }

  const token = bearerToken.split(' ')[1];
  const decodedPayload = decodeJwtToken(token);
  try {
    jwt.verify(token.trim(), config.auth.secret);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      const tokenExpirationStatus = checkExpirationStatus(decodedPayload);
      if (tokenExpirationStatus === 'grace') {
        const newToken = createToken({
          userId: decodedPayload.userId,
          email: decodedPayload.email,
          name: decodedPayload.name,
        });
        response.set('authorization', 'Bearer ' + newToken);
        next();
        return;
      }
    }
    response
      .status(InvalidTokenError.httpException.status)
      .json({ success: false, message: InvalidTokenError.httpException.message });
    return;
  }

  response.locals.userId = decodedPayload.userId;
  const newToken = createToken({
    userId: decodedPayload.userId,
    email: decodedPayload.email,
    name: decodedPayload.name,
  });
  response.set('authorization', 'Bearer ' + newToken);
  next();
}

export default authenticationMiddleware;
