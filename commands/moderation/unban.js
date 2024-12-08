import { logAudit } from '../../handlers/auditHandler.js';

export default {
    name: 'unban',
    description: 'Unbans a user.',
    async execute(message, args) {
        if (!message.member.permissions.has('BanMembers')) {
            const embed = new EmbedBuilder()
                .setTitle("Access Denied")
                .setDescription("You are not allowed to use this command.")
                .setColor('#3498DB')

            return message.reply({ embeds: [embed] });
        }

        const targetId = args[0];
        if (!targetId) {
            return message.reply('That is not a valid user. Try again~');
        }

        let target;
        try {
            target = await message.guild.bans.fetch(targetId);
            if (!target) {
                return message.reply("That user isn't banned");
            }
        } catch (err) {
            console.error('Error fetching ban:', err);
            return message.reply('There was an error fetching the ban info. Please check behind the scenes >~<');
        }

        try {
            await message.guild.members.unban(target.user.id, `Unbanned by ${message.author.tag}`);
        } catch (err) {
            console.error('Error unbanning user:', err);
            return message.reply('Something went horribly wrong. We are all going to die!');
        }

        const reason = args.slice(1).join(' ') || 'No reason specified';
        await logAudit(message, target.user, 'unban', reason);
        message.channel.send(`<@${target.user.id}> has been unbanned!`);
    }
};
