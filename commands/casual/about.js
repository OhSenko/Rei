import { readdirSync } from 'fs';
import path from 'path';
import { embedBuilder } from '../../functions/embedBuilder.js';

export default {
    name: "help",
    description: "Displays a list of all available commands.",
    async execute(message) {
        const commandsDir = path.resolve('./commands');
        const categories = {};

        const folders = readdirSync(commandsDir);

        for (const folder of folders) {
            const folderPath = path.join(commandsDir, folder);
            const files = readdirSync(folderPath).filter(file => file.endsWith('.js'));

            for (const file of files) {
                const command = (await import(path.join(folderPath, file))).default;
                if (!categories[folder]) {
                    categories[folder] = [];
                }
                categories[folder].push({
                    name: command.name || file.replace('.js', ''),
                    description: command.description || 'No description provided.'
                });
            }
        }

        const embed = embedBuilder(
            "Commands ;3",
            "Here are all the things you can make me do:",
            0x00AE86,
            message.author
        );

        for (const [category, commands] of Object.entries(categories)) {
            const commandList = commands.map(cmd => `**${cmd.name}**: ${cmd.description}`).join('\n');
            embed.addFields({ name: category.charAt(0).toUpperCase() + category.slice(1), value: commandList, inline: false });
        }

        message.channel.send({ embeds: [embed] });
    }
};
