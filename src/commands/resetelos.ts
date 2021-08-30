import Command, { RunCallback } from "../structures/Command";
import Player from "../schemas/Player";
import mongoose from "mongoose";
import playerEloChange from "../util/actions/playerEloChange";

const run: RunCallback = async (client, message, args, settings) => {
  if (!message.guild || !message.member || !settings) return;

  if (!client.owners.includes(message.author.id)) {
    message.channel.send("You dont have permission to do that!");
    return;
  }

  mongoose.connection.dropCollection("games").catch((err) => {
    message.channel.send("Failed to drop games collection");
    console.log(err);
  });

  const players = await Player.find({});
  if (players.length <= 0) {
    message.channel.send("Error getting players or no players found");
    return;
  }

  let i = 0;
  const interval = setInterval(() => {
    if (i >= players.length) clearInterval(interval);
    ++i;

    const p = players[i];
    if (!p) return;

    p.elo = 0;
    p.wins = 0;
    p.losses = 0;
    p.mvps = 0;
    p.winstreak = 0;
    p.losestreak = 0;
    p.winstreakHigh = 0;
    p.eloHigh = 0;
    if (p.scores) p.scores = 0;
    p.games = [];

    p.save()
      .then(async () => {
        console.log("saved player", p.name);

        if (!message.guild || !settings) return;
        const member = await message.guild.members.fetch(p.discordId).catch(() => console.log("not updating member because they left the guild"));
        if (!member) return;
        console.log("updating member", member.user.tag);
        playerEloChange(member, p, settings.rankRoles);
      })
      .catch(() => {
        console.log("error reseting player", p.name);
      });
  }, 500);
};

const ResetElosCommand: Command = {
  name: "resetelos",
  run,
};

module.exports = ResetElosCommand;
