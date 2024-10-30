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
client.once('ready', async () => {
  console.log(`${client.user.tag} is online!`);

  try {
    // Clear all global commands
    await client.application.commands.set([]);
    console.log("Cleared all global commands.");
  } catch (error) {
    console.error("Error clearing global commands:", error);
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
