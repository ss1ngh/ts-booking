const express = require ('express');

const { ServerConfig, Logger } = require('./config');
const apiRoutes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use('/api', apiRoutes);

//global error handler
app.use((err, req, res, next) => {

    Logger.error(err.message, {
        stack : err.stack,
        url : req.originalUrl,
        method : req.method
    });

    const statusCode = err.status || "500";
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success : false,
        message : message,
        data : {}
    });

});

app.listen(ServerConfig.PORT, () => {
    console.log(`server running on port :  localhost:${ServerConfig.PORT}`);
})