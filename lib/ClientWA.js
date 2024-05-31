const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Api = require('./Api');

class ClientWA {
    constructor(clientId, settings = {}) {
        this.settings = settings;
        this.clientId = clientId;
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox',],
            },
            webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html', }
        });
    }

    async checkPhone(phone) {
        try {
            const result = await this.client.isRegisteredUser(phone);
            return { result };
        } catch (error) {
            return { result: false, error: error.message };
        }
    }

    init() {
        this.client.on('qr', (qr) => {
            qrcode.generate(qr, {small: true}, (qrCode) => this.qr = qrCode);
        });

        this.client.on('message', message => {
            console.log(message.body);
            if (!message.body) return;
            const phone = message.from.replace(/\D/g, '');
            console.log(this.settings);
            if (this.settings.sendingMessageInfo) {
                Api.sendMessageInfo(phone, message.body);
            }
            
        });

        this.client.initialize();
    }

    logout() {
        this.client.logout();
    }
}

module.exports = ClientWA;