const uuid = require("uuid/v4");

const stories = {};

function createStory(storyName) {
  const id = uuid();
  stories[id] = { id, storyName, votes: {} };
  return stories[id];
}

function getStory(id) {
  // TODO: Handle non-existing story properly
  return stories[id];
}

function updateStory(story) {
  stories[story.id] = story;
  return story;
}

module.exports = { createStory, getStory, updateStory };
