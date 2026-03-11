export class AppError extends Error {
    constructor (public message : string, public statusCode : number) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(resource : string) {
        super(`${resource} not found`, 404);
    }
}