module.exports = {
  name: 'version',
  description: 'Mysti Grecia Version!',
  testOnly: true,

  callback: (client, interaction) => {  
      interaction.reply('The version is Forge 1.20.1');
  },
};
