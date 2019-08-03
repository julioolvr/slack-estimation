const { respond, acknowledge } = require('./slack')
const { getStory, createStory } = require('./store')
const { closeVote, countVote } = require('./actions')
const { start, vote } = require('./responses')

function handleStart (req, res) {
  acknowledge(res)

  const storyName = req.body.text
  const responseUrl = req.body.response_url

  const story = createStory(storyName)

  respond(responseUrl, {
    response_type: 'in_channel',
    blocks: start(story)
  })
}

function handleAction (req, res) {
  acknowledge(res)

  const payload = JSON.parse(req.body.payload)
  const value = payload.actions[0].value
  const [, action, id] = value.match(/(.+?)\.(.+)/)
  const story = getStory(id)

  switch (action) {
    case 'close':
      closeVote(story)
      break
    default:
      countVote(story, action, payload)
  }

  respond(payload.response_url, {
    replace_original: true,
    blocks: vote(story)
  })
}

module.exports = {
  handleStart,
  handleAction
}
