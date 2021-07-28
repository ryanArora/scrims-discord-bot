import Client from "../structures/Client";
import { Message } from "discord.js";
import Event from "../structures/Event";
import GuildSettings, { IGuildSettings } from "../schemas/GuildSettings";

const message = async (client: Client, message: Message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(client.prefix)) return;

  let settings: IGuildSettings | null = null;
  if (message.guild) {
    settings = await GuildSettings.findOne({ guildId: message.guild.id });
    if (settings === null) {
      settings = new GuildSettings({ guildId: message.guild.id });
      await settings.save();
    }
  }

  const args: string[] = message.content.slice(client.prefix.length).trim().split(/ +/g);
  const commandName = args.shift()!.toLowerCase();

  const command = client.commands.get(commandName) ?? client.commands.find((cmd) => (cmd.aliases ? cmd.aliases.includes(commandName) : false));
  if (command) {
    command.run(client, message, args, settings);
  }
};

const MessageEvent: Event = {
  name: "message",
  run: message,
};

module.exports = MessageEvent;
