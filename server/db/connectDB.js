const mongoose = require('mongoose')


mongoose.connect('mongodb://localhost:27017/milestone1', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DB Connection Established")
}).catch(err => {
    console.log("DB Connection Error ", err)
})
