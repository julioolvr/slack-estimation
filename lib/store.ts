import { v4 as uuid } from "uuid";
import { Story } from "./story";

const stories: Record<string, Story> = {};

export function createStory(storyName: string) {
  const id = uuid();
  stories[id] = { id, storyName, votes: {}, closed: false };
  return stories[id];
}

export function getStory(id: string) {
  // TODO: Handle non-existing story properly
  return stories[id];
}

export function updateStory(story: Story) {
  stories[story.id] = story;
  return story;
}
