const { is } = require("ramda");
const { matchObject, startsWith } = require("./utils");

const snapshot = storyName => ({
  response_type: "in_channel",
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: text => text.trim() === `*Voting* :point_right: ${storyName}`
      }
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "0" },
          action_id: is(String),
          value: startsWith("0.")
        },
        {
          type: "button",
          text: { type: "plain_text", text: "1" },
          action_id: is(String),
          value: startsWith("1.")
        },
        {
          type: "button",
          text: { type: "plain_text", text: "2" },
          action_id: is(String),
          value: startsWith("2.")
        },
        {
          type: "button",
          text: { type: "plain_text", text: "3" },
          action_id: is(String),
          value: startsWith("3.")
        }
      ]
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "5" },
          action_id: is(String),
          value: startsWith("5.")
        },
        {
          type: "button",
          text: { type: "plain_text", text: "8" },
          action_id: is(String),
          value: startsWith("8.")
        },
        {
          type: "button",
          text: { type: "plain_text", text: "∞" },
          action_id: is(String),
          value: startsWith("∞.")
        },
        {
          type: "button",
          text: { type: "plain_text", text: "?" },
          action_id: is(String),
          value: startsWith("?.")
        }
      ]
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: 'No votes'
      }
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Close vote" },
          action_id: is(String),
          value: startsWith("close.")
        }
      ]
    }
  ]
});

module.exports = storyName => matchObject(snapshot(storyName));
