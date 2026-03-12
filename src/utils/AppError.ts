import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
    public readonly success: boolean;

    constructor(
        public readonly message: string, 
        public readonly statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR
    ) {
        super(message);
        this.success = false;
        this.name = this.constructor.name;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, StatusCodes.NOT_FOUND);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string) {
        super(message, StatusCodes.BAD_REQUEST);
    }
}