import Game, { EGameState } from "../schemas/Game";
import Player from "../schemas/Player";
import Command, { RunCallback } from "../structures/Command";
import canScore from "../util/canScore";
import { rankFromElo, winEloFromRank, loseEloFromRank, mvpEloFromRank } from "../util/elo";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.member || !settings) return;

  if (!canScore(message.member, settings.scorerRole)) {
    message.channel.send("You need to be a scorer to run this command!");
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

  for (const discordId of game.players) {
    const player = await Player.findOne({ discordId });
    if (!player) {
      message.channel.send(`Failed to update stats for <@${discordId}>`);
      continue;
    }

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
      if (game.voided) continue;
      if (game.state !== EGameState.FINISHED) continue;

      const win = (game.winningTeam === 1 && game.team1.includes(discordId)) || (game.winningTeam === 2 && game.team2.includes(discordId));
      const mvp = game.mvps.includes(discordId);

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

      if (mvp) {
        player.mvps++;
        const eloToAdd = mvpEloFromRank(rank);
        player.elo += eloToAdd;
        if (player.eloHigh <= player.elo) player.eloHigh += eloToAdd;
      }
    }

    const { name, elo, eloHigh, wins, losses, winstreak, winstreakHigh, losestreak } = player;
    console.log(`${name} - New Stats\n`);
    console.log(`ELO: ${elo}\n`);
    console.log(`Peak ELO: ${eloHigh}\n`);
    console.log(`Wins: ${wins}\n`);
    console.log(`Losses: ${losses}\n`);
    console.log(`Winstreak: ${winstreak}\n`);
    console.log(`Highest Winstreak: ${winstreakHigh}\n`);
    console.log(`Losestreak: ${losestreak}\n\n`);
  }
};

const ForceResultCommand: Command = {
  name: "forceresult",
  aliases: ["forceres"],
  run,
};

module.exports = ForceResultCommand;
