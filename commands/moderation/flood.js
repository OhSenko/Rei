import { EmbedBuilder } from 'discord.js';
export default {
    name: 'flood',
    description: 'Floods the chat lol',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageMessages')) {
            const embed = new EmbedBuilder()
                .setTitle("Access Denied")
                .setDescription("You are not allowed to use this command.")
                .setColor('#3498DB')

            return message.reply({ embeds: [embed] });
        }

        const amount = parseInt(args[0]);
        const userMessage = args.slice(1).join(' ');
        if (!amount || isNaN(amount) || amount < 1 || amount > 1000) {
            return message.reply("Please tell me how many");
        }
        if (!userMessage) {
            return message.reply("I can't flood the chat with nothing yk...");
        }
        await message.reply(`Ok lol here we go:`);

        let sentMessages = 0;
        const delay = 210;

        async function sendBatch() {
            const batchSize = Math.min(5, amount - sentMessages);
            for (let i = 0; i < batchSize; i++) {
                await message.channel.send(userMessage);
                sentMessages++;
            }

            if (sentMessages < amount) {
                setTimeout(sendBatch, delay);
            }
        }

        sendBatch();
    },
};
