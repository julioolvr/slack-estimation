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

const { createStory, getStory } = require('./lib/store')
const respondTo = require('./respondToSlack')

/*
  ACTION HANDLERS
*/
function handleStart (req, res) {
  acknowledge(res)

  const storyName = req.body.text
  const responseUrl = req.body.response_url

  const story = createStory(storyName)

  respondTo(responseUrl, {
    response_type: 'in_channel',
    blocks: start(story)
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
    blocks: vote(id)
  })
}

module.exports = {
  handleStart,
  handleAction
}

// TODO: Configurable options
const OPTIONS = ['0', '1', '2', '3', '5', '8', '∞', '?']

/*
  RESPONSE BUILDERS
*/
function start (story) {
  return pipe(
    addTitle(story.storyName),
    addVotes(story.id, OPTIONS),
    addCloseVote(story.id)
  )([])
}

function vote (id) {
  const currentStory = getStory(id)
  return currentStory.closed
    ? closedVote(id, currentStory)
    : voteInProgress(id, currentStory)
}

function voteInProgress (id, vote) {
  return pipe(
    addTitle(vote.storyName),
    addVotes(id, OPTIONS),
    addVoters(vote.votes),
    addCloseVote(id)
  )([])
}

function closedVote (id, vote) {
  return pipe(
    addClosedTitle(vote.storyName),
    addResults(vote.votes, OPTIONS)
  )([])
}

/*
  COMPONENTS
*/
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

/*
  ACTIONS
*/
function countVote (id, option, payload) {
  // TODO: Handle non-existing story properly
  const votes = getStory(id).votes

  if (votes[payload.user.id] !== option) {
    votes[payload.user.id] = option
  } else {
    delete votes[payload.user.id]
  }
}

function closeVote (id) {
  // TODO: Handle non-existing story properly
  const vote = getStory(id)
  vote.closed = true
}

function acknowledge (res) {
  res.status(200).end()
}
