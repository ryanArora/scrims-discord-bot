import Command, { RunCallback } from "../structures/Command";
import Game, { IGame } from "../schemas/Game";
import canScore from "../util/canScore";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  if (!canScore(message.member, settings.scorerRole)) {
    message.channel.send("You need to be a scorer to run this command!");
    return;
  }

  let gameId: number | null = null;

  try {
    gameId = parseInt(args[0] as string, 10);
  } catch (e) {
    gameId = null;
  }

  let game: IGame | null = null;
  if (gameId) {
    const g = await Game.findOne({ gameId });
    if (g) game = g;
  } else {
    const g = await Game.findOne({ textChannel: message.channel.id });
    if (g) game = g;
  }

  if (!game) {
    message.channel.send("You need to provide a gameid as an argumnet or be in a game channel!");
    return;
  }

  let msg = "Unable to parse json object";
  try {
    msg = `State of Game #${game.gameId}:` + "```json\n" + JSON.stringify(game, null, 2) + "\n```";
  } catch (e) {}

  message.channel.send(msg);
};

const GameStateCommand: Command = {
  name: "state",
  aliases: ["gamestate"],
  run,
};

module.exports = GameStateCommand;
