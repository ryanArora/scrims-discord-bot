require("dotenv").config();

import path from "path";
import Client from "./structures/Client";
import { Intents } from "discord.js";
import mongoose from "mongoose";

process.on("unhandledException", console.error);
process.on("unhandledRejection", console.error);

const bot = new Client({
  allowedMentions: { parse: ["users"] },
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES],
  partials: ["MESSAGE", "REACTION"],
});

bot.registerCommands(path.join(__dirname, "./commands"));
bot.registerEvents(path.join(__dirname, "./events"));

mongoose.connect(process.env.MONGO_CONNECTION!).then(() => {
  console.log("Connected to database!");
  bot.login(process.env.DISCORD_TOKEN);
});
