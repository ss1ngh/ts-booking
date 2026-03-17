import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import v1Router from './routes/v1/index.js';
import { StatusCodes } from 'http-status-codes';
import { AppError } from './utils/errors/AppError.js';
import z, { ZodError } from 'zod';
import { initExpirationService } from './services/expiration.service.js';
import { connectRedis } from './config/redis.config.js';

const app = express();
app.use(express.json());

app.use('/' , v1Router);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ZodError) {
        const errorTree = z.treeifyError(err);
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Validation Failed",
            data: {},
            error: {
                fieldErrors : 'properties' in errorTree ? errorTree.properties : {} ,
                formErrors: errorTree.errors
            } 
        });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            data: {},
            error: err
        });
    }

    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Something went wrong",
        data: {},
        error: process.env.NODE_ENV === "development" ? err : {}
    });
});

const startServer = async () => {
    try {
        await connectRedis();
        await initExpirationService();
        
        app.listen(3000, () => console.log("Server running on port 3000"));
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer();