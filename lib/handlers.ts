import { Request, Response } from "express";

import { respond, acknowledge } from "./slack";
import { getStory, createStory, updateStory } from "./store";
import { closeVote, countVote } from "./actions";
import { vote } from "./responses";

export function handleStart(req: Request, res: Response) {
  acknowledge(res);

  const storyName = req.body.text;
  const responseUrl = req.body.response_url;

  const story = createStory(storyName);

  respond(responseUrl, {
    response_type: "in_channel",
    blocks: vote(story),
  });
}

export function handleAction(req: Request, res: Response) {
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
    blocks: vote(updatedStory),
  });
}
