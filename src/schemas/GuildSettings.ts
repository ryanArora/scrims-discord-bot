import { Schema, model, Document } from "mongoose";
import { Snowflake } from "discord.js";

export interface AlliedGuild {
  id: string;
  name: string;
  role: Snowflake;
}

export interface IGuildSettings extends Document {
  guildId: Snowflake;
  queueWaiting: Snowflake;
  queue2: Snowflake;
  queue3: Snowflake;
  queue4: Snowflake;
  gamesCategory: Snowflake;
  scoringRequestsChannel: Snowflake;
  scoredGamesChannel: Snowflake;
  scorerRole: Snowflake;
  registeredRole: Snowflake;
  bannedRole: Snowflake;
  alliedRole: Snowflake;
  rankRoles: Snowflake[];
  alliedPlayers: string[];
  alliedGuilds: AlliedGuild[];
  bannedPlayers: string[];
}

const GuildSettingsSchema = new Schema({
  guildId: { type: String, requried: true, index: true, unique: true },
  queueWaiting: { type: String, required: true },
  queue2: { type: String, required: true },
  queue3: { type: String, required: true },
  queue4: { type: String, required: true },
  gamesCategory: { type: String, required: true },
  scoringRequestsChannel: { type: String, required: true },
  scoredGamesChannel: { type: String, required: true },
  scorerRole: { type: String, required: true },
  registeredRole: { type: String, required: true },
  bannedRole: { type: String, required: true },
  alliedRole: { type: String, required: true },
  rankRoles: { type: [String], required: true },
  alliedPlayers: { type: [String], required: true },
  alliedGuilds: { type: [Object], required: true },
  bannedPlayers: { type: [String], required: true },
});

export default model<IGuildSettings>("GuildSettings", GuildSettingsSchema);
