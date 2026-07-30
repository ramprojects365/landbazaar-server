export class AppError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}
export class AuthorizationError extends AppError {
    constructor(message = 'Not authorized') {
        super(message, 403);
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}
export class DuplicateError extends AppError {
    constructor(field = 'Resource') {
        super(`${field} already exists`, 400);
    }
}
//# sourceMappingURL=errors.js.map