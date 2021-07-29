import Client from "../structures/Client";
import { VoiceState } from "discord.js";
import Event from "../structures/Event";

const voiceLeave = async (client: Client, oldState: VoiceState, newState: VoiceState) => {
  if (oldState.channelID === newState.channelID) return;
  if (newState.channelID) return;

  // executed on voice leave
};

const VoiceLeaveEvent: Event = {
  name: "voiceStateUpdate",
  run: voiceLeave,
};

module.exports = VoiceLeaveEvent;
