const { Schema, model } = require("mongoose")

const Document = new Schema({
    _id: String,
    content: Object,
})

module.exports = model("Document", Document)