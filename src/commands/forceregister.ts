import Command, { RunCallback } from "../structures/Command";
import axios from "axios";
import { GuildMember, Util } from "discord.js";
import getPlayerUpdateNickname from "../util/getPlayerUpdateNickname";
import canScore from "../util/canScore";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  if (!canScore(message.member, settings.scorerRole)) {
    message.channel.send("You need to be a scorer to run this command!").catch(() => {});
    return;
  }

  const name = args[0];
  if (!name) {
    message.channel.send("You need to have your username as the first argument").catch(() => {
      console.log("Error sending invalid arguments response");
    });
    return;
  }

  let user = message.mentions.users.first();
  let member: GuildMember | null = null;

  if (user) {
    member = message.guild!.member(user);
  } else {
    member = message.member;
  }

  if (!member) {
    message.channel.send("That user isn't in the server").catch(() => {});
    return;
  }

  axios
    .get(`https://api.mojang.com/users/profiles/minecraft/${name}`)
    .then((res) => {
      const uuid = res?.data?.id;
      const name = res?.data?.name;

      if (!uuid || !name) {
        message.channel.send("Please enter a valid name to register").catch(() => {});
        return;
      }

      getPlayerUpdateNickname(member!, uuid, name)
        .then((p) => {
          message.channel.send("Registered `" + Util.escapeMarkdown(member!.user.tag) + "` as " + Util.escapeMarkdown(p.name)).catch(() => {});
        })
        .catch((err) => {
          message.channel.send("Theres already someone registered as that!").catch(() => {});
          console.log(err);
        });
    })
    .catch((err) => {
      message.channel.send("Error getting player from the Mojang API");
      console.log(err);
    });
};

const ForceRegisterCommand: Command = {
  name: "forceregister",
  aliases: ["forcerename"],
  run,
};

module.exports = ForceRegisterCommand;
