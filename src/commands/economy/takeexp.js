const { ApplicationCommandOptionType } = require('discord.js');
const Level = require('../../models/Level');
const calculateLevelXp = require('../../utils/calculateLevelXp');

module.exports = {
    name: 'takeexp',
    description: 'Take experience points from a user.',
    testOnly: true,

    options: [
        {
            name: 'user',
            description: 'User to take experience points from.',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'amount',
            description: 'Amount of experience points to take away.',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],

    callback: async (client, interaction) => {
        const targetUser = interaction.options.getUser('user');
        const xpAmount = interaction.options.getInteger('amount');

       
        if (!targetUser) {
            await interaction.reply({
                content: 'User not found.',
                ephemeral: true,
            });
            return;
        }

        const query = {
            userId: targetUser.id,
            guildId: interaction.guild.id,
        };

        try {
            // Find the user's level record
            const level = await Level.findOne(query);

            if (level) {
                // Update the XP of the user
                level.xp -= xpAmount;

                // Ensure XP doesn't go below zero
                if (level.xp < 0) {
                    level.xp = 0; // Reset XP to zero if it goes negative
                }

                await level.save();

                // Respond with the total XP remaining
                await interaction.reply(`${targetUser} has had ${xpAmount} XP taken away. Total XP: ${level.xp}`);
            } else {
                await interaction.reply(`${targetUser} does not have any experience points recorded.`);
            }
        } catch (error) {
            console.error(`Error taking XP: ${error}`);
            await interaction.reply({
                content: 'There was an error taking XP. Please try again later.',
                ephemeral: true,
            });
        }
    },
};
