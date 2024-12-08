import { EmbedBuilder } from 'discord.js';

export default {
    name: 'whois',
    description: 'Displays information about a user.',
    async execute(message, args) {
        const targetUser = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(targetUser.id);

        // User details
        const username = `${targetUser.username}#${targetUser.discriminator}`;
        const id = targetUser.id;
        const avatarURL = targetUser.displayAvatarURL({ dynamic: true, size: 1024 });
        const createdAt = `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`;
        const isBot = targetUser.bot ? 'Yes' : 'No';

        const joinedAt = member?.joinedTimestamp
            ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
            : 'Unknown';
        const roles = member?.roles.cache
            .filter(role => role.name !== '@everyone')
            .map(role => role.name)
            .join(', ') || 'No roles';

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle(`Who is ${targetUser.username}?`)
            .setThumbnail(avatarURL)
            .addFields(
                { name: 'Username', value: username, inline: true },
                { name: 'User ID', value: id, inline: true },
                { name: 'Bot', value: isBot, inline: true },
                { name: 'Account Created', value: createdAt, inline: true },
                { name: 'Joined Server', value: joinedAt, inline: true },
                { name: 'Roles', value: roles, inline: false }
            )
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    },
};
