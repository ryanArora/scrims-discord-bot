import Command, { RunCallback } from "../structures/Command";
import { MessageEmbed } from "discord.js";
import Game, { GameState } from "../schemas/Game";
import mentionsStr from "../util/str/mentionsStr";
import getLastUrlRoute from "../util/getLastUrlRoute";
import getFileExtension from "../util/getFileExtension";
import finishGame from "../util/actions/finishGame";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  const game = await Game.findOne({ textChannel: message.channel.id });
  if (!game) {
    message.channel.send("You're not in an active game channel!");
    return;
  }

  if (game.state !== GameState.PLAYING) {
    message.channel.send("You can't score the game right now!");
    return;
  }

  const attachment = message.attachments.first();
  const url = attachment?.proxyURL ? attachment.proxyURL : "";
  const ext = getFileExtension(getLastUrlRoute(url));

  if (ext !== "png" && ext !== "jpg" && ext !== "jpeg") {
    message.channel.send("You have to upload a screenshot as an attachment");
    return;
  }

  const scoringChannel = message.guild.channels.cache.get(settings.scoringRequestsChannel);
  if (!scoringChannel) {
    message.channel.send(`<@${settings.scorerRole}>, failed to get scoring games channel, please score this`);
  } else {
    const embed = new MessageEmbed();
    embed.setTitle(`Scoring Request - Game #${game.gameId}`);
    embed.setColor("#a36bed");
    embed.addField("Team 1", `Captain: <@${game.team1[0]}>\nPlayers: ${mentionsStr(game.team1.slice(1), "\n")}`);
    embed.addField("Team 2", `Captain: <@${game.team2[0]}>\nPlayers: ${mentionsStr(game.team2.slice(1), "\n")}`);
    embed.setImage(url);

    if (scoringChannel.isText())
      scoringChannel.send({ embeds: [embed] }).then(() => {
        game.state = GameState.SCORING;
        game.save().catch(() => {
          message.channel.send("Error saving game!");
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
