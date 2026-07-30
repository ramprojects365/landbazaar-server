export declare class AppError extends Error {
    status: number;
    constructor(message: string, status?: number);
}
export declare class ValidationError extends AppError {
    constructor(message?: string);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class DuplicateError extends AppError {
    constructor(field?: string);
}
//# sourceMappingURL=errors.d.ts.map