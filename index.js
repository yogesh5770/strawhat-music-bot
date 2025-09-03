// STRAWHAT MUSIC BOT - UPDATED VERSION
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');

// Load configuration from environment variables
const config = {
  token: process.env.DISCORD_BOT_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  bot: {
    activity: ' STRAWHAT Music'
  }
};

// Debug: Log environment variables (without exposing sensitive data)
console.log(' Environment Check:');
console.log('Token exists:', !!config.token);
console.log('Client ID exists:', !!config.clientId);
console.log('Guild ID exists:', !!config.guildId);

if (!config.token) {
  console.error(' DISCORD_BOT_TOKEN environment variable is missing!');
  process.exit(1);
}

if (!config.clientId) {
  console.error(' CLIENT_ID environment variable is missing!');
  process.exit(1);
}

console.log(' Environment variables validated successfully!');

// Create Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// Command collection
client.commands = new Collection();

// Music system
client.musicQueues = new Map(); // Voice connections
client.songQueues = new Map(); // Song queues
client.currentSong = new Map(); // Current playing song
client.musicHistory = new Map(); // Music history
client.qualitySettings = new Map(); // Quality settings

console.log(' Client initialized successfully!');

// Load command handler
require('./handlers/commandHandler')(client);

// Load event handler (now clean without DisTube)
require('./handlers/eventHandler')(client);

console.log(' Handlers loaded successfully!');

// Bot ready event
client.once('ready', () => {
  console.log(` ${client.user.tag} is ready!`);
  console.log(` Bot is in ${client.guilds.cache.size} servers`);

  // Set bot status and activity
  client.user.setPresence({
    activities: [{
      name: config.bot.activity,
      type: ActivityType.Playing,
    }],
    status: 'online',
  });
});

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Render health check endpoint
const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      bot: client.user ? 'online' : 'offline',
      guilds: client.guilds?.cache?.size || 0,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(` Render health check server running on port ${PORT}`);
});

console.log(' Starting bot login...');

// Login with bot token
client.login(config.token);
