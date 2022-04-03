
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


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

const authRoutes = require("./routes/routes");

app.use(authRoutes)




ShareDB.types.register(require('rich-text').type);
const shareDBServer = new ShareDB();
const connection = shareDBServer.connect();
const doc = connection.get('documents', 'firstDocument');


// // Connecting to our socket server


// doc.on('op', function (op, source) {
//     if (source === quill) return;
//     quill.updateContents(op);
// });


const ONE_DOC_ID = 0
let clients = [];


//EVENT STREAM
async function eventsHandler(request, response, next) {

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


    let exist = false
    for (let i = 0; i < clients.length; i++) {
        console.log("@@@@", clients[i].id, clientId)
        if (clients[i].id == clientId) {
            exist = true
        }
    }
    if (!exist) {
        // send stuff...
        console.log("FUUK")
        const document = await findOrCreateDocument(ONE_DOC_ID)
        response.write(`data: ${JSON.stringify(document)}\n\n`)
    }

    clients.push(newClient);
    console.log("Currently Connected Users: ", clients.length)


    // {data: {content: oplist}}
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
    sendOpEventsToAll(connectionId, request.body.data.ops);



    // [
    //     [{ insert: 'a' }], [{ retain: 1 }, { insert: 'b' }], [{ retain: 2 }, { insert: 'c' }]
    // ]

    const content = request.body.content.ops
    const update = await Document.findByIdAndUpdate(ONE_DOC_ID, { content })


    response.end()
}
app.post('/op/:connectionId', updateOps);



async function getDoc(request, response) {
    const document = await findOrCreateDocument(ONE_DOC_ID)
    response.json(document.content)
}
app.get('/getDoc/:connectionId', getDoc);


async function findOrCreateDocument(ONE_DOC_ID) {
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

