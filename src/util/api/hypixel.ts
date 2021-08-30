import axios from "axios";
import { getName } from "./mojang";

const base = "https://api.hypixel.net";

export interface HypixelGuildMemberExperienceHistoryDay {
  experience: string;
  date: string;
}

export interface HypixelGuildMember {
  uuid: string;
  name?: string;
  rank: string;
  joined: number;
  questParticipation: number;
  expHistory: {
    "0": HypixelGuildMemberExperienceHistoryDay;
    "1": HypixelGuildMemberExperienceHistoryDay;
    "2": HypixelGuildMemberExperienceHistoryDay;
    "3": HypixelGuildMemberExperienceHistoryDay;
    "4": HypixelGuildMemberExperienceHistoryDay;
    "5": HypixelGuildMemberExperienceHistoryDay;
    "6": HypixelGuildMemberExperienceHistoryDay;
  };
}

export interface HypixelGuild {
  guildId: string;
  name: string;
  members: HypixelGuildMember[];
}

export interface HypixelGuildQuery {
  id?: string;
  player?: string;
  name?: string;
}

export const getGuild = (query: HypixelGuildQuery, getNames = false): Promise<HypixelGuild | null> => {
  let url = base + `/guild?key=${process.env.HYPIXEL_API_KEY}&`;
  if (query.id) url += `id=${query.id}`;
  else if (query.name) url += `name=${query.name}`;
  else if (query.player) url += `player=${query.player}`;

  return new Promise<HypixelGuild | null>(async (resolve, reject) => {
    axios
      .get(url)
      .then(async ({ data }) => {
        const guild = data.guild;

        if (data?.success === true && guild === null) {
          resolve(null);
          return;
        }

        if (data?.success && (!guild._id || !guild.name || !guild.members)) {
          reject(500);
          return;
        }

        let names: (string | undefined)[] = [];
        if (getNames) {
          names = await Promise.all(
            guild.members.map((m: any) => {
              return getName(m.uuid);
            })
          );
        }

        const members: HypixelGuildMember[] = guild.members.map((m: any, i: number) => {
          const exps = Object.values(m.expHistory) as number[];
          const dates = Object.keys(m.expHistory) as string[];

          return {
            uuid: m.uuid as string,
            name: names[i],
            rank: m.rank as string,
            joined: m.joined as number,
            questParticipation: m.questParticipation ? m.questParticipation : 0,
            expHistory: {
              0: { experience: exps[0]!, date: dates[0]! },
              1: { experience: exps[1]!, date: dates[1]! },
              2: { experience: exps[2]!, date: dates[2]! },
              3: { experience: exps[3]!, date: dates[3]! },
              4: { experience: exps[4]!, date: dates[4]! },
              5: { experience: exps[5]!, date: dates[5]! },
              6: { experience: exps[6]!, date: dates[6]! },
            },
          };
        });

        resolve({
          guildId: guild._id as string,
          name: guild.name as string,
          members,
        });
      })
      .catch((err) => {
        reject(err?.response?.status);
      });
  });
};

export const getDiscord = (uuid: string) => {
  return new Promise<string | undefined>((resolve, reject) => {
    axios
      .get(`${base}/player?key=${process.env.HYPIXEL_API_KEY}&uuid=${uuid}`)
      .then(({ data }) => {
        resolve(data?.player?.socialMedia?.links?.DISCORD);
      })
      .catch((err) => {
        reject(err?.response?.status);
      });
  });
};
