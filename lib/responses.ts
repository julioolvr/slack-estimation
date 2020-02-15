import { unnest } from "ramda";

import {
  title,
  votes,
  closeVote,
  voters,
  closedTitle,
  results
} from "./blocks";

import { Story } from "./story";
import config from "./config";

const OPTIONS = config.options;

export function start(story: Story) {
  return unnest([
    title(story.storyName),
    votes(story.id, OPTIONS),
    closeVote(story.id)
  ]);
}

export function vote(story: Story) {
  return story.closed ? closedVote(story) : voteInProgress(story);
}

function voteInProgress(story: Story) {
  return unnest([
    title(story.storyName),
    votes(story.id, OPTIONS),
    voters(story.votes),
    closeVote(story.id)
  ]);
}

function closedVote(story: Story) {
  return unnest([closedTitle(story.storyName), results(story.votes, OPTIONS)]);
}
