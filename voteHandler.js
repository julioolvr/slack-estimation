const uuid = require('uuid/v4')
const { splitEvery, pipe, append, flip, concat } = require('ramda')

const respondTo = require('./respondToSlack')

function handleStart (req, res) {
  acknowledge(res)

  const story = req.body.text
  const responseUrl = req.body.response_url

  respondTo(responseUrl, {
    response_type: 'in_channel',
    blocks: startVotesFor(story)
  })
}

function handleAction (req, res) {
  acknowledge(res)

  const payload = JSON.parse(req.body.payload)
  const value = payload.actions[0].value
  const [, action, id] = value.match(/(.+?)\.(.+)/)

  switch (action) {
    case 'close':
      closeVote(id)
      break
    default:
      countVote(id, action, payload)
  }

  respondTo(payload.response_url, {
    replace_original: true,
    blocks: buildMessage(id)
  })
}

module.exports = {
  handleStart,
  handleAction
}

function acknowledge (res) {
  res.status(200).end()
}

// TODO: Configurable options
const OPTIONS = [0, 1, 2, 3, 5, 8, '∞', '?']

const runningVotes = {}

function startVotesFor (storyName) {
  const id = uuid()
  runningVotes[id] = { storyName, votes: {} }

  return pipe(
    addTitle(storyName),
    addVotes(id, OPTIONS),
    addCloseVote(id)
  )([])
}

const addTitle = title =>
  append({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: title
    }
  })

const addVotes = (voteId, options) =>
  flip(concat)(
    splitEvery(4, options).map(optionsSlice => ({
      type: 'actions',
      elements: optionsSlice.map(option => ({
        type: 'button',
        text: {
          type: 'plain_text',
          text: String(option)
        },
        action_id: uuid(), // TODO: Is it really needed?
        value: `${option}.${voteId}`
      }))
    }))
  )

const addCloseVote = voteId =>
  append({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Close vote'
        },
        action_id: uuid(),
        value: `close.${voteId}`
      }
    ]
  })

function countVote (id, option, payload) {
  // TODO: Handle non-existing vote properly
  const votes = runningVotes[id].votes

  if (votes[payload.user.id] !== option) {
    votes[payload.user.id] = option
  } else {
    delete votes[payload.user.id]
  }
}

function closeVote (id) {
  // TODO: Handle non-existing vote properly
  const vote = runningVotes[id]
  vote.closed = true
}

function buildMessage (id, storyName) {
  const content = []
  const vote = runningVotes[id]

  content.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: vote.storyName
    }
  })

  if (!vote.closed) {
    splitEvery(4, OPTIONS).map(optionsSlice => {
      content.push({
        type: 'actions',
        elements: optionsSlice.map(option => ({
          type: 'button',
          text: {
            type: 'plain_text',
            text: String(option)
          },
          action_id: uuid(), // TODO: Is it really needed?
          value: `${option}.${id}`
        }))
      })
    })

    content.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Close vote'
          },
          action_id: uuid(),
          value: `close.${id}`
        }
      ]
    })

    const voters = Object.keys(vote.votes)

    if (voters.length > 0) {
      content.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Already voted: ${voters
            .map(voterId => `<@${voterId}>`)
            .join(', ')}`
        }
      })
    }
  } else {
    const voters = Object.keys(vote.votes)

    content.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Voting is closed! ${voters.map(
          voterId => `<@${voterId}>: ${vote.votes[voterId]}`
        )}`
      }
    })
  }

  return content
}
