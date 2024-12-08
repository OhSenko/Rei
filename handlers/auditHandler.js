import fs from 'fs';
import { EmbedBuilder } from 'discord.js';
import path from 'path';
import config from '../config/config.json' assert { type: 'json' };

const auditFilePath = path.resolve('auditLogs.json');

if (!fs.existsSync(auditFilePath)) {
    fs.writeFileSync(auditFilePath, JSON.stringify({ cases: [] }, null, 2));
}

export async function logAudit(message, target, action, reason = 'No reason provided', additionalData = {}) {
    let auditData;

    try {
        auditData = JSON.parse(fs.readFileSync(auditFilePath));
    } catch (error) {
        console.error('Error reading or parsing auditLogs.json:', error);
        auditData = { cases: [] };
    }

    const caseNumber = auditData.cases.length > 0 ? auditData.cases[auditData.cases.length - 1].caseNumber + 1 : 1;

    let actionText = '';
    let actionEmoji = '';
    let footerText = '';
    let embedColor = 0xFF0000;

    switch (action) {
        case 'mute':
            actionText = ` Member Muted`;
            actionEmoji = '🔇';
            footerText = `Time: ${new Date().toUTCString()}`;
            break;
        case 'ban':
            actionText = ` Member Banned`;
            actionEmoji = '⛔';
            footerText = `Time: ${new Date().toUTCString()}`;
            embedColor = 0xFF0000;
            break;
        case 'jail':
            actionText = `Member Jailed`;
            actionEmoji = '⛓️';
            footerText = `Time: ${new Date().toUTCString()}`;
            embedColor = 0x4C4C4C
            break
        case 'kick':
            actionText = ` Member Kicked`;
            actionEmoji = '👢';
            footerText = `Time: ${new Date().toUTCString()}`;
            embedColor = 0xFF9900;
            break;
        case 'warn':
            actionText = ` Member Warned`;
            actionEmoji = '⚠️';
            footerText = `Time: ${new Date().toUTCString()}`;
            embedColor = 0xFFCC00;
            break;
        default:
            actionText = ` Unknown Action`;
            actionEmoji = '❓';
            footerText = `Time: ${new Date().toUTCString()}`;
            break;
    }

    const auditEntry = {
        caseNumber,
        action,
        reason,
        memberId: target.id,
        memberTag: target.user.tag,
        moderatorId: message.author.id,
        moderatorTag: message.author.tag,
        timestamp: new Date().toISOString(),
        additionalData,
        commandLocation: message.channel.name,
        messageLink: `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`,
    };

    auditData.cases.push(auditEntry);

    try {
        fs.writeFileSync(auditFilePath, JSON.stringify(auditData, null, 2));
    } catch (error) {
        console.error('Error writing to auditLogs.json:', error);
    }

    const auditChannel = await message.guild.channels.fetch(config.auditChannelId);
    if (!auditChannel) return message.reply('Audit channel not found.');

    const embed = new EmbedBuilder()
        .setTitle(`${actionEmoji} ${actionText}`)
        .setColor(embedColor)
        .addFields(
            {
                name: 'Reason',
                value: reason,
                inline: false,
            },
            {
                name: 'Member',
                value: `<@${target.id}> | ${target.user.tag} \`\`\`${target.id}\`\`\``,
                inline: false,
            },
            {
                name: 'Moderator Responsible',
                value: `<@${message.author.id}> | ${message.author.tag} \`\`\`${message.author.id}\`\`\``,
                inline: false,
            },
            {
                name: 'Command Location',
                value: `${message.channel.name} | [Direct Link](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`,
                inline: false,
            },
        )
        .setThumbnail(target.user.displayAvatarURL())
        .setFooter({
            text: footerText,
        })
        .setTimestamp();

    await auditChannel.send({ embeds: [embed] });
}
