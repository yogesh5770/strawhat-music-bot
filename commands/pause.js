const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the currently playing song'),
  
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

    if (queue.paused) {
      return interaction.reply({
        content: '⏸️ The music is already paused!',
        ephemeral: true
      });
    }

    try {
      queue.pause();
      
      const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('⏸️ Music Paused')
        .setDescription(`**${queue.songs[0].name}** has been paused`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Pause command error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle('❌ Error')
        .setDescription('Failed to pause the music.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
}; 