const ClientWA = require('../lib/ClientWA');
const ClientModel = require('../models/Client');
const ClientsCollection = {
    items: {},
    startClient: async function (clientId, params, create = false) {
        var client = new ClientWA(clientId, params);
        client.init();
        this.items[clientId] = client;
        if (!create) return;
        const model = new ClientModel();
        const rows = await model.where('waid', clientId).get();
        if (!rows.length) model.create({ waid: clientId, on: 1 });
    }
};
module.exports = ClientsCollection;