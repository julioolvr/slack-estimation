const uuid = require('uuid/v4')
const { splitEvery, compose, not, isEmpty } = require('ramda')

const title = title => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Voting* :point_right: ${title}`
    }
  }
]

const closedTitle = title => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Voting closed* :checkered_flag: ${title}`
    }
  }
]

const votes = (voteId, options) =>
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

const closeVote = voteId => [
  {
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
  }
]

const voters = votes =>
  compose(
    not,
    isEmpty
  )(votes)
    ? [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Already voted: ${Object.keys(votes)
            .map(voterId => `<@${voterId}>`)
            .join(', ')}`
        }
      }
    ]
    : []

const results = (votes, options) =>
  not(isEmpty(votes))
    ? [
      {
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
      }
    ]
    : [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':cry: No votes'
        }
      }
    ]

module.exports = {
  title,
  votes,
  closeVote,
  voters,
  closedTitle,
  results
}

const hasVotes = votes => option => votesCountFor(votes, option) > 0

const votesCountFor = (votes, option) => votersFor(votes, option).length

const votersFor = (votes, option) =>
  Object.keys(votes).filter(voterId => votes[voterId] === option)
