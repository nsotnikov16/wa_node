const Logger = require('./Logger');

class Api {

    /**
     * Отправка информации о сообщении
     * @param {string} phone 
     * @param {string} message 
     * @returns 
     */
    async sendMessageInfo(phone, message) {
        const data = { phone, message };
        const result = await this.request('POST', '/whatsup', data);
        Logger.call('api', { method: 'sendMessageInfo', result, data });
        return result;
    }

    /**
     * Общий метод для работы с запросами
     * @param {string} method 
     * @param {string} url 
     * @param {object} data 
     * @returns {object}
     */
    async request(method = 'GET', url = '', data) {
        let result = {};
        if (!url.includes('http')) url = process.env.API_URL + url;
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                ...method != 'GET' ? { body: JSON.stringify(data) } : ''
            })

            result = await response.json();

        } catch (error) {
            result = { error: error.message };
        }

        return result;
    }
};

module.exports = new Api();