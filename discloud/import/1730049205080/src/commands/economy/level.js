const { Client, Interaction, ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js');
const canvacord = require('canvacord'); // Ensure this is the correct package
const { RankCardBuilder, Font } = require('canvacord'); // Import RankCardBuilder
const calculateLevelXp = require('../../utils/calculateLevelXp');
const Level = require('../../models/Level');

  
  module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
    callback: async (client, interaction) => {
      if (!interaction.inGuild()) {
        interaction.reply('You can only run this command inside a server.');
        return;
      }
  
      await interaction.deferReply();
  
      const mentionedUserId = interaction.options.get('target-user')?.value;
      const targetUserId = mentionedUserId || interaction.member.id;
      const targetUserObj = await interaction.guild.members.fetch(targetUserId);
  
      const fetchedLevel = await Level.findOne({
        userId: targetUserId,
        guildId: interaction.guild.id,
      });
  
      if (!fetchedLevel) {
        interaction.editReply(
          mentionedUserId
            ? `${targetUserObj.user.tag} doesn't have any levels yet. Try again when they chat a little more.`
            : "You don't have any levels yet. Chat a little more and try again."
        );
        return;
      }
  
      let allLevels = await Level.find({ guildId: interaction.guild.id }).select(
        '-_id userId level xp'
      );
  
      allLevels.sort((a, b) => {
        if (a.level === b.level) {
          return b.xp - a.xp;
        } else {
          return b.level - a.level;
        }
      });
  
      let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;
  
      Font.loadDefault();

      const rank = new canvacord.RankCardBuilder()
      const card = new RankCardBuilder()
      .setDisplayName(targetUserObj.user.tag) // Set the user's display name
      .setUsername(targetUserObj.user.username) // Set the username
      .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 })) // Set the avatar URL
      .setCurrentXP(fetchedLevel.xp) // Set the user's current XP
      .setRequiredXP(calculateLevelXp(fetchedLevel.level)) // Set the required XP for the next level
      .setLevel(fetchedLevel.level) // Set the user's current level
      .setRank(currentRank) // Set the user's rank
      .setOverlay(50) // Set overlay to 0 for no overlay
      .setBackground(`./src/images/rankbackground.png`); // Set the background color (or you can use a background image URL)
  
  const image = await card.build({ format: "png" }); // Build the card image in PNG format
  const attachment = new AttachmentBuilder(image); // Create an attachment from the image
  await interaction.editReply({ files: [attachment] }); // Send the image as a reply
    },
  
    name: 'level',
    description: "Shows your/someone's level.",
    options: [
      {
        name: 'target-user',
        description: 'The user whose level you want to see.',
        type: ApplicationCommandOptionType.Mentionable,
      },
    ],
  };