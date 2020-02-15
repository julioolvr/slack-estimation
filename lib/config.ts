export default {
  options: process.env.OPTIONS
    ? process.env.OPTIONS.split(",")
    : ["0", "1", "2", "3", "5", "8", "∞", "?"]
};
