const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  deleted: false,
  name: 'ban',
  description: 'Bans a member!',
  options: [
    {
      name: 'target-user',
      description: 'The user to ban.',
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: 'reason',
      description: 'The reason for banning.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.Administrator],

  callback: async (client, interaction) => {
    const targetUser = interaction.options.getMentionable('target-user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    // Ensure the target is a member (not a role or other mentionable)
    if (!targetUser || !targetUser.bannable) {
      return interaction.reply({ content: "I can't ban this user!", ephemeral: true });
    }

    try {
      await targetUser.ban({ reason });
      await interaction.reply({ content: `Successfully banned ${targetUser.user.tag}! Reason: ${reason}` });
    } catch (error) {
      console.error('Error banning user:', error);
      await interaction.reply({ content: 'There was an error trying to ban this user.', ephemeral: true });
    }
  },
};
