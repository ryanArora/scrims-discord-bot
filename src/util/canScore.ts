import { GuildMember, Snowflake } from "discord.js";

const canScore = (member: GuildMember, scorerRole: Snowflake) => {
  if (member.permissions.has("ADMINISTRATOR")) return true;
  return scorerRole && member.roles.cache.some((r) => r.id === scorerRole);
};

export default canScore;
