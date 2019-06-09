const uuid = require("uuid/v4");
const fetch = require("node-fetch");

function handleStart(req, res) {
  res.status(200).end();

  const story = req.body.text;
  const responseUrl = req.body.response_url;

  fetch(responseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      response_type: "in_channel",
      blocks: startVotesFor(story)
    })
  });
}

function handleAction(req, res) {
  const payload = JSON.parse(req.body.payload);
  const value = payload.actions[0].value;
  const [, action, id] = value.match(/(.+?)\.(.+)/);

  switch (action) {
    case "close":
      closeVote(id);
      break;
    default:
      countVote(id, action, payload);
  }

  res.status(200).end();

  const responseUrl = payload.response_url;

  fetch(responseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      replace_original: true,
      blocks: buildMessage(id)
    })
  });
}

module.exports = {
  handleStart,
  handleAction
};

// TODO: Configurable options
const OPTIONS = [0, 1, 2, 3, 5, 8, "∞", "?"];

const runningVotes = {};

function startVotesFor(storyName) {
  const id = uuid();
  runningVotes[id] = { storyName, votes: {} };
  return buildMessage(id);
}

function countVote(id, option, payload) {
  // TODO: Handle non-existing vote properly
  const votes = runningVotes[id].votes;

  if (votes[payload.user.id] !== option) {
    votes[payload.user.id] = option;
  } else {
    delete votes[payload.user.id];
  }
}

function closeVote(id) {
  // TODO: Handle non-existing vote properly
  const vote = runningVotes[id];
  vote.closed = true;
}

function buildMessage(id, storyName) {
  const content = [];
  const vote = runningVotes[id];

  content.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: vote.storyName
    }
  });

  if (!vote.closed) {
    content.push({
      type: "actions",
      elements: OPTIONS.map(option => ({
        type: "button",
        text: {
          type: "plain_text",
          text: String(option)
        },
        action_id: uuid(), // TODO: Is it really needed?
        value: `${option}.${id}`
      }))
    });

    content.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Close vote"
          },
          action_id: uuid(),
          value: `close.${id}`
        }
      ]
    });

    const voters = Object.keys(vote.votes);

    if (voters.length > 0) {
      content.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Already voted: ${voters
            .map(voterId => `<@${voterId}>`)
            .join(", ")}`
        }
      });
    }
  } else {
    const voters = Object.keys(vote.votes);

    content.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Voting is closed! ${voters.map(
          voterId => `<@${voterId}>: ${vote.votes[voterId]}`
        )}`
      }
    });
  }

  return content;
}
