import funnyStrings from '../config/strings.json' assert { type: 'json' };

function getRandomMentionResponse() {
  const mentions = funnyStrings.mention;
  const randomIndex = Math.floor(Math.random() * mentions.length);
  return mentions[randomIndex];
}

export default {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    if (message.mentions.has(message.client.user)) {
      const randomResponse = getRandomMentionResponse();
      await message.reply(randomResponse);
    }
  }
};
