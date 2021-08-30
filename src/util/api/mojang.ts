import axios from "axios";

export const nameRegex = new RegExp(/^[a-zA-Z0-9_]{2,16}$/gm);

export const getName = (uuid: string) => {
  return new Promise<string | undefined>(async (resolve, reject) => {
    axios
      .get(`https://api.mojang.com/user/profiles/${uuid}/names`)
      .then(({ data }) => {
        if (data.length > 0) {
          resolve(data[data.length - 1]?.name);
          return;
        }

        resolve(undefined);
      })
      .catch(() => {
        resolve(undefined);
      });
  });
};

export interface MinecraftProfile {
  uuid: string;
  name: string;
}

export const getProfile = (name: string) => {
  return new Promise<MinecraftProfile | undefined>(async (resolve, reject) => {
    if (!name.match(nameRegex)) {
      reject(400);
      return;
    }

    axios
      .get(`https://api.mojang.com/users/profiles/minecraft/${name}`)
      .then(({ data }) => {
        if (data.name && data.id) {
          resolve({ uuid: data.id, name: data.name });
          return;
        }

        resolve(undefined);
      })
      .catch((err) => {
        reject(err?.response?.statusCode);
      });
  });
};
