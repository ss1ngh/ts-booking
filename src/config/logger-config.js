const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf} = format;

const customFormat = printf(( { level, message, timestamp, stack } ) => {
    return `${timestamp} : ${level} : ${stack || message}`;
});

const logger = createLogger({
    format : combine(
        timestamp({format: 'YYYY-MM-DD  HH:mm:ss'}),
        errors({stack : true}),
        customFormat
    ),
    transports : [
        new transports.Console(),
        new transports.File({
            filename: 'combined.log',
            format: combine(timestamp(), format.json())
        })
    ],
});

module.exports = logger
