import { EmbedBuilder } from "discord.js";

export default {
    name: "bean",
    description: "Beans a user.",
    async execute(message, args) {
        if (!message.member.permissions.has('BanMembers')) {
            const embed = new EmbedBuilder()
                .setTitle("Access Denied")
                .setDescription("You are not allowed to use this command.")
                .setColor('#3498DB')

            return message.reply({ embeds: [embed] });
        }

        const target = message.mentions.members.first() || (args[0] ? await message.guild.members.fetch(args[0]).catch(() => null) : null);

        console.log("Resolved target:", target); //debug shiz


        if (!target) {
            return message.reply('Wait... who?');
        }
        if (message.member.roles.highest.position <= target.roles.highest.position) {
            return message.reply('Uhm... nice try :3');
        }
        if (target.id === message.author.id) {
            return message.reply("Nice try bucko, you cannot bean yourself...");
        }
        try {
            return message.reply(`<@${target.id}> has been beaned!`)
        } catch (error) {
            console.error(error);
            return message.reply("Oopsie, something broke. Better check logs :3");
        }
    },
};