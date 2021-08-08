import Command, { RunCallback } from "../structures/Command";
import { MessageEmbed } from "discord.js";
import Game, { GameState } from "../schemas/Game";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !settings) return;
  if (!message.channel.isText()) return;

  const game = await Game.findOne({ textChannel: message.channel.id });
  if (!game) {
    message.channel.send("You're not in an active game channel");
    return;
  }

  if (game.state === GameState.FINISHED) {
    let msg = "You can't void a game after a scoring request!";
    if (game.voided) msg = "The game has already been voided!";

    message.channel.send(msg);
    return;
  }

  const votesNeeded = game.players.length / 2 + 1;

  const embed = new MessageEmbed();
  embed.setTitle("Void Request");
  embed.setDescription(`React to this message to agree to cancel the game.\`0/${votesNeeded}\` people have voted.`);

  message.channel.send({ embeds: [embed] }).then((msg) => {
    msg.react("✔️");
  });
};

const VoidCommand: Command = {
  name: "void",
  run,
};

module.exports = VoidCommand;
