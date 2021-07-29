import Command, { RunCallback } from "../structures/Command";
import Game from "../schemas/Game";

const run: RunCallback = async (client, message, args, settings) => {
  if (message.attachments.size <= 0) {
    message.channel.send("You need to provide an image as an attachment");
    return;
  }

  const game = await Game.findOne({ textChannel: message.channel.id });
  if (!game) {
    message.channel.send("You're not in an active game channel");
    return;
  }
};

const PickCommand: Command = {
  name: "pick",
  aliases: ["p"],
  run,
};

module.exports = PickCommand;
