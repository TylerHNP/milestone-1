const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose');
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser');


const PRODUCTION_MODE = false;
const IP = "209.94.59.184"

const PORT = PRODUCTION_MODE ? 80 : 5001;


require("./db/connectDB")


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

const authRoutes = require("./routes/routes")

app.use(authRoutes)

app.get('/', (req, res) => res.send('Homepage'))



if (PRODUCTION_MODE) {
    app.listen(PORT, IP, () => console.log(`CSE356 Milestone 1 ${iPORT}`))
} else {
    app.listen(PORT, () => console.log(`CSE356 Milestone 1 ${PORT}`))
}
