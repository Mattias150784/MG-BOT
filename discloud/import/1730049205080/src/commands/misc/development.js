const { ApplicationCommandOptionType, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const schedule = require('node-schedule');

const scheduledPosts = []; 

// Define the month and year here
const SCHEDULED_MONTH = 11; // November
const SCHEDULED_YEAR = 2024; // Year

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
            name: 'day',
            description: 'Day of the month for the post.',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
        {
            name: 'time',
            description: 'Time in 24-hour format (HH:mm) for the post.',
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
        const day = interaction.options.getInteger('day');
        const time = interaction.options.getString('time');
        const description = interaction.options.getString('description') || 'Here’s the scheduled development update!';

        const scheduledDate = calculateDate(day, time);
        
        if (!scheduledDate) {
            await interaction.editReply({
                content: 'Invalid time format. Please use the "HH:mm" format in 24-hour notation.',
            });
            return;
        } else if (scheduledDate <= new Date()) {
            await interaction.editReply({
                content: 'Scheduled time is in the past. Please provide a future time.',
            });
            return;
        }

        await interaction.editReply({
            content: `Development post scheduled for ${scheduledDate.toLocaleString()}.`,
        });

 
        const job = schedule.scheduleJob(scheduledDate, async () => {
            const channel = interaction.channel;
            const image = new AttachmentBuilder(imageAttachment.url);

            await channel.send({
                content: description,
                files: [image],
            });

          
            const index = scheduledPosts.findIndex(post => post.job === job);
            if (index !== -1) scheduledPosts.splice(index, 1);
        });

        scheduledPosts.push({ date: scheduledDate, description, job });
    },
    scheduledPosts, 
};


function calculateDate(day, timeString) {
    const timeMatch = timeString.match(/(\d{2}):(\d{2})/);
    if (!timeMatch) return null;

    const [ , hour, minute ] = timeMatch;

    const targetDate = new Date(SCHEDULED_YEAR, SCHEDULED_MONTH - 1, day, parseInt(hour), parseInt(minute), 0, 0);


    if (isDST(targetDate)) {
        targetDate.setHours(targetDate.getHours() - 1);
    }

    return targetDate;
}


function isDST(date) {
    const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
    const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(jan, jul) !== date.getTimezoneOffset();
}
