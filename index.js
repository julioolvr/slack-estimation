require("dotenv").config();

const express = require("express");

const validateSlackRequest = require("./slackValidationMiddleware");
const handlers = require("./voteHandler");

const app = express();
const port = 3000; // TODO: Env var

// TODO: Request validation
app.use(validateSlackRequest);
app.use(express.urlencoded({ extended: false }));
app.post("/start", handlers.handleStart);
app.post("/vote", handlers.handleAction);

app.listen(port, () => console.log(`⚡️ App running on port ${port}`));
