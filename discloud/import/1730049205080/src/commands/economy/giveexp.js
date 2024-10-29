const { ApplicationCommandOptionType } = require('discord.js');
const Level = require('../../models/Level');
const calculateLevelXp = require('../../utils/calculateLevelXp');

function getRandomXp(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    name: 'giveexp',
    description: 'Give experience points to a user.',
    testOnly: true, // Change to false for production

    options: [
        {
            name: 'user',
            description: 'User to give experience points to.',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'amount',
            description: 'Amount of experience points to give.',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],

    callback: async (client, interaction) => {
        const targetUser = interaction.options.getUser('user'); // Get the user
        const xpAmount = interaction.options.getInteger('amount'); // Get the amount of XP to give

        // Check if the user is valid
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
                level.xp += xpAmount;

                // Check if the user has leveled up
                if (level.xp >= calculateLevelXp(level.level)) {
                    level.xp -= calculateLevelXp(level.level); // Subtract XP needed to level up
                    level.level += 1;

                    // Send level-up message to a specific channel
                    const levelUpChannel = client.channels.cache.get('1225296117512671263'); // Replace with your channel ID
                    if (levelUpChannel) {
                        levelUpChannel.send(`${interaction.member}, The Fates smile upon you! You have ascended to **Level ${level.level}**, gaining favor from the gods! Keep on your heroic journey!`);
                    }
                } else {
                    await interaction.reply(`${targetUser} has received ${xpAmount} XP! Total XP: ${level.xp}`);
                }

                await level.save();
            } else {
                // If the user doesn't exist, create a new level entry
                const newLevel = new Level({
                    userId: targetUser.id,
                    guildId: interaction.guild.id,
                    xp: xpAmount,
                    level: 1, // Start at level 1
                });

                await newLevel.save();
                await interaction.reply(`${targetUser} has received their first ${xpAmount} XP!`);
            }
        } catch (error) {
            console.error(`Error giving XP: ${error}`);
            await interaction.reply({
                content: 'There was an error giving XP. Please try again later.',
                ephemeral: true,
            });
        }
    },
};
