const { pipe } = require('ramda')

const {
  addTitle,
  addVotes,
  addCloseVote,
  addVoters,
  addClosedTitle,
  addResults
} = require('./blocks')

// TODO: Configurable options
const OPTIONS = ['0', '1', '2', '3', '5', '8', '∞', '?']

function start (story) {
  return pipe(
    addTitle(story.storyName),
    addVotes(story.id, OPTIONS),
    addCloseVote(story.id)
  )([])
}

function vote (story) {
  return story.closed ? closedVote(story) : voteInProgress(story)
}

module.exports = { start, vote }

function voteInProgress (story) {
  return pipe(
    addTitle(story.storyName),
    addVotes(story.id, OPTIONS),
    addVoters(story.votes),
    addCloseVote(story.id)
  )([])
}

function closedVote (story) {
  return pipe(
    addClosedTitle(story.storyName),
    addResults(story.votes, OPTIONS)
  )([])
}
