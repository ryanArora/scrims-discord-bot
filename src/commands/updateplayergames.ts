import Command, { RunCallback } from "../structures/Command";
import Game, { GameState } from "../schemas/Game";
import Player from "../schemas/Player";
import getNewPlayerStats from "../util/getNewPlayerStats";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member) return;

  if (!message.member.permissions.has("ADMINISTRATOR")) {
    message.channel.send("You dont have permission to do that");
    return;
  }

  const games = await Game.find({});
  let players = await Player.find({});
  if (!games || !players) {
    message.channel.send("Failed to get games or players from database");
    return;
  }

  players = players.map((p) => {
    p.elo = 0;
    p.eloHigh = 0;
    p.wins = 0;
    p.losses = 0;
    p.winstreak = 0;
    p.winstreakHigh = 0;
    p.losestreak = 0;
    p.mvps = 0;
    p.games = [];
    return p;
  });

  for (const game of games) {
    if (game.voided || game.state !== GameState.FINISHED || game.winningTeam === undefined) continue;

    for (const discordId of game.players) {
      let player = players.find((p) => p.discordId === discordId);
      if (!player) {
        console.log(`Player ${discordId} not found`, game.gameId);
        continue;
      }

      player = getNewPlayerStats(player, game);
      player.games.push(game.gameId);
    }
  }
};

const UpdatePlayerGames: Command = {
  name: "updateplayergames",
  run,
};

module.exports = UpdatePlayerGames;
