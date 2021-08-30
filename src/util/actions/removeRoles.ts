import { GuildMember, Role } from "discord.js";

const removeRoles = (member: GuildMember, roles: string[]) => {
  const promises: Array<Promise<Role>> = [];

  member.roles.cache.forEach((role) => {
    if (roles.includes(role.id)) {
      promises.push(
        new Promise((resolve, reject) => {
          member.roles
            .remove(role)
            .catch((err) => {
              console.log(`Error removing role ${role.name} from ${member.user.tag}`, err);
            })
            .then(() => {
              resolve(role);
            });
        })
      );
    }
  });

  return Promise.all(promises);
};

export default removeRoles;
