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


const keywordResponses = [
  {
    keywords: ["when", "version"],
    response: "We would like it to be released late December or early January, stay tuned in announcements for it!",
  },
  {
    keywords: ["when", "update"],
    response: "We would like it to be released late December or early January, stay tuned in announcements for it!",
  }
];

client.on('messageCreate', (message) => {

  if (message.author.bot) return;


  if (!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) return;

 
  let replied = false;


  const lowerCaseMessage = message.content.toLowerCase();


  for (const { keywords, response } of keywordResponses) {

    if (keywords.every(keyword => lowerCaseMessage.includes(keyword))) {
      message.reply(response);
      replied = true; 
      break;
    }
  }


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
