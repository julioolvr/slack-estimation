import { Story } from "./story";
import { Payload as SlackPayload } from "./slack";

export function countVote(
  story: Story,
  option: string,
  payload: SlackPayload
): Story {
  const newVotes = { ...story.votes };

  if (newVotes[payload.user.id] !== option) {
    newVotes[payload.user.id] = option;
  } else {
    delete newVotes[payload.user.id];
  }

  return { ...story, votes: newVotes };
}

export function closeVote(story: Story): Story {
  return { ...story, closed: true };
}
