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

module.exports = {
  addTitle,
  addVotes,
  addCloseVote,
  addVoters,
  addClosedTitle,
  addResults
}

const hasVotes = votes => option => votesCountFor(votes, option) > 0

const votesCountFor = (votes, option) => votersFor(votes, option).length

const votersFor = (votes, option) =>
  Object.keys(votes).filter(voterId => votes[voterId] === option)
