'use strict';

import BaseException from '../exceptions/BaseException';
import HttpException from '../exceptions/httpException';
import HttpStatusCodeEnum from '../constants/httpStatusCodeEnum';
import ApiErrorMessageEnum from '../constants/apiErrorMessageEnum';

const InvalidArgumentError = new BaseException({
  message: ApiErrorMessageEnum.INVALID_ARGUMENT,
  httpException: new HttpException({
    status: HttpStatusCodeEnum.BAD_REQUEST,
    message: ApiErrorMessageEnum.INVALID_ARGUMENT,
  }),
});

export default InvalidArgumentError;
