import Command, { RunCallback } from "../structures/Command";
import axios from "axios";
import { GuildMember, Util } from "discord.js";
import getPlayerUpdateNickname from "../util/actions/getPlayerUpdateNickname";
import canScore from "../util/canScore";
import { Rank } from "../schemas/Player";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  if (!canScore(message.member, settings.scorerRole)) {
    message.channel.send("You need to be a scorer to run this command!");
    return;
  }

  const name = args[0];
  if (!name) {
    message.channel.send("You need to have your username as the first argument");
    return;
  }

  let user = message.mentions.users.first();
  let member: GuildMember | null = null;

  if (user) {
    member = await message.guild.members.fetch(user);
  } else {
    member = message.member;
  }

  if (!member) {
    message.channel.send("That user isn't in the server");
    return;
  }

  axios
    .get(`https://api.mojang.com/users/profiles/minecraft/${name}`)
    .then((res) => {
      const uuid = res?.data?.id;
      const name = res?.data?.name;

      if (!uuid || !name) {
        message.channel.send("Please enter a valid name to register");
        return;
      }

      getPlayerUpdateNickname(member!, uuid, name)
        .then((p) => {
          message.channel.send("Registered `" + Util.escapeMarkdown(member!.user.tag) + "` as " + Util.escapeMarkdown(p.name));
        })
        .catch((err) => {
          message.channel.send("Theres already someone registered as that!");
          console.log(err);
        });

      if (!message.guild || !member) return;

      const registeredRole = message.guild.roles.cache.get(settings.registeredRole);
      if (registeredRole) member.roles.add(registeredRole).catch(() => {});

      const rankRoleId = settings.rankRoles[Rank.STONE];
      if (rankRoleId) {
        const stoneRole = message.guild.roles.cache.get(rankRoleId);
        if (stoneRole) member.roles.add(stoneRole).catch(() => {});
      }
    })
    .catch(() => {
      message.channel.send("Please enter a valid player as the first argument!");
    });
};

const ForceRegisterCommand: Command = {
  name: "forceregister",
  aliases: ["forcerename"],
  run,
};

module.exports = ForceRegisterCommand;
