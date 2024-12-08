import { EmbedBuilder } from 'discord.js';

export function embedBuilder(title = '', description = '', color = 0xFFFFFF, author = null) {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description);

    return embed;
}
