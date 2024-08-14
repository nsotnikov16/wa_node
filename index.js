require('dotenv').config();
const express = require('express');
const mysql = require("mysql2");
const bodyParser = require('body-parser');
const Logger = require('./lib/Logger');
const path = require('path');
const app = express();
const ClientWA = require('./lib/ClientWA');
const defaultClientId = 'neiros';
const clients = {};

const db = mysql.createConnection({
    connectionLimit: 5,
    host: process.env.DB_HOST,
    user: process.env.DB_LOGIN,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
});

const querydb = (query) => new Promise((resolve, reject) => db.query(query, (err, data) => {
    if (err) return reject(err);
    resolve(data);
}))

const startClient = (clientId, params, create = false) => {
    var client = new ClientWA(clientId, params);
    client.init();
    clients[clientId] = client;
    if (!create) return;
    db.query(`SELECT * FROM clients WHERE waid = '${clientId}'`, (err, data) => {
        if (err || data.length) return;
        db.query(`INSERT INTO clients VALUES('${clientId}', 1)`);
    })
}

querydb('SELECT waid FROM clients where `on` = 1').then(data => {
    data.forEach(item => startClient(item.waid, { sendingMessageInfo: item.waid == defaultClientId }))
    console.log(clients);
})

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, }));

app.use(Logger.request);

/* app.use((req, res, next) => {
    if (req.query.hash != process.env.HASH_QUERY) return res.sendStatus(403);
    next();
}) */

app.get('/', (req, res) => res.send('<h1>The server is running</h1>'));

app.get('/phone/:phone', async (req, res) => {
    if (!clients[defaultClientId]) return res.status(500).send('Error clientNeiros');
    res.status(200);
    const result = await clients[defaultClientId].checkPhone(req.params.phone);
    res.send(result);
});

app.get('/init', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/init/:clientId/result', (req, res) => {
    const clientId = req.params.clientId;
    if (!clients[clientId]) {
        startClient(clientId, { sendingMessageInfo: clientId == defaultClientId }, true);
    } else {
        var client = clients[clientId];
        if (client.qr) {
            res.send(client.qr);
        } else {
            res.send('');
        }
    }
})

app.get('/client/:clientId/logout', async (req, res) => {
    const clientId = req.params.clientId;
    try {
        if (!clients[clientId]) throw new Error();
        const ok = await clients[clientId].logout();
        if (!ok) throw new Error();
        await querydb(`DELETE FROM clients where waid = '${clientId}'`)
        delete clients[clientId];
        return res.send({ success: true });
    } catch (error) {

    }

    return res.send({ success: false });
})

app.use(Logger.error);

app.listen(process.env.PORT, () => console.log('Server started...'))
