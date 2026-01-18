import { createLogger, format, transports } from 'winston';
const { combine, timestamp, errors, printf} = format;

const customFormat = printf(( { level, message, timestamp, stack } : any ) => {
    return `${timestamp} : ${level} : ${stack || message}`;
});

export const Logger = createLogger({
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

