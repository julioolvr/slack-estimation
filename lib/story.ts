export type Story = {
  id: string;
  storyName: string;
  votes: Votes;
  closed: boolean;
};

export type Votes = {
  [userId: string]: string;
};
