const { ApplicationCommandOptionType, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const schedule = require('node-schedule');

const scheduledPosts = []; // Array to keep track of scheduled posts

// Define the month and year here
const SCHEDULED_MONTH = 11; // November (0-based index, so 11 means December)
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
        // Check for Administrator permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true,
            });
            return;
        }

        // Defer the reply to allow time for processing
        await interaction.deferReply({ ephemeral: true });

        // Parse inputs
        const imageAttachment = interaction.options.getAttachment('image');
        const day = interaction.options.getInteger('day');
        const time = interaction.options.getString('time');
        const description = interaction.options.getString('description') || 'Here’s the scheduled development update!';

        // Calculate the exact date and time for scheduling
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

        // Confirm scheduling
        await interaction.editReply({
            content: `Development post scheduled for ${scheduledDate.toLocaleString()}.`,
        });

        // Schedule the post and save details in scheduledPosts
        const job = schedule.scheduleJob(scheduledDate, async () => {
            const channel = interaction.channel;
            const image = new AttachmentBuilder(imageAttachment.url);

            await channel.send({
                content: description,
                files: [image],
            });

            // Remove the job from scheduledPosts once executed
            const index = scheduledPosts.findIndex(post => post.job === job);
            if (index !== -1) scheduledPosts.splice(index, 1);
        });

        // Add job details to the scheduledPosts array
        scheduledPosts.push({ date: scheduledDate, description, job });
    },
    scheduledPosts, // Export the array for access in other files
};

// Helper function to calculate the scheduled date and time
function calculateDate(day, timeString) {
    const timeMatch = timeString.match(/(\d{2}):(\d{2})/);
    if (!timeMatch) return null;

    const [ , hour, minute ] = timeMatch;

    // Use the predefined month and year
    const targetDate = new Date(SCHEDULED_YEAR, SCHEDULED_MONTH - 1, day, parseInt(hour), parseInt(minute), 0, 0);

    // Adjust for daylight saving time if needed
    if (isDST(targetDate)) {
        targetDate.setHours(targetDate.getHours() - 1);
    }

    return targetDate;
}

// Helper to check if daylight saving time is in effect
function isDST(date) {
    const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
    const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(jan, jul) !== date.getTimezoneOffset();
}
