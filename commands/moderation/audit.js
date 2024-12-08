import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'audit',
    description: "View your or another moderator's audit log",
    async execute(message, args) {
        if (!message.member.permissions.has('MANAGE_GUILD')) {
            const embed = new EmbedBuilder()
                .setTitle("Access Denied")
                .setDescription("You are not allowed to use this command.")
                .setColor('#3498DB')

            return message.reply({ embeds: [embed] });
        }

        let targetMember;
        if (args[0] === 'me') {
            targetMember = message.guild.members.cache.get(message.author.id);
        } else {
            targetMember = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
        }

        if (!targetMember) {
            return message.reply('Please mention a valid user or provide their user ID, or use "me" to view your own audit logs.');
        }

        try {
            const auditLogsPath = path.resolve(path.dirname(import.meta.url).replace(/^file:\/\//, ''), '../../auditLogs.json');
            console.log(`Resolved audit logs path: ${auditLogsPath}`);

            if (!fs.existsSync(auditLogsPath)) {
                return message.reply(`Audit logs file not found at ${auditLogsPath}`);
            }

            const auditLogsData = fs.readFileSync(auditLogsPath, 'utf-8');
            const auditLogs = JSON.parse(auditLogsData).cases;

            const filteredLogs = auditLogs.filter(log => log.moderatorId === targetMember.id);

            if (filteredLogs.length === 0) {
                return message.reply(`No audit logs found for ${targetMember.user.tag}.`);
            }

            const embed = new EmbedBuilder()
                .setTitle(`${targetMember.user.tag}'s audit Logs`)
                .setColor('#FFAA00')
                .setTimestamp();

            filteredLogs.forEach((log) => {
                const caseNumber = log.caseNumber;
                const action = log.action;
                const reason = log.reason || 'No reason specified';
                const memberTag = log.memberTag;
                const additionalData = log.additionalData || 'None';
                const createdAt = new Date(log.timestamp).toUTCString();
                const messageLink = log.messageLink;

                embed.addFields({
                    name: `Case #${caseNumber}`,
                    value: `**Action:** ${action}\n**Target:** ${memberTag}\n**Reason:** ${reason}\n**Additional Info:** ${additionalData}\n**Date:** ${createdAt}\n**Message:** [Link](${messageLink})`,
                    inline: false,
                });
            });

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching audit logs from file:', error);
            return message.reply(`There was an error fetching the audit logs from the file. Error details: ${error.message}`);
        }
    },
};
