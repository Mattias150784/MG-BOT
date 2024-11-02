const { ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: 'sneakpeek',
    description: 'Retrieve a development image based on a specified keyword.',
    options: [
        {
            name: 'name',
            description: 'Keyword to see a certain development image (e.g., "centaur", "satyr").',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],

    callback: async (client, interaction) => {
        const keyword = interaction.options.getString('name').toLowerCase();

        const imagePath = path.join(__dirname, '..','..', 'images', `${keyword}.png`);

        console.log("Looking for image at:", imagePath);


        // Check if the image exists in the 'images' folder
        if (!fs.existsSync(imagePath)) {
            await interaction.reply({
                content: `No sneak peek found for "${keyword}". Please try a different keyword.`,
                ephemeral: true,
            });
            return;
        }

        // Send the image as an attachment
        const imageAttachment = new AttachmentBuilder(imagePath);
        await interaction.reply({
            content: `Here's the development post for ${keyword}`,
            files: [imageAttachment],
        });
    },
};
