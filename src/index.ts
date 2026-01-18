import express, { Request, Response, NextFunction } from 'express';
import { ServerConfig, Logger } from './config';
import apiRoutes from './routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use('/api', apiRoutes);

//global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {

    Logger.error(err.message, {
        stack : err.stack,
        url : req.originalUrl,
        method : req.method
    });

    const statusCode = err.status || 500; 
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success : false,
        message : message,
        data : {}
    });

});

app.listen(ServerConfig.PORT, () => {
    console.log(`server running on port : localhost:${ServerConfig.PORT}`);
});