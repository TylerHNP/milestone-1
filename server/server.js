
const WebSocket = require('ws')
const WebSocketJSONStream = require('@teamwork/websocket-json-stream')

const express = require('express')
const ShareDB = require('sharedb');
const cors = require('cors')

const app = express()
const bodyParser = require('body-parser');

const PRODUCTION_MODE = false;
const IP = "209.94.59.184"

const PORT = PRODUCTION_MODE ? 80 : 5001;


require("./db/connectDB")
var http = require('http');

// ShareDB.types.register(richText.type);
// const shareDBServer = new ShareDB();
// const connection = shareDBServer.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

const authRoutes = require("./routes/routes");
const { response } = require('express');

app.use(authRoutes)

// var server = http.createServer(app)
// var webSocketServer = new WebSocket.Server({ server: server })

// var backend = new ShareDB()
// webSocketServer.on('connection', (webSocket) => {
//     var stream = new WebSocketJSONStream(webSocket)
//     backend.listen(stream)
// })
// const doc = connection.get('documents', 'firstDocument');


let clients = [];

function eventsHandler(request, response, next) {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    response.writeHead(200, headers);

    const clientId = request.params.connectionId

    const newClient = {
        id: clientId,
        response
    };
    console.log(`New ${clientId} Connection Opened`);


    clients.push(newClient);

    request.on('close', () => {
        console.log(`${clientId} Connection closed`);
        clients = clients.filter(client => client.id !== clientId);
    });
}

app.get('/connect/:connectionId', eventsHandler);


function sendOpEventsToAll(connectionId, delta) {
    try {
        clients.forEach(client => {
            if (client.id != connectionId) {
                client.response.write(`data: ${JSON.stringify(delta)}\n\n`)
            }
        }
        )
    } catch (e) {
        console.log(e)
    }
}

async function updateOps(request, respsonse) {
    const connectionId = request.params.connectionId
    sendOpEventsToAll(connectionId, request.body.delta.ops);
    respsonse.end()
}
app.post('/op/:connectionId', updateOps);



async function getDoc(request, respsonse) {


    response.send(document)
}
app.post('/op/:connectionId', updateOps);


if (PRODUCTION_MODE) {
    app.listen(PORT, IP, () => console.log(`CSE356 Milestone 1: listening on port ${PORT}`))
} else {
    app.listen(PORT, () => console.log(`CSE356 Milestone 1: listening on port ${PORT}`))
}

