import { GuildMember, Snowflake } from "discord.js";
import { rankFromElo } from "../elo";

const updateMember = (member: GuildMember, name: string, elo: number, oldElo: number, rankRoles: Snowflake[]) => {
  member.setNickname(`[${elo}] ${name}`).catch(() => {});

  const rank = rankFromElo(elo);
  const oldRank = rankFromElo(oldElo);

  if (rank !== oldRank) {
    member.roles.cache.forEach((role) => {
      if (rankRoles.includes(role.id)) member.roles.remove(role);
    });

    const rankRoleId = rankRoles[rank];
    if (rankRoleId) {
      const role = member.guild.roles.cache.get(rankRoleId);
      if (role) member.roles.add(role);
    }
  }
};

export default updateMember;
