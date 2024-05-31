require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser');
const Logger = require('./lib/Logger');
const app = express();
const ClientWA = require('./lib/ClientWA');

const clientNeiros = new ClientWA('neiros');
clientNeiros.init();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, }));

app.use(Logger.request);

app.get('/', (req, res) => res.send('<h1>The server is running</h1>'));

app.get('/phone/:phone', async (req, res) => {
    if (!clientNeiros) return res.status(500).send('Error clientNeiros');
    res.status(200);
    const result = await clientNeiros.checkPhone(req.params.phone);
    res.send(result);
})

app.use(Logger.error);

app.listen(process.env.PORT, () => console.log('Server started...'))
