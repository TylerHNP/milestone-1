const mongoose = require('mongoose');
const crypto = require('crypto');

const documentSchema = new mongoose.Schema({
    id: String,
    content: String,
    createdDate: String,
});



const Document = mongoose.model('Document', documentSchema);


exports.Document = Document;

