import { EmbedBuilder } from 'discord.js';
import { logAudit } from '../../handlers/auditHandler.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default {
    name: 'ban',
    description: 'Bans a user',
    async execute(message, args) {
        if (!message.member.permissions.has('BanMembers')) {
            const embed = new EmbedBuilder()
                .setTitle("Access Denied")
                .setDescription("You are not allowed to use this command.")
                .setColor('#3498DB')

            return message.reply({ embeds: [embed] });
        }
        const target = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!target) {
            return message.reply('Please mention a valid user or provide a valid user ID.');
        }
        if (message.member.roles.highest.position <= target.roles.highest.position) {
            return message.reply('You cannot ban someone with equal or higher role position.');
        }
        if (target.id === message.author.id) {
            return message.reply('Nice try.');
        }
        const reason = args.slice(1).join(' ') || 'No reason specified';

        try {
            await target.ban({
                reason: reason,
            });
        } catch (err) {
            console.error(err);
            return message.reply('Something went horribly wrong here :3');
        }

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const stringsPath = path.join(__dirname, '../../config/strings.json');
        let strings;
        try {
            strings = JSON.parse(fs.readFileSync(stringsPath, 'utf8'));
        } catch (err) {
            console.error('Error reading strings.json:', err);
            return message.reply('There was an error fetching the ban message.');
        }

        const banMessages = strings.user_was_x;
        const randomMessage = banMessages[Math.floor(Math.random() * banMessages.length)];

        await logAudit(message, target, 'ban', reason);

        message.channel.send(`<@${target.id}> was ${randomMessage}`);
    }
};
