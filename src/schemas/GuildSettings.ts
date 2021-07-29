import { Schema, model, Document } from "mongoose";
import { TextChannel, Guild, VoiceChannel } from "discord.js";

export interface IGuildSettings extends Document {
  guildId: Guild["id"];
  queue2: VoiceChannel["id"];
  queue3: VoiceChannel["id"];
  queue4: VoiceChannel["id"];
  gamesCategory: TextChannel["id"];
}

const GuildSettingsScema = new Schema({
  guildId: { type: String, requried: true, index: true, unique: true },
  queue2: { type: String },
  queue3: { type: String },
  queue4: { type: String },
  gamesCategory: { type: String },
});

export default model<IGuildSettings>("GuildSettings", GuildSettingsScema);
