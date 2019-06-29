const crypto = require('crypto')

module.exports = function verifySlackRequest (req, res, buf) {
  const timestamp = req.get('X-Slack-Request-Timestamp')

  if (new Date().getTime() - parseInt(timestamp, 10) * 1000 > 1000 * 60 * 5) {
    throw new Error('Request timestamp is from more than 5 minutes ago')
  }

  const secret = process.env.SLACK_SIGNING_SECRET
  if (!secret) {
    throw new Error('Missing Slack signing secret')
  }

  const signatureBaseString = ['v0', timestamp, buf.toString()].join(':')
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(signatureBaseString)
  const signature = `v0=${hmac.digest('hex')}`

  if (req.get('X-Slack-Signature') !== signature) {
    throw new Error('Invalid signature found')
  }
}