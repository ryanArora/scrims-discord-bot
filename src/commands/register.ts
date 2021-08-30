import { TextChannel } from "discord.js";
import Command, { RunCallback } from "../structures/Command";
import registerPlayer from "../util/actions/registerPlayer";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  const name = args[0];
  if (!name) {
    message.channel.send("You need to have your username as the first argument");
    return;
  }

  registerPlayer(message.member, name, false, settings, message.channel as TextChannel);
};

const RegisterCommand: Command = {
  name: "register",
  aliases: ["rename"],
  run,
};

module.exports = RegisterCommand;
