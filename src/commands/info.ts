import Command, { RunCallback } from "../structures/Command";
import Player from "../schemas/Player";
import ratioToString from "../util/ratioToString";

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

      const { elo, eloHigh, wins, losses, winstreak, losestreak, winstreakHigh, mvps } = player;

      let msg = `[${elo}] ${player.name}\n\n`;
      msg += `Highest Elo: ${eloHigh}\n`;
      msg += `Wins: ${wins}\n`;
      msg += `Losses: ${losses}\n`;
      msg += `WLR: ${ratioToString(wins, losses, 2)}\n`;
      msg += `MVPs: ${mvps}\n`;
      msg += `Winstreak: ${winstreak}\n`;
      msg += `Highest Winstreak: ${winstreakHigh}\n`;
      msg += `Losestreak: ${losestreak}`;

      message.channel.send(msg);
    })
    .catch(() => {
      message.channel.send("Unable to fetch player");
    });
};

const InfoCommand: Command = {
  name: "info",
  aliases: ["i"],
  run,
};

module.exports = InfoCommand;
