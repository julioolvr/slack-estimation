function countVote (story, option, payload) {
  // TODO: Immutable
  const votes = story.votes

  if (votes[payload.user.id] !== option) {
    votes[payload.user.id] = option
  } else {
    delete votes[payload.user.id]
  }
}

function closeVote (story) {
  // TODO: Immutable
  story.closed = true
}

module.exports = { countVote, closeVote }
