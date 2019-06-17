const axios = require('axios')

function respondTo (responseUrl, body) {
  return axios.post(responseUrl, body).catch(err => {
    // TODO: What's the proper way to log on node apps?
    // eslint-disable-next-line no-console
    console.error('Failed to respond to Slack', { err })
  })
}

module.exports = respondTo
