import Command, { RunCallback } from "../structures/Command";
import Player from "../schemas/Player";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

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
      message.channel.send(`[${elo}] ${player.name}\n\nWins: ${wins}\nLosses: ${losses}\nWLR: ${wlr}\nWinstreak: ${winstreak}\nLosestreak: ${losestreak}`).catch(() => {});
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
