module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`🎵 ${client.user.tag} is online and ready!`);
    console.log(`🎶 Bot is in ${client.guilds.cache.size} servers`);
    console.log(`🔗 Invite link: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`);
  },
}; 