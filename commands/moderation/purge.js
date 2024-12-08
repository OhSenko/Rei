import { EmbedBuilder } from 'discord.js';

export default {
    name: 'purge',
    description: 'Purges a number of messages from the channel.',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageMessages')) {
            const embed = new EmbedBuilder()
                .setTitle("Access Denied")
                .setDescription("You are not allowed to use this command.")
                .setColor('#3498DB')

            return message.reply({ embeds: [embed] });
        }

        let amount = parseInt(args[0]);

        if (isNaN(amount) || amount < 1 || amount > 1000) {
            return message.reply("numbers between 1 and 1000 plz, any more and i'll die");
        }

        while (amount > 0) {
            const batchAmount = Math.min(amount, 100);
            try {
                const messages = await message.channel.messages.fetch({ limit: batchAmount });
                const deletableMessages = messages.filter(msg => !msg.pinned);

                await message.channel.bulkDelete(deletableMessages, true);

                amount -= deletableMessages.size;
            } catch (err) {
                console.error('Error during purge:', err);
                return message.reply("There was an error trying to purge messages.");
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(`Successfully deleted messages.`)
            .setColor('#00FF00')
            .setTimestamp();

        const confirmationMessage = await message.channel.send({ embeds: [embed] });

        setTimeout(() => confirmationMessage.delete(), 1500);
    }
};
