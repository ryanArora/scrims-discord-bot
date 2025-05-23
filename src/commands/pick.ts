import Command, { RunCallback } from "../structures/Command";
import Game, { GameState } from "../schemas/Game";
import { MessageEmbed } from "discord.js";
import mentionsStr from "../util/str/mentionsStr";
import getPicksAmount from "../util/getPicks";
import dragPlayers from "../util/actions/dragPlayers";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;
  if (!settings.gamesCategory) return;

  const game = await Game.findOne({ textChannel: message.channel.id });
  if (!game) {
    message.channel.send("You're not in an active game channel!");
    return;
  }

  if (game.state !== GameState.PICKING) {
    message.channel.send("The game isn't in the picking phase!");
    return;
  }

  let team1Picked = !(game.pickNumber % 2);
  if ((team1Picked && game.team1[0] !== message.author.id) || (!team1Picked && game.team2[0] !== message.author.id)) {
    message.channel.send("It's not your turn to pick!");
    return;
  }

  let picks = getPicksAmount(game.players.length, game.pickNumber);
  game.pickNumber++;
  let picksNext = getPicksAmount(game.players.length, game.pickNumber);

  const users = message.mentions.users.first(picks);

  // if user didn't pick the right amount
  if (users.length !== picks) {
    message.channel.send(`You must select ${picks} player${picks > 1 ? "s" : ""} for this turn`);
    return;
  }

  const remaining = game.players.filter((x) => game.team1.concat(game.team2).indexOf(x) === -1);

  // if user picked someone not in queue
  if (!users.every((u) => remaining.includes(u.id))) {
    message.channel.send("You can't pick that player!");
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
  embed.setColor("#a36bed");

  if (remaining.length === 1) {
    embed.setTitle(`Game #${game.gameId} - Start Game`);

    if (game.team1.length > game.team2.length) {
      game.team2 = game.team2.concat(remaining);
    } else {
      game.team1 = game.team1.concat(remaining);
    }

    message.guild.channels
      .create(`Game #${game.gameId} - Team 1`, { type: "GUILD_VOICE", parent: settings.gamesCategory })
      .then(async (voice) => {
        if (!message.guild) return;

        game.team1VoiceChannel = voice.id;

        message.guild.channels
          .create(`Game #${game.gameId} - Team 2`, { type: "GUILD_VOICE", parent: settings.gamesCategory })
          .then((voice) => {
            if (!message.channel) return;

            game.team2VoiceChannel = voice.id;
            game.state = GameState.PLAYING;

            game.save();

            dragPlayers(voice, game.team2, message.channel);
          })
          .catch(() => {
            message.channel.send("Error creating team voice channel for team 1");
          });

        await dragPlayers(voice, game.team1, message.channel);

        setTimeout(() => {
          if (!message.guild) return;
          const oldVoice = message.guild.channels.cache.get(game.teamPickingVoiceChannel);
          if (!oldVoice) return;

          oldVoice.delete().catch(() => {
            message.channel.send("Error deleting team picking channel");
          });
        }, 2000);
      })
      .catch(() => {
        message.channel.send("Error creating team voice channel for team 1");
      });
  }

  let team1Str = `Captain: <@${game.team1[0]}>`;
  if (game.team1.length > 1) team1Str += `\nPlayers: ${mentionsStr(game.team1.slice(1), "\n")}`;
  embed.addField("Team 1", team1Str);

  let team2Str = `Captain: <@${game.team2[0]}>`;
  if (game.team2.length > 1) team2Str += `\nPlayers: ${mentionsStr(game.team2.slice(1), "\n")}`;
  embed.addField("Team 2", team2Str);

  let msg = "The teams have been picked! The game will start shortly.";

  if (remaining.length > 1) {
    embed.setTitle(`Game #${game.gameId} - Picking Teams`);
    embed.addField("Remaining Players", mentionsStr(remaining, "\n"));
    msg = `<@${team1Picked ? game.team2[0] : game.team1[0]}> can select **${picksNext}** player${picksNext > 1 ? "s" : ""} for the next pick.`;

    game.save();
  }

  message.channel.send({ content: msg, embeds: [embed] });
};

const PickCommand: Command = {
  name: "pick",
  aliases: ["p"],
  run,
};

module.exports = PickCommand;
