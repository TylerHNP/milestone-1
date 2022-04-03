import { useState, useEffect, useCallback } from 'react'

import Quill from "quill"
import "quill/dist/quill.snow.css"
import { v4 as uuidV4 } from "uuid"
const connectionId = uuidV4()


function TextEditor() {
    const [quill, setQuill] = useState()
    const [quillLoaded, setQuillLoaded] = useState(false)
    const [listening, setListening] = useState(false);


    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null) return

        wrapper.innerHTML = ""
        const editor = document.createElement("div")
        wrapper.append(editor)
        const q = new Quill(editor, {
            theme: "snow",
            modules: { toolbar: ['bold', 'italic', 'underline', 'strike', 'align'] },
        })
        setQuill(q)
        setQuillLoaded(true)
    }, [])

    // once connected, check for existing doc and retreive
    useEffect(() => {

        if (quill == null) return
        async function fetchData() {

            const document = await fetch(`http://localhost:5001/getDoc/${connectionId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            });
            document.json().then(d => console.log("connected to a doc...", (d.content)))
            quill.setContents(document.content)
            quill.enable()
        }
        fetchData();

    }, [quillLoaded])

    //receiving updates from server
    useEffect(() => {
        if (quill == null) return
        if (!listening) {
            const events = new EventSource(`http://localhost:5001/connect/${connectionId}`);
            events.onmessage = (event) => {
                const updatedDelta = JSON.parse(event.data);
                console.log(updatedDelta)
                quill.updateContents(updatedDelta)
            };
            setListening(true);
        }


    }, [listening, quill])




    //submiting my doc updates
    useEffect(() => {
        if (quill == null) return

        const handler = async (delta, oldDelta, source) => {
            if (source !== "user") return
            console.log(delta)
            // socket.emit("send-changes", delta)
            const rawResponse = await fetch(`http://localhost:5001/op/${connectionId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ delta })
            });
            console.log(rawResponse.status)
        }
        quill.on("text-change", handler)
        return () => {
            quill.off("text-change", handler)
        }

    }, [quill])

    return (
        <div>
            <p>KYLERIM</p>

            <div className="container" ref={wrapperRef}></div>

        </div>
    );
}

export default TextEditor;




// import React, { useEffect, useState } from 'react';
// import Quill from 'quill';
// import 'quill/dist/quill.snow.css';
// import Sharedb from 'sharedb/lib/client';
// import richText from 'rich-text';
// import { useParams } from "react-router-dom"

// // Registering the rich text type to make sharedb work
// // with our quill editor
// Sharedb.types.register(richText.type);

// // Connecting to our socket server
// // const socket = new WebSocket('ws://localhost:5001');
// const events = new EventSource('http://localhost:5001/events');
// const connection = new Sharedb.Connection(events);

// // Querying for our document

// function TextEditor() {

//     const { id: documentId } = useParams()

//     const [value, setValue] = useState()
//     const [events, setEvents] = useState([])

//     const [listening, setListening] = useState(false);
//     const doc = connection.get('documents', documentId);

//     useEffect(() => {
//         doc.subscribe(function (err) {
//             if (err) throw err;

//             const toolbarOptions = ['bold', 'italic', 'underline', 'strike', 'align'];
//             const options = {
//                 theme: 'snow',
//                 modules: {
//                     toolbar: toolbarOptions,
//                 },
//             };
//             let quill = new Quill('#editor', options);
//             /**
//              * On Initialising if data is present in server
//              * Updtaing its content to editor
//              */
//             quill.setContents(doc.data);

//             /**
//              * On Text change publishing to our server
//              * so that it can be broadcasted to all other clients
//              */
//             quill.on('text-change', function (delta, oldDelta, source) {
//                 if (source !== 'user') return;
//                 doc.submitOp(delta, { source: quill });
//                 console.log(delta)
//             });

//             /** listening to changes in the document
//              * that is coming from our server
//              */
//             doc.on('op', function (op, source) {
//                 if (source === quill) return;
//                 quill.updateContents(op);
//             });
//         });
//         return () => {
//             connection.close();
//         };
//     }, []);



//     return (
//         <div style={{ margin: '5%', border: '1px solid' }}>
//             <div id='editor'></div>
//         </div>
//     );
// }

// export default TextEditor;
