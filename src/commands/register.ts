import Command, { RunCallback } from "../structures/Command";
import axios from "axios";
import { Util } from "discord.js";
import getPlayerUpdateNickname from "../util/getPlayerUpdateNickname";

const run: RunCallback = async (client, message, args, settings) => {
  const name = args[0];
  if (!name) {
    message.channel.send("You need to have your username as the first argument").catch(() => {
      console.log("Error sending invalid arguments response");
    });
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

      axios
        .get(`https://api.hypixel.net/player?uuid=${uuid}&key=${process.env.HYPIXEL_API_KEY}`)
        .then((res) => {
          const hypixelPlayer = res?.data?.player;

          if (!hypixelPlayer) {
            message.channel.send("Please register as a valid player").catch(() => {});
            return;
          }

          const hypixelTag = hypixelPlayer?.socialMedia?.links?.DISCORD;
          if (!hypixelTag) {
            // add gif explaining how to
            message.channel.send("Please link your Discord tag to hypixel. Maybe you typed the wrong name in the command?");
            return;
          }

          if (hypixelTag !== message.author.tag) {
            const cleanedTag = Util.removeMentions(Util.escapeMarkdown(message.author.tag));
            message.channel.send(`Please update your Discord tag on hypixel to \`${cleanedTag}\``).catch(() => {});
            return;
          }

          if (!message.member) {
            message.channel.send("Player not in discord").catch(() => {});
            return;
          }

          getPlayerUpdateNickname(message.member, uuid, name)
            .then((p) => {
              message.channel.send("Registered as " + Util.escapeMarkdown(p.name)).catch(() => {});
            })
            .catch((err) => {
              message.channel.send("Theres already someone registered as that!").catch(() => {});
              console.log(err);
            });
        })
        .catch((err) => {
          message.channel.send("Error getting player from the hypixel api");
          console.log(err);
        });
    })
    .catch((err) => {
      message.channel.send("Error getting player from the Mojang API");
      console.log(err);
    });
};

const RegisterCommand: Command = {
  name: "register",
  aliases: ["rename"],
  run,
};

module.exports = RegisterCommand;
