import { MessageEmbed } from "discord.js";
import Game, { EGameState } from "../schemas/Game";
import Player from "../schemas/Player";
import Command, { RunCallback } from "../structures/Command";
import getNewPlayerStats from "../util/getNewPlayerStats";
import updateMember from "../util/actions/updateMember";
import eloDifferenceStr from "../util/str/eloDifferenceStr";
import mentionsStr from "../util/str/mentionsStr";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  if (!message.member.hasPermission("ADMINISTRATOR")) {
    message.channel.send("You need to be an admin to do that!");
    return;
  }

  const gameId = parseInt(args[0] as string, 10);
  if (isNaN(gameId)) {
    message.channel.send("You need to provide a game id as the first argument!");
    return;
  }

  const winningTeam = parseInt(args[1] as string, 10);
  if (winningTeam !== 1 && winningTeam !== 2) {
    message.channel.send("You need to provide the winning team as the second argument!");
    return;
  }

  const mvps = message.mentions.users.map((u) => u.id);
  if (mvps.length <= 0) {
    message.channel.send("You need to mention at least one player as mvp!");
    return;
  }

  const games = await Game.find({});
  if (!games) {
    message.channel.send("No games have been played!");
    return;
  }

  const game = games.find((g) => g.gameId === gameId);
  if (!game) {
    message.channel.send("You need to enter a valid game id!");
    return;
  }

  const mvpsAreAllPlayers = mvps.every((id) => game.players.includes(id));
  if (!mvpsAreAllPlayers) {
    message.channel.send("An mvp you provided did not play in the game!");
    return;
  }

  game.state = EGameState.FINISHED;
  game.mvps = mvps;
  game.winningTeam = winningTeam;

  await game.save().catch(() => {
    message.reply(`Failed to save score result for game #${gameId}!`);
  });

  let team1Str = "";
  let team2Str = "";

  for (const discordId of game.players) {
    let player = await Player.findOne({ discordId });
    if (!player) {
      message.channel.send(`Failed to update stats for <@${discordId}>`);
      continue;
    }

    const oldElo = player.elo;

    player.elo = 0;
    player.eloHigh = 0;
    player.wins = 0;
    player.losses = 0;
    player.winstreak = 0;
    player.winstreakHigh = 0;
    player.losestreak = 0;
    player.mvps = 0;

    player.games.push(gameId);
    player.games.sort((a, b) => a - b);

    for (const gameId of player.games) {
      const game = games.find((g) => g.gameId === gameId);
      if (!game) continue;
      player = getNewPlayerStats(player, game);
    }

    const isTeam1 = game.team1.includes(player.discordId);
    if (isTeam1) {
      team1Str += eloDifferenceStr(player.name, player.elo, oldElo, settings.rankRoles, "\n");
    } else {
      team2Str += eloDifferenceStr(player.name, player.elo, oldElo, settings.rankRoles, "\n");
    }

    await player.save().catch((err) => {
      message.channel.send(`Unable to edit <@${discordId}>'s stats for Game #${game.gameId}`);
      console.log(err);
    });

    const member = message.guild.members.cache.get(player.discordId);
    if (member) updateMember(member, player.name, player.elo, oldElo, settings.rankRoles);
  }

  message.channel.send("Changed game result!");

  const oldText = message.guild.channels.cache.get(game.textChannel);
  if (oldText) oldText.delete();

  const text = message.guild.channels.cache.get(settings.scoredGamesChannel);
  if (!text?.isText()) return;

  const embed = new MessageEmbed();
  embed.setTitle(`Game #${game.gameId} - Game Result Changed`);
  embed.setDescription(`Winner: Team ${game.winningTeam === 1 ? "1" : "2"}\nMVP${game.mvps.length === 1 ? "" : "s"}: ${mentionsStr(game.mvps, " ")}`);
  embed.addField("Team 1", team1Str.slice(0, -1));
  embed.addField("Team 2", team2Str.slice(0, -1));

  text.send(mentionsStr(game.players, " "), { embed });
};

const ForceResultCommand: Command = {
  name: "forceresult",
  aliases: ["forceres"],
  run,
};

module.exports = ForceResultCommand;
