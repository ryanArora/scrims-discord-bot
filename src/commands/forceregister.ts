import Command, { RunCallback } from "../structures/Command";
import { TextChannel } from "discord.js";
import canScore from "../util/canScore";
import registerPlayer from "../util/actions/registerPlayer";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  if (!canScore(message.member, settings.scorerRole)) {
    message.channel.send("You need to be a scorer to run this command!");
    return;
  }

  const member = message.mentions?.members?.first();
  if (!member) {
    message.channel.send("You need to have the member to register as the first argument");
    return;
  }

  const name = args[1];
  if (!name) {
    message.channel.send("You need to have your username as the second argument");
    return;
  }

  registerPlayer(member, name, true, settings, message.channel as TextChannel);
};

const ForceRegisterCommand: Command = {
  name: "forceregister",
  aliases: ["forcerename"],
  run,
};

module.exports = ForceRegisterCommand;
