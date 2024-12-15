const express = require('express')
const app = express()

const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv/config')

app.use(bodyParser.json())

const postsRoute = require('./routes/posts')
const authRoute = require('./routes/auth')

app.use('/api',postsRoute)
app.use('/api/user',authRoute)

try{
    mongoose.connect(process.env.DB_CONNECTOR)
    console.log('DB is now connected!')
} catch(err) {
    console.log(err)
}

app.listen(3000, ()=>{
    console.log('Server is running')
})