import { GuildMember, Role } from "discord.js";

const canScore = (member: GuildMember, scorerRole: Role["id"]) => {
  if (member.hasPermission("ADMINISTRATOR")) return true;
  return scorerRole && member.roles.cache.some((r) => r.id === scorerRole);
};

export default canScore;
