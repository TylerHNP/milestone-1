import { useState, useEffect, useCallback } from 'react'

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useParams } from "react-router-dom"



function TextEditor() {
    const { id: documentId } = useParams()
    const [socket, setSocket] = useState()
    const [value, setValue] = useState()

    return (<div>
        <ReactQuill theme="snow" value={value} onChange={setValue} />
    </div>
    );
}

export default TextEditor;