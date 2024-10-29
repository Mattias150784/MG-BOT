module.exports = {
  name: 'version',
  description: 'Mysti Grecia Version!',
  testOnly: true,

  callback: (client, interaction) => {  // Use 'callback' to match the handler's expectation
      interaction.reply('The version is Forge 1.20.1');
  },
};
