const { Client, Message } = require('discord.js');
const Level = require('../../models/Level');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const cooldowns = new Set();

function getRandomXp(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 */

module.exports = async (client, message) => {
    if (!message.inGuild() || message.author.bot || cooldowns.has(message.author.id)) return;

    const xpToGive = getRandomXp(5, 15);

    const query = {
        userId: message.author.id,
        guildId: message.guild.id,
    };

    try {
        const level = await Level.findOne(query);

        if (level) {
            level.xp += xpToGive;

            // Check if user has leveled up
            if (level.xp > calculateLevelXp(level.level)) {
                level.xp = 0;
                level.level += 1;

                // Send level-up message to the specified channel
                const levelUpChannel = client.channels.cache.get('1225296117512671263'); // Replace with your channel ID
                if (levelUpChannel) {
                    levelUpChannel.send(`${message.member}, The Fates smile upon you! You have ascended to **Level ${level.level}**, gaining favor from the gods! Keep on your heroic journey!`);
                }
            }

            await level.save().catch((e) => {
                console.log(`Error saving update: ${e}`);
                return;
            });

            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id);
            }, 45000);
        } else {
            // Create a new level if the user doesn't have one
            const newLevel = new Level({
                userId: message.author.id,
                guildId: message.guild.id,
                xp: xpToGive,
                level: 1 // Set initial level to 1
            });

            await newLevel.save();
            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id);
            }, 45000);
        }
    } catch (error) {
        console.log(`Error giving XP: ${error}`);
    }
}
