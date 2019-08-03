require('dotenv').config()

const express = require('express')

const { verifySlackRequest } = require('./lib/slack')
const handlers = require('./lib/handlers')

const app = express()
const port = process.env.PORT || 3000

const urlEncodedOptions = { extended: false }

// TODO: Double check that the following is true when running on Glitch
if (process.env.NODE_ENV === 'production') {
  urlEncodedOptions.verify = verifySlackRequest
}

app.use(express.urlencoded(urlEncodedOptions))
app.post('/start', handlers.handleStart)
app.post('/vote', handlers.handleAction)

const server = app.listen(port, () =>
  // eslint-disable-next-line no-console
  console.log(`⚡️ App running on port ${port}`)
)

module.exports = app
module.exports.stop = () => server.close()
