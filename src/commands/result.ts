import Game, { EGameState } from "../schemas/Game";
import Command, { RunCallback } from "../structures/Command";
import { Message, MessageEmbed } from "discord.js";
import Player from "../schemas/Player";
import { rankFromElo, winEloFromRank, loseEloFromRank, mvpEloFromRank } from "../util/elo";
import mentionsStr from "../util/mentionsStr";
import canScore from "../util/canScore";

const deleteMessageLater = (message: Message, ms: number) => {
  setTimeout(() => {
    message.delete();
  }, ms);
};

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  if (!canScore(message.member, settings.scorerRole)) {
    message.channel.send("You don't have permission to do this!");
    return;
  }

  if (!args[0]) {
    message.channel.send("You need to put a game id as the first argument!");
    return;
  }

  let gameId: number | null = null;
  try {
    gameId = parseInt(args[0] as string, 10);
  } catch (e) {
    message.channel.send("You need to have number as a game id!");
    return;
  }

  if (args[1] !== "1" && args[1] !== "2") {
    message.channel.send("You need to put the winining team as the second argument!");
    return;
  }
  const winningTeam = parseInt(args[1], 10);

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

  if (game.state !== EGameState.SCORING) {
    message.channel.send("That game isn't in the scoring stage!");
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

  await game.save().catch(async () => {
    const msg = await message.reply(`Failed to save score result for game #${gameId}!`);
    deleteMessageLater(msg, 5000);
  });

  const msg = await message.channel.send(`Saved score result for game ${gameId}!`);
  deleteMessageLater(msg, 5000);

  let team1Str = "";
  let team2Str = "";

  for (const id of game.players) {
    let win = false;
    if (game.winningTeam === 1 ? game.team1.includes(id) : game.team2.includes(id)) win = true;

    const player = await Player.findOne({ discordId: id });
    if (!player) {
      message.channel.send(`Game #${game.gameId} was not scored for <@${id}>, player was not found`);
      continue;
    }

    const oldElo = player.elo;

    const rank = rankFromElo(player.elo);
    if (win) {
      const eloToAdd = winEloFromRank(rank);
      player.elo += eloToAdd;

      // Increment highest elo
      if (player.eloHigh <= player.elo) player.eloHigh = oldElo + eloToAdd;

      // Increment highest winstreak
      if (player.winstreak >= player.winstreakHigh) player.winstreakHigh = player.winstreak + 1;

      player.winstreak++;
      player.wins++;
      player.losestreak = 0;
    } else {
      // truly unlucky when this code is executed
      player.elo -= loseEloFromRank(rank);
      if (player.elo < 0) player.elo = 0;
      player.losestreak++;
      player.losses++;
      player.winstreak = 0;
    }

    if (mvps.includes(id)) {
      player.mvps++;
      const eloToAdd = mvpEloFromRank(rank);
      player.elo += eloToAdd;
      if (player.eloHigh <= player.elo) player.eloHigh += eloToAdd;
    }

    const member = message.guild.members.cache.get(id);
    if (member) member.setNickname(`[${player.elo}] ${player.name}`);

    player.games.push(game.gameId);

    await player.save().catch((err) => {
      message.channel.send(`Unable to edit <@${id}>'s stats for Game #${game.gameId}`);
      console.log(err);
    });

    const isTeam1 = game.team1.includes(id);
    const newRank = rankFromElo(player.elo);

    if (isTeam1) {
      team1Str += `${player.name} [\`${oldElo}\` ➜ \`${player.elo}\`] Rank: <@&${settings.rankRoles[rank]}> ➜ ${rank === newRank ? "N/A" : `<@&${settings.rankRoles[newRank]}>`}\n`;
    } else {
      team2Str += `${player.name} [\`${oldElo}\` ➜ \`${player.elo}\`] Rank: <@&${settings.rankRoles[rank]}> ➜ ${rank === newRank ? "N/A" : `<@&${settings.rankRoles[newRank]}>`}\n`;
    }

    if (rank !== newRank) {
      const member = message.guild.members.cache.get(player.discordId);
      if (member) {
        member.roles.cache.forEach(async (role) => {
          if (settings.rankRoles.includes(role.id)) {
            await member.roles.remove(role);
          }
        });

        const rankRoleId = settings.rankRoles[newRank];
        if (rankRoleId) {
          const role = message.guild.roles.cache.get(rankRoleId);
          if (role) {
            member.roles.add(role);
          }
        }
      }
    }
  }

  const text = message.guild.channels.cache.get(settings.scoredGamesChannel);
  if (!text?.isText()) return;

  const embed = new MessageEmbed();
  embed.setTitle(`Game #${game.gameId} - Scored`);
  embed.setDescription(`Winner: Team ${game.winningTeam === 1 ? "1" : "2"}\nMVP${game.mvps.length === 1 ? "" : "s"}: ${mentionsStr(game.mvps, " ")}`);
  embed.addField("Team 1", team1Str.slice(0, -1));
  embed.addField("Team 2", team2Str.slice(0, -1));

  text.send(mentionsStr(game.players, " "), { embed });

  const oldText = message.guild.channels.cache.get(game.textChannel);
  if (oldText) oldText.delete().catch(console.log);
};

const ResultCommand: Command = {
  name: "result",
  aliases: ["scoreresult", "res"],
  run,
};

module.exports = ResultCommand;
