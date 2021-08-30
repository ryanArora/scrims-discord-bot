import Player from "../schemas/Player";
import Command, { RunCallback } from "../structures/Command";
import canScore from "../util/canScore";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.member || !settings) return;

  if (!canScore(message.member, settings.scorerRole)) {
    message.channel.send("You don't have permission to do that!");
    return;
  }

  const nickname = args[0];
  if (!nickname) {
    message.channel.send("You have to provide a nickname as the first argument");
    return;
  }

  const player = await Player.findOne({ discordId: message.author.id }).catch(() => {});
  if (!player) {
    message.channel.send("Player not registered!");
    return;
  }

  message.member.setNickname(nickname);

  player.nickname = nickname;
  player
    .save()
    .then(() => {
      message.channel.send("Updated nickname!");
    })
    .catch(() => {
      message.channel.send("Failed to update nickname!");
    });
};

const NicknameCommand: Command = {
  name: "nickname",
  aliases: ["nick"],
  run,
};

module.exports = NicknameCommand;
