import Command, { RunCallback } from "../structures/Command";
import Game, { IGame } from "../schemas/Game";
import canScore from "../util/canScore";
import { MessageEmbed } from "discord.js";
import gameStateStr from "../util/str/gameStateStr";
import mentionsStr from "../util/str/mentionsStr";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  if (!canScore(message.member, settings.scorerRole)) {
    message.channel.send("You need to be a scorer to run this command!");
    return;
  }

  let gameId = parseInt(args[0] as string, 10);
  let game: IGame | null = null;

  if (!isNaN(gameId)) {
    game = await Game.findOne({ gameId });
  } else {
    game = await Game.findOne({ textChannel: message.channel.id });
  }

  if (!game) {
    message.channel.send("You need to provide a gameid as an argumnet or be in a game channel!");
    return;
  }

  // let msg = "Unable to parse json object";
  // try {
  //   msg = `State of Game #${game.gameId}:` + "```json\n" + JSON.stringify(game, null, 2) + "\n```";
  // } catch (e) {}

  // message.channel.send(msg);

  const embed = new MessageEmbed();
  embed.setTitle(`Game #${game.gameId} - State`);
  embed.setColor("#a36bed");

  let msg = `Game State: ${gameStateStr(game.state)}\n`;
  msg += `Winning Team: ${game.winningTeam ? game.winningTeam : "Undecided"}\n`;
  msg += `MVP${game.mvps.length > 1 ? "s" : ""}: ${mentionsStr(game.mvps, " ")}\n`;
  msg += `Voided: ${game.voided ? game.voided : false}\n`;
  msg += `Team 1: ${mentionsStr(game.team1, " ")}\n`;
  msg += `Team 2: ${mentionsStr(game.team2, " ")}`;

  embed.setDescription(msg);

  message.channel.send({ embeds: [embed] });
};

const GameStateCommand: Command = {
  name: "state",
  aliases: ["gamestate"],
  run,
};

module.exports = GameStateCommand;
