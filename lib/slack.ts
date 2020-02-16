import { Request, Response } from "express";
import * as crypto from "crypto";
import axios from "axios";

import { BlockUi } from "./blocks";

export type Payload = {
  user: {
    id: string;
  };
};

type SlackBody = {
  blocks: BlockUi;
  response_type?: "in_channel";
  replace_original?: boolean;
};

export function respond(responseUrl: string, body: SlackBody) {
  return axios.post(responseUrl, body).catch(err => {
    // TODO: What's the proper way to log on node apps?
    // eslint-disable-next-line no-console
    console.error("Failed to respond to Slack", { err });
  });
}

export function acknowledge(res: Response) {
  res.status(200).end();
}

export function verifySlackRequest(req: Request, res: Response, buf: Buffer) {
  const timestamp = req.get("X-Slack-Request-Timestamp");

  if (
    !timestamp ||
    new Date().getTime() - parseInt(timestamp, 10) * 1000 > 1000 * 60 * 5
  ) {
    throw new Error("Request timestamp is from more than 5 minutes ago");
  }

  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) {
    throw new Error("Missing Slack signing secret");
  }

  const signatureBaseString = ["v0", timestamp, buf.toString()].join(":");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(signatureBaseString);
  const signature = `v0=${hmac.digest("hex")}`;

  if (req.get("X-Slack-Signature") !== signature) {
    throw new Error("Invalid signature found");
  }
}
