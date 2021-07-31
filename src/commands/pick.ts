import Command, { RunCallback } from "../structures/Command";
import Game from "../schemas/Game";
import { MessageEmbed } from "discord.js";
import mentionsStr from "../util/mentionsStr";
import getPicksAmount from "../util/getPicksAmount";
import dragPlayers from "../util/dragPlayers";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;
  if (!settings.gamesCategory) return;

  const game = await Game.findOne({ textChannel: message.channel.id });
  if (!game) {
    message.channel.send("You're not in an active game channel!");
    return;
  }

  let team1Picked = !(game.pickNumber % 2);
  if ((team1Picked && game.team1[0] !== message.author.id) || (!team1Picked && game.team2[0] !== message.author.id)) {
    message.channel.send("It's not your turn to pick!").catch(() => {});
    return;
  }

  let picks = getPicksAmount(game.players.length, game.pickNumber);
  game.pickNumber++;
  let picksNext = getPicksAmount(game.players.length, game.pickNumber);

  const users = message.mentions.users.first(picks);

  // if user didn't pick the right amount
  if (users.length !== picks) {
    message.channel.send(`You must select ${picks} player${picks > 1 ? "s" : ""} for this turn`).catch(() => {});
    return;
  }

  const remaining = game.players.filter((x) => game.team1.concat(game.team2).indexOf(x) === -1);

  // if user picked someone not in queue
  if (!users.every((u) => remaining.includes(u.id))) {
    message.channel.send("You can't pick that player!").catch(() => {});
    return;
  }

  // valid pick

  const userIds = users.map((u) => u.id);

  // add users to their team
  if (team1Picked) {
    game.team1 = game.team1.concat(userIds);
  } else {
    game.team2 = game.team2.concat(userIds);
  }

  // remove the picked users from the remaining players
  for (const u of users) remaining.splice(remaining.indexOf(u.id), 1);

  const embed = new MessageEmbed();
  let msg = "";

  if (remaining.length === 1) {
    embed.setTitle(`Game #${game.gameId} - Start Game`);

    if (game.team1.length > game.team2.length) {
      game.team2 = game.team2.concat(remaining);
    } else {
      game.team1 = game.team1.concat(remaining);
    }

    message.guild.channels
      .create(`Game #${game.gameId} - Team 1`, { type: "voice", parent: settings.gamesCategory })
      .then(async (voice) => {
        if (!message.guild) return;

        game.team1VoiceChannel = voice.id;

        message.guild.channels
          .create(`Game #${game.gameId} - Team 2`, { type: "voice", parent: settings.gamesCategory })
          .then(async (voice) => {
            if (!message.channel) return;

            game.team2VoiceChannel = voice.id;

            game.save().catch(console.log);

            dragPlayers(voice, game.team2, message.channel);
          })
          .catch((err) => {
            message.channel.send("Error creating team voice channel for team 1").catch(() => {});
          });

        await dragPlayers(voice, game.team1, message.channel);

        setTimeout(() => {
          if (!message.guild) return;
          const oldVoice = message.guild.channels.cache.get(game.teamPickingVoiceChannel);
          if (!oldVoice) return;

          oldVoice.delete().catch(() => {
            message.channel.send("Error deleting team picking channel").catch(() => {});
          });
        }, 2000);
      })
      .catch((err) => {
        message.channel.send("Error creating team voice channel for team 1").catch(() => {});
      });
  }

  let team1Str = `Captain: <@${game.team1[0]}>`;
  if (game.team1.length > 1) team1Str += `\nPlayers: ${mentionsStr(game.team1.slice(1), "\n")}`;
  embed.addField("Team 1", team1Str);

  let team2Str = `Captain: <@${game.team2[0]}>`;
  if (game.team2.length > 1) team2Str += `\nPlayers: ${mentionsStr(game.team2.slice(1), "\n")}`;
  embed.addField("Team 2", team2Str);

  if (remaining.length > 1) {
    embed.setTitle(`Game #${game.gameId} - Picking Teams`);
    embed.addField("Remaining Players", mentionsStr(remaining, "\n"));
    msg = `<@${team1Picked ? game.team2[0] : game.team1[0]}> can select **${picksNext}** player${picksNext > 1 ? "s" : ""} for the next pick.`;

    game.save().catch(console.log);
  }

  message.channel.send(msg, { embed }).catch(() => {});
};

const PickCommand: Command = {
  name: "pick",
  aliases: ["p"],
  run,
};

module.exports = PickCommand;
