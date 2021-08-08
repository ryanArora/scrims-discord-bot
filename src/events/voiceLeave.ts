import Client from "../structures/Client";
import { VoiceState } from "discord.js";
import Event from "../structures/Event";

const voiceLeave = async (client: Client, oldState: VoiceState, newState: VoiceState) => {
  if (oldState.channelId === newState.channelId) return;
  if (newState.channelId) return;

  // executed on voice leave
};

const VoiceLeaveEvent: Event = {
  name: "voiceStateUpdate",
  run: voiceLeave,
};

module.exports = VoiceLeaveEvent;
