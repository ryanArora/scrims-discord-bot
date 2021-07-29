import { Schema, model, Document } from "mongoose";
import { TextChannel, Guild, VoiceChannel, Role } from "discord.js";

export interface IGuildSettings extends Document {
  guildId: Guild["id"];
  queue2: VoiceChannel["id"];
  queue3: VoiceChannel["id"];
  queue4: VoiceChannel["id"];
  gamesCategory: TextChannel["id"];
  scorerRole: Role["id"];
  registeredRole: Role["id"];
  stoneRole: Role["id"];
  coalRole: Role["id"];
  ironRole: Role["id"];
  goldRole: Role["id"];
  diamondRole: Role["id"];
  emeraldRole: Role["id"];
  sapphireRole: Role["id"];
  rubyRole: Role["id"];
  tourmalneRole: Role["id"];
  amethystRole: Role["id"];
  alexandriteRole: Role["id"];
  tanzanitreRole: Role["id"];
  topazRole: Role["id"];
}

const GuildSettingsScema = new Schema({
  guildId: { type: String, requried: true, index: true, unique: true },
  queue2: { type: String },
  queue3: { type: String },
  queue4: { type: String },
  gamesCategory: { type: String },
  scorerRole: { type: String },
  stoneRole: { type: String },
  coalRole: { type: String },
  ironRole: { type: String },
  goldRole: { type: String },
  diamondRole: { type: String },
  emeraldRole: { type: String },
  sapphireRole: { type: String },
  rubyRole: { type: String },
  tourmalneRole: { type: String },
  amethystRole: { type: String },
  alexandriteRole: { type: String },
  tanzanitreRole: { type: String },
  topazRole: { type: String },
});

export default model<IGuildSettings>("GuildSettings", GuildSettingsScema);
