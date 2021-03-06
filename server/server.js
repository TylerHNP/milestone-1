
const WebSocket = require('ws')
const WebSocketJSONStream = require('@teamwork/websocket-json-stream')

const express = require('express')
// const ShareDB = require('sharedb');
var ShareDB = require('sharedb/lib/client');

const cors = require('cors')

const app = express()
const bodyParser = require('body-parser');

const IS_PRODUCTION_MODE = false;
const IP = "209.94.59.184"

const PORT = IS_PRODUCTION_MODE ? 80 : 5001;


let websocketServer = 'ws://209.94.59.184:5555'
if (!IS_PRODUCTION_MODE) {
    websocketServer = 'ws://localhost:5555'
}

const Document = require('./models/Document')
require("./db/connectDB")


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

const authRoutes = require("./routes/routes");

app.use(authRoutes)



ShareDB.types.register(require('rich-text').type);

const socket = new WebSocket(websocketServer);
const connection = new ShareDB.Connection(socket)
const doc = connection.get('documents', 'firstDocument');
doc.subscribe(function (err) {
    if (err) throw err;
    doc.on('op', function (delta, source) {
        console.log("op changes happens", source);
        console.log(delta);
        sendOpEventsToAll(source, delta);
    });
});

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


    clients.push(newClient);
    console.log("Currently Connected Users: ", clients.length)
    console.log("USERS: ", clients.map(i => i.id))



    // Send only once upon starting the connection.
    // First message event should be emitted after the connection is established with format
    // `{data: {content: oplist}}` where the ops here must represent the whole operation array 
    //for the whole document initially.
    for (let i = 0; i < clients.length; i++) {
        if (clients[i].id === clientId) {
            const document = await findOrCreateDocument(ONE_DOC_ID)
            //`{data: {content: oplist}}`
            const content = { content: document.content }
            console.log(`data: ${JSON.stringify(content)}\n\n`)
            response.write(`data: ${JSON.stringify(content)}\n\n`)
            // below is the formatted example sending
            // {
            //     data: {
            //       content: '[{"insert":"asdfasdfasdfasasdfasdfasdasdfasdfasd\\nasdfasdfasdfasasdfasdfasdasdfasdf\\n"}]'
            //     }
            //   }

        }
    }


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


    const connectionId = request.params.connectionId
    // console.log("@@@@@@@@@@@@@@@@@@@", request.body)
    // @@@@@@@@@@@@@@@@@@@ [ [ { retain: 6 }, { insert: 'f' } ] ]

    for (let i = 0; i < request.body.length; i++) {
        const content = request.body[i];

        doc.submitOp(content, { source: connectionId });
        // ** PROBABLY NEEDS TO SEND PROCESSED OP from SHAREDB to below...
        // sendOpEventsToAll(connectionId, request.body[i]);

    }
    // [
    //     [{ insert: 'a' }], [{ retain: 1 }, { insert: 'b' }], [{ retain: 2 }, { insert: 'c' }]
    // ]

    //@TODO
    // HOW ARE WE GOING TO SAVE IT TO SHAREDB...?

    // const content = request.body.content.ops
    // console.log("#########", content)
    // const update = await Document.findByIdAndUpdate(ONE_DOC_ID, { content })


    // ------------- SHAREDB -------------


    response.end()





}
app.post('/op/:connectionId', updateOps);



async function findOrCreateDocument(ONE_DOC_ID) {
    const document = await Document.findById(ONE_DOC_ID)
    console.log('found existing doc to load... doc_id:', ONE_DOC_ID)
    if (document) return document
    console.log('new doc creating.. doc_id:', ONE_DOC_ID)
    return await Document.create({ _id: ONE_DOC_ID, content: [] })
}

if (IS_PRODUCTION_MODE) {
    app.listen(PORT, IP, () => console.log(`CSE356 Milestone 1: listening on port ${PORT}`))
} else {
    app.listen(PORT, () => console.log(`CSE356 Milestone 1: listening on port ${PORT}`))
}

