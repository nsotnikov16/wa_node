require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser');
const Logger = require('./lib/Logger');
const path = require('path');
const app = express();
const ClientWA = require('./lib/ClientWA');

const clients = {};

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, }));

app.use(Logger.request);

app.get('/', (req, res) => res.send('<h1>The server is running</h1>'));

app.get('/phone/:phone', async (req, res) => {
    if (!clients['neiros']) return res.status(500).send('Error clientNeiros');
    res.status(200);
    const result = await clients['neiros'].checkPhone(req.params.phone);
    res.send(result);
});

app.get('/init', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/init/:clientId/result', (req, res) => {
    const clientId = req.params.clientId;
    if (!clients[clientId]) {
        var client = new ClientWA(clientId, { sendingMessageInfo: clientId == 'neiros' });
        client.init();
        clients[clientId] = client;
    } else {
        var client = clients[clientId];
        if (client.qr) {
            res.send(client.qr);
        } else {
            res.send('');
        }
    }
})

app.use(Logger.error);

app.listen(process.env.PORT, () => console.log('Server started...'))
