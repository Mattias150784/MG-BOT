require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType} = require('discord.js');

const commands = [
{
    name: 'version',
    description: 'Mysti Grecia Version',

}
];

const rest = new REST({ version: '10'}).setToken(process.env.TOKEN);

(async () => {
try {
    console.log('Registering slash commands...');

await rest.put(
    Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
         process.env.GUILD_ID
        ),
     { body: commands}
);

console.log('Slash commands were registered succesfully!');
} catch (error) {
    console.log(`I feel a disturbance in the force. ${error}`);
  }
})();

