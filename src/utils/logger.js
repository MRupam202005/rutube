import winston from "winston";

// Define the custom settings for each transport (file, console)
const options = {
    fileCombined: {
        level: 'info',
        filename: 'logs/combined.log',
        handleExceptions: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.json()
        ),
    },
    fileError: {
        level: 'error',
        filename: 'logs/error.log',
        handleExceptions: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.json()
        ),
    },
    console: {
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        handleExceptions: true,
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp }) => {
                return `[${timestamp}] ${level}: ${message}`;
            })
        ),
    },
};

// Instantiate a new Winston Logger with the settings defined above
const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    transports: [
        new winston.transports.File(options.fileError),
        new winston.transports.File(options.fileCombined),
    ],
    exitOnError: false, // do not exit on handled exceptions
});

// If we're not in production then log to the `console` with the format
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console(options.console));
} else {
    // In production we still want console logs (e.g. for AWS CloudWatch/Render logs) but in JSON format
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
    }));
}

// create a stream object with a 'write' function that will be used by `morgan` HTTP logger
logger.stream = {
    write: function(message) {
        // use the 'info' log level so the output will be picked up by both transports
        logger.info(message.trim());
    },
};

export default logger;
