const winston = require('winston');
const path = require('path');
require('dotenv').config();

const logFile = process.env.LOG_FILE || 'logs/parser.log';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',

    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}${stack ? '\n' + stack : ''}`;
        })
    ),

    transports: [
        // כתיבה לקובץ לוג
        new winston.transports.File({
            filename: logFile,
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5
        }),

        // כתיבה למסך
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

module.exports = logger;