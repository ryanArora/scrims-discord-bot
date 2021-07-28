require("dotenv").config();

import path from "path";
import Client from "./strutures/Client";
import { Intents } from "discord.js";
import mongoose from "mongoose";

const intents = new Intents();
intents.add(Intents.NON_PRIVILEGED);
intents.add("GUILD_MEMBERS");

const bot = new Client({
  allowedMentions: { parse: ["users"] },
  ws: {
    intents,
  },
});

mongoose
  .connect(process.env.MONGO_CONNECTION!!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database!");

    bot.registerCommands(path.join(__dirname, "./commands"));
    bot.registerEvents(path.join(__dirname, "./events"));
    bot.login(process.env.DISCORD_TOKEN);
  });
