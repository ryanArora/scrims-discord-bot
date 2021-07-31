import Command, { RunCallback } from "../structures/Command";
import { MessageEmbed, OverwriteResolvable, VoiceChannel } from "discord.js";
import Game, { EGameState } from "../schemas/Game";
import dragPlayers from "../util/dragPlayers";
import mentionsStr from "../util/mentionsStr";
import getLastUrlRoute from "../util/getLastUrlRoute";
import getFileExtension from "../util/getFileExtension";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  const game = await Game.findOne({ textChannel: message.channel.id });
  if (!game) {
    message.channel.send("You're not in an active game channel!").catch(() => {});
    return;
  }

  if (game.state === EGameState.PICKING) {
    message.channel.send("You can't score the game before the teams have been picked!");
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
    message.channel.send("You have to upload a screenshot as an attachment");
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
      scoringChannel
        .send({ embed })
        .then(() => {
          message.channel.send("Scoring request submitted!");
          game.state = EGameState.SCORING;
          game.save().catch(console.log);
        })
        .catch(() => {});
  }

  const text = message.guild.channels.cache.get(game.textChannel);
  if (text) {
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
  }

  setTimeout(async () => {
    if (!message.guild) return;
    const waiting = message.guild.channels.cache.get(settings.queueWaiting);
    if (waiting?.type === "voice") {
      await dragPlayers(waiting as VoiceChannel, game.players);
    }

    if (text) {
      text
        .overwritePermissions([
          {
            id: message.guild.id,
            deny: ["VIEW_CHANNEL"],
          },
          {
            id: settings.scorerRole,
            allow: ["VIEW_CHANNEL"],
          },
        ])
        .catch(() => {
          message.channel.send("Error replacing channel permissions").catch(() => {});
        });
    }

    setTimeout(() => {
      if (!message.guild) return;
      const team1Voice = message.guild.channels.cache.get(game.team1VoiceChannel);
      const team2Voice = message.guild.channels.cache.get(game.team2VoiceChannel);

      if (team1Voice) {
        team1Voice.delete().catch(() => {
          message.channel.send("Error deleting team 1's voice channel").catch(() => {});
        });
      } else {
        message.channel.send("Error deleting team 1's voice channel").catch(() => {});
      }

      if (team2Voice) {
        team2Voice.delete().catch(() => {
          message.channel.send("Error deleting team 2's voice channel").catch(() => {});
        });
      } else {
        message.channel.send("Error deleting team 2's voice channel").catch(() => {});
      }
    }, 2000);
  }, 10000);
};

const ScoreCommand: Command = {
  name: "score",
  aliases: ["ss", "screenshot", "save"],
  run,
};

module.exports = ScoreCommand;
