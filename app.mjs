import express from "express";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

import tmi from "tmi.js";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("server is running at port number 3000");
});

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
const defaultData = { votes: [], learn: [], totalVotes: [] };
const db = new Low(adapter, defaultData);

// Read data from JSON file, this will set db.data content
// If JSON file doesn't exist, defaultData is used instead
await db.read();

const { votes, learn } = db.data;

const updateVotes = () => {
  console.log('updateVotes Called', db.data.totalVotes[0].total)
  
  app.get("/", (req, res) => {
    res.send(`<h1>Which font should we use?</h1>
      <h2>${db.data.totalVotes[0].option}: ${db.data.totalVotes[0].total}</h2>
      <h2>${db.data.totalVotes[1].option}: ${db.data.totalVotes[1].total}</h2>`);
  });
}

const sumVotes = (subCommand, option) => {
  // read totalVotes totals
  const voteOption = parseInt(subCommand);

  console.log("voteOption", voteOption);

  const foundIndex = db.data.totalVotes.findIndex(
    (obj) => obj.voteOption === voteOption
  );
  const voteObj = {
    voteOption: voteOption,
    option: option,
    total: (foundIndex !== -1 ? db.data.totalVotes[foundIndex].total : 0) + 1,
  };

  console.log("Working Total", voteObj);

  if (foundIndex !== -1) {
    db.data.totalVotes[foundIndex] = voteObj;
  } else {
    db.data.totalVotes.push(voteObj);
  }
};

client.on("connected", async (channel, tags) => {
  updateVotes()
});

client.on("message", async (channel, tags, message, self) => {
  if (self || !message.startsWith("!")) return;

  const args = message.slice(1).split(" ");
  const command = args.shift().toLowerCase();

  // console.log("message", message) // !vote test 123
  // console.log('args', args) // [ 'test', '123' ]
  // console.log('command', command)

  const alreadyVoted = db.data.votes.find(
    (vote) => vote.username === tags.username
  );

  const optionOne = "Comic Sans";
  const optionTwo = "Comic Sans BOLD";

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
          votes.push({
            username: `${tags.username}`,
            vote: "Comic Sans",
            option: 1,
          });
          sumVotes(subCommand, optionOne);
          await db.write();
          updateVotes();
          console.log("Update Votes");
          return;
        }
        case "2": {
          client.say(
            channel,
            `@${tags.username} You voted for Comic Sans Bold`
          );
          votes.push({
            username: `${tags.username}`,
            vote: "Comic Sans BOLD",
            option: 2,
          });
          sumVotes(subCommand, optionTwo);
          await db.write();
          return;
        }
      }
    }
    case "setup": {
      client.say(
        channel,
        `Laptop: MBP '14 (2022) ║ Keyboard: Keychron K2 ║ Mouse: MX Master 3S ║ Mic: Astro A10`
      );
      return;
    }
    case "learn": {
      // TODO: Return links to users
      if (args.length === 0) {
        client.say(
          channel,
          `@${tags.username}, hey there you can submit a link to a good developer resource with !learn URL (optional: category)`
        );
        return;
      }

      // !learn search js
      if (args === "search") {
        // TO DO
        // const results = db.data.learn.
        // // For each article need to post
        //   client.say(channel, `@${tags.username}, Here you go`);
        // return;
      }
      const hyperlink = args.shift().toLowerCase();
      const linkExists = db.data.learn.find(
        (entry) => entry.link === hyperlink
      );

      const description = args.join(" ");
      console.log("Args", args);
      console.log(hyperlink);
      // hyperlink regex should go here

      if (linkExists) {
        client.say(channel, `@${tags.username}, this has already been posted!`);
        return;
      }
      client.say(channel, `@${tags.username} thanks for posting a link`);
      learn.push({
        username: `${tags.username}`,
        link: hyperlink,
        description: description,
      });
      await db.write();
      return;
    }
    case "discord": {
      client.say(channel, "https://discord.com/invite/4mb34Ztjkr");
    }
    case "idea": {
      // Submit an idea then it can be voted on
    }
  }

  // 1) Tallying vote
  // Read current DB value for [totalVotes]
  // If no value then create a [totalVotes] object
  // Local store totalVotes variable
  // On vote submit there should be a +1 to totalVotes
  // Write to the db with the new value

  //Visualising the votes
  //
  // Needs access to lowdb to check the totals
  // Will need to put the DB online to be able to access in streamelements custom
  // https://github.com/StreamElements/widgets/blob/master/BotCounter/widget.js
});
