import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

import tmi from "tmi.js";
import "dotenv/config";

const client = new tmi.Client({
  // with debug flag on, we can see more verbose console commands
  options: { debug: true },
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.API_KEY,
  },
  channels: ["hwalk01"],
});

client.connect();

// db.json file path
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, "db.json");

// Configure lowdb to write data to JSON file
const adapter = new JSONFile(file);
const defaultData = { votes: [], learn: [] };
const db = new Low(adapter, defaultData);

// Read data from JSON file, this will set db.data content
// If JSON file doesn't exist, defaultData is used instead
await db.read();

const { votes, learn } = db.data;


client.on("message", async (channel, tags, message, self) => {
  if (self || !message.startsWith("!")) return;

  const args = message.slice(1).split(" ");
  const command = args.shift().toLowerCase();

  // console.log("message", message) // !vote test 123
  // console.log('args', args) // [ 'test', '123' ]
  // console.log('command', command)

  const alreadyVoted = db.data.votes.find((vote) => vote.username === tags.username); 

  switch (command) {
    case "vote": {
      if (args.length === 0) {
        client.say(
          channel,
          `@${tags.username}, hey there you can vote on a font to use for the project, type !vote 1 or 2`
        );
        return;
      }

      const subCommand = args.shift().toLowerCase();
      if (alreadyVoted) {
        client.say(
            channel,
            `@${tags.username}, you can only vote once, but thank you!`
          );
          return;
      }
      switch (subCommand) {
        case "1": {
          client.say(channel, `@${tags.username} You voted for Comic Sans`);
          votes.push({ username: `${tags.username}`, vote: "Comic Sans", option: 1 });
          await db.write();
          return;
        }
        case "2": {
          client.say(
            channel,
            `@${tags.username} You voted for Comic Sans Bold`
          );
          votes.push({ username: `${tags.username}`, vote: "Comic Sans BOLD", option: 2  });
          await db.write();
          return;
        }
      }
    }
    case "setup": {
        client.say (
            channel,
            `Laptop: MBP '14 (2022) ║ Keyboard: Keychron K2 ║ Mouse: MX Master 3S ║ Mic: Astro A10`
        )
    }
    case "learn": {
        const linkExists = db.data.learn.find((entry) => entry.link === hyperlink);
        if (args.length === 0) {
            client.say(
                channel,
                `@${tags.username}, hey there you can submit a link to a good developer resource with !learn URL (optional: category)`
                );
                return;
            }
            const hyperlink = args.shift().toLowerCase();
            const category = args.shift().toLowerCase();
            console.log(hyperlink);
            // hyperlink regex should go here

        if (linkExists) {
            client.say(
                channel,
                `@${tags.username}, this has already been posted!`
              );
              return;
          }
        client.say(channel, `@${tags.username} thanks for posting a link`);
        learn.push({ username: `${tags.username}`, link: hyperlink, category: category});
        await db.write();
        return;
    }
    case "discord": {
        client.say(channel, 'https://discord.com/invite/4mb34Ztjkr')
    }
    case "idea": {
        // Submit an idea then it can be voted on
    }
  }

  // !learn
  // Potential Issues: Link Quality, possible for discord display as could take up lots of chat window space


    // Submit links (!learn submit (URL, Category))
    // Submit a URL, category
    // Get links all, or by category (!learn get all or !learn get js)


  //Visualising
  // Needs access to lowdb to check the totals
  // Will need to put the DB online to be able to access in streamelements custom
  // https://github.com/StreamElements/widgets/blob/master/BotCounter/widget.js


  // Dict for subCommands

  // console.log(`${tags['display-name']}: ${message}`);
});
