import { GuildMember, Role } from "discord.js";
import { IPlayer } from "../../schemas/Player";
import { rankFromElo } from "../elo";

const updateMember = (member: GuildMember, name: IPlayer["name"], elo: IPlayer["elo"], oldElo: IPlayer["elo"], rankRoles: Role["id"][]) => {
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
