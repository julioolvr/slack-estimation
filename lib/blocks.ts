import { v4 as uuid } from "uuid";
import { splitEvery, compose, not, isEmpty } from "ramda";

import { Votes } from "./story";

export const title = (title: string) => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Voting* :point_right: ${title}`
    }
  }
];

export const closedTitle = (title: string) => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Voting closed* :checkered_flag: ${title}`
    }
  }
];

export const votes = (voteId: string, options: Array<string>) =>
  splitEvery(4, options).map(optionsSlice => ({
    type: "actions",
    elements: optionsSlice.map(option => ({
      type: "button",
      text: {
        type: "plain_text",
        text: String(option)
      },
      action_id: uuid(), // TODO: Is it really needed?
      value: `${option}.${voteId}`
    }))
  }));

export const closeVote = (voteId: string) => [
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Close vote"
        },
        action_id: uuid(),
        value: `close.${voteId}`
      }
    ]
  }
];

export const voters = (votes: Votes) =>
  compose(not, isEmpty)(votes)
    ? [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Already voted: ${Object.keys(votes)
              .map(voterId => `<@${voterId}>`)
              .join(", ")}`
          }
        }
      ]
    : [];

export const results = (votes: Votes, options: Array<string>) =>
  not(isEmpty(votes))
    ? [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: options
              .filter(hasVotes(votes))
              .map(
                option =>
                  `• ${option} - ${votersFor(votes, option)
                    .map(voterId => `<@${voterId}>`)
                    .join(", ")}`
              )
              .join("\n")
          }
        }
      ]
    : [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: ":cry: No votes"
          }
        }
      ];

const hasVotes = (votes: Votes) => (option: string) =>
  votesCountFor(votes, option) > 0;

const votesCountFor = (votes: Votes, option: string) =>
  votersFor(votes, option).length;

const votersFor = (votes: Votes, option: string) =>
  Object.keys(votes).filter(voterId => votes[voterId] === option);