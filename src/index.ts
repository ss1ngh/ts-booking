import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import v1Router from './routes/v1/index.js';
import { StatusCodes } from 'http-status-codes';
import { AppError } from './utils/errors/AppError.js';
import z, { ZodError } from 'zod';
import { initExpirationService } from './services/expiration.service.js';
import { connectRedis, connectRateLimitRedis } from './config/redis.config.js';
import { initRateLimiters } from './utils/rateLimit/rateLimit.helper.js';

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.use('/' , v1Router);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
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
        await connectRateLimitRedis();
        await initRateLimiters();
        await initExpirationService();
        
        app.listen(3000, () => console.log("Server running on port 3000"));
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer();