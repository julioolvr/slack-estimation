const uuid = require('uuid/v4')
const {
  splitEvery,
  pipe,
  append,
  flip,
  concat,
  when,
  not,
  isEmpty,
  ifElse
} = require('ramda')

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
const OPTIONS = ['0', '1', '2', '3', '5', '8', '∞', '?']

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

function voteInProgressFor (id, vote) {
  return pipe(
    addTitle(vote.storyName),
    addVotes(id, OPTIONS),
    addVoters(vote.votes),
    addCloseVote(id)
  )([])
}

function closedVoteFor (id, vote) {
  return pipe(
    addClosedTitle(vote.storyName),
    addResults(vote.votes, OPTIONS)
  )([])
}

const addTitle = title =>
  append({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Voting* :point_right: ${title}`
    }
  })

const addClosedTitle = title =>
  append({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Voting closed* :checkered_flag: ${title}`
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

const addVoters = votes =>
  when(
    pipe(
      isEmpty,
      not
    ),
    append({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Already voted: ${Object.keys(votes)
          .map(voterId => `<@${voterId}>`)
          .join(', ')}`
      }
    })
  )

const hasVotes = votes => option => votesCountFor(votes, option) > 0

const votesCountFor = (votes, option) => votersFor(votes, option).length

const votersFor = (votes, option) =>
  Object.keys(votes).filter(voterId => votes[voterId] === option)

const addResults = (votes, options) =>
  ifElse(
    () => not(isEmpty(votes)),
    append({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: options
          .filter(hasVotes(votes))
          .map(
            option =>
              `• ${option} - ${votersFor(votes, option)
                .map(voterId => `<@${voterId}>`)
                .join(', ')}`
          )
          .join('\n')
      }
    }),
    append({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':cry: No votes'
      }
    })
  )

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

function buildMessage (id) {
  const vote = runningVotes[id]
  return vote.closed ? closedVoteFor(id, vote) : voteInProgressFor(id, vote)
}
