require('dotenv').config()

const express = require('express')

const verifySlackRequest = require('./verifySlackRequest')
const handlers = require('./voteHandler')

const app = express()
const port = process.env.PORT || 3000

app.use(express.urlencoded({ extended: false, verify: verifySlackRequest }))
app.post('/start', handlers.handleStart)
app.post('/vote', handlers.handleAction)

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`⚡️ App running on port ${port}`))
