'use strict';

import UserService from '../../services/userService';
import AuthService from '../../services/authService';
import PartialUser from '../../data/types/partialUser';
import BaseResponse from '../../data/models/baseResponse';
import { body, validationResult } from 'express-validator';
import { ICreateUserData } from '../../data/types/repository';
import { NextFunction, Request, Response, Router } from 'express';
import HttpStatusCodeEnum from '../../data/constants/httpStatusCodeEnum';
import InvalidArgumentError from '../../data/errors/invalidArgumentError';
import ResponseMessageEnum from '../../data/constants/responseMessageEnum';
import config from '../../config';
import logger from '../../utils/logger';

class AuthController {
  public readonly router: Router;
  private readonly path = '/auth';
  protected readonly userService: UserService;
  protected readonly authService: AuthService;

  constructor(userService: UserService, authservice: AuthService) {
    this.userService = userService;
    this.authService = authservice;
    this.router = Router();
    this.initializeRoutes();
  }

  private readonly register = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) next(InvalidArgumentError);

      const createUserArgs: ICreateUserData = request.body;
      await this.userService.create(createUserArgs);

      response.status(HttpStatusCodeEnum.OK).json(new BaseResponse({ message: ResponseMessageEnum.CREATED, success: true }));
    } catch (error) {
      next(error);
    }
  };

  private readonly login = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) next(InvalidArgumentError);

      const { email, password }: { email: string; password: string } = request.body;
      const { token, user } = await this.authService.login(email, password);

      response
        .status(HttpStatusCodeEnum.OK)
        .cookie('todo_api_authorization', token, {
          secure: config.isProd,
          maxAge: 86400 * 1000,
          httpOnly: false,
        })
        .json(new BaseResponse<PartialUser>({ data: user }));
    } catch (error) {
      next(error);
    }
  };

  private initializeRoutes() {
    this.router.post(
      this.path + '/' + 'register',
      body('email').isEmail().isLength({ max: 32 }),
      body('firstName').isLength({ max: 32 }),
      body('lastName').isLength({ max: 32 }),
      body('password').isLength({ min: 8 }),
      this.register,
    );
    this.router.post(
      this.path + '/' + 'login',
      body('email').isEmail().isLength({ max: 32 }),
      body('password').isLength({ min: 8 }),
      this.login,
    );
  }
}

export default AuthController;
