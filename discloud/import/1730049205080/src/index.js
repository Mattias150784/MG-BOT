require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
  ],
});

const CHANNELS = ['1209679138353315910', '1223420457793880186', '1185733246198231076', '1210768867639562260', '1299563374253834342'];

// Define keyword sets and associated responses for easy expansion
const keywordResponses = [
  {
    keywords: ["when", "version"],
    response: "We would like it to be released late December or early January, stay tuned in announcements for it!",
  },
  {
    keywords: ["when", "update"],
    response: "We would like it to be released late December or early January, stay tuned in announcements for it!",
  },
  {
    keywords: ["hello"],
    response: "Hello! How are you doing?",
  },
  {
    keywords: ["hi"],
    response: "Hello! How are you doing?",
  }
];
// Clear all global commands
try {
  const globalCommands = await client.application.commands.fetch();
  for (const command of globalCommands.values()) {
      await client.application.commands.delete(command.id);
  }
  console.log("Cleared all global commands.");
} catch (error) {
  console.error("Error clearing global commands:", error);
}

// Clear all guild commands
try {
  const guildId = '1185733244004610050'; // Replace with your guild ID
  const guildCommands = await client.guilds.cache.get(guildId)?.commands.fetch();
  for (const command of guildCommands.values()) {
      await client.guilds.cache.get(guildId)?.commands.delete(command.id);
  }
  console.log("Cleared all guild commands.");
} catch (error) {
  console.error("Error clearing guild commands:", error);
}

// Reload commands afterward
client.once('ready', async () => {
  try {
      console.log("Reloading commands...");
      await client.application.commands.set(commands);
      console.log("Commands reloaded successfully.");
  } catch (error) {
      console.error("Error reloading commands:", error);
  }
});



client.on('messageCreate', (message) => {
  // Ignore messages from the bot itself
  if (message.author.bot) return;

  // Check if the message is in the specified channels or mentions the bot
  if (!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) return;

  // Flag to check if a response has already been sent
  let replied = false;

  // Convert message content to lowercase for easier keyword matching
  const lowerCaseMessage = message.content.toLowerCase();

  // Iterate over the keyword-responses to find a match
  for (const { keywords, response } of keywordResponses) {
    // Check if all keywords for the current response are in the message
    if (keywords.every(keyword => lowerCaseMessage.includes(keyword))) {
      message.reply(response);
      replied = true; // Mark that a reply has been sent
      break; // Stop further processing
    }
  }

  // If no specific keyword match, but the bot is mentioned, send a generic reply
  if (!replied && message.mentions.users.has(client.user.id)) {
    message.reply("Hello! I'm the Mysti Grecia Bot. You can ask questions or just say hi!");
  }
});

(async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    eventHandler(client);

    client.login(process.env.TOKEN);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();
