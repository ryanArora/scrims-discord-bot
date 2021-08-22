import Game, { GameState } from "../schemas/Game";
import Command, { RunCallback } from "../structures/Command";
import { MessageEmbed } from "discord.js";
import Player from "../schemas/Player";
import mentionsStr from "../util/str/mentionsStr";
import canScore from "../util/canScore";
import updateMember from "../util/actions/updateMember";
import getNewPlayerStats from "../util/getNewPlayerStats";
import eloDifferenceStr from "../util/str/eloDifferenceStr";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  if (!canScore(message.member, settings.scorerRole)) {
    message.channel.send("You don't have permission to do this!");
    return;
  }

  const gameId = parseInt(args[0] as string, 10);
  if (isNaN(gameId)) {
    message.channel.send("You need to put a game id as the first argument!");
    return;
  }

  const winningTeam = parseInt(args[1] as string, 10);
  if (winningTeam !== 1 && winningTeam !== 2) {
    message.channel.send("You need to put the winining team as the second argument!");
    return;
  }

  const mvps = message.mentions.users.map((u) => u.id);
  if (mvps.length <= 0) {
    message.channel.send("You need to put at least one mvp!");
    return;
  }

  const game = await Game.findOne({ gameId });
  if (!game) {
    message.channel.send("That's not a valid game id!");
    return;
  }

  if (game.state !== GameState.SCORING) {
    message.channel.send("That game isn't in the scoring stage!");
    return;
  }

  const mvpsAreAllPlayers = mvps.every((id) => game.players.includes(id));
  if (!mvpsAreAllPlayers) {
    message.channel.send("An mvp you provided did not play in the game!");
    return;
  }

  game.state = GameState.FINISHED;
  game.mvps = mvps;
  game.winningTeam = winningTeam;

  await game.save().catch(() => {
    message.reply(`Failed to save score result for game #${gameId}!`);
  });

  message.channel.send(`Saved score result for game ${gameId}!`);

  let team1Str = "";
  let team2Str = "";

  for (const discordId of game.players) {
    let player = await Player.findOne({ discordId });
    if (!player) {
      message.channel.send(`Game #${game.gameId} was not scored for <@${discordId}>, player was not found`);
      continue;
    }

    const oldElo = player.elo;
    player = getNewPlayerStats(player, game);
    player.games.push(game.gameId);

    await player.save().catch((err) => {
      message.channel.send(`Unable to edit <@${discordId}>'s stats for Game #${game.gameId}`);
      console.log(err);
    });

    const member = message.guild.members.cache.get(player.discordId);
    if (member) updateMember(member, player.name, player.elo, oldElo, settings.rankRoles);

    const isTeam1 = game.team1.includes(player.discordId);
    if (isTeam1) {
      team1Str += eloDifferenceStr(player.name, player.elo, oldElo, settings.rankRoles, "\n");
    } else {
      team2Str += eloDifferenceStr(player.name, player.elo, oldElo, settings.rankRoles, "\n");
    }
  }

  const scorer = await Player.findOne({ discordId: message.author.id });
  if (scorer) {
    if (!scorer.scores) scorer.scores = 1;
    else scorer.scores++;
    scorer.save();
  }

  const oldText = message.guild.channels.cache.get(game.textChannel);
  if (oldText) oldText.delete();

  const text = message.guild.channels.cache.get(settings.scoredGamesChannel);
  if (!text?.isText()) return;

  const embed = new MessageEmbed();
  embed.setTitle(`Game #${game.gameId} - Scored`);
  embed.setColor("#a36bed");
  embed.setDescription(`Winner: Team ${game.winningTeam === 1 ? "1" : "2"}\nMVP${game.mvps.length === 1 ? "" : "s"}: ${mentionsStr(game.mvps, " ")}`);
  embed.addField("Team 1", team1Str.slice(0, -1));
  embed.addField("Team 2", team2Str.slice(0, -1));

  text.send({ content: mentionsStr(game.players, " "), embeds: [embed] });
};

const ResultCommand: Command = {
  name: "result",
  aliases: ["scoreresult", "res"],
  run,
};

module.exports = ResultCommand;
