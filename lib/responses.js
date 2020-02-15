const { unnest } = require("ramda");

const {
  title,
  votes,
  closeVote,
  voters,
  closedTitle,
  results
} = require("./blocks");

// TODO: Configurable options
const OPTIONS = ["0", "1", "2", "3", "5", "8", "∞", "?"];

function start(story) {
  return unnest([
    title(story.storyName),
    votes(story.id, OPTIONS),
    closeVote(story.id)
  ]);
}

function vote(story) {
  return story.closed ? closedVote(story) : voteInProgress(story);
}

module.exports = { start, vote };

function voteInProgress(story) {
  return unnest([
    title(story.storyName),
    votes(story.id, OPTIONS),
    voters(story.votes),
    closeVote(story.id)
  ]);
}

function closedVote(story) {
  return unnest([closedTitle(story.storyName), results(story.votes, OPTIONS)]);
}
