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
            document.json().then(d => console.log("connected to a doc...", (quill.setContents(d))))
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
                const a = JSON.parse(event.data)

                if (a.content) {
                    console.log("First message sent with content key..", JSON.parse(event.data))

                } else {
                    console.log("Not first time connected anymore / hearing updates...")
                }
                const updatedDelta = JSON.parse(event.data);
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

                //check piazza data type...
                body: JSON.stringify({ data: delta, content: quill.getContents() })
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




/**
 * On Text change publishing to our server
 * so that it can be broadcasted to all other clients
 */
            // quill.on('text-change', function (delta, oldDelta, source) {
            //     if (source !== 'user') return;
            //     doc.submitOp(delta, { source: quill });
            //     console.log(delta)
            // });

/** listening to changes in the document
 * that is coming from our server
 */
            // doc.on('op', function (op, source) {
            //     if (source === quill) return;
            //     quill.updateContents(op);
            // });

