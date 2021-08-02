import { Schema, model, Document } from "mongoose";
import { TextChannel, Guild, VoiceChannel, Role } from "discord.js";

export interface IGuildSettings extends Document {
  guildId: Guild["id"];
  hypixelGuildId: string;
  queueWaiting: VoiceChannel["id"];
  queue2: VoiceChannel["id"];
  queue3: VoiceChannel["id"];
  queue4: VoiceChannel["id"];
  gamesCategory: TextChannel["id"];
  scoringRequestsChannel: TextChannel["id"];
  scoredGamesChannel: TextChannel["id"];
  scorerRole: Role["id"];
  registeredRole: Role["id"];
  rankRoles: Role["id"][];
}

const GuildSettingsScema = new Schema({
  guildId: { type: String, requried: true, index: true, unique: true },
  hypixelGuildId: { type: String },
  queueWaiting: { type: String },
  queue2: { type: String },
  queue3: { type: String },
  queue4: { type: String },
  gamesCategory: { type: String },
  scoringRequestsChannel: { type: String },
  scoredGamesChannel: { type: String },
  scorerRole: { type: String },
  registeredRole: { type: String },
  rankRoles: { type: [String] },
});

export default model<IGuildSettings>("GuildSettings", GuildSettingsScema);
