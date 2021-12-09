'use strict';

import { Todo } from '@prisma/client';
import TodoService from '../../services/todoService';
import BaseResponse from '../../data/models/baseResponse';
import { body, param, validationResult } from 'express-validator';
import { NextFunction, Request, Response, Router } from 'express';
import HttpStatusCodeEnum from '../../data/constants/httpStatusCodeEnum';
import InvalidArgumentError from '../../data/errors/invalidArgumentError';
import ResponseMessageEnum from '../../data/constants/responseMessageEnum';
import { ICreateTodoData, IUpdateTodoData } from '../../data/types/repository';
import contentTypeValidatorMiddleware from '../middlewares/contentTypeValidatorMiddleware';

class TodoController {
  public readonly router: Router;
  private readonly path = '/list';
  protected readonly service: TodoService;

  constructor(service: TodoService) {
    this.service = service;
    this.router = Router();
    this.initializeRoutes();
  }

  private readonly create = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) next(InvalidArgumentError);

      const data: ICreateTodoData = request.body;
      await this.service.create(data);

      response.status(HttpStatusCodeEnum.CREATED).json(new BaseResponse({ message: ResponseMessageEnum.CREATED }));
    } catch (error) {
      next(error);
    }
  };

  private readonly createMany = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) next(InvalidArgumentError);

      const data: ICreateTodoData[] = request.body.data;
      await this.service.createMany(data);

      response.status(HttpStatusCodeEnum.CREATED).json(new BaseResponse({ message: ResponseMessageEnum.CREATED_MANY }));
    } catch (error) {
      next(error);
    }
  };

  private readonly getById = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) next(InvalidArgumentError);

      const id = Number(request.params.id);
      const todo = await this.service.getById(id);

      response.status(HttpStatusCodeEnum.OK).json(new BaseResponse<Todo>({ data: todo }));
    } catch (error) {
      next(error);
    }
  };

  private readonly getManyByUserId = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) next(InvalidArgumentError);

      const userId = Number(request.params.userId);
      const listCollection = await this.service.getManyByUserId(userId);

      response.status(HttpStatusCodeEnum.OK).json(new BaseResponse<Todo[]>({ data: listCollection }));
    } catch (error) {
      next(error);
    }
  };

  private readonly getManyByListId = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) next(InvalidArgumentError);

        const listId = Number(request.params.listId);
        const listCollection = await this.service.getManyByListId(listId);

        response.status(HttpStatusCodeEnum.OK).json(new BaseResponse<Todo[]>({ data: listCollection }));
      } catch (error) {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  };

  private readonly update = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) next(InvalidArgumentError);

      const { id, data }: { id: number; data: IUpdateTodoData } = request.body;
      await this.service.update(id, data);

      response.status(HttpStatusCodeEnum.OK).json(new BaseResponse({ message: ResponseMessageEnum.UPDATED }));
    } catch (error) {
      next(error);
    }
  };

  private readonly updateMany = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) next(InvalidArgumentError);

      const { ids, data }: { ids: number[]; data: IUpdateTodoData[] } = request.body;
      await this.service.updateMany(ids, data);

      response.status(HttpStatusCodeEnum.OK).json(new BaseResponse({ message: ResponseMessageEnum.UPDATED_MANY }));
    } catch (error) {
      next(error);
    }
  };

  private readonly delete = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) next(InvalidArgumentError);

      const id = Number(request.params.id);
      await this.service.delete(id);

      response.status(HttpStatusCodeEnum.OK).json(new BaseResponse({ message: ResponseMessageEnum.DELETED }));
    } catch (error) {
      next(error);
    }
  };

  private readonly deleteMany = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) next(InvalidArgumentError);

      const { ids }: { ids: number[] } = request.body;
      await this.service.deleteMany(ids);

      response.status(HttpStatusCodeEnum.OK).json(new BaseResponse({ message: ResponseMessageEnum.DELETED_MANY }));
    } catch (error) {
      next(error);
    }
  };

  private initializeRoutes() {
    this.router.post(
      this.path + '/create',
      contentTypeValidatorMiddleware,
      body('name').exists().isLength({ max: 64 }),
      body('userId').exists().toInt(),
      this.create,
    );
    this.router.post(
      this.path + '/createMany',
      contentTypeValidatorMiddleware,
      body('data').exists().isArray(),
      this.createMany,
    );
    this.router.put(
      this.path + '/update',
      contentTypeValidatorMiddleware,
      body('id').exists().toInt(),
      body('data').exists().isObject(),
      this.update,
    );
    this.router.put(
      this.path + '/updateMany',
      contentTypeValidatorMiddleware,
      body('ids').exists().isArray(),
      body('data').exists().isArray(),
      this.updateMany,
    );
    this.router.get(this.path + '/get/:id', param('id').exists().toInt(), this.getById);
    this.router.get(this.path + '/get/user/:userId', param('userId').exists().toInt(), this.getManyByUserId);
    this.router.get(this.path + '/get/list/:listId', param('listId').exists().toInt(), this.getManyByListId);
    this.router.delete(this.path + '/delete/:id', body('id').exists().toInt(), this.delete);
    this.router.post(
      this.path + '/deleteMany',
      contentTypeValidatorMiddleware,
      body('ids').exists().isArray(),
      this.deleteMany,
    );
  }
}

export default TodoController;