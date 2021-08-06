import Command, { RunCallback } from "../structures/Command";
import { MessageEmbed } from "discord.js";
import Game, { EGameState } from "../schemas/Game";
import mentionsStr from "../util/str/mentionsStr";
import getLastUrlRoute from "../util/getLastUrlRoute";
import getFileExtension from "../util/getFileExtension";
import finishGame from "../util/actions/finishGame";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  const game = await Game.findOne({ textChannel: message.channel.id });
  if (!game) {
    message.channel.send("You're not in an active game channel!").catch(() => {});
    return;
  }

  if (game.state === EGameState.PICKING) {
    message.channel.send("You can't score the game before the teams have been picked!").catch(() => {});
    return;
  } else if (game.state === EGameState.FINISHED) {
    let msg = "The game has already been ";
    if (game.voided) {
      msg += "voided!";
    } else {
      msg += "scored!";
    }
    message.channel.send(msg).catch(() => {});
    return;
  }

  const attachment = message.attachments.first();
  const url = attachment?.proxyURL ? attachment.proxyURL : "";
  const ext = getFileExtension(getLastUrlRoute(url));

  if (ext !== "png" && ext !== "jpg" && ext !== "jpeg") {
    message.channel.send("You have to upload a screenshot as an attachment").catch(() => {});
    return;
  }

  const scoringChannel = message.guild.channels.cache.get(settings.scoringRequestsChannel);
  if (!scoringChannel) {
    message.channel.send(`<@${settings.scorerRole}>, failed to get scoring games channel, please score this`).catch(() => {});
  } else {
    const embed = new MessageEmbed();
    embed.setTitle(`Scoring Request - Game #${game.gameId}`);
    embed.addField("Team 1", `Captain: <@${game.team1[0]}>\nPlayers: ${mentionsStr(game.team1.slice(1), "\n")}`);
    embed.addField("Team 2", `Captain: <@${game.team2[0]}>\nPlayers: ${mentionsStr(game.team2.slice(1), "\n")}`);
    embed.setImage(url);

    if (scoringChannel.isText())
      scoringChannel.send({ embed }).then(() => {
        game.state = EGameState.SCORING;
        game.save().catch(() => {
          message.channel.send("Error saving game!").catch(() => {});
        });
      });
  }

  finishGame(game, message.guild, settings);
};

const ScoreCommand: Command = {
  name: "score",
  aliases: ["ss", "screenshot", "save"],
  run,
};

module.exports = ScoreCommand;
