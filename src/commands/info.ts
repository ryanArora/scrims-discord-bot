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

      const { elo, eloHigh, wins, losses, winstreak, losestreak, winstreakHigh } = player;
      let wlr = "";
      if (wins > 0 && losses === 0) wlr = "∞";
      else if (wins === 0 && losses === 0) wlr = "0.00";
      else wlr = (wins / losses).toFixed(2);

      let msg = `[${elo}] ${player.name}\n\n`;
      msg += `Highest Elo: ${eloHigh}\n`;
      msg += `Wins: ${wins}\n`;
      msg += `Losses: ${losses}\n`;
      msg += `WLR: ${wlr}\n`;
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
  aliases: ["i, stats"],
  run,
};

module.exports = InfoCommand;
