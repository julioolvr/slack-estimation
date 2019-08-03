function countVote (story, option, payload) {
  const newVotes = { ...story.votes }

  if (newVotes[payload.user.id] !== option) {
    newVotes[payload.user.id] = option
  } else {
    delete newVotes[payload.user.id]
  }

  return { ...story, votes: newVotes }
}

function closeVote (story) {
  return { ...story, closed: true }
}

module.exports = { countVote, closeVote }
