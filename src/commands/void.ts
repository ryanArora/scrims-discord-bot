import Command, { RunCallback } from "../structures/Command";
import { MessageEmbed, OverwriteResolvable, TextChannel } from "discord.js";
import Game, { EGameState } from "../schemas/Game";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !settings) return;
  if (!message.channel.isText()) return;

  const game = await Game.findOne({ textChannel: message.channel.id });
  if (!game) {
    message.channel.send("You're not in an active game channel!").catch(() => {});
    return;
  }

  if (game.state === EGameState.FINISHED) {
    let msg = "You can't void a game after a scoring request!";
    if (game.voided) msg = "The game has already been voided!";

    message.channel.send(msg).catch(() => {});
    return;
  }

  const votesNeeded = game.players.length / 2 + 1;

  const embed = new MessageEmbed();
  embed.setTitle("Void Request");
  embed.setDescription(`React to this message to agree to cancel the game.\`0/${votesNeeded}\` people have voted.`);

  const text = message.channel as TextChannel;

  const perms: OverwriteResolvable[] = [
    {
      id: message.guild.id,
      deny: ["VIEW_CHANNEL"],
    },
    {
      id: settings.scorerRole,
      allow: ["VIEW_CHANNEL"],
    },
  ];

  for (const id of game.players) {
    perms.push({
      id,
      deny: ["SEND_MESSAGES"],
      allow: ["VIEW_CHANNEL"],
    });
  }

  text.overwritePermissions(perms);

  message.channel
    .send({ embed })
    .then((msg) => {
      msg.react("✔️");
    })
    .catch(() => {});
};

const VoidCommand: Command = {
  name: "void",
  run,
};

module.exports = VoidCommand;
