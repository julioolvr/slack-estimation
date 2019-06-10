require("dotenv").config();

const express = require("express");

const verifySlackRequest = require("./verifySlackRequest");
const handlers = require("./voteHandler");

const app = express();
const port = 3000; // TODO: Env var

app.use(express.urlencoded({ extended: false, verify: verifySlackRequest }));
app.post("/start", handlers.handleStart);
app.post("/vote", handlers.handleAction);

app.listen(port, () => console.log(`⚡️ App running on port ${port}`));
