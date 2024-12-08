import { EmbedBuilder } from 'discord.js';
export default {
    name: 'echo',
    description: 'Repeats what the user says',
    async execute(message, args) {
        if (!message.member.permissions.has('Administrator')) {
            const embed = new EmbedBuilder()
                .setTitle("Access Denied")
                .setDescription("You are not allowed to use this command.")
                .setColor('#3498DB')

            return message.reply({ embeds: [embed] });
        }
        if (!args.length) {
            return message.reply("I can't echo nothing, you know...").then(reply => {
                setTimeout(() => reply.delete().catch(() => {}), 200);
            });
        }

        await message.delete().catch(err => console.error("I can't delete your reply, oopsie :3c", err));
        
        message.channel.send(args.join(" "));
    }
};
