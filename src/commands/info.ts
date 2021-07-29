import Command, { RunCallback } from "../structures/Command";
import Player from "../schemas/Player";

const run: RunCallback = async (client, message, args, settings) => {
  let discordId = message.author.id;
  const user = message.mentions.users.first();
  if (user) discordId = user.id;

  Player.findOne({ discordId })
    .then((player) => {
      if (!player) {
        message.channel.send("Player hasn't registered yet!");
        return;
      }

      const { elo, wins, losses, wlr, winstreak, losestreak } = player;
      console.log(elo, wins, losses, wlr, winstreak, losestreak);
    })
    .catch(() => {
      message.channel.send("Unable to fetch player").catch(() => {});
    });
};

const InfoCommand: Command = {
  name: "info",
  aliases: ["i, stats"],
  run,
};

module.exports = InfoCommand;
