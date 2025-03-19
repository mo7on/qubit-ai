class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ErrorHandler {
  static badRequest(message, errorCode = 'BAD_REQUEST') {
    return new AppError(message, 400, errorCode);
  }
  
  static unauthorized(message = 'Unauthorized access', errorCode = 'UNAUTHORIZED') {
    return new AppError(message, 401, errorCode);
  }
  
  static forbidden(message = 'Forbidden access', errorCode = 'FORBIDDEN') {
    return new AppError(message, 403, errorCode);
  }
  
  static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    return new AppError(message, 404, errorCode);
  }
  
  static serverError(message = 'Internal server error', errorCode = 'SERVER_ERROR') {
    return new AppError(message, 500, errorCode);
  }
  
  static serviceUnavailable(message = 'Service temporarily unavailable', errorCode = 'SERVICE_UNAVAILABLE') {
    return new AppError(message, 503, errorCode);
  }
}

module.exports = {
  AppError,
  ErrorHandler
};