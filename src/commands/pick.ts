import Command, { RunCallback } from "../structures/Command";
import Game from "../schemas/Game";
import { MessageEmbed } from "discord.js";
import mentionsStr from "../util/mentionsStr";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  const game = await Game.findOne({ textChannel: message.channel.id });
  if (!game) {
    message.channel.send("You're not in an active game channel");
    return;
  }

  const remaining = game.players.filter((x) => game.team1.concat(game.team2).indexOf(x) === -1);
  const playersLeft = remaining.length;
  const playerCount = game.players.length;

  // 1-2-1 for 3v3, 1-2-2-1 for 4v4
  let picks = 1;
  if (playersLeft === 5 && playerCount === 8) {
    picks = 2;
  } else if (playersLeft === 3 && (playerCount === 8 || playerCount === 6)) {
    picks = 2;
  }

  const users = message.mentions.users.first(picks);

  // if user didn't pick the right amount
  if (users.length !== picks) {
    message.channel.send(`You must select ${picks} player${picks > 1 ? "s" : ""} for this turn`).catch(() => {});
    return;
  }

  // if user picked someone not in queue
  if (!users.every((u) => remaining.includes(u.id))) {
    message.channel.send("A user you selected is not in the queue").catch(() => {});
    return;
  }

  const userIds = users.map((u) => u.id);

  // when team1 has less more people, its team2's pick, otherwise its team1's
  if (game.team1.length > game.team2.length) {
    game.team2 = game.team2.concat(userIds);
  } else {
    game.team1 = game.team1.concat(userIds);
  }

  // remove the picked users from the remaining players
  for (const u of users) remaining.splice(remaining.indexOf(u.id), 1);

  game.save().catch(console.log);

  const embed = new MessageEmbed();
  let msg = "";

  if (remaining.length === 1) {
    embed.setTitle(`Game #${game.gameId} - Picking Teams`);

    if (game.team1.length > game.team2.length) {
      game.team2 = game.team2.concat(remaining);
    } else {
      game.team1 = game.team1.concat(remaining);
    }
  }

  let team1Str = `Captain: <@${game.team1[0]}>`;
  if (game.team1.length > 1) team1Str += `\nPlayers: ${mentionsStr(game.team1.slice(1), "\n")}`;

  let team2Str = `Captain: <@${game.team2[0]}>`;
  if (game.team2.length > 1) team2Str += `\nPlayers: ${mentionsStr(game.team2.slice(1), "\n")}`;

  embed.addField("Team 1", team1Str);
  embed.addField("Team 2", team2Str);

  if (remaining.length > 1) {
    embed.setTitle(`Game #${game.gameId} - Picking Teams`);
    embed.addField("Remaining Players", mentionsStr(remaining, "\n"));
    msg = `<@${game.team1.length > game.team2.length ? game.team2[0] : game.team1[0]}> can select **${picks}** player${picks > 1 ? "s" : ""} for the next pick.`;
  }

  message.channel.send(msg, { embed }).catch(() => {});
};

const PickCommand: Command = {
  name: "pick",
  aliases: ["p"],
  run,
};

module.exports = PickCommand;
