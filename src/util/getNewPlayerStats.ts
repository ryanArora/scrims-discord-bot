import { IPlayer } from "../schemas/Player";
import { EGameState, IGame } from "../schemas/Game";
import { rankFromElo, winEloFromRank, loseEloFromRank, mvpEloFromRank } from "../util/elo";

const getNewPlayerStats = (player: IPlayer, game: IGame) => {
  if (game.voided) return player;
  if (game.state !== EGameState.FINISHED) return player;

  const inGame = game.team1.includes(player.discordId) || game.team2.includes(player.discordId);
  if (!inGame) return player;

  const won = (game.winningTeam === 1 && game.team1.includes(player.discordId)) || (game.winningTeam === 2 && game.team2.includes(player.discordId));
  const mvp = game.mvps.includes(player.discordId);

  const rank = rankFromElo(player.elo);
  const oldElo = player.elo;

  if (won) {
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

  return player;
};

export default getNewPlayerStats;
