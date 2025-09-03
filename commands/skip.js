const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip to the next song in the queue'),
  
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

    if (queue.songs.length <= 1) {
      return interaction.reply({
        content: '❌ There are no more songs in the queue to skip to!',
        ephemeral: true
      });
    }

    try {
      const skippedSong = queue.songs[0];
      queue.skip();
      
      const embed = new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle('⏭️ Song Skipped')
        .setDescription(`**${skippedSong.name}** has been skipped`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Skip command error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle('❌ Error')
        .setDescription('Failed to skip the song.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
}; 