export default {
    name: 'avatar',
    description: 'Fetches the avatar of a user.',
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const avatarEmbed = {
            color: 0x3498db,
            title: `${user.username}'s Avatar`,
            image: {
                url: user.displayAvatarURL({ dynamic: true, size: 1024 }),
            },
        };

        await message.channel.send({ embeds: [avatarEmbed] });
    },
};
