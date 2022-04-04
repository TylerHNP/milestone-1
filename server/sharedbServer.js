// const WebSocket = require('ws');
// const WebSocketJSONStream = require('@teamwork/websocket-json-stream');
// const ShareDB = require('sharedb');
// var http = require('http');


// const IS_PRODUCTION_MODE = false;

// let IP = "ws://209.94.59.184:5555"
// if (!IS_PRODUCTION_MODE) {
//     IP = "ws://localhost:5555"
// }
// /**
//  * By Default Sharedb uses JSON0 OT type.
//  * To Make it compatible with our quill editor.
//  * We are using this npm package called rich-text
//  * which is based on quill delta
//  */
// ShareDB.types.register(require('rich-text').type);

// const shareDBServer = new ShareDB();
// const connection = shareDBServer.connect();

// /**
//  * 'documents' is collection name(table name in sql terms)
//  * 'firstDocument' is the id of the document
//  */
// const doc = connection.get('documents', 'firstDocument');



// doc.fetch(function (err) {
//     if (err) throw err;
//     if (doc.type === null) {
//         /**
//          * If there is no document with id "firstDocument" in memory
//          * we are creating it and then starting up our ws server
//          */
//         doc.create([], 'rich-text', () => {
//             const wss = new WebSocket(IP);
//             console.log("doc is created");
//             console.log(doc.data);
//             wss.on('connection', function connection(ws) {
//                 // For transport we are using a ws JSON stream for communication
//                 // that can read and write js objects.
//                 const jsonStream = new WebSocketJSONStream(ws);
//                 shareDBServer.listen(jsonStream);
//             });
//         });
//         return;
//     }
// });

// http.createServer(function (req, res) {
//     res.writeHead(200, { 'Content-Type': 'text/plain' });
//     res.end('Hello World\n');
// })

// server.listen(`${IP}`);

// console.log('Server running at http://10.211.56.1:8080/');


var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var richText = require('rich-text');
var WebSocket = require('ws');
var WebSocketJSONStream = require('@teamwork/websocket-json-stream');


const IS_PRODUCTION_MODE = false;
const IP = "209.94.59.184"

const PORT = 5555;

ShareDB.types.register(richText.type);
var backend = new ShareDB();
createDoc(startServer);

// Create initial document then fire callback
function createDoc(callback) {
    var connection = backend.connect();
    var doc = connection.get('documents', 'firstDocument');
    doc.fetch(function (err) {
        if (err) throw err;
        if (doc.type === null) {
            doc.create([{ insert: 'Hi!' }], 'rich-text', callback);
            return;
        }
        callback();
    });
}

function startServer() {
    // Create a web server to serve files and listen to WebSocket connections
    var app = express();
    app.use(express.static('static'));
    app.use(express.static('node_modules/quill/dist'));
    var server = http.createServer(app);

    // Connect any incoming WebSocket connection to ShareDB
    var wss = new WebSocket.Server({ server: server });
    wss.on('connection', function (ws) {
        var stream = new WebSocketJSONStream(ws);
        backend.listen(stream);
        console.log("our main server is now connected to shareDB server")
    });


    if (IS_PRODUCTION_MODE) {
        server.listen(PORT, IP, () => console.log(`CSE356 Milestone 1 ShareDB: listening on port ${PORT}`))
    } else {
        server.listen(PORT, () => console.log(`CSE356 Milestone 1 ShareDB: listening on port ${PORT}`))
    }
    console.log(`Listening on ${IP}`);
}