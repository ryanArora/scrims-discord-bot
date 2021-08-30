import { GuildMember, Snowflake } from "discord.js";
import { IPlayer } from "../../schemas/Player";
import { rankFromElo } from "../elo";
import nicknameStr from "../str/nicknameStr";
import removeRoles from "./removeRoles";

const playerEloChange = (member: GuildMember, player: IPlayer, rankRoles: Snowflake[]) => {
  member.setNickname(nicknameStr(player)).catch(() => {});

  const rank = rankFromElo(player.elo);
  const rankRoleId = rankRoles[rank];
  const toRemove = rankRoles.filter((roleId) => roleId !== rankRoleId);
  removeRoles(member, toRemove);

  if (!rankRoleId) {
    console.log(`Rank role at index ${rank} not found`);
    return;
  }

  member.roles.add(rankRoleId).catch((err) => {
    console.log(`Error adding role ${rankRoleId} to ${member.user.tag}`, err);
  });
};

export default playerEloChange;
