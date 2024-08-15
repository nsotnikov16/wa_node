const { Client, LocalAuth } = require('whatsapp-web.js');
const Logger = require('./Logger');
const qrcode = require('qrcode-terminal');
const Api = require('./Api');
const ClientModel = require('../models/Client');

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

    async init(createInDB) {
        this.client.on('qr', (qr) => {
            qrcode.generate(qr, { small: true }, (qrCode) => this.qr = qrCode);
        });

        this.client.on('message', message => {
            if (!message.body) return;
            const phone = message.from.replace(/\D/g, '');
            if (phone && this.settings.sendingMessageInfo) Api.sendMessageInfo(phone, message.body);
            Logger.call('client', { phone, message: message.body, clientId: this.clientId });
        });

        // Клиент готов к использованию
        this.client.on('ready', () => {
            Logger.call('client', { message: `Client ${this.clientId} is ready` })
        });

        this.client.on('auth_failure', message => Logger.call('client', { message }))

        this.client.on('disconnected', () => this.setOn(false));

        this.client.initialize();

        if (createInDB) {
            const model = new ClientModel();
            const rows = await model.where('waid', this.clientId).get();
            if (!rows.length) model.create({ waid: this.clientId, on: 1 });
        }
    }

    async logout() {
        try {
            await this.client.logout();
            await this.setOn(false);
            Logger.call('client', { status: 'logout' })
            return true;
        } catch (error) {
            Logger.call('client', { status: 'logout', error: error.message });
        }
        return false;
    }

    async setOn(status) {
        const model = new ClientModel();
        const result = await model.where('waid', this.clientId).update({ on: Number(Boolean(status)) });
        if (!result.success) throw new Error(result.message);
    }
}

module.exports = ClientWA;