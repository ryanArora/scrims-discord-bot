import Command, { RunCallback } from "../structures/Command";
import { MessageEmbed } from "discord.js";
import Game, { EGameState } from "../schemas/Game";
import finishGame from "../util/actions/finishGame";
import canScore from "../util/canScore";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;
  if (!message.channel.isText()) return;

  if (!canScore(message.member, settings.scorerRole)) {
    message.channel.send("You need to be a scorer to run this command!");
    return;
  }

  const game = await Game.findOne({ textChannel: message.channel.id });
  if (!game) {
    message.channel.send("You're not in an active game channel");
    return;
  }

  if (game.state === EGameState.FINISHED) {
    let msg = "You can't void a game after a scoring request!";
    if (game.voided) msg = "The game has already been voided!";

    message.channel.send(msg);
    return;
  }

  game.state = EGameState.FINISHED;
  game.voided = true;

  game
    .save()
    .then(async () => {
      const embed = new MessageEmbed();
      embed.setTitle(`Game #${game.gameId} - Force Void`);
      embed.setDescription("The game has been voided by force!");

      message.channel.send({ embed }).catch(() => {});

      if (!message.guild) return;
      finishGame(game, message.guild, settings);
    })
    .catch((err) => {
      message.channel.send("Error voiding game!");
      console.log(err);
    });
};

const ForceVoidCommand: Command = {
  name: "forcevoid",
  run,
};

module.exports = ForceVoidCommand;
