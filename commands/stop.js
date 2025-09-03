const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the music and clear the queue'),
  
  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guildId);
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ You need to be in a voice channel to use this command!',
        ephemeral: true
      });
    }

    if (!queue) {
      return interaction.reply({
        content: '❌ There is nothing playing right now!',
        ephemeral: true
      });
    }

    try {
      queue.stop();
      
      const embed = new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle('⏹️ Music Stopped')
        .setDescription('The music has been stopped and the queue has been cleared.')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Stop command error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle('❌ Error')
        .setDescription('Failed to stop the music.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
}; 