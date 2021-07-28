import { Schema, model, Document } from "mongoose";

export interface IGuildSettings extends Document {
  guildId: string;
}

const GuildSettingsScema = new Schema({
  guildId: { type: String, requried: true, index: true, unique: true },
});

export default model<IGuildSettings>("GuildSettings", GuildSettingsScema);
