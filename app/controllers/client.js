const path = require('path');
const ClientsCollection = require('../collections/clients');
const ClientModel = require('../models/Client');
const { defaultClientId } = require('../tools/constants')

module.exports.init = (req, res) => res.sendFile(path.join(process.cwd(), 'public', 'index.html'));

module.exports.resultInit = (req, res) => {
    const clientId = req.params.clientId;
    if (!ClientsCollection.items[clientId]) {
        ClientsCollection.startClient(clientId, { sendingMessageInfo: clientId == defaultClientId }, true);
    } else {
        var client = ClientsCollection.items[clientId];
        if (client.qr) {
            res.send(client.qr);
        } else {
            res.send('');
        }
    }
}

module.exports.logout = async (req, res) => {
    const clientId = req.params.clientId;
    try {
        if (!ClientsCollection.items[clientId]) throw new Error();
        const ok = await ClientsCollection.items[clientId].logout();
        if (!ok) throw new Error();
        const model = new ClientModel();
        const result = await model.where('waid', clientId).delete();
        if (!result.success) throw new Error();
        delete ClientsCollection.items[clientId];
        return res.send({ success: true });
    } catch (error) {

    }

    return res.send({ success: false });
}