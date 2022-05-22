import { expect } from "chai";

import { Story } from "./story";
import { storyFactory } from "./test/factories";

import { start, vote } from "./responses";

describe("responses", () => {
  describe("start", () => {
    rendersABlankVoteTests(start, {
      storyName: "STORY",
      votes: {},
      id: "STORY_ID",
    });
  });

  describe("vote", () => {
    describe("for an open story", () => {
      describe("with no existing votes", () => {
        rendersABlankVoteTests(vote, {
          storyName: "STORY",
          votes: {},
          id: "STORY_ID",
        });
      });

      describe("with voters", () => {
        it("renders the voters", () => {
          const response = vote(
            storyFactory.build({
              storyName: "STORY",
              votes: { U123: "2", U456: "3" },
              id: "STORY_ID",
            })
          );

          expect(response[3]).to.deep.equal({
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Already voted: <@U123>, <@U456>",
            },
          });
        });
      });
    });

    describe("for a closed story", () => {
      it("renders a closed vote title", () => {
        const response = vote({
          storyName: "STORY",
          id: "STORY_ID",
          votes: {},
          closed: true,
        });

        expect(response).to.deep.include({
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Voting closed* :checkered_flag: STORY",
          },
        });
      });

      describe("with votes", () => {
        it("includes the voters and their votes", () => {
          const response = vote({
            storyName: "STORY",
            votes: { U123: "2", U456: "3" },
            id: "STORY_ID",
            closed: true,
          });

          expect(response).to.deep.include({
            type: "section",
            text: {
              type: "mrkdwn",
              text: "• 2 - <@U123>\n• 3 - <@U456>",
            },
          });
        });
      });

      describe("without votes", () => {
        it("includes a message saying there are no votes", () => {
          const response = vote({
            storyName: "STORY",
            votes: {},
            id: "STORY_ID",
            closed: true,
          });

          expect(response).to.deep.include({
            type: "section",
            text: {
              type: "mrkdwn",
              text: ":cry: No votes",
            },
          });
        });
      });
    });
  });

  function rendersABlankVoteTests(
    fn: typeof start | typeof vote,
    story: Partial<Story>
  ) {
    it("includes the story name", () => {
      const response = fn(storyFactory.build({ ...story }));

      expect(response).to.deep.include({
        type: "section",
        text: { type: "mrkdwn", text: "*Voting* :point_right: STORY" },
      });
    });

    it("includes the voting options", () => {
      const response = fn(storyFactory.build({ ...story }));

      expect(response[1].type).to.equal("actions");
      ["0", "1", "2", "3"].forEach((option, index) => {
        // @ts-ignore
        expect(response[1].elements[index]).to.deep.include({
          type: "button",
          value: `${option}.STORY_ID`,
          text: { type: "plain_text", text: option },
        });
      });

      expect(response[2].type).to.equal("actions");
      ["5", "8", "∞", "?"].forEach((option, index) => {
        // @ts-ignore
        expect(response[2].elements[index]).to.deep.include({
          type: "button",
          value: `${option}.STORY_ID`,
          text: { type: "plain_text", text: option },
        });
      });
    });

    it("includes the actions", () => {
      const response = fn(storyFactory.build({ ...story }));
      expect(response[3].type).to.equal("actions");
      // @ts-ignore
      expect(response[3].elements[0]).to.deep.include({
        type: "button",
        text: {
          type: "plain_text",
          text: "Close vote",
        },
        value: "close.STORY_ID",
      });
    });
  }
});
