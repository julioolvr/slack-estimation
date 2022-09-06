import { unnest } from "ramda";

import {
  title,
  votes,
  closeVote,
  voters,
  closedTitle,
  results,
  BlockUi,
} from "./blocks";

import { Story } from "./story";
import config from "./config";

const OPTIONS = config.options;

export function vote(story: Story): BlockUi {
  return story.closed ? closedVote(story) : voteInProgress(story);
}

function voteInProgress(story: Story): BlockUi {
  return unnest([
    title(story.storyName),
    votes(story.id, OPTIONS),
    voters(story.votes),
    closeVote(story.id),
  ]);
}

function closedVote(story: Story): BlockUi {
  return unnest([closedTitle(story.storyName), results(story.votes, OPTIONS)]);
}
