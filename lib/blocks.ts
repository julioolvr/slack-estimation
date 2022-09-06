import { v4 as uuid } from "uuid";
import { splitEvery, compose, not, isEmpty } from "ramda";

import { Votes } from "./story";

export type BlockUi = Array<Block>;

type Block = SectionBlock | ActionsBlock;

type SectionBlock = TextSectionBlock | FieldsSectionBlock;

type TextObject = PlainTextObject | MarkdownObject;

type PlainTextObject = {
  type: "plain_text";
  text: string;
  emoji?: boolean;
};

type MarkdownObject = {
  type: "mrkdwn";
  text: string;
  verbatim?: boolean;
};

type TextSectionBlock = {
  type: "section";
  text: TextObject;
  block_id?: string;
  fields?: Array<string>;
};

type FieldsSectionBlock = {
  type: "section";
  block_id?: string;
  fields: Array<TextObject>;
};

type ActionsBlock = {
  type: "actions";
  elements: Array<BlockElements>;
  block_id?: string;
};

type BlockElements = ButtonBlockElement;

type ButtonBlockElement = {
  type: "button";
  text: PlainTextObject;
  action_id: string;
  url?: string;
  value?: string;
  style?: "primary" | "danger";
};

export const title = (title: string): Array<SectionBlock> => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Voting* :point_right: ${title}`,
    },
  },
];

export const closedTitle = (title: string): Array<SectionBlock> => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Voting closed* :checkered_flag: ${title}`,
    },
  },
];

export const votes = (
  voteId: string,
  options: Array<string>
): Array<ActionsBlock> =>
  splitEvery(4, options).map((optionsSlice) => ({
    type: "actions",
    elements: optionsSlice.map((option) => ({
      type: "button",
      text: {
        type: "plain_text",
        text: String(option),
      },
      action_id: uuid(), // TODO: Is it really needed?
      value: `${option}.${voteId}`,
    })),
  }));

export const closeVote = (voteId: string): Array<ActionsBlock> => [
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Close vote",
        },
        action_id: uuid(),
        value: `close.${voteId}`,
      },
    ],
  },
];

export const voters = (votes: Votes): Array<SectionBlock> =>
  compose(not, isEmpty)(votes)
    ? [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Already voted (${Object.keys(votes).length}): ${Object.keys(
              votes
            )
              .map((voterId) => `<@${voterId}>`)
              .join(", ")}`,
          },
        },
      ]
    : [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "No votes",
          },
        },
      ];

export const results = (
  votes: Votes,
  options: Array<string>
): Array<SectionBlock> =>
  not(isEmpty(votes))
    ? [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: options
              .filter(hasVotes(votes))
              .map(
                (option) =>
                  `• ${option} - ${votersFor(votes, option)
                    .map((voterId) => `<@${voterId}>`)
                    .join(", ")}`
              )
              .join("\n"),
          },
        },
      ]
    : [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: ":cry: No votes",
          },
        },
      ];

const hasVotes = (votes: Votes) => (option: string) =>
  votesCountFor(votes, option) > 0;

const votesCountFor = (votes: Votes, option: string) =>
  votersFor(votes, option).length;

const votersFor = (votes: Votes, option: string) =>
  Object.keys(votes).filter((voterId) => votes[voterId] === option);
