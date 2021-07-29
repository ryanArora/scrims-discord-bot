import Client from "../structures/Client";
import { VoiceState } from "discord.js";
import Event from "../structures/Event";
import Game from "../schemas/Game";

const voiceJoin = async (client: Client, oldState: VoiceState, newState: VoiceState) => {
  // executed on voicestatechange

  if (oldState.channelID === newState.channelID) return;
  if (!newState.channelID) return;

  // executed on voice join

  const settings = await client.getGuildSettings(newState.guild.id);
  if (!settings) {
    console.log("Error getting settings on voicejoin", newState.guild.id);
    return;
  }

  if (!settings.queue2 || !settings.queue3 || !settings.queue4 || !settings.gamesCategory) {
    console.log("Settings not configured in guild", newState.guild.id);
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

  const text = await newState.guild.channels.create(`game-#${gameCount}`, { type: "text", parent: settings.gamesCategory });
  if (!text) {
    console.log("Error creating textchannel for game", gameCount);
    return;
  }

  text.send("Placeholder for team picking embed").catch((err) => {
    console.log("Error sending start message to game", gameCount);
  });

  const voice = await newState.guild.channels.create(`Game #${gameCount} - Picking Teams`, { type: "voice", parent: settings.gamesCategory });
  if (!voice) {
    console.log("Error creating voicechannel for game", gameCount);
    return;
  }

  const players = channel.members.first(playerLimit);
  const playerIds = players.map((p) => p.id);

  for (const player of players) {
    player.voice.setChannel(voice.id).catch(() => {
      console.log("Error moving player", player.user.tag, "to voicechannel for game", gameCount);
    });
  }

  const game = new Game({
    gameId: gameCount,
    players: playerIds,
    textChannel: text.id,
    voiceChannel: voice.id,
  });

  game.save().catch(() => {
    console.log("Error saving game");
  });
};

const VoiceJoinEvent: Event = {
  name: "voiceStateUpdate",
  run: voiceJoin,
};

module.exports = VoiceJoinEvent;
