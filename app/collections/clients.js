const ClientWA = require('../lib/ClientWA');
const ClientsCollection = {
    items: {},
    startClient: async function (clientId, params, create = false) {
        var client = new ClientWA(clientId, params);
        client.init(create);
        this.items[clientId] = client;
    }
};
module.exports = ClientsCollection;