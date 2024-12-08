import { Client, Guild, IntentsBitField, Message, Collection, ActivityType } from "discord.js";
import messageDelete from './events/messageDelete.js';
import messageUpdate from './events/messageUpdate.js';
import memberJoin from './events/memberJoin.js';
import memberLeave from './events/memberLeave.js';

import config from './config/config.json' assert { type: 'json' };
import funnyStrings from './config/strings.json' assert { type: 'json' };

import fs from 'fs';
import path from 'path';

///////////////////////////////////////////////////////////////////////////////
// INTENTS BRAH
///////////////////////////////////////////////////////////////////////////////

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

export { client };

///////////////////////////////////////////////////////////////////////////////
// READ COMMANDS FROM COMMAND FOLDER
///////////////////////////////////////////////////////////////////////////////

client.commands = new Collection();
const commandsPath = path.resolve('./commands');
fs.readdirSync(commandsPath).forEach(folder => {
    const folderPath = path.join(commandsPath, folder);
    fs.readdirSync(folderPath).forEach(file => {
        if (file.endsWith('.js')) {
            import(path.join(folderPath, file)).then(command => {
                client.commands.set(command.default.name, command.default);
            });
        }
    });
});

///////////////////////////////////////////////////////////////////////////////
// SET RANDOM STATUS AND LOGIN (butchered edition)
///////////////////////////////////////////////////////////////////////////////

function getRandomStatus() {
    const statuses = funnyStrings.statuses;
    const randomIndex = Math.floor(Math.random() * statuses.length);
    return statuses[randomIndex];
  }

  async function initializeBot() {
    await client.login(config.token);
    console.log('Rei is ready to serve~');
  
    if (client.user) {
      setPresence();
      setInterval(() => {
        setPresence();
      }, 30000);
    } else {
      console.error('Error. Rei not ready.');
    }
  }
  
  async function setPresence() {
    const randomStatus = getRandomStatus();
  
    await client.user.setPresence({
      status: 'idle',
      activities: [{
        type: ActivityType.Custom,
        name: 'CustomStatus',
        state: randomStatus,
      }],
    });
  
    console.log(`Status updated to: ${randomStatus}`);
  }

///////////////////////////////////////////////////////////////////////////////
// MAKE SURE BOT LISTENS TO ? AND ! FOR COMMANDS BECAUSE FUCK SLASH COMMANDS
///////////////////////////////////////////////////////////////////////////////

client.on('messageCreate', message => {
    if (message.author.bot || (!message.content.startsWith('!') && !message.content.startsWith('?'))) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (command) {
        try {
            command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply("I could not execute that command, sorry...");
        }
    }
});

///////////////////////////////////////////////////////////////////////////////
// EVENTS GET HANDLED
///////////////////////////////////////////////////////////////////////////////

const __dirname = new URL('.', import.meta.url).pathname;

client.events = new Map();

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = await import(path.join(eventsPath, file));
  client.events.set(event.default.name, event.default);
}

client.on('messageCreate', async (message) => {
  const event = client.events.get('messageCreate');
  if (event) {
    try {
      await event.execute(message);
    } catch (error) {
      console.error('Error executing event:', error);
    }
  }
});

///////////////////////////////////////////////////////////////////////////////
// HANDLERS FROM ../EVENTS/
///////////////////////////////////////////////////////////////////////////////

client.on('messageDelete', (message) => {
    messageDelete(message, client);
});

client.on('messageUpdate', (oldMessage, newMessage) => {
    messageUpdate(oldMessage, newMessage, client);
});

client.on('guildMemberAdd', (member) => memberJoin(member));
client.on('guildMemberRemove', (member) => memberLeave(member));

///////////////////////////////////////////////////////////////////////////////
// LOGIN
///////////////////////////////////////////////////////////////////////////////

initializeBot().catch(console.error);