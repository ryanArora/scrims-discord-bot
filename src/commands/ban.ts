import Player from "../schemas/Player";
import Command, { RunCallback } from "../structures/Command";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  if (!message.member.permissions.has("ADMINISTRATOR")) {
    message.channel.send("You don't have permission to do that!");
    return;
  }

  let id = message.mentions.users.first()?.id;
  if (!id) id === args[0];
  if (!id) {
    message.channel.send("You have to mention or put a players userid as the first argument");
    return;
  }

  const player = await Player.findOne({ discordId: id }).catch(() => {});
  if (!player) {
    message.channel.send("That player hasn't registered!");
    return;
  }

  const member = await message.guild.members.fetch(id);
  if (member && !member.roles.cache.has(settings.bannedRole)) {
    member.roles.add(settings.bannedRole).catch(() => {});
  }

  if (!settings.bannedPlayers.includes(player.uuid)) {
    settings.bannedPlayers.push(player.uuid);
    settings.save();
  }

  message.channel.send(`Banned player ${player.name} (${player.uuid})`);
};

const BanCommand: Command = {
  name: "ban",
  aliases: ["fuckoff"],
  run,
};

module.exports = BanCommand;
