const uuid = require('uuid/v4')

const stories = {}

function createStory (storyName) {
  const id = uuid()
  stories[id] = { id, storyName, votes: {} }
  return stories[id]
}

function getStory (id) {
  return stories[id]
}

module.exports = { createStory, getStory }
