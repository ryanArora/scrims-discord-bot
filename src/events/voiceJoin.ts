import Client from "../structures/Client";
import { MessageEmbed, OverwriteResolvable, VoiceState } from "discord.js";
import Event from "../structures/Event";
import Game, { GameState } from "../schemas/Game";
import Player from "../schemas/Player";
import mentionsStr from "../util/str/mentionsStr";
import shuffle from "../util/shuffle";

const voiceJoin = async (client: Client, oldState: VoiceState, newState: VoiceState) => {
  // executed on voicestatechange

  if (oldState.channelId === newState.channelId) return;
  if (!newState.channelId) return;

  // executed on voice join

  const settings = await client.getGuildSettings(newState.guild.id);
  if (!settings) {
    console.log("Error getting settings on voicejoin", newState.guild.id);
    return;
  }

  if (!settings.queue2 || !settings.queue3 || !settings.queue4 || !settings.gamesCategory) {
    console.log("Queue settings not configured in guild", newState.guild.id);
    return;
  }

  const channel = newState.channel;
  if (!channel) return;

  let playerLimit = 0;
  if (channel.id === settings.queue2) {
    playerLimit = 4;
  } else if (channel.id === settings.queue3) {
    playerLimit = 6;
  } else if (channel.id === settings.queue4) {
    playerLimit = 8;
  } else {
    return;
  }

  const playerCount = channel.members.size;
  if (playerCount !== playerLimit) return;

  // executed when the queue is full

  let gameCount = await Game.countDocuments({});
  if (!gameCount && gameCount !== 0) {
    console.log("Error getting game count", newState.guild.id);
    return;
  }
  gameCount++;

  const members = channel.members.first(playerLimit);
  const memberIds = members.map((p) => p.id);

  const permissionOverwrites: OverwriteResolvable[] = [
    {
      id: newState.guild.roles.everyone.id,
      deny: ["VIEW_CHANNEL"],
    },
    {
      id: settings.scorerRole,
      allow: ["VIEW_CHANNEL"],
    },
  ];

  for (const id of memberIds) permissionOverwrites.push({ id, allow: ["VIEW_CHANNEL"] });

  const text = await newState.guild.channels.create(`game-#${gameCount}`, { type: "GUILD_TEXT", parent: settings.gamesCategory, permissionOverwrites });
  if (!text) {
    console.log("Error creating textchannel for game", gameCount);
    return;
  }

  const voice = await newState.guild.channels.create(`Game #${gameCount} - Picking Teams`, { type: "GUILD_VOICE", parent: settings.gamesCategory });
  if (!voice) {
    console.log("Error creating voicechannel for game", gameCount);
    return;
  }

  Player.find({ discordId: { $in: memberIds } })
    .then((players) => {
      if (players.length !== playerLimit) {
        // FEATURE:
        // In the future, don't allow this to happen
        text.send("Someone hasn't registered, please void the game").catch(() => {});
        return;
      }

      const sorted = [...players].sort((a, b) => (a.elo < b.elo ? 1 : -1)); // highest elo goes to the top
      // const possibleCaptains = sorted.slice(0, Math.floor(playerLimit / 2));
      const shuffled = shuffle([...sorted]);

      const cap1 = shuffled[0];
      const cap2 = shuffled[1];

      if (!cap1 || !cap2) {
        console.log("A captain is missing?");
        return;
      }

      let remaining = [...sorted];
      const i = remaining.indexOf(cap1);
      remaining.splice(i, 1);
      const j = remaining.indexOf(cap2);
      remaining.splice(j, 1);

      let remainingStr = "";
      for (const player of remaining) remainingStr += `<@${player.discordId}>\n`;
      remainingStr = remainingStr.slice(0, -1);

      const embed = new MessageEmbed();
      embed.setTitle(`Game #${gameCount} - Picking Teams`);
      embed.setColor("#a36bed");
      embed.addField("Team 1", `Captain: <@${cap1.discordId}>`);
      embed.addField("Team 2", `Captain: <@${cap2.discordId}>`);
      embed.addField("Remaining", remainingStr);

      if (!remainingStr) remainingStr = "null";

      let msg = "Captains have been picked. Use the `pick` or `p` command to choose your players.\n";
      msg += `Captain 1: <@${cap1.discordId}>\n`;
      msg += `Captain 2: <@${cap2.discordId}>\n`;
      msg += mentionsStr(
        remaining.map((p) => p.discordId),
        " "
      );

      text.send({ content: msg, embeds: [embed] });

      const game = new Game({
        gameId: gameCount,
        players: memberIds,
        textChannel: text.id,
        teamPickingVoiceChannel: voice.id,
        team1: [cap1.discordId], // first captain
        team2: [cap2.discordId], // second captain
        pickNumber: 0,
        state: GameState.PICKING,
        voided: false,
      });

      game.save().catch(() => {
        console.log("Error saving game");
      });
    })
    .catch((err) => {
      console.log("Error fetching players", err);
    });

  for (const member of members) {
    member.voice.setChannel(voice.id).catch(() => {
      console.log("Error moving player", member.user.tag, "to voicechannel for game", gameCount);
    });
  }
};

const VoiceJoinEvent: Event = {
  name: "voiceStateUpdate",
  run: voiceJoin,
};

module.exports = VoiceJoinEvent;
