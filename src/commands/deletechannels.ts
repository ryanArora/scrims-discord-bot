import Command, { RunCallback } from "../structures/Command";

// temporary commmand

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member) return;

  if (!message.member.hasPermission("ADMINISTRATOR")) {
    message.channel.send("You dont have permission to do that");
    return;
  }

  message.guild.channels.cache.forEach((c) => {
    if (c.name.startsWith("game-") || c.name.startsWith("Game #")) c.delete().catch(console.log);
  });
};

const DeleteChannelsCommand: Command = {
  name: "deletechannels",
  run,
};

module.exports = DeleteChannelsCommand;
