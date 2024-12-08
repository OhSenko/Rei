import { EmbedBuilder } from 'discord.js';
import { logAudit } from '../../handlers/auditHandler.js';

export default {
    name: 'mute',
    description: 'Mutes a user for a specified amount of time.',
    async execute(message, args) {
        if (!message.member.permissions.has('MuteMembers')) {
            const embed = new EmbedBuilder()
                .setTitle("Access Denied")
                .setDescription("You are not allowed to use this command.")
                .setColor('#3498DB')

            return message.reply({ embeds: [embed] });
        }
        const target = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!target) {
            return message.reply('Uh, that is not a valid user. Try again~');
        }
        if (message.member.roles.highest.position <= target.roles.highest.position) {
            return message.reply('That user is above you, nice try though.');
        }
        if (target.id === message.author.id) {
            return message.reply('Nice try.');
        }
        const timeArg = args[1];
        let muteDuration = null;

        if (timeArg) {
            const timeRegex = /^(\d+)(s|m|h|d|w)$/;
            const match = timeArg.match(timeRegex);
            
            if (match) {
                const value = parseInt(match[1], 10);
                const unit = match[2];

                let milliseconds = 0;
                switch (unit) {
                    case 's':
                        milliseconds = value * 1000;
                        break;
                    case 'm':
                        milliseconds = value * 60 * 1000;
                        break;
                    case 'h':
                        milliseconds = value * 60 * 60 * 1000;
                        break;
                    case 'd':
                        milliseconds = value * 24 * 60 * 60 * 1000;
                        break;
                    case 'w':
                        milliseconds = value * 7 * 24 * 60 * 60 * 1000;
                        break;
                    default:
                        return message.reply('Invalid time format.');
                }

                muteDuration = Date.now() + milliseconds;
            } else {
                return message.reply('Please use a valid time format (s, m, h, d, w).');
            }
        }

        try {
            await target.timeout(muteDuration ? muteDuration - Date.now() : null, args.slice(2).join(' ') || 'No reason specified');
        } catch (err) {
            console.error(err);
            return message.reply('There was an error muting the user. Make sure I have permission to time them out.');
        }

        const reason = args.slice(2).join(' ') || 'No reason specified';

        await logAudit(message, target, 'mute', reason, muteDuration ? `Duration: ${muteDuration - Date.now()}ms` : 'Indefinite');

        message.channel.send(`<@${target.id}> has been muted!`);
    }
};
