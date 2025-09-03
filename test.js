// Test file to verify deployment
console.log(' Test file loaded successfully!');
console.log(' No config.json dependency found!');
console.log(' Environment variables:', {
  token: !!process.env.DISCORD_BOT_TOKEN,
  clientId: !!process.env.CLIENT_ID,
  guildId: !!process.env.GUILD_ID
});
