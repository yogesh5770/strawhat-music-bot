const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song'),
  
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

    if (!queue.paused) {
      return interaction.reply({
        content: '▶️ The music is already playing!',
        ephemeral: true
      });
    }

    try {
      queue.resume();
      
      const embed = new EmbedBuilder()
        .setColor(0x4ECDC4)
        .setTitle('▶️ Music Resumed')
        .setDescription(`**${queue.songs[0].name}** is now playing`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Resume command error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle('❌ Error')
        .setDescription('Failed to resume the music.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
}; 