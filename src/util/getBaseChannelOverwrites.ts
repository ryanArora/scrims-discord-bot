import { Snowflake, OverwriteResolvable } from "discord.js";

const getBaseChannelOverwrites = (defaultRole: Snowflake, scorerRole: Snowflake) => {
  const overwrites: OverwriteResolvable[] = [
    {
      id: defaultRole,
      deny: ["VIEW_CHANNEL"],
    },
    {
      id: scorerRole,
      allow: ["VIEW_CHANNEL"],
    },
  ];

  return overwrites;
};

export default getBaseChannelOverwrites;
