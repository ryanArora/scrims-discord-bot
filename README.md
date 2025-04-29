# Scrims Discord Bot

This project is a Discord bot originally made to host Hypixel Ranked Bedwars. Bedwars is a minigame on Hypixel, the world's most popular Minecraft server. Bedwars lacks an official competitive mode with proper ranks and ELO progression, and Ranked Bedwars is an unofficial variant of Bedwars that supports this.

You can use this Discord bot to run scrims for any game though, not just Bedwars.

Using this Discord bot:

- You join a Discord voice channel to queue into a game.
- Then, you are put into a match with other players with similar ELO.
- Team captains are randomly selected, and they take turns picking teams.
- Once the teams are selected, players are moved into their team's voice channel.
- The teams play the game and upload a screenshot showing the winning team.
- A trusted moderator determines the winning team. The winning team gains ELO, and the losing team loses ELO.
- Players can check their score and position on the leaderboard, and potentially win prizes at the end of the season.

I made this project in the summer after 11th grade to play with my Guild (a group of friends, ~50 people).

## Technologies Used

- Typescript
- Node.js
- Discord.js
- MongoDB/Mongoose

## Development

```bash
cp .env.example .env      # Populate .env with the appropriate secrets
yarn                      # Install dependencies
yarn dev                  # Run the development server
```
