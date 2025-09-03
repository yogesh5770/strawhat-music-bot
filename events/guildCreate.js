module.exports = {
  name: 'guildCreate',
  once: false,
  execute(guild, client) {
    console.log(`🎉 Joined new guild: ${guild.name} (id: ${guild.id})`);
    console.log(`🎶 Total guilds: ${client.guilds.cache.size}`);
    
    // You can add welcome message logic here
    const systemChannel = guild.systemChannel;
    if (systemChannel) {
      const welcomeEmbed = {
        color: 0x4ECDC4,
        title: '🎵 Thanks for adding me!',
        description: 'I\'m your custom music bot! Use `/help` to see all available commands.',
        fields: [
          {
            name: '🎶 Quick Start',
            value: 'Join a voice channel and use `/play <song>` to start playing music!',
            inline: false
          },
          {
            name: '🔧 Setup',
            value: 'Make sure I have permission to join voice channels and send messages.',
            inline: false
          }
        ],
        timestamp: new Date()
      };
      
      systemChannel.send({ embeds: [welcomeEmbed] }).catch(console.error);
    }
  },
}; 