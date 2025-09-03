const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const config = require('./config.json');

// Create Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// Create DisTube instance with plugins for v4
client.distube = new DisTube(client, {
  plugins: [
    new SpotifyPlugin(), // Spotify first - official releases, best quality
    new YtDlpPlugin({ update: true }), // YouTube - maximum availability (99%)
  ],
  // DisTube v4 options
  leaveOnStop: false,
  leaveOnFinish: false,
  leaveOnEmpty: true,
  emptyCooldown: 30000, // 30 seconds
});

// Command collection
client.commands = new Collection();

// Load commands and events
require('./handlers/commandHandler')(client);
require('./handlers/eventHandler')(client);

// Bot ready event
client.once('ready', () => {
  console.log(`🎵 ${client.user.tag} is ready!`);
  console.log(`🎶 Bot is in ${client.guilds.cache.size} servers`);

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

// Railway health check endpoint
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
  console.log(`🚂 Railway health check server running on port ${PORT}`);
});

// Login with bot token
client.login(config.token); 