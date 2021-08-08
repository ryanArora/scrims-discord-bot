import { Snowflake } from "discord.js";
import { rankFromElo } from "../elo";

const eloDifferenceStr = (name: string, elo: number, oldElo: number, rankRoles: Snowflake[], delimeter: string) => {
  const rank = rankFromElo(elo);
  const oldRank = rankFromElo(oldElo);

  return `${name} [\`${oldElo}\` ➜ \`${elo}\`] Rank: <@&${rankRoles[oldRank]}> ➜ ${oldRank === rank ? "N/A" : `<@&${rankRoles[rank]}>`}${delimeter}`;
};

export default eloDifferenceStr;
