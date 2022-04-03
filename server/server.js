
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

const Document = require('./models/Document')
require("./db/connectDB")
var http = require('http');

// ShareDB.types.register(richText.type);
// const shareDBServer = new ShareDB();
// const connection = shareDBServer.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

const authRoutes = require("./routes/routes");

app.use(authRoutes)

// var server = http.createServer(app)
// var webSocketServer = new WebSocket.Server({ server: server })

// var backend = new ShareDB()
// webSocketServer.on('connection', (webSocket) => {
//     var stream = new WebSocketJSONStream(webSocket)
//     backend.listen(stream)
// })
// const doc = connection.get('documents', 'firstDocument');

const ONE_DOC_ID = 0
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

async function updateOps(request, response) {

    //@TODO
    // Handle list of Ops Events
    // right now, it only handles one at a time. the grading scripts expect an array of it.
    const connectionId = request.params.connectionId
    sendOpEventsToAll(connectionId, request.body.delta.ops);
    const document = await Document.findById(ONE_DOC_ID)

    const a = await Document.findByIdAndUpdate(ONE_DOC_ID, { content: [document.content] + [request.body.delta.ops] }, { new: true })
    response.end()
}
app.post('/op/:connectionId', updateOps);



async function getDoc(request, response) {
    const connectionId = request.params.connectionId
    const document = await findOrCreateDocument(ONE_DOC_ID)
    response.json(document)
}
app.get('/getDoc/:connectionId', getDoc);


async function findOrCreateDocument(ONE_DOC_ID) {

    // const document = await Document.count({}, async function (err, count) {
    //     if (count == 0) {
    //         console.log("0")
    //         return await Document.create({ _id: 0, content: "" })
    //     } else if (count == 1) {
    //         console.log("1")
    //         return await Document.find().limit(1)
    //     }
    // })

    const document = await Document.findById(ONE_DOC_ID)
    console.log('found existing doc to load... doc_id:', ONE_DOC_ID)
    if (document) return document
    console.log('new doc creating.. doc_id:', ONE_DOC_ID)
    return await Document.create({ _id: ONE_DOC_ID, content: [] })

}

if (PRODUCTION_MODE) {
    app.listen(PORT, IP, () => console.log(`CSE356 Milestone 1: listening on port ${PORT}`))
} else {
    app.listen(PORT, () => console.log(`CSE356 Milestone 1: listening on port ${PORT}`))
}

