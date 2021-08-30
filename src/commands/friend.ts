import Player from "../schemas/Player";
import Command, { RunCallback } from "../structures/Command";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.member || !settings) return;

  if (!message.member.permissions.has("ADMINISTRATOR")) {
    message.channel.send("You don't have permission to do that!");
    return;
  }

  let id = message.mentions.users.first()?.id;
  if (!id) id = args[0];

  if (!id) {
    message.channel.send("You have to mention someone or provide their userid as the first argument");
    return;
  }

  const player = await Player.findOne({ discordId: id });
  if (!player) {
    message.channel.send("That player doesn't exist");
    return;
  }

  settings.alliedPlayers.push(player.uuid);
  settings.save().then(async () => {
    if (message.guild && id) {
      const member = await message.guild.members.fetch(id);
      if (member) {
        member.roles.add(settings.alliedRole).catch(console.log);
      }
    }

    message.channel.send("Added player to friends!");
  });
};

const FriendCommand: Command = {
  name: "friend",
  aliases: ["ally"],
  run,
};

module.exports = FriendCommand;
