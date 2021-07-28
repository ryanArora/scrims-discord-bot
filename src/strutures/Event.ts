import Client from "./Client";
import Discord from "discord.js";

export type MessageRunCallback = (client: Client, message: Discord.Message) => void;

export default interface Event {
  name: string;
  run: MessageRunCallback;
}
