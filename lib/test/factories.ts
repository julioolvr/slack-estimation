import { Factory } from "fishery";

import { Story } from "../story";

export const storyFactory = Factory.define<Story>(({ sequence }) => ({
  id: `story-${sequence}`,
  storyName: `Story ${sequence}`,
  votes: {},
  closed: false,
}));
