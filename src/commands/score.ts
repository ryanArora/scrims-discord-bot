import Command, { RunCallback } from "../structures/Command";

const run: RunCallback = (client, message, args, settings) => {
  // if (message.attachments.size <= 0) {
  //   message.channel.send("You need to provide an image as an attachment");
  //   return;
  // }

  message.reply("score");
};

const ScoreCommand: Command = {
  name: "score",
  run,
};

module.exports = ScoreCommand;
