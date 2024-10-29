const { ApplicationCommandOptionType, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const schedule = require('node-schedule');
const { DateTime } = require('luxon');

const scheduledPosts = []; 

module.exports = {
    name: 'development',
    description: 'Schedule a development post with an image and description at a specified time.',
    options: [
        {
            name: 'image',
            description: 'Image to include in the development post.',
            type: ApplicationCommandOptionType.Attachment,
            required: true,
        },
        {
            name: 'time',
            description: 'Time to post the update. Use "YYYY-MM-DD HH:mm:ss AM/PM" or "YYYY-MM-DD HH:mm:ss" (24-hour).',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'description',
            description: 'Description to include with the post.',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],

    callback: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true,
            });
            return;
        }

    
        await interaction.deferReply({ ephemeral: true });

        const imageAttachment = interaction.options.getAttachment('image');
        const scheduledTime = interaction.options.getString('time');
        const description = interaction.options.getString('description') || 'Here’s the scheduled development update!';

        const date = parseTime(scheduledTime);
        if (!date || date <= new Date()) {
            await interaction.editReply({
                content: 'Invalid time or time is in the past. Use "YYYY-MM-DD HH:mm:ss AM/PM" or "YYYY-MM-DD HH:mm:ss" (24-hour format).',
            });
            return;
        }

    
        await interaction.editReply({
            content: `Development post scheduled for ${date.toLocaleString()}.`,
        });

       
        const job = schedule.scheduleJob(date, async () => {
            const channel = interaction.channel;
            const image = new AttachmentBuilder(imageAttachment.url);

            await channel.send({
                content: description,
                files: [image],
            });

 
            const index = scheduledPosts.findIndex(post => post.job === job);
            if (index !== -1) scheduledPosts.splice(index, 1);
        });

   
        scheduledPosts.push({ date, description, job });
    },
    scheduledPosts,
};


function parseTime(timeString) {
    const amPmMatch = timeString.match(/(\d{4}-\d{2}-\d{2}) (\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?/i);
    if (amPmMatch) {
        const [ , date, hour, minute, second, amPm ] = amPmMatch;
        let hours = parseInt(hour);
        if (amPm?.toLowerCase() === 'pm' && hours < 12) hours += 12;
        if (amPm?.toLowerCase() === 'am' && hours === 12) hours = 0;

        const dateTime = DateTime.fromFormat(`${date} ${hours}:${minute}:${second}`, 'yyyy-MM-dd H:mm:ss', { zone: 'America/Los_Angeles' });
        return dateTime.isValid ? dateTime.toJSDate() : null;
    } else {
        const date = new Date(timeString);
        return isNaN(date.getTime()) ? null : date;
    }
}
