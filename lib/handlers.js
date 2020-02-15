const { respond, acknowledge } = require("./slack");
const { getStory, createStory, updateStory } = require("./store");
const { closeVote, countVote } = require("./actions");
const { start, vote } = require("./responses");

function handleStart(req, res) {
  acknowledge(res);

  const storyName = req.body.text;
  const responseUrl = req.body.response_url;

  const story = createStory(storyName);

  respond(responseUrl, {
    response_type: "in_channel",
    blocks: start(story)
  });
}

function handleAction(req, res) {
  acknowledge(res);

  const payload = JSON.parse(req.body.payload);
  const value = payload.actions[0].value;
  const [, action, id] = value.match(/(.+?)\.(.+)/);
  const story = getStory(id);
  let updatedStory;

  switch (action) {
    case "close":
      updatedStory = closeVote(story);
      break;
    default:
      updatedStory = countVote(story, action, payload);
  }

  updateStory(updatedStory);

  respond(payload.response_url, {
    replace_original: true,
    blocks: vote(updatedStory)
  });
}

module.exports = {
  handleStart,
  handleAction
};
