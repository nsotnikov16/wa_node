const { format, transports, createLogger } = require('winston');
const expressWinston = require('express-winston');

class Logger {

    /**
     * Все входящие запросы на сервер
     */
    request = expressWinston.logger({
        transports: [
            new transports.File({ filename: './logs/express/request.json' }),
        ],
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
    });

    /* Ошибки сервера */
    error = expressWinston.errorLogger({
        transports: [
            new transports.File({ filename: './logs/express/error.json' }),
        ],
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
    });

    /* Кастомный логгер POST запросов */
    post = createLogger({
        transports: [
            new transports.File({ filename: './logs/post.json' })
        ],
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
    })

    /* API */
    api = createLogger({
        transports: [
            new transports.File({ filename: './logs/api.json' })
        ],
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
    })

    /* API */
    client = createLogger({
        transports: [
            new transports.File({ filename: './logs/client.json' })
        ],
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
    })

    call = async (logger, data) => {
        await this[logger].info(data);
    }
}

module.exports = new Logger();