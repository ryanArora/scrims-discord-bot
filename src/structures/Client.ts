import fs from "fs";
import path from "path";
import Discord from "discord.js";
import Command from "./Command";
import Event from "./Event";

export default class Client extends Discord.Client {
  commands = new Discord.Collection<Command["name"], Command>();
  prefix = "-";
  static developers = ["272172704243908609"];

  constructor(options: Discord.ClientOptions) {
    super(options);
  }

  registerCommands(commandsDir: string) {
    console.log("Registering commands");

    const commandFiles = fs.readdirSync(commandsDir);

    for (const file of commandFiles) {
      if (!file.endsWith(".js")) continue; // since this runs at runtime, the files will be built and in javascript
      const command = require(path.join(commandsDir, file));
      this.commands.set(command.name, command);
    }
  }

  registerEvents(eventsDir: string) {
    console.log("Registering events");

    const eventFiles = fs.readdirSync(eventsDir);

    for (const file of eventFiles) {
      if (!file.endsWith(".js")) continue; // since this runs at runtime, the files will be built and in javascript

      const event: Event = require(path.join(eventsDir, file));

      // bind event to EventEmitter
      this.on(event.name, event.run.bind(null, this));
    }
  }
}
