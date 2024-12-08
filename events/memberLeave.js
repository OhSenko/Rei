import { EmbedBuilder } from 'discord.js';
import config from '../config/config.json' assert { type: 'json' };

export default async function memberLeaveHandler(member) {
    const joinLeaveChannel = member.guild.channels.cache.get(config.joinLeaveChannelId);
    if (!joinLeaveChannel) return console.error(`Channel with ID ${config.joinLeaveChannelId} not found.`);

    const accountCreatedAt = member.user.createdAt;
    const now = new Date();
    const accountAge = Math.floor((now - accountCreatedAt) / (1000 * 60 * 60 * 24 * 365));

    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('➖ Member Left')
        .setDescription(
            `<@${member.id}> | **${member.user.tag}**\n\`\`\`${member.id}\`\`\``
        )
        .addFields(
            { name: 'Account Creation Date', value: `${accountCreatedAt.toUTCString()} (${accountAge} years ago)`, inline: false },
            { name: 'Server Member Count', value: `${member.guild.memberCount}`, inline: false }
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ text: ' ' });

    await joinLeaveChannel.send({ embeds: [embed] });
}
