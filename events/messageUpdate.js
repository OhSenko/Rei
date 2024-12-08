import { EmbedBuilder } from 'discord.js';
import config from '../config/config.json' assert { type: 'json' };

export default async (oldMessage, newMessage, client) => {
    const logChannel = await client.channels.fetch(config.editsChannelId);
    const ignoreCategoryId = config.ignoreCategoryId;
    const truncate = (str, max = 1023) => str.length > max ? `${str.slice(0, max - 3)}...` : str;

    if (!logChannel || newMessage.partial || oldMessage.content === newMessage.content) return;

    const channel = await client.channels.fetch(newMessage.channelId);
    if (channel.parentId === ignoreCategoryId) return;

    const editedAt = new Date();
    const timeAgo = Math.floor((editedAt - oldMessage.createdTimestamp) / 1000);
    const timeAgoText = timeAgo > 60 
        ? `${Math.floor(timeAgo / 60)} minute(s) ago` 
        : `${timeAgo} second(s) ago`;

    const embed = new EmbedBuilder()
        .setTitle('✏️ Message Edited')
        .setColor(0xFFA500)
        .addFields(
            {
                name: 'Author',
                value: `<@${newMessage.author?.id || 'Unknown'}> | ${newMessage.author?.tag || 'Unknown'}\n\`\`\`${newMessage.author?.id || 'Unknown'}\`\`\``,
                inline: true,
            },
            {
                name: 'Channel',
                value: `${newMessage.channel?.toString() || 'Unknown'}`,
                inline: true,
            },
            {
                name: 'Time of Edit',
                value: `<t:${Math.floor(editedAt.getTime() / 1000)}:f> (<t:${Math.floor(editedAt.getTime() / 1000)}:R>)`,
                inline: true,
            },
            {
                name: 'Before Edit',
                value: truncate(oldMessage.content),
                inline: false,
            },
            {
                name: 'After Edit',
                value: truncate(newMessage.content),
                inline: false,
            },
            {
                name: 'Additional Info',
                value: `${Array.isArray(newMessage.embeds) && newMessage.embeds.length > 0 ? `[${newMessage.embeds.length} Embed(s)]` : '[No embeds]'}`,
                inline: false,
            }
        )
        .setFooter({
            text: `Message ID: ${newMessage.id}`,
            iconURL: newMessage.author?.displayAvatarURL({ dynamic: true }) || client.user.displayAvatarURL(),
        })
        .setTimestamp(editedAt);

    logChannel.send({ embeds: [embed] });
};
