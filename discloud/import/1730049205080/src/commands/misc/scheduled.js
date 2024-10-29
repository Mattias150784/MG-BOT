const { PermissionsBitField } = require('discord.js');
const { scheduledPosts } = require('./development');

module.exports = {
    name: 'scheduled',
    description: 'View all scheduled development posts.',
    callback: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true,
            });
            return;
        }

        if (scheduledPosts.length === 0) {
            await interaction.reply({
                content: 'There are no scheduled development posts.',
                ephemeral: true,
            });
            return;
        }

        const postList = scheduledPosts
            .map((post, index) => `**#${index + 1}** - Scheduled for: ${post.date.toLocaleString()}\nDescription: ${post.description}`)
            .join('\n\n');

        await interaction.reply({
            content: `**Scheduled Development Posts:**\n\n${postList}`,
            ephemeral: true,
        });
    },
};
