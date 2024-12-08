export async function sendMessage(channel, content, embed = null) {
    if (embed) {
        return channel.send({ content, embeds: [embed] });
    }
    return channel.send(content);
}
