import { Schema, model, Document } from "mongoose";
import { Snowflake } from "discord.js";

export interface IGuildSettings extends Document {
  guildId: Snowflake;
  hypixelGuildId: string;
  queueWaiting: Snowflake;
  queue2: Snowflake;
  queue3: Snowflake;
  queue4: Snowflake;
  gamesCategory: Snowflake;
  scoringRequestsChannel: Snowflake;
  scoredGamesChannel: Snowflake;
  scorerRole: Snowflake;
  registeredRole: Snowflake;
  rankRoles: Snowflake[];
}

const GuildSettingsScema = new Schema({
  guildId: { type: String, requried: true, index: true, unique: true },
  hypixelGuildId: String,
  queueWaiting: String,
  queue2: String,
  queue3: String,
  queue4: String,
  gamesCategory: String,
  scoringRequestsChannel: String,
  scoredGamesChannel: String,
  scorerRole: String,
  registeredRole: String,
  rankRoles: [String],
});

export default model<IGuildSettings>("GuildSettings", GuildSettingsScema);
