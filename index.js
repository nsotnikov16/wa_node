require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Logger = require('./app/lib/Logger');
const ClientModel = require('./app/models/Client');
const ClientsCollection = require('./app/collections/clients');
const { defaultClientId } = require('./app/tools/constants');


(async () => {
    const allClients = await new ClientModel().where('on', 1).select(['waid']).get();
    if (allClients.length) allClients.forEach(item => ClientsCollection.startClient(item.waid, { sendingMessageInfo: item.waid == defaultClientId }))
})()



app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, }));

app.use(Logger.request);

app.get('/', (req, res) => res.send('<h1>The server is running</h1>'));

app.get('/phone/:phone', async (req, res) => {
    if (!ClientsCollection.items[defaultClientId]) return res.status(500).send('Error client ' + defaultClientId);
    res.status(200);
    const result = await ClientsCollection.items[defaultClientId].checkPhone(req.params.phone);
    res.send(result);
});

app.use('/client/', require('./app/routes/client'));

app.use(Logger.error);

app.listen(process.env.PORT, () => console.log('Server started...'))