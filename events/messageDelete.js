import { EmbedBuilder } from 'discord.js';
import config from '../config/config.json' assert { type: 'json' };

export default async (message, client) => {
    const logChannel = await client.channels.fetch(config.deletedChannelId);
    const ignoreCategoryId = config.ignoreCategoryId;

    if (!logChannel || message.partial) return;

    const channel = await client.channels.fetch(message.channelId);
    if (channel.parentId === ignoreCategoryId) return;

    const deletedAt = new Date();
    const timeAgo = Math.floor((deletedAt - message.createdTimestamp) / 1000);
    const timeAgoText = timeAgo > 60 
        ? `${Math.floor(timeAgo / 60)} minute(s) ago` 
        : `${timeAgo} second(s) ago`;

    const embed = new EmbedBuilder()
        .setTitle('🗑️ Message Deleted')
        .setColor(0xFF0000)
        .setImage(message.attachments.first()?.url || null)
        .addFields(
            {
                name: 'Author',
                value: `<@${message.author?.id || 'Unknown'}> | ${message.author?.tag || 'Unknown'}\n\`\`\`${message.author?.id || 'Unknown'}\`\`\``,
                inline: false,
            },
            {
                name: 'Channel',
                value: `${message.channel?.toString() || 'Unknown'}`,
                inline: false,
            },
            {
                name: 'Time of Deletion',
                value: `<t:${Math.floor(deletedAt.getTime() / 1000)}:f> (<t:${Math.floor(deletedAt.getTime() / 1000)}:R>)`,
                inline: false,
            },
            {
                name: 'Deleted content',
                value: message.content || '[No content available]',
                inline: false,
            },
        )
        .setFooter({
            text: `Message ID: ${message.id}`,
            iconURL: message.author?.displayAvatarURL({ dynamic: true }) || client.user.displayAvatarURL(),
        })
        .setTimestamp(deletedAt);

    logChannel.send({ embeds: [embed] });
};
