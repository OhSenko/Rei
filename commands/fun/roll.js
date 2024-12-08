import { create, all } from 'mathjs';

const math = create(all);

export default {
  name: 'roll',
  description: 'Roll the dice because it is so very nice',
  async execute(message, args) {
    const rollPattern = /(\d+)d(\d+)([+-]?\s*\d+d\d+)?/g;
    let detailedResults = [];
    let totalResult = 0;

    if (!args.length) {
      return message.reply('Please provide a valid set of dice...');
    }

    let diceExpression = args.join(' ');
    let match;

    while ((match = rollPattern.exec(diceExpression)) !== null) {
      const count = parseInt(match[1]);
      const sides = parseInt(match[2]);

      let rolls = [];
      let rollSum = 0;
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        rollSum += roll;
      }

      detailedResults.push(`${count}d${sides}: [${rolls.join(', ')}] = ${rollSum}`);
      totalResult += rollSum;

      if (match[3]) {
        const extraRoll = match[3].trim();
        const extraResult = math.evaluate(extraRoll);
        detailedResults.push(`${extraRoll} = ${extraResult}`);
        totalResult += extraResult;
      }
    }

    const resultMessage = `**🎲 Roll Results:**\n\n${detailedResults.join('\n')}\n\n**Total:** ${totalResult}`;

    message.channel.send(resultMessage);
  },
};
