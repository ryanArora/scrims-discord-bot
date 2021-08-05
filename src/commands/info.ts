import Command, { RunCallback } from "../structures/Command";
import Player from "../schemas/Player";
import Game from "../schemas/Game";
import ratioToString from "../util/ratioToString";
import { MessageEmbed, Util } from "discord.js";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  let discordId = message.author.id;
  const user = message.mentions.users.first();
  if (user) discordId = user.id;

  const players = await Player.find({});
  if (!players) {
    message.channel.send("No one has registered yet!");
    return;
  }

  players.sort((a, b) => b.elo - a.elo);

  const i = players.findIndex((p) => p.discordId === discordId);
  const player = players[i];

  if (!player) {
    message.channel.send("Player haven't registered yet!");
    return;
  }

  let gamesMsg = "";

  const games = player.games.slice(-5);
  for (const gameId of games) {
    const game = await Game.findOne({ gameId });
    if (!game?.winningTeam) continue;

    let won = (game.winningTeam === 1 && game.team1.includes(player.discordId)) || (game.winningTeam === 2 && game.team2.includes(player.discordId));

    gamesMsg += `#${gameId}${won ? ` 🏆` : ""}\n`;
  }

  gamesMsg.slice(0, -1);

  if (!gamesMsg) gamesMsg = "No recent games";

  const { elo, eloHigh, wins, losses, winstreak, losestreak, winstreakHigh, mvps } = player;

  let msg = "";
  msg += `ELO: __**${elo}**__\n`;
  msg += `Wins: **${wins}**\n`;
  msg += `Losses: **${losses}**\n`;
  msg += `Games: **${wins + losses}**\n`;
  msg += `MVPs: **${mvps}**\n`;
  msg += `Win/Loss Rate: **${ratioToString(wins, losses, 2)}**\n`;
  msg += `MVP Rate: **${ratioToString(mvps, wins + losses, 2)}**\n`;
  msg += `Highest Elo: **${eloHigh}**\n`;
  msg += `Winstreak: **${winstreak}**\n`;
  msg += `Highest Winstreak: **${winstreakHigh}**\n`;
  msg += `Losestreak: **${losestreak}**`;

  const embed = new MessageEmbed();
  embed.setTitle(`Player Info - ${Util.escapeMarkdown(player.name)}`);
  embed.setDescription(`[${elo}] ${player.name}\n\nPosition: **#${i + 1}**`);
  embed.addField("Player Stats", msg, true);
  embed.addField("Recent Games", gamesMsg, true);
  embed.setTimestamp();
  embed.setFooter(`Requested by ${message.author.tag}`);

  message.channel.send({ embed });
};

const InfoCommand: Command = {
  name: "info",
  aliases: ["i"],
  run,
};

module.exports = InfoCommand;
