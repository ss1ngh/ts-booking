import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import v1Router from './routes/v1/index.js';
import { StatusCodes } from 'http-status-codes';
import { AppError } from './utils/AppError.js';
import { ZodError } from 'zod';

const app = express();
app.use(express.json());

app.use('/' , v1Router);

// 2. Global Error Handler (MUST be defined after all routes/middlewares)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // Handle Zod Validation Errors
    if (err instanceof ZodError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Validation Failed",
            data: {},
            error: err.flatten().fieldErrors // Provides clean, readable errors
        });
    }

    // Handle your custom AppErrors (like NotFoundError)
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            data: {},
            error: err
        });
    }

    // Fallback for unexpected internal errors
    console.error(err); // Log for debugging
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Something went wrong",
        data: {},
        error: process.env.NODE_ENV === "development" ? err : {}
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));