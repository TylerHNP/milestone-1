# Milestone 1

## Client

- npm i
- npm start

#### packages used

- react-router-dom
- react-quill

## Server

- node
- express
- mongoose

Milestone #1
Description
Project is to create a shared document service. Multiple clients/users should be able to edit and coordinate to work on documents.

1.  /connect/:id
    Open a unique connection for the id,
    Create a persistent document (if one does not exist),
    And start receiving an http event stream as a response

The server will send ‘message’ events in the stream when any connected user modifies the document.
Contents of the message events:
First message event should be emitted after the connection is established with format `{data: {content: oplist}}` where the ops here must represent the whole operation array for the whole document initially.
Subsequent message events should be emitted on changes to the document from users `{data: array_of_oplists}`
Ops is the array of rich-text type OT transformations (retain, insert, delete). The operations should support “bold” and “italics” attributes. For an example of an “ops”

2.  /op/:id
    Type : POST
    Sample Payload :
    [
    [{'retain': 5}, {'insert': 'a'}],
    [{'retain': 4}, {'delete': 10}],
    [{'insert': “Hello”, 'attributes': {'bold': true}}]
    ]

3.  /doc/:id
    Type : GET
    API returns html response
    Response : Whole_document_contents_as_HTML

HTML format:
Enclose the doc contents in <p>...</p>
Use <br /> for line breaks
Use <strong>...</strong> for bold
Use <em>..</em> for italics
